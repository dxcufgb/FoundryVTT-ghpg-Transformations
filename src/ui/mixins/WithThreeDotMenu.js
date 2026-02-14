export function WithThreeDotMenu(Base) {
    return class extends Base {

        activateListeners(html) {
            super.activateListeners?.(html);

            html.find("[data-menu]").on("click", ev => {
                this._onThreeDotMenu(ev);
            });
        }

        _onThreeDotMenu(event) {
            event.preventDefault();
            this.element
                .find(".three-dot-menu")
                .toggleClass("open");
        }
    };
}