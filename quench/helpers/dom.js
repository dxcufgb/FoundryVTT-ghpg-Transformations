import { waitFor } from "./waitFor.js"

export async function waitForElement({
    root,
    selector,
    timeout
})
{
    return waitFor({
        timeout,
        predicate: () => root.querySelector(selector),
        errorMessage: `Timed out waiting for element: ${selector}`
    })
}

export async function waitForElements({
    root,
    selector,
    timeout
})
{
    return waitFor({
        timeout,
        predicate: () =>
        {
            if (!root) return false

            const els = root.querySelectorAll(selector)
            return els.length > 0 ? els : false
        },
        errorMessage: `Timed out waiting for elements: ${selector}`
    })
}



export function waitForDialog(title)
{
    return waitFor({
        predicate: () =>
            Array.from(ui.windows.values()).find(w => w.title === title),
        errorMessage: `Dialog not found: ${title}`
    })
}


export function waitForHook(hookName)
{
    return waitFor({
        predicate: () =>
            new Promise(resolve =>
                Hooks.once(hookName, (...args) => resolve(args))
            ),
        errorMessage: `Hook did not fire: ${hookName}`
    })
}

export async function waitForElementGone({
    selector,
    root = document,
    timeout = 5000
})
{
    return waitFor({
        timeout,
        predicate: () =>
        {
            const el = root.querySelector(selector)
            return !el || !el.isConnected
        },
        errorMessage: `Timed out waiting for element to be removed: ${selector}`
    })
}


export function waitForApplication(app)
{
    return waitFor({
        predicate: () => app.element?.length && app.rendered,
        errorMessage: "Application did not finish rendering"
    })
}

export function querySheet(sheet, selector)
{
    return sheet.element?.[0]?.querySelector(selector)
}

export async function waitForNextFrame()
{
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}
