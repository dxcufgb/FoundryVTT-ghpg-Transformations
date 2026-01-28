import { resolveValue } from "../utils/resolveValue.js";

export function createHpAction({
    actorRepository,
    logger
}) {
    return async function APPLY_HP({
        actor,
        action,
        context,
        variables
    }) {
        const { mode, value } = action.data ?? {};

        if (!mode || value == null) {
            logger.warn("HP action missing mode or value", action);
            return;
        }

        // Value is expected to already be resolved to a number
        const amount = Number(
            resolveValue(action.data.value, variables)
        );

        if (Number.isNaN(amount)) {
            logger.warn("HP action value is not a number", value);
            return;
        }

        logger.debug(
            "Applying HP action",
            actor.id,
            mode,
            amount
        );

        switch (mode) {
            case "temp":
                await actorRepository.addTempHp(actor, amount);
                break;

            case "heal":
                await actorRepository.addHp(actor, amount);
                break;

            case "damage":
                await actorRepository.applyDamage(actor, amount);
                break;

            case "set":
                await actorRepository.setActorHp(actor, amount);
                break;

            default:
                logger.warn("Unknown HP action mode", mode);
        }
    };
}
