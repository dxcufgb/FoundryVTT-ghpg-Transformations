export function getSimpleDialog(title, content) {
    return new Dialog({
        title: title,
        content: `<p>${content}</p>`,
        buttons: {
            ok: {
                label: "Ok",
            }
        }
    })
}

export function getRollDialog(title, content) {
    return new Promise((resolve) => {
        const dialog = new Dialog({
            title: title,
            content: content,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: async () => {
                        const roll = await new Roll("1d20").roll({ async: true });
                        roll.toMessage({ flavor: "Custom Check" });
                        resolve(roll.total);
                    }
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => resolve(null)
            },
            default: "roll"
        });
        dialog.render(true);
    });
}