export async function getD20RollDialog(actor, identifier, rollType, dc = null, mode = TransformationModule.constants.ROLL_MODE.NORMAL.int) {
    if (!actor) {
        ui.notifications.warn("Select a token.");
        return;
    }

    let config = {};
    
    if (mode == TransformationModule.constants.ROLL_MODE.ADVANTAGE.int) {
        config.advantage = true
    }
    
    if (mode == TransformationModule.constants.ROLL_MODE.DISADVANTAGE.int) {
        config.disadvantage = true
    }
    
    if (TransformationModule.constants.ABILITY.contains(identifier)) {
        config.ability = identifier;
        if (rollType == TransformationModul.constant.ROLL_TYPE.SAVING_THROW) {
            if (dc != null) {
                config.target = dc
            }
            return actor.rollSavingThrow(config);
        } else if (rollType == TransformationModul.constant.ROLL_TYPE.ABILITY_CHECK) {
            return actor.rollAbilityCheck(config);
        }
    } else if (TransformationModule.constants.SKILL.contains(identifier)) {
        config.skill = identifier;
        return actor.rollSkill(config);
    } else {
        ui.notifications.warn("Uknown roll type");
    }
}