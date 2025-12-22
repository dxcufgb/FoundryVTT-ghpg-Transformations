Hooks.on("dnd5e.damageActor", async (actor, amount, updates) => {
    let transformation = new Transformation(actor);
    if (transformation.initialized) {
        transformation.onDamage();
    }
});

Hooks.on("dnd5e.restCompleted", async (actor, result) => {
    let transformation = new Transformation(actor);
    if (transformation.initialized) {
        if (result.type == "short") {
            transformation.onShortRest();
        } else if (result.longRest) {
            transformation.onLongRest();
        }
    }
});

Hooks.on("dnd5e.rollInitiative", (actor, combatant) => {
    let transformation = new Transformation(actor);
    if (transformation.initialized) {
        transformation.onInitiative();
    }
});