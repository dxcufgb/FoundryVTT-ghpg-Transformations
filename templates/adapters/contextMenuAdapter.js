let ACTIVE_MENU = null;

export async function openContextMenu({ app, button, event }) {
    closeContextMenu();

    if (typeof app.getContextMenuOptions !== "function") return;

    const rawOptions = app.getContextMenuOptions();

    const callbacks = {};
    const options = [];

    for (const opt of rawOptions) {
        if (opt.condition && !opt.condition()) continue;

        const id = crypto.randomUUID();
        callbacks[id] = opt.callback;

        options.push({
            id,
            name: opt.name,
            icon: opt.icon
        });
    }

    if (!options.length) return;

    const html = await foundry.applications.handlebars.renderTemplate(
        "modules/transformations/scripts/templates/contextMenu.hbs",
        { options }
    );

    const menu = $(html).appendTo(document.body);
    ACTIVE_MENU = menu;

    menu.data("callbacks", callbacks);

    positionMenu(menu, button);

    // Handle option clicks
    menu.on("click", ".context-item", ev => {
        ev.preventDefault();
        ev.stopPropagation();

        const action = ev.currentTarget.dataset.action;
        const cb = menu.data("callbacks")[action];

        try {
            cb?.();
        } catch (err) {
            console.error("Context menu callback failed", err);
        }

        closeContextMenu();
    });

    // Close on outside click
    setTimeout(() => {
        $(document).on("click.contextmenu", ev => {
            if (!menu[0].contains(ev.target)) {
                closeContextMenu();
            }
        });
    }, 0);

    // Close on escape
    $(document).on("keydown.contextmenu", ev => {
        if (ev.key === "Escape") {
            closeContextMenu();
        }
    });
}

function positionMenu(menu, button) {
    const rect = button.getBoundingClientRect();
    const menuWidth = menu.outerWidth();
    const menuHeight = menu.outerHeight();

    let top = rect.bottom + window.scrollY;
    let left = rect.right + window.scrollX - menuWidth;

    // Clamp to viewport
    const maxLeft = window.innerWidth - menuWidth - 8;
    const maxTop = window.innerHeight - menuHeight - 8;

    left = Math.max(8, Math.min(left, maxLeft));
    top = Math.max(8, Math.min(top, maxTop));

    menu.css({ top, left });
}

export function closeContextMenu() {
    if (!ACTIVE_MENU) return;

    ACTIVE_MENU.remove();
    ACTIVE_MENU = null;

    $(document).off("click.contextmenu");
    $(document).off("keydown.contextmenu");
}