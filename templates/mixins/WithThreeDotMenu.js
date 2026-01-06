export const WithThreeDotMenu = Base =>
    class extends Base {

        async _onRender(context, options) {
            await super._onRender?.(context, options);
            const cfg = this.constructor.threeDotConfig;
            if (cfg.gmOnly && !game.user.isGM) return;
            if (this._hasThreeDotButton) return;
            this._injectThreeDotButton();
        }

        _injectThreeDotButton() {
            const cfg = this.constructor.threeDotConfig;
            if (!cfg) return;

            const elementToPutAfter = this.element.querySelector(cfg.selector);
            if (!elementToPutAfter) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "header-control icon fa-solid fa-ellipsis-vertical";
            button.ariaLabel = "Options";
            button.tooltip = "Options";

            button.addEventListener("click", ev => {
                ev.preventDefault();
                ev.stopPropagation();

                Hooks.call("threeDotMenu", {
                    app: this,
                    button,
                    event: ev
                });
            });

            elementToPutAfter.after(button);
            this._hasThreeDotButton = true;
        }
    };