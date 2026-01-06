export function registerContextMenu(app, html) {
    // Inject three-dot buttons if missing
    html.find(".item").each((_, li) => {
        if (li.querySelector(".context-trigger")) return;
        TransformationModule.logger.debug("Injecting context menu button into item:", li);
        const button = document.createElement("button");
        button.classList.add("context-trigger");
        button.type = "button";
        button.innerHTML = '<i class="fas fa-ellipsis-vertical"></i>';

        li.querySelector(".item-controls")?.appendChild(button);
    });

    html.on("click", ".context-trigger", ev => {
        ev.preventDefault();
        ev.stopPropagation();

        const li = ev.currentTarget.closest(".item");
        openContextMenu({ app, target: li, event: ev });
    });
}

function getOptions(app) {
    return [
        {
            name: "Edit",
            icon: '<i class="fas fa-edit"></i>',
            callback: (li, app) => app._onItemEdit(li)
        },
        {
            name: "Duplicate",
            icon: '<i class="fas fa-copy"></i>',
            callback: (li, app) => app._onItemDuplicate(li)
        },
        {
            name: "Delete",
            icon: '<i class="fas fa-trash"></i>',
            condition: () => app.isEditable,
            callback: (li, app) => app._onItemDelete(li)
        }
    ];
}

async function openContextMenu({ app, target, event }) {
    closeContextMenu();

    const rawOptions = getOptions(app);
    const callbacks = {};

    const options = rawOptions
        .filter(o => !o.condition || o.condition(target, app))
        .map(o => {
            const id = crypto.randomUUID();
            callbacks[id] = o.callback;
            return {
                id,
                name: o.name,
                icon: o.icon
            };
        });

    if (!options.length) return;

    const html = await foundry.applications.handlebars.renderTemplate(
        "modules/your-module/templates/context-menu.hbs",
        { options }
    );

    const menu = $(html).appendTo(document.body);
    menu.data("callbacks", callbacks);

    positionMenu(menu, target);

    menu.on("click", ".context-item", ev => {
        const id = ev.currentTarget.dataset.action;
        menu.data("callbacks")[id]?.(target, app);
        closeContextMenu();
    });

    $(document).one("click.contextmenu", closeContextMenu);
}

function positionMenu(menu, target) {
    const rect = target.getBoundingClientRect();
    const width = menu.outerWidth();

    menu.css({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - width
    });
}

function closeContextMenu() {
    $(".dnd5e-context-menu").remove();
    $(document).off("click.contextmenu");
}