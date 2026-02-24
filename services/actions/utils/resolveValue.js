export function resolveValue(value, context = {}, variables = {}, logger = null)
{
    logger?.debug?.("resolveValue", { value, context, variables })

    if (typeof value === "number") return value
    if (typeof value !== "string") return null

    const replaced = value.replace(
        /@([\w.]+)/g,
        (_, path) =>
        {
            const parts = path.split(".")

            // 1️⃣ Try variables first
            let cur = variables
            for (const p of parts) {
                cur = cur?.[p]
                if (cur == null) break
            }

            if (cur != null) return Number(cur) || 0

            // 2️⃣ Fallback to context
            cur = context
            for (const p of parts) {
                cur = cur?.[p]
                if (cur == null) return 0
            }

            return Number(cur) || 0
        }
    )

    try {
        return Function(`"use strict"; return (${replaced})`)()
    } catch (err) {
        logger?.warn?.("resolveValue evaluation failed", replaced, err)
        return null
    }
}
