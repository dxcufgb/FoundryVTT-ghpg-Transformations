export class TransformationsSpellSlotRecoveryDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor({viewModel, controller, options = {}, logger = null})
    {
        logger?.debug?.("TransformationsSpellSlotRecoveryDialog.constructor", {
            viewModel,
            controller,
            options
        })

        const mergedOptions = mergeDialogOptions({
            viewModel,
            options
        })

        super(mergedOptions)

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
            "transformations-spell-slot-recovery-dialog"
        ],
        window: {
            title: "Recover Spell Slots",
            width: 480,
            height: "auto",
            resizable: false
        }
    };

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/transformations-spell-slot-recovery-dialog.hbs"
        }
    };

    async _prepareContext()
    {
        this.logger?.debug?.(
            "TransformationsSpellSlotRecoveryDialog._prepareContext"
        )

        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.(
            "TransformationsSpellSlotRecoveryDialog._onRender",
            {
                context,
                options
            }
        )

        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const selectionMode = this.viewModel.selectionMode
        const groups = Array.from(root.querySelectorAll("[data-slot-group]"))
        const slotInputs = Array.from(root.querySelectorAll("[data-slot-option]"))
        const confirmBtn = root.querySelector("[data-action='confirm']")
        const closeBtn = root.querySelector("[data-action='close']")
        const selectionSummaryValue = root.querySelector("[data-selection-summary]")

        const getGroupInputs = group =>
            Array.from(group?.querySelectorAll("[data-slot-option]") ?? [])

        const getGroupCost = group =>
        {
            const firstInput = getGroupInputs(group)[0]
            return Number(firstInput?.dataset.slotCost ?? 0)
        }

        const mapInputToSelection = input => ({
            slotKey: input.dataset.slotKey,
            level: Number(input.dataset.slotLevel ?? 0),
            cost: Number(input.dataset.slotCost ?? 0),
            slotType: input.dataset.slotType ?? "spell"
        })

        const getSelectedInput = () =>
            slotInputs.find(input => input.checked)

        const getSelectedCost = () =>
        {
            if (selectionMode === "multiple") {
                return slotInputs
                    .filter(input => input.checked)
                    .reduce((total, input) =>
                        total + Number(input.dataset.slotCost ?? 0), 0)
            }

            return Number(getSelectedInput()?.dataset.slotCost ?? 0)
        }

        const updateSingleSelectionState = () =>
        {
            const selectedInput = getSelectedInput()
            const selectedCost = Number(selectedInput?.dataset.slotCost ?? 0)

            if (selectionSummaryValue) {
                selectionSummaryValue.textContent = String(selectedCost)
            }

            if (confirmBtn) {
                confirmBtn.disabled = !selectedInput
            }
        }

        const updateMultipleSelectionState = () =>
        {
            const totalSelectedCost = getSelectedCost()
            const budget = Math.max(Number(this.viewModel.maxRecoverableCost ?? 0), 0)
            const remaining = Math.max(budget - totalSelectedCost, 0)

            if (selectionSummaryValue) {
                selectionSummaryValue.textContent = String(remaining)
            }

            for (const group of groups) {
                const groupInputs = getGroupInputs(group)
                const groupCost = getGroupCost(group)
                const selectedCount = groupInputs.filter(input => input.checked).length
                const otherSelectedCost =
                    totalSelectedCost - (selectedCount * groupCost)
                const maxReachableCount =
                    groupCost > 0
                        ? Math.min(
                            groupInputs.length,
                            Math.floor(
                                Math.max(budget - otherSelectedCost, 0) / groupCost
                            )
                        )
                        : selectedCount

                groupInputs.forEach((input, index) =>
                {
                    if (input.checked) {
                        input.disabled = false
                        return
                    }

                    input.disabled = index >= maxReachableCount
                })
            }

            if (confirmBtn) {
                confirmBtn.disabled = totalSelectedCost <= 0
            }
        }

        const updateSelectionState = () =>
        {
            if (selectionMode === "multiple") {
                updateMultipleSelectionState()
                return
            }

            updateSingleSelectionState()
        }

        for (const input of slotInputs) {
            input.addEventListener("change", event =>
            {
                if (selectionMode === "multiple") {
                    const changedInput = event.currentTarget
                    const group = changedInput.closest("[data-slot-group]")
                    const groupInputs = getGroupInputs(group)
                    const changedIndex = groupInputs.indexOf(changedInput)
                    const groupCost = getGroupCost(group)
                    const otherSelectedCost =
                        getSelectedCost() -
                        (changedInput.checked ? groupCost : 0)
                    const budget = Math.max(
                        Number(this.viewModel.maxRecoverableCost ?? 0),
                        0
                    )
                    const maxReachableCount =
                        groupCost > 0
                            ? Math.min(
                                groupInputs.length,
                                Math.floor(
                                    Math.max(budget - otherSelectedCost, 0) / groupCost
                                )
                            )
                            : groupInputs.length
                    const desiredCount = changedInput.checked
                        ? changedIndex + 1
                        : changedIndex

                    groupInputs.forEach((groupInput, index) =>
                    {
                        groupInput.checked = index < Math.min(
                            desiredCount,
                            maxReachableCount
                        )
                    })
                }

                updateSelectionState()
            })
        }

        confirmBtn?.addEventListener("click", async () =>
        {
            if (selectionMode === "multiple") {
                const selectedSpellSlots = slotInputs
                    .filter(input => input.checked)
                    .map(mapInputToSelection)

                if (selectedSpellSlots.length === 0) return

                await this.controller.confirm(selectedSpellSlots)
                this.close()
                return
            }

            const selectedInput = getSelectedInput()
            if (!selectedInput) return

            await this.controller.confirm(mapInputToSelection(selectedInput))
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
        this.logger?.debug?.(
            "TransformationsSpellSlotRecoveryDialog._onClose",
            {options}
        )

        await super._onClose(options)
        this.controller.cancel?.()
    }
}

function mergeDialogOptions({
    viewModel,
    options
})
{
    const dialogClassName = viewModel?.dialogClassName
    const classes = [
        ...TransformationsSpellSlotRecoveryDialog.DEFAULT_OPTIONS.classes,
        ...(options?.classes ?? []),
        ...(dialogClassName ? [dialogClassName] : [])
    ]

    return {
        ...options,
        classes: Array.from(new Set(classes)),
        window: {
            ...TransformationsSpellSlotRecoveryDialog.DEFAULT_OPTIONS.window,
            ...(options?.window ?? {}),
            title: viewModel?.title ?? options?.window?.title
        }
    }
}
