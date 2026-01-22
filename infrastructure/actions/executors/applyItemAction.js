/**
 * Apply an item grant action to an actor.
 *
 * @param {object} params
 * @param {Actor} params.actor
 * @param {object} params.data
 * @param {string} params.data.uuid
 * @param {object} [params.data.replaces]
 * @param {string} [params.data.replaces.uuid]
 */
export async function applyItemAction({
    actor,
    data,
    context,
    logger
}) {
    if (data.mode == "consume") return await consumeUse({ actor, data });
    throw new Error(`Unknown mode in applyItemAction ${data.mode}`);
}

async function consumeUse({ actor, data }) {
    const { uuid, mode, blocker = false, uses = 0 } = data;

    const item = actor.items.find(
        i => i.flags?.transformations?.sourceUuid === uuid
    );

    if (!item) {
        return { applied: false, reason: "item-not-found" };
    }

    const itemUses = item.system?.uses;
    if (!itemUses) {
        return { applied: false, block: blocker, reason: "item-has-no-uses" };
    }

    const max = Number(itemUses.max) || 0;
    const spent = Number(itemUses.spent) || 0;
    const remaining = max - spent;

    if (remaining < uses) {
        return { applied: false, block: blocker, reason: "not-enough-uses" };
    }

    await item.update({
        "system.uses.spent": spent + uses
    });

    return { applied: true, consumed: uses };
}
