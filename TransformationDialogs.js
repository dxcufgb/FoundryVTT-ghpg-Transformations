export async function getRollDialogConfig(actor, savingThrowIdentifier, title = "Roll") {
    let config;
    const actor = canvas.tokens.controlled[0]?.actor;
    if (actor){
    config = await dnd5e.buildSavingThrowRollConfig(actor, savingThrowIdentifier, {
        title: title
    });
    }
    return config;
}

export function getSimpleDialog(title, content) {
    return new Dialog({
        title: title,
        content: `<p>${content}</p>`,
        buttons: {
            ok: {
                label: "Ok",
            }
        }
    });
}