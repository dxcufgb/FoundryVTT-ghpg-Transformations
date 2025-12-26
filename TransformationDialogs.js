export async function getD20Roll(actor, identifier, title, flavor, mode = TransformationModule.constants.ROLL_MODE.NORMAL) {
    if (!actor) {
        ui.notifications.warn("Select a token.");
        return;
    }

    const config = await dnd5e.buildSavingThrowRollConfig(actor, identifier, {
    title: title,
    flavor: flavor
    });

    if (mode == TransformationModule.constants.ROLL_MODE.ADVANTAGE) {
        config.advantage = true
    }

    if (mode == TransformationModule.constants.ROLL_MODE.DISADVANTAGE) {
        config.disadvantage = true
    }

    const roll = await dnd5e.rollSavingThrow(config);
}