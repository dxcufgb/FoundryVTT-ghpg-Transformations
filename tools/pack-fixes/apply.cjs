#!/usr/bin/env node
/**
 * Applies declarative fixes to the module's compendium packs (LevelDB).
 *
 * Usage:
 *   node tools/pack-fixes/apply.cjs [--dry-run] [--only <patch-file-glob-substring>]
 *
 * Environment:
 *   TRANSFORMATIONS_PACKS   packs folder (default: %LOCALAPPDATA%/FoundryVTT/Data/modules/transformations/packs)
 *   FOUNDRY_CLASSIC_LEVEL   path to classic-level (default: Foundry's bundled copy)
 *   PACK_BACKUP_DIR         where backups go (default: <repo>/../FoundryVTT-ghpg-Transformations-pack-backups)
 *
 * Foundry must not have a world open (the packs are locked while a world runs).
 *
 * Patch files live in tools/pack-fixes/patches/*.json and contain an array of ops:
 *   { "id": "unique-op-id", "pack": "gh-transformations", "key": "!items!<id>",
 *     "op": "set", "path": "system.uses.max", "value": "@prof", "expect": "<optional current value>" }
 *   { ..., "op": "unset", "path": "flags.transformations.stale" }
 *   { ..., "op": "arrayAdd" | "arrayRemove", "path": "effects", "value": "<id>" }
 *   { ..., "op": "create", "doc": { ...full document... } }          // key must not exist
 *   { ..., "op": "delete" }                                          // removes the key
 * "key" is the raw LevelDB key, e.g. "!items.effects!<itemId>.<effectId>" or "!tables.results!<tableId>.<resultId>".
 * Ops are idempotent: a "set" whose value is already in place is skipped. An "expect" mismatch aborts the run
 * before anything is written.
 */
const fs = require("fs")
const path = require("path")

const REPO = path.resolve(__dirname, "..", "..")
const PACKS = process.env.TRANSFORMATIONS_PACKS ??
    path.join(process.env.LOCALAPPDATA ?? "", "FoundryVTT", "Data", "modules", "transformations", "packs")
const CLASSIC_LEVEL = process.env.FOUNDRY_CLASSIC_LEVEL ??
    "C:/Program Files/Foundry Virtual Tabletop/resources/app/node_modules/classic-level"
const BACKUP_DIR = process.env.PACK_BACKUP_DIR ?? path.resolve(REPO, "..", "FoundryVTT-ghpg-Transformations-pack-backups")

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const onlyIdx = args.indexOf("--only")
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null

const { ClassicLevel } = require(CLASSIC_LEVEL)

function getPath(obj, p)
{
    return p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

function setPath(obj, p, value)
{
    const parts = p.split(".")
    let o = obj
    for (const k of parts.slice(0, -1)) {
        if (o[k] == null || typeof o[k] !== "object") o[k] = {}
        o = o[k]
    }
    o[parts.at(-1)] = value
}

function unsetPath(obj, p)
{
    const parts = p.split(".")
    const parent = getPath(obj, parts.slice(0, -1).join(".")) ?? (parts.length === 1 ? obj : undefined)
    if (parent && typeof parent === "object") delete parent[parts.at(-1)]
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const pathsOverlap = (a, b) => a === b || a.startsWith(`${b}.`) || b.startsWith(`${a}.`)

/**
 * An op is superseded when a later op (in file order) rewrites the same document path, or
 * creates/deletes the whole document. On a re-run its "expect" no longer matches, which is fine.
 */
function markSuperseded(ops)
{
    for (let i = 0; i < ops.length; i++) {
        const op = ops[i]
        op.superseded = ops.slice(i + 1).some(later =>
            later.pack === op.pack && later.key === op.key && (
                later.op === "create" || later.op === "delete" ||
                (op.path && later.path && pathsOverlap(op.path, later.path))
            ))
    }
    return ops
}

function loadPatches()
{
    const dir = path.join(__dirname, "patches")
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort()
        .filter(f => !only || f.includes(only))
    const ops = []
    for (const f of files) {
        const list = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))
        for (const op of list) ops.push({ ...op, file: f })
    }
    const ids = new Set()
    for (const op of ops) {
        if (!op.id || !op.pack || !op.key || !op.op) throw new Error(`Op missing id/pack/key/op in ${op.file}: ${JSON.stringify(op)}`)
        if (ids.has(op.id)) throw new Error(`Duplicate op id ${op.id} (${op.file})`)
        ids.add(op.id)
    }
    return ops
}

async function main()
{
    const ops = markSuperseded(loadPatches())
    const byPack = new Map()
    for (const op of ops) {
        if (!byPack.has(op.pack)) byPack.set(op.pack, [])
        byPack.get(op.pack).push(op)
    }

    const dbs = new Map()
    const pending = new Map() // pack -> Map(key -> doc|null)
    const report = { applied: 0, skipped: 0 }
    const errors = []

    try {
        for (const [pack, packOps] of byPack) {
            const dbPath = path.join(PACKS, pack)
            if (!fs.existsSync(dbPath)) throw new Error(`Pack not found: ${dbPath}`)
            const db = new ClassicLevel(dbPath, { valueEncoding: "json" })
            await db.open()
            dbs.set(pack, db)
            const changes = new Map()
            pending.set(pack, changes)

            const read = async key =>
            {
                if (changes.has(key)) return changes.get(key)
                try { return await db.get(key) } catch (e) { if (e.code === "LEVEL_NOT_FOUND") return undefined; throw e }
            }

            for (const op of packOps) {
                const label = `[${op.file}] ${op.id}`
                const doc = await read(op.key)
                if (op.op === "create") {
                    if (doc !== undefined && doc !== null) {
                        // Already created by an earlier run; later ops may have changed it since.
                        if (!same(doc, op.doc)) console.log(`${label}: ${op.key} already exists (changed since creation), skipped`)
                        report.skipped++
                        continue
                    }
                    changes.set(op.key, structuredClone(op.doc)); report.applied++; continue
                }
                if (doc === undefined || doc === null) {
                    if (op.op === "delete") { report.skipped++; continue }
                    errors.push(`${label}: ${op.key} not found in ${pack}`); continue
                }
                if (op.op === "delete") { changes.set(op.key, null); report.applied++; continue }

                const next = structuredClone(doc)
                const current = getPath(next, op.path)
                if (op.op === "set") {
                    if (same(current, op.value)) { report.skipped++; continue }
                    if ("expect" in op && !same(current, op.expect)) {
                        if (op.superseded) { report.skipped++; continue }
                        errors.push(`${label}: ${op.key} ${op.path} expected ${JSON.stringify(op.expect)} but found ${JSON.stringify(current)}`); continue
                    }
                    setPath(next, op.path, op.value)
                } else if (op.op === "unset") {
                    if (current === undefined) { report.skipped++; continue }
                    unsetPath(next, op.path)
                } else if (op.op === "arrayAdd" || op.op === "arrayRemove") {
                    const arr = Array.isArray(current) ? [...current] : []
                    const has = arr.some(v => same(v, op.value))
                    if ((op.op === "arrayAdd") === has) { report.skipped++; continue }
                    setPath(next, op.path, op.op === "arrayAdd" ? [...arr, op.value] : arr.filter(v => !same(v, op.value)))
                } else {
                    errors.push(`${label}: unknown op ${op.op}`); continue
                }
                changes.set(op.key, next)
                report.applied++
            }
        }

        if (errors.length) {
            console.error(`Aborting, nothing written. ${errors.length} problem(s):\n - ${errors.join("\n - ")}`)
            process.exitCode = 1
            return
        }

        if (dryRun) {
            console.log(`[dry run] ${report.applied} op(s) would be applied, ${report.skipped} already in place.`)
            return
        }
        if (!report.applied) {
            console.log(`Nothing to do, ${report.skipped} op(s) already in place.`)
            return
        }

        // Back up every pack we are about to touch.
        const stamp = new Date().toISOString().replace(/[:.]/g, "-")
        for (const pack of byPack.keys()) {
            if (!pending.get(pack)?.size) continue
            const target = path.join(BACKUP_DIR, stamp, pack)
            fs.mkdirSync(target, { recursive: true })
            for (const f of fs.readdirSync(path.join(PACKS, pack))) {
                if (f === "LOCK") continue
                fs.copyFileSync(path.join(PACKS, pack, f), path.join(target, f))
            }
        }

        for (const [pack, changes] of pending) {
            if (!changes.size) continue
            const batch = dbs.get(pack).batch()
            for (const [key, doc] of changes) {
                if (doc === null) batch.del(key)
                else batch.put(key, doc)
            }
            await batch.write()
        }
        console.log(`Applied ${report.applied} op(s), ${report.skipped} already in place. Backup: ${path.join(BACKUP_DIR, stamp)}`)
    } finally {
        for (const db of dbs.values()) await db.close()
    }
}

main().catch(error =>
{
    if (error?.code === "LEVEL_DATABASE_NOT_OPEN" || /lock/i.test(String(error?.message))) {
        console.error("Could not open a pack. Close the world in Foundry (return to setup) and try again.")
    }
    console.error(error)
    process.exitCode = 1
})
