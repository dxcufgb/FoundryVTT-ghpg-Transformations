export const ActionTypes = {
    EFFECT: "effect",
    ITEM: "item",
    FLAG: "flag",
    ROLL_TABLE: "rollTable",
    MACRO: "macro",
    SCRIPT: "script",
    SAVE: "save",
    HP: "hp",
    CHAT: "chat"
};

export function isValidAction(action) {
    return (
        typeof action?.type === "string" &&
        action.type in ActionTypes &&
        typeof action.data === "object"
    );
}
