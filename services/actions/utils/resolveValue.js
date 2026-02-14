export function resolveValue(value, context, logger = null) {
    logger?.debug?.("resolveValue", { value, context })
    if (typeof value === "number") return value;

    if (typeof value !== "string") return null;

    // Simple @variable replacement
    const replaced = value.replace(
        /@([\w.]+)/g,
        (_, path) => {
            const parts = path.split(".");
            let cur = context;
            for (const p of parts) {
                cur = cur?.[p];
                if (cur == null) return 0;
            }
            return Number(cur) || 0;
        }
    );

    try {
        return Function(`"use strict"; return (${replaced})`)();
    } catch {
        return null;
    }
}
