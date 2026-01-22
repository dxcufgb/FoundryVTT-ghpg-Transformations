export async function applyEffectAction({ actor, data, context, logger }) {
    logger.debug("applyEffectAction called!");

    if (!data.mode) {
        throw new Error("applyEffectAction requires mode");
    }

    if (data.mode == "fromEffectCatalogByFlag") return applyEffectFromFlag(actor, data, context, logger);
}

async function applyEffectFromFlag(actor, data, context, logger) {

    // await actor.createEmbeddedDocuments("ActiveEffect", [{
    // 	label: effectName,
    // 	name: effectName,
    // 	description: description,
    // 	statuses: [effectName.replaceAll(" ", "")],
    // 	img: icon,
    // 	changes: changes,
    // 	origin: actor.uuid,
    // 	flags: {
    // 		[TransformationModule.constants.MODULE_NAME]: { removeOnLongRest: true }
    // 	},
    // }]);
}