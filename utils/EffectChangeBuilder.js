export class EffectChangeBuilder
{
    constructor ({
        constants,
        logger
    })
    {
        this.constants = constants
        this.logger = logger
    }

    getDisadvantage(identifier, rollType = this.constants.ROLL_TYPE.ABILITY_CHECK)
    {
        return this.#get(identifier, rollType, -1)
    }

    getAdvantage(identifier, rollType = this.constants.ROLL_TYPE.ABILITY_CHECK)
    {
        return this.#get(identifier, rollType, 1)
    }
    #get(identifier, rollType, value)
    {
        const { SKILL, ABILITY, ATTRIBUTE } = this.constants

        if (Object.values(SKILL).includes(identifier)) {
            return this.#skill(identifier, value)
        }

        if (Object.values(ABILITY).includes(identifier)) {
            return this.#ability(identifier, rollType, value)
        }

        if (Object.values(ATTRIBUTE.ROLLABLE).includes(identifier)) {
            return this.#attribute(identifier, value)
        }

        this.logger.warn(
            "Unknown identifier in EffectChangeBuilder",
            identifier
        )
        return []
    }

    #skill(skill, value)
    {
        return [
            {
                key: `system.skills.${skill}.roll.mode`,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value
            }
        ]
    }

    #ability(ability, rollType, value)
    {
        if (rollType === this.constants.ROLL_TYPE.ABILITY_CHECK) {
            return [
                {
                    key: `system.abilities.${ability}.check.roll.mode`,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value
                }
            ]
        }

        if (rollType === this.constants.ROLL_TYPE.SAVING_THROW) {
            return [
                {
                    key: `system.abilities.${ability}.save.roll.mode`,
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value
                }
            ]
        }

        this.logger.warn(
            "Unknown roll type in EffectChangeBuilder",
            rollType
        )
        return []
    }

    #attribute(attribute, value)
    {
        return [
            {
                key: `system.attributes.${attribute}.roll.mode`,
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value
            }
        ]
    }

    findOverrideType(identifier)
    {
        const { MOVEMENT_TYPE, ATTRIBUTE, OVERRIDE_TYPE } = this.constants

        if (MOVEMENT_TYPE.contains(identifier)) {
            return OVERRIDE_TYPE.MOVEMENT_TYPE
        }

        if (
            ATTRIBUTE.contains(identifier) ||
            ATTRIBUTE.ROLLABLE.contains(identifier)
        ) {
            return OVERRIDE_TYPE.ATTRIBUTES
        }

        this.logger.warn(
            "Unknown identifier in findOverrideType",
            identifier
        )
        return null
    }
}