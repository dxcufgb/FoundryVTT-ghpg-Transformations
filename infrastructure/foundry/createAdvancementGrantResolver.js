import { DAMAGE_TYPE_CHOICES } from "./advancementCatalog.js"

export function createAdvancementGrantResolver({
    activeEffectRepository,
    logger
})
{
    logger.debug("createAdvancementGrantResolver", {
        activeEffectRepository
    })

    const grantHandlers = Object.freeze({
        dv: applyDamageVulnerabilityGrant
    })

    async function resolve({
        actor,
        grant,
        sourceItem = null
    })
    {
        logger.debug("createAdvancementGrantResolver.resolve", {
            actor,
            grant,
            sourceItem
        })

        const parsedGrant = parseGrant(grant)
        if (!parsedGrant) {
            return false
        }

        const handler = grantHandlers[parsedGrant.type]
        if (!handler) {
            logger.warn(
                "Advancement grant skipped: unsupported grant type",
                parsedGrant.type,
                grant
            )
            return false
        }

        return handler({
            actor,
            sourceItem,
            parsedGrant
        })
    }

    return Object.freeze({
        resolve
    })

    function parseGrant(rawGrant)
    {
        if (typeof rawGrant !== "string") {
            logger.warn(
                "Advancement grant skipped: invalid grant type",
                rawGrant
            )
            return null
        }

        const [type, value] = rawGrant.split(":")
        if (!type || !value) {
            logger.warn(
                "Advancement grant skipped: malformed grant",
                rawGrant
            )
            return null
        }

        return {
            raw: rawGrant,
            type,
            value
        }
    }

    async function applyDamageVulnerabilityGrant({
        actor,
        sourceItem,
        parsedGrant
    })
    {
        const entry = DAMAGE_TYPE_CHOICES[parsedGrant.value]
        if (!entry) {
            logger.warn(
                "Advancement grant skipped: unknown damage vulnerability",
                parsedGrant.value
            )
            return false
        }

        const effect = await activeEffectRepository.create({
            actor,
            name: `Damage Vulnerability: ${entry.label}`,
            label: entry.label,
            description:
                `Gain vulnerability to ${entry.label.toLowerCase()} damage.`,
            source: "transformation",
            icon: entry.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            changes: [{
                key: "system.traits.dv.value",
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.ADD ?? 2,
                value: entry.id
            }],
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    advancementGrant: parsedGrant.raw,
                    advancementGrantType: "damageVulnerability"
                }
            }
        })

        return effect != null
    }
}
