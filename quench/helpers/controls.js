export function findControlButton(name)
{
    const controls = ui.controls?.controls ?? []
    for (const control of controls) {
        const tool = control.tools.find(t => t.name === name)
        if (tool) return tool
    }
    return null
}
