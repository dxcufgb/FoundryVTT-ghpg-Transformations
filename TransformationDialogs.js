export async function getRollDialogConfig(actor, savingThrowIdentifier, title = "Roll") {
    let config;;
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