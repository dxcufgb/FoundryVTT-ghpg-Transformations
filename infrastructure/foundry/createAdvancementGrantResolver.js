import { DAMAGE_TYPE_CHOICES, SKILL_CHOICES } from "./advancementCatalog.js"
import { createSkillChoiceDescription, createSkillChoiceName, resolveSkillChoiceValue } from "./advancementSkillResolver.js"

export function createAdvancementGrantResolver({
    activeEffectRepository,
    logger
})
{
    logger.debug("createAdvancementGrantResolver", {
        activeEffectRepository
    })

    const grantHandlers = Object.freeze({
        dv: applyDamageVulnerabilityGrant,
        skills: applySkillGrant
    })

    async function resolve({
        actor,
        grant,
        mode,
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
        if (!parsedGrant.mode) {
            parsedGrant.mode = mode
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

        const [type, value, mode = null] = rawGrant.split(":")
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
            value,
            mode
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

    async function applySkillGrant({
        actor,
        sourceItem,
        parsedGrant
    })
    {
        const entry = SKILL_CHOICES[parsedGrant.value]
        if (!entry) {
            logger.warn(
                "Advancement grant skipped: unknown skill",
                parsedGrant.value
            )
            return false
        }

        const mode = parsedGrant.mode ?? "forcedExpertise"
        const currentValue = Number(actor?.system?.skills?.[parsedGrant.value]?.value ?? 0)
        const resolvedSkillValue = resolveSkillChoiceValue({
            currentValue,
            mode,
            logger
        })

        if (resolvedSkillValue == null) {
            logger.debug(
                "Advancement grant skipped: skill mode did not resolve",
                parsedGrant.raw
            )
            return false
        }

        const effect = await activeEffectRepository.create({
            actor,
            name: createSkillChoiceName(
                entry.label,
                mode,
                resolvedSkillValue
            ),
            label: entry.label,
            description: createSkillChoiceDescription(
                entry.label,
                mode,
                resolvedSkillValue
            ),
            source: "transformation",
            icon: entry.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            skillIdentifier: parsedGrant.value,
            changes: [{
                key: `system.skills.${parsedGrant.value}.value`,
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                value: resolvedSkillValue
            }],
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    advancementGrant: parsedGrant.raw,
                    advancementGrantType: "skill",
                    advancementGrantMode: mode
                }
            }
        })

        return effect != null
    }
}
