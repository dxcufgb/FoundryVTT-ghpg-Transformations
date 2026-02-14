import { substitute } from "../actions/utils/substitute.js";

// services/formulas/createFormulaEvaluator.js
export function createFormulaEvaluator({ logger }) {
    logger.debug("createFormulaEvaluator", {})

    function evaluate({ formula, scope }) {
        logger.debug("createFormulaEvaluator.evaluate", { formula, scope })
        if (!formula) return null;

        try {
            const expression = substitute(formula, scope);
            return Roll.safeEval(expression);
        } catch (err) {
            logger.error("Formula evaluation failed", {
                formula,
                scope,
                err
            });
            return null;
        }
    }

    return Object.freeze({ evaluate });
}
