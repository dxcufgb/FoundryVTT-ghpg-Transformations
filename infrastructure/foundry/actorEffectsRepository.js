import { MODULE_NAME } from "../../config/constants.js";

export function createActorEffectsRepository() {

    async function createEffect({
        actor,
        name,
        description,
        icon,
        changes
    }) {
        return actor.createEmbeddedDocuments("ActiveEffect", [
            {
                label: name,
                name,
                description,
                statuses: [name.replaceAll(" ", "")],
                img: icon,
                changes,
                origin: actor.uuid,
                flags: {
                    [MODULE_NAME]: { removeOnLongRest: true }
                }
            }
        ]);
    }

    return {
        createEffect
    };
}
