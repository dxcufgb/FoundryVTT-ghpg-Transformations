import { substitute } from "../actions/utils/substitute.js";

// services/formulas/createFormulaEvaluator.js
export function createFormulaEvaluator({ logger }) {
    logger.debug("createFormulaEvaluator", {})

    function evaluate({ formula, scope }) {
        logger.debug("createFormulaEvaluator.evaluate", { formula, scope })
        if (!formula) return null;

        try {
            const expression = substitute(formula, scope);
            const resolvedExpression = resolveJavaScriptCode(expression);
            return Roll.safeEval(resolvedExpression);
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

    function resolveJavaScriptCode(expression) {
        if (typeof expression !== "string" || expression.length === 0) {
            return expression;
        }

        try {
            return String(
                Function(`"use strict"; return (${expression});`)()
            );
        } catch {
            return expression;
        }
    }
}
