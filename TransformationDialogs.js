export function getSimpleDialog(title, content) {
    new Dialog({
        title: title,
        content: `<p>${content}</p>`,
        buttons: {
            ok: {
                label: "Ok",
            }
        }
    })
}