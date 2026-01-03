export function registerTransformationConfigurationEventListeners(app, html, data) {
    html.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const config = button.dataset.config;
        if (action === "showConfiguration" && config === "transformation") {
            if (!app.isEditable) return;
            const showConfiguration = TransformationModule.dialogConfigs.showConfiguration;

            new showConfiguration.TransformationConfig(
                app.actor,
                TransformationModule.Transformations
            ).render(true);
        }
    });
}

export function registerTransformationTooltipEventListeners(app, html, data) {
    container.addEventListener("mouseenter", async (event) => {
        const pill = event.target.closest(".transformation");
        if (!pill) return;

        const uuid = pill.dataset.uuid;
        const item = await fromUuid(uuid);
        if (!item) return;

        showCustomTooltip(pill, item);
    }, true);

    container.addEventListener("mouseleave", () => {
        hideCustomTooltip();
    }, true);
}

let tooltipEl;

function showCustomTooltip(anchor, item) {
    hideCustomTooltip();

    tooltipEl = document.createElement("div");
    tooltipEl.className = "custom-tooltip";
    tooltipEl.innerHTML = `
    <strong>${foundry.utils.escapeHTML(item.name)}</strong><br>
    ${foundry.utils.escapeHTML(item.system?.description?.value ?? "")}
  `;

    document.body.appendChild(tooltipEl);

    const rect = anchor.getBoundingClientRect();
    tooltipEl.style.left = `${rect.right + 8}px`;
    tooltipEl.style.top = `${rect.top}px`;
}

function hideCustomTooltip() {
    tooltipEl?.remove();
    tooltipEl = null;
}
