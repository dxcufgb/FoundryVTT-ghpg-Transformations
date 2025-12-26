export async function getD20RollDialog(actor, identifier, rollType, dc = null, mode = dnd5e.dice.D20Roll.ADV_MODE.NORMAL) {
    if (!actor) {
        ui.notifications.warn("Select a token.");
        return;
    }

    let config;
    
    if (mode == dnd5e.dice.D20Roll.ADV_MODE.ADVANTAGE) {
        config.advantage = true
    }
    
    if (mode == dnd5e.dice.D20Roll.ADV_MODE.DISADVANTAGE) {
        config.disadvantage = true
    }
    
    if (CONFIG.DND5E.ABILITY[identifier]) {
        config.ability = identifier;
        if (rollType == TransformationModul.constant.ROLL_TYPE.SAVING_THROW) {
            if (dc != null) {
                config.target = dc
            }
            return actor.rollSavingThrow(config);
        } else if (rollType == TransformationModul.constant.ROLL_TYPE.ABILITY_CHECK) {
            return actor.rollAbilityCheck(config);
        }
    } else if (CONFIG.DND5E.SKILL[identifier]) {
        config.skill = identifier;
        return actor.rollSkill(config);
    } else {
        ui.notifications.warn("Uknown roll type");
    }
}