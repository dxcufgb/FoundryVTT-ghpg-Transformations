import {
    ABILITY,
    SKILL,
    ROLL_TYPE,
    ROLL_MODE
} from "../../config/constants.js";

import { enumUtils } from "../../utils/enumUtils.js";

export function createD20RollAction({ ui }) {

    async function roll({
        actor,
        identifier,
        rollType,
        dc = null,
        mode = ROLL_MODE.NORMAL.int
    }) {
        if (!actor) {
            ui.notifications.warn("Select a token.");
            return;
        }

        const config = {};

        if (mode === ROLL_MODE.ADVANTAGE.int) {
            config.advantage = true;
        }

        if (mode === ROLL_MODE.DISADVANTAGE.int) {
            config.disadvantage = true;
        }

        if (enumUtils.enumContains(ABILITY, identifier)) {
            config.ability = identifier;

            if (rollType === ROLL_TYPE.SAVING_THROW) {
                if (dc != null) config.target = dc;
                return actor.rollSavingThrow(config);
            }

            if (rollType === ROLL_TYPE.ABILITY_CHECK) {
                return actor.rollAbilityCheck(config);
            }
        }

        if (enumUtils.enumContains(SKILL, identifier)) {
            config.skill = identifier;
            return actor.rollSkill(config);
        }

        ui.notifications.warn("Unknown roll type");
    }

    return {
        roll
    };
}
