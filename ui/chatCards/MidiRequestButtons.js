export function renderMidiRequestButtons({
    buttons = [],
    rootClasses = ["midi-dnd5e-buttons"],
    wrapperClasses = ["card-buttons"],
    rootDataset = {},
    rootAttributes = {}
} = {})
{
    if (!buttons.length) return ""

    const root = document.createElement("div")
    applyClasses(root, rootClasses)
    applyDataset(root, rootDataset)
    applyAttributes(root, rootAttributes)

    const wrapper = document.createElement("div")
    applyClasses(wrapper, wrapperClasses)

    for (const buttonData of buttons) {
        wrapper.append(createMidiRequestButton(buttonData))
    }

    root.append(wrapper)

    return root.outerHTML
}

export function createMidiRequestButton({
    icon = "",
    label = "",
    visibleLabel = "",
    hiddenLabel = "",
    dataset = {},
    attributes = {},
    classes = [],
    disabled = false
} = {})
{
    const button = document.createElement("button")
    button.type = "button"

    applyClasses(button, classes)
    applyDataset(button, dataset)
    applyAttributes(button, attributes)

    if (disabled) {
        button.disabled = true
    }

    if (icon) {
        button.insertAdjacentHTML("beforeend", icon)
    }

    if (visibleLabel || hiddenLabel) {
        if (visibleLabel) {
            const visible = document.createElement("span")
            visible.className = "visible-dc"
            visible.innerHTML = visibleLabel
            button.append(visible)
        }

        if (hiddenLabel) {
            const hidden = document.createElement("span")
            hidden.className = "hidden-dc"
            hidden.innerHTML = hiddenLabel
            button.append(hidden)
        }
    } else if (label) {
        button.insertAdjacentHTML("beforeend", label)
    }

    return button
}

function applyClasses(element, classes)
{
    for (const className of normalizeArray(classes)) {
        if (!className) continue
        element.classList.add(className)
    }
}

function applyDataset(element, dataset)
{
    for (const [key, value] of Object.entries(dataset ?? {})) {
        if (value == null) continue
        element.dataset[key] = String(value)
    }
}

function applyAttributes(element, attributes)
{
    for (const [name, value] of Object.entries(attributes ?? {})) {
        if (value == null || value === false) continue

        if (value === true || value === "") {
            element.setAttribute(name, "")
            continue
        }

        element.setAttribute(name, String(value))
    }
}

function normalizeArray(value)
{
    return Array.isArray(value)
        ? value
        : [value]
}
