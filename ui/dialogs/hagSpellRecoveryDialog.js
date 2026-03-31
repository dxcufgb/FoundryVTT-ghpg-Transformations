export class HagSpellRecoveryDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor({viewModel, controller, options = {}, logger = null})
    {
        logger?.debug?.("HagSpellRecoveryDialog.constructor", {
            viewModel,
            controller,
            options
        })

        super(options)

        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: [
            "sheet",
            "dnd5e2",
            "standard-form",
            "hag-spell-recovery-dialog"
        ],
        window: {
            title: "Hag Spell Recovery",
            width: 480,
            height: "auto",
            resizable: false
        }
    };

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/hag-spell-recovery-dialog.hbs"
        }
    };

    async _prepareContext()
    {
        this.logger?.debug?.("HagSpellRecoveryDialog._prepareContext")

        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("HagSpellRecoveryDialog._onRender", {
            context,
            options
        })

        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const radios = Array.from(root.querySelectorAll("[data-slot-radio]"))
        const confirmBtn = root.querySelector("[data-action='confirm']")
        const closeBtn = root.querySelector("[data-action='close']")
        const selectedCost = root.querySelector("[data-selected-cost]")

        const updateSelectionState = () =>
        {
            const selectedRadio = radios.find(radio => radio.checked)
            const cost = Number(selectedRadio?.dataset.slotCost ?? 0)

            if (selectedCost) {
                selectedCost.textContent = String(cost)
            }

            if (confirmBtn) {
                confirmBtn.disabled = !selectedRadio
            }
        }

        for (const radio of radios) {
            radio.addEventListener("change", () =>
            {
                updateSelectionState()
            })
        }

        confirmBtn?.addEventListener("click", async () =>
        {
            const selectedRadio = radios.find(radio => radio.checked)
            if (!selectedRadio) return

            await this.controller.confirm({
                slotKey: selectedRadio.dataset.slotKey,
                level: Number(selectedRadio.dataset.slotLevel ?? 0),
                cost: Number(selectedRadio.dataset.slotCost ?? 0),
                slotType: selectedRadio.dataset.slotType ?? "spell"
            })
            this.close()
        })

        closeBtn?.addEventListener("click", () =>
        {
            this.close()
        })

        updateSelectionState()
    }

    async _onClose(options)
    {
        this.logger?.debug?.("HagSpellRecoveryDialog._onClose", {options})

        await super._onClose(options)
        this.controller.cancel?.()
    }
}
