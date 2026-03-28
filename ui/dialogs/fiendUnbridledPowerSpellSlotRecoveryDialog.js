export class FiendUnbridledPowerSpellSlotRecoveryDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor({viewModel, controller, options = {}, logger = null})
    {
        logger?.debug?.("FiendUnbridledPowerSpellSlotRecoveryDialog.constructor", {
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
            "fiend-unbridled-power-spell-slot-recovery-dialog"
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
                "modules/transformations/scripts/templates/dialogs/fiend-unbridled-power-spell-slot-recovery-dialog.hbs"
        }
    };

    async _prepareContext()
    {
        this.logger?.debug?.(
            "FiendUnbridledPowerSpellSlotRecoveryDialog._prepareContext"
        )

        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.(
            "FiendUnbridledPowerSpellSlotRecoveryDialog._onRender",
            {
                context,
                options
            }
        )

        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const groups = Array.from(
            root.querySelectorAll(
                ".fiend-unbridled-power-spell-slot-recovery__group"
            )
        )
        const checkboxes = Array.from(
            root.querySelectorAll("[data-slot-checkbox]")
        )
        const confirmBtn = root.querySelector("[data-action='confirm']")
        const remainingValue = root.querySelector("[data-remaining]")
        const closeBtn = root.querySelector("[data-action='close']")

        const getGroupCheckboxes = group =>
            Array.from(group?.querySelectorAll("[data-slot-checkbox]") ?? [])

        const getGroupCost = group =>
        {
            const firstCheckbox = getGroupCheckboxes(group)[0]
            return Number(firstCheckbox?.dataset.slotCost ?? 0)
        }

        const getSelectedCount = group =>
            getGroupCheckboxes(group).filter(checkbox => checkbox.checked).length

        const setSelectedCount = (group, count) =>
        {
            const checkboxes = getGroupCheckboxes(group)
            checkboxes.forEach((checkbox, index) =>
            {
                checkbox.checked = index < count
            })
        }

        const getTotalSelectedCost = () =>
            groups.reduce((total, group) =>
            {
                const cost = getGroupCost(group)
                if (cost <= 0) return total

                return total + (getSelectedCount(group) * cost)
            }, 0)

        const updateSelectionState = () =>
        {
            const totalSelectedCost = getTotalSelectedCost()

            const remaining = Math.max(this.viewModel.amount - totalSelectedCost, 0)

            if (remainingValue) {
                remainingValue.textContent = String(remaining)
            }

            for (const group of groups) {
                const groupCheckboxes = getGroupCheckboxes(group)
                const groupCost = getGroupCost(group)
                const selectedCount = getSelectedCount(group)
                const otherSelectedCost =
                          totalSelectedCost - (selectedCount * groupCost)
                const maxReachableCount =
                          groupCost > 0
                              ? Math.min(
                                  groupCheckboxes.length,
                                  Math.floor(
                                      Math.max(
                                          this.viewModel.amount - otherSelectedCost,
                                          0
                                      ) / groupCost
                                  )
                              )
                              : selectedCount

                groupCheckboxes.forEach((checkbox, index) =>
                {
                    if (checkbox.checked) {
                        checkbox.disabled = false
                        return
                    }

                    checkbox.disabled = index >= maxReachableCount
                })
            }

            if (confirmBtn) {
                confirmBtn.disabled = totalSelectedCost <= 0
            }
        }

        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", event =>
            {
                const changedCheckbox = event.currentTarget
                const group = changedCheckbox.closest(
                    ".fiend-unbridled-power-spell-slot-recovery__group"
                )
                const groupCheckboxes = getGroupCheckboxes(group)
                const changedIndex = groupCheckboxes.indexOf(changedCheckbox)
                const groupCost = getGroupCost(group)
                const otherSelectedCost =
                          getTotalSelectedCost() -
                          (changedCheckbox.checked ? groupCost : 0)
                const maxReachableCount =
                          groupCost > 0
                              ? Math.min(
                                  groupCheckboxes.length,
                                  Math.floor(
                                      Math.max(
                                          this.viewModel.amount - otherSelectedCost,
                                          0
                                      ) / groupCost
                                  )
                              )
                              : groupCheckboxes.length
                const desiredCount = changedCheckbox.checked
                    ? changedIndex + 1
                    : changedIndex

                setSelectedCount(
                    group,
                    Math.min(desiredCount, maxReachableCount)
                )

                updateSelectionState()
            })
        }

        confirmBtn?.addEventListener("click", async () =>
        {
            const selectedSpellSlots = checkboxes
                .filter(checkbox => checkbox.checked)
                .map(checkbox => ({
                    slotKey: checkbox.dataset.slotKey,
                    level: Number(checkbox.dataset.slotLevel ?? 0),
                    cost: Number(checkbox.dataset.slotCost ?? 0),
                    slotType: checkbox.dataset.slotType ?? "spell"
                }))

            if (selectedSpellSlots.length === 0) return

            await this.controller.confirm(selectedSpellSlots)
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
            "FiendUnbridledPowerSpellSlotRecoveryDialog._onClose",
            {options}
        )

        await super._onClose(options)
        this.controller.cancel?.()
    }
}
