export class AbilityScoreAdvancementDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor({actor, viewModel, controller, options = {}, logger = null})
    {
        logger?.debug?.("AbilityScoreAdvancementDialog.constructor", {
            actor,
            viewModel,
            controller,
            options
        })

        super(mergeDialogOptions({
            viewModel,
            options
        }))

        this.actor = actor
        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
        this.didResolve = false
        this.abilityStates = viewModel.abilities.map(ability => ({
            ...ability
        }))
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: [
            "sheet",
            "dnd5e2",
            "standard-form",
            "ability-score-advancement-dialog"
        ],
        window: {
            title: "Allocate Ability Scores",
            width: 520,
            height: "auto",
            resizable: false
        }
    }

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/ability-score-advancement-dialog.hbs"
        }
    }

    async _prepareContext()
    {
        this.logger?.debug?.("AbilityScoreAdvancementDialog._prepareContext")

        return {
            ...this.viewModel,
            abilities: this.abilityStates.map(ability => ({
                ...ability
            })),
            pointsRemaining: this.getRemainingPoints()
        }
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("AbilityScoreAdvancementDialog._onRender", {
            context,
            options
        })

        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const actionButtons = root.querySelectorAll("[data-action]")

        actionButtons.forEach(button =>
        {
            button.addEventListener("click", async event =>
            {
                const action = event.currentTarget.dataset.action
                const abilityKey = event.currentTarget.dataset.abilityKey

                switch (action) {
                    case "increase":
                        this.adjustAbilityScore(abilityKey, 1)
                        this.updateUi(root)
                        break
                    case "decrease":
                        this.adjustAbilityScore(abilityKey, -1)
                        this.updateUi(root)
                        break
                    case "confirm":
                        this.didResolve = true
                        await this.controller.confirm(this.getSelection())
                        await this.close({force: true})
                        break
                    case "close":
                        await this.close({force: true})
                        break
                    default:
                        break
                }
            })
        })

        this.updateUi(root)
    }

    async _onClose(options)
    {
        this.logger?.debug?.("AbilityScoreAdvancementDialog._onClose", {
            options
        })

        await super._onClose(options)

        if (!this.didResolve) {
            this.controller.cancel?.()
        }
    }

    getSelection()
    {
        return this.abilityStates.reduce((selection, ability) =>
        {
            selection[ability.key] = ability.selectedValue
            return selection
        }, {})
    }

    getRemainingPoints()
    {
        return Math.max(
            Number(this.viewModel.pointsAvailable ?? 0) - this.getSpentPoints(),
            0
        )
    }

    getSpentPoints()
    {
        return this.abilityStates.reduce((total, ability) =>
            total + Math.max(
                ability.selectedValue - ability.currentValue - ability.fixedIncrease,
                0
            ),
        0)
    }

    canIncrease(ability)
    {
        if (ability?.locked) return false

        return this.getRemainingPoints() > 0 &&
            ability.selectedValue < ability.maximumSelectableValue
    }

    canDecrease(ability)
    {
        if (ability?.locked) return false

        return ability.selectedValue > (
            ability.currentValue + ability.fixedIncrease
        )
    }

    adjustAbilityScore(abilityKey, delta)
    {
        const ability = this.abilityStates.find(entry => entry.key === abilityKey)
        if (!ability || !Number.isFinite(delta)) return

        if (delta > 0 && this.canIncrease(ability)) {
            ability.selectedValue = Math.min(
                ability.selectedValue + 1,
                ability.maximumSelectableValue
            )
            return
        }

        if (delta < 0 && this.canDecrease(ability)) {
            ability.selectedValue = Math.max(
                ability.selectedValue - 1,
                ability.currentValue + ability.fixedIncrease
            )
        }
    }

    updateUi(root)
    {
        root.querySelector("[data-points-remaining]")?.replaceChildren(
            document.createTextNode(String(this.getRemainingPoints()))
        )

        for (const ability of this.abilityStates) {
            const row = root.querySelector(
                `[data-ability-row="${ability.key}"]`
            )
            if (!row) continue

            row.querySelector("[data-selected-value]")?.replaceChildren(
                document.createTextNode(String(ability.selectedValue))
            )

            const increaseButton = row.querySelector(
                "[data-action='increase']"
            )
            const decreaseButton = row.querySelector(
                "[data-action='decrease']"
            )

            if (increaseButton) {
                increaseButton.disabled = !this.canIncrease(ability)
            }

            if (decreaseButton) {
                decreaseButton.disabled = !this.canDecrease(ability)
            }
        }
    }
}

function mergeDialogOptions({
    viewModel,
    options
})
{
    const classes = [
        ...AbilityScoreAdvancementDialog.DEFAULT_OPTIONS.classes,
        ...(options?.classes ?? [])
    ]

    return {
        ...options,
        classes: Array.from(new Set(classes)),
        window: {
            ...AbilityScoreAdvancementDialog.DEFAULT_OPTIONS.window,
            ...(options?.window ?? {}),
            title: viewModel?.title ?? options?.window?.title
        }
    }
}
