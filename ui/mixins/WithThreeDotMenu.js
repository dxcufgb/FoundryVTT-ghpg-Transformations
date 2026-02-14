export function WithThreeDotMenu(Base, logger = null) {
    logger?.debug?.("WithThreeDotMenu", { Base })
    return class extends Base {

        activateListeners(html) {
            logger?.debug?.("WithThreeDotMenu.activateListeners", { html })
            super.activateListeners?.(html);

            html.find("[data-menu]").on("click", ev => {
                this._onThreeDotMenu(ev);
            });
        }

        _onThreeDotMenu(event) {
            logger?.debug?.("WithThreeDotMenu._onThreeDotMenu", { event })
            event.preventDefault();
            this.element
                .find(".three-dot-menu")
                .toggleClass("open");
        }
    };
}
