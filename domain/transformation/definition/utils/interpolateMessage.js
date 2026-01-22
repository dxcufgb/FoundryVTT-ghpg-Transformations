import { resolveExpression } from "./resolveExpression.js";

/**
 * Replace @expressions inside a chat message.
 */
export function interpolateMessage(template, context) {
    return template.replace(
        /@([a-zA-Z_][a-zA-Z0-9_.]*)/g,
        (_, expr) => {
            const value = resolveExpression(`@${expr}`, context);
            return value != null ? value : "";
        }
    );
}