import { conditionsMet } from "../../domain/transformation/schema/conditionSchema.js";
import { ActionResult } from "./ActionResult.js";
import { hasActionRun, markActionAsRun } from "./onceRules.js";
import { actionExecutors } from "./executors/index.js";
import { isValidAction } from "../../domain/transformation/schema/actionSchema.js";


/**
 * Apply a single declarative action.
 *
 * @param {object} params
 * @param {Actor} params.actor              - Resolved actor document
 * @param {object} params.action             - Action definition
 * @param {object} params.context            - Execution context
 * @param {object} params.context.stage      - Transformation stage
 * @param {object} params.context.trigger    - Trigger name
 */
export async function applyAction({ actor, action, context, logger }) {
    isValidAction(action);

    if (!conditionsMet(actor, action.when, context)) {
        if (action.data.blocker) {
            return ActionResult.blocked("conditions-not-met");
        } else {
            return ActionResult.skipped("conditions-not-met");
        }
    }

    if (action.once) {
        const alreadyRan = hasActionRun(actor, action.once, context);
        if (alreadyRan) {
            return ActionResult.skipped("once-already-executed");
        }
    }

    const executor = actionExecutors[action.type];

    if (!executor) {
        throw new Error(`No executor registered for action type "${action.type}"`);
    }

    let result;
    try {
        result = await executor({
            actor,
            data: action.data,
            context,
            logger
        });
    } catch (error) {
        console.error(
            `Action execution failed [${action.type}]`,
            action,
            error
        );
        return ActionResult.failed(error);
    }

    if (action.once && result?.applied !== false) {
        await markActionAsRun(actor, action.once, context);
    }

    return result ?? ActionResult.applied();
}
