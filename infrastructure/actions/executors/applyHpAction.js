import {
    resolveExpression,
    buildExpressionContext
} from "../utils/index.js";
/**
 * Apply an HP-related action to an actor.
 *
 * @param {object} params
 * @param {Actor} params.actor
 * @param {object} params.data
 */
export async function applyHpAction({ actor, data, context, logger }) {

    if (!data.mode) {
        throw new Error("HP action requires mode");
    }

    if (data.mode === "temp") return await applyTempHp({ actor, data, context });

    if (data.mode === "heal") return await applyHeal({ actor, data, context });

    if (data.mode === "damage") return await applyDamage({ actor, data, context });

    throw new Error(`Unknown HP action mode: ${data.mode}`);
}

async function applyTempHp({ actor, data, context }) {
    const { result, commonData } = prepareData({ actor, data, context });
    if (result != "success") return result;

    const currentTemp = Number(commonData.hp.temp) || 0;

    await actor.update({
        "system.attributes.hp.temp": commonData.resolvedValue + currentTemp
    });

    return { applied: true };
}

async function applyHeal({ actor, data, context }) {
    const { result, commonData } = prepareData({ actor, data, context });
    if (result != "success") return result;

    const current = Number(commonData.hp.value) || 0;
    const max = Number(commonData.hp.max) || 0;

    if (current >= max && !commonData.allowOverflow) {
        return {
            applied: false,
            block: blockIfNoEffect,
            reason: "already-at-max-hp"
        };
    }

    let newValue = current + commonData.resolvedValue;

    if (commonData.clamp && !commonData.allowOverflow) {
        newValue = Math.min(newValue, max);
    }

    await actor.update({
        "system.attributes.hp.value": newValue
    });

    return { applied: true };
}

async function applyDamage({ actor, data, context }) {
    const { result, commonData } = prepareData({ actor, data, context });
    if (result != "success") return result;

    const current = Number(commonData.hp.value) || 0;

    if (current <= 0) {
        return {
            applied: false,
            block: blockIfNoEffect,
            reason: "already-at-zero"
        };
    }

    const newValue = Math.max(0, current - commonData.resolvedValue);

    await actor.update({
        "system.attributes.hp.value": newValue
    });

    return { applied: true };
}

function prepareData({ actor, data, context }) {
    let result = "success";
    let returnData = {
        mode: data.mode,
        value: data.value,
        clamp: data.clamp ?? true,
        allowOverflow: data.allowOverflow ?? false,
        blockIfNoEffect: data.blockIfNoEffect ?? false,
    }
    const resolvedValue = resolveExpression(returnData.value, buildExpressionContext(actor, context));

    if (!resolvedValue || resolvedValue <= 0) {
        result = {
            applied: false,
            block: blockIfNoEffect,
            reason: "no-hp-change"
        };
    } else {
        returnData.resolvedValue = resolvedValue
    }
    const hp = actor.system?.attributes?.hp;
    if (!hp) {
        result = { applied: false };
    } else {
        returnData.hp = hp
    }
    return { result: result, commonData: returnData };
}