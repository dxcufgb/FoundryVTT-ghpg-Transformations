const MODULE_ID = "transformations"
const MODULE_COMPENDIUM_PREFIX = `Compendium.${MODULE_ID}.`
const CHOOSABLE_ABILITIES = ["str", "dex"]
const ABILITY_FIELD = "ability"
const ROLL_OPTION_KEY = "transformationsAbility"

let abilityChoiceDialogClass = null

/**
 * An item belongs to the module when it was granted by a transformation or
 * comes from (or lives in) one of the module's compendiums.
 */
export function isModuleItem(item)
{
    if (!item) return false

    const flags = item.flags?.[MODULE_ID]
    if (flags && Object.keys(flags).length > 0) return true

    if (typeof item.pack === "string" && item.pack.startsWith(`${MODULE_ID}.`)) return true

    const sources = [
        item._stats?.compendiumSource,
        item.flags?.core?.sourceId
    ]
    return sources.some(source =>
        typeof source === "string" && source.startsWith(MODULE_COMPENDIUM_PREFIX)
    )
}

/**
 * Returns the abilities a player may pick between for this attack, or an empty
 * array when the attack is not a "Strength or Dexterity" attack.
 */
export function getAttackAbilityChoices(activity)
{
    if (activity?.type !== "attack") return []
    if (activity.attack?.flat) return []

    // An explicitly chosen ability ("str", "none", "spellcasting", ...) is not a choice.
    if (activity.attack?.ability) return []

    const available = activity.availableAbilities
    if (!available) return []

    const abilities = Array.from(available)
    if (!CHOOSABLE_ABILITIES.every(ability => abilities.includes(ability))) return []

    return [...CHOOSABLE_ABILITIES]
}

export function getAbilityModifier(actor, ability)
{
    return Number(actor?.system?.abilities?.[ability]?.mod ?? 0)
}

function formatModifier(mod)
{
    return mod >= 0 ? `+${mod}` : `${mod}`
}

export function createAbilityOptions(actor, abilities)
{
    return abilities.map(ability =>
    {
        const label = CONFIG.DND5E.abilities[ability]?.label ?? ability
        return {
            value: ability,
            label: `${label} (${formatModifier(getAbilityModifier(actor, ability))})`
        }
    })
}

/**
 * The ability dnd5e would pick on its own: the one with the highest modifier.
 */
export function getDefaultAbility(activity, abilities)
{
    if (abilities.includes(activity?.ability)) return activity.ability

    return abilities.reduce((best, ability) =>
        getAbilityModifier(activity?.actor, ability) > getAbilityModifier(activity?.actor, best)
            ? ability
            : best
    , abilities[0])
}

/**
 * Points the "@mod" term of a built roll at the chosen ability.
 */
export function applyAbilityToRollConfig(rollConfig, {actor, ability})
{
    if (!rollConfig || !ability) return

    rollConfig.options ??= {}
    rollConfig.options[ROLL_OPTION_KEY] = ability

    if (rollConfig.parts?.includes("@mod")) {
        rollConfig.data ??= {}
        rollConfig.data.mod = getAbilityModifier(actor, ability)
    }

    if (actor?.getFlag?.("dnd5e", "elvenAccuracy")) {
        rollConfig.options.elvenAccuracy =
            CONFIG.DND5E.characterFlags?.elvenAccuracy?.abilities?.includes(ability) ?? false
    }
}

function getBaseAttackDialogClass()
{
    return globalThis.dnd5e?.applications?.dice?.AttackRollConfigurationDialog ?? null
}

/**
 * The dnd5e attack roll dialog with an extra ability dropdown, laid out like
 * the dialog's other selects (attack mode, ammunition, mastery).
 */
export function getAbilityChoiceDialogClass()
{
    if (abilityChoiceDialogClass) return abilityChoiceDialogClass

    const BaseDialog = getBaseAttackDialogClass()
    if (!BaseDialog) return null

    abilityChoiceDialogClass = class AbilityChoiceAttackRollConfigurationDialog extends BaseDialog
    {
        static DEFAULT_OPTIONS = {
            transformationsAbilityOptions: []
        }

        async _prepareConfigurationContext(context, options)
        {
            context = await super._prepareConfigurationContext(context, options)

            const abilityOptions = this.options.transformationsAbilityOptions ?? []
            if (abilityOptions.length < 2) return context

            context.fields = [
                {
                    field: new foundry.data.fields.StringField({
                        label: game.i18n.localize("DND5E.Ability"),
                        blank: false,
                        required: true
                    }),
                    name: ABILITY_FIELD,
                    options: abilityOptions,
                    value: this.config[ABILITY_FIELD]
                },
                ...(context.fields ?? [])
            ]
            return context
        }
    }

    return abilityChoiceDialogClass
}

/**
 * dnd5e 6.0 and later have this dropdown built in. Their attack dialog config
 * always carries `abilityOptions`, so leave those rolls alone.
 */
function hasNativeAbilityChoice(dialog)
{
    return Array.isArray(dialog?.options?.abilityOptions)
}

export function handlePreRollAttack(config, dialog, {logger} = {})
{
    const activity = config?.subject
    if (!isModuleItem(activity?.item)) return
    if (hasNativeAbilityChoice(dialog)) return

    const abilities = getAttackAbilityChoices(activity)
    if (!abilities.length) return

    const actor = activity.actor
    if (!abilities.includes(config[ABILITY_FIELD])) {
        config[ABILITY_FIELD] = getDefaultAbility(activity, abilities)
    }

    dialog.options ??= {}
    const BaseDialog = getBaseAttackDialogClass()
    const currentClass = dialog.applicationClass ?? BaseDialog
    if (currentClass === BaseDialog) {
        const DialogClass = getAbilityChoiceDialogClass()
        if (DialogClass) {
            dialog.applicationClass = DialogClass
            dialog.options.transformationsAbilityOptions = createAbilityOptions(actor, abilities)
        }
    }
    else {
        logger?.debug?.("attackAbilityChoice: custom attack dialog in use, dropdown skipped", currentClass)
    }

    const originalBuildConfig = dialog.options.buildConfig
    dialog.options.buildConfig = (process, rollConfig, formData, index) =>
    {
        originalBuildConfig?.(process, rollConfig, formData, index)

        const chosen = formData?.get?.(ABILITY_FIELD) ?? process?.[ABILITY_FIELD]
        if (!abilities.includes(chosen)) return

        applyAbilityToRollConfig(rollConfig, {actor, ability: chosen})
    }
}

/**
 * Finds the ability picked on the attack roll this damage roll belongs to.
 */
export function findChosenAttackAbility(config)
{
    const messageId = config?.event?.target?.closest?.("[data-message-id]")?.dataset?.messageId
    const message = messageId ? game.messages?.get(messageId) : null
    const attack = message?.getAssociatedRolls?.("attack")?.pop?.() ?? null
    return attack?.rolls?.[0]?.options?.[ROLL_OPTION_KEY] ?? null
}

export function handlePreRollDamage(config)
{
    const activity = config?.subject
    if (!isModuleItem(activity?.item)) return

    // dnd5e 6.0+ passes the attack's ability to the damage roll itself.
    if (config.ability) return

    const abilities = getAttackAbilityChoices(activity)
    if (!abilities.length) return

    const ability = findChosenAttackAbility(config)
    if (!abilities.includes(ability)) return

    const mod = getAbilityModifier(activity.actor, ability)
    for (const roll of config.rolls ?? []) {
        if (!roll?.data || !("mod" in roll.data)) continue
        roll.data = {...roll.data, mod}
    }
}

/**
 * Lets players pick Strength or Dexterity in the attack roll dialog for module
 * items whose attack uses "Strength or Dexterity".
 */
export function registerAttackAbilityChoiceHooks({logger})
{
    logger.debug("registerAttackAbilityChoiceHooks")

    Hooks.on("dnd5e.preRollAttackV2", (config, dialog) =>
    {
        try {
            handlePreRollAttack(config, dialog, {logger})
        }
        catch (error) {
            logger.warn?.("attackAbilityChoice: preRollAttackV2 failed", error)
        }
    })

    Hooks.on("dnd5e.preRollDamageV2", config =>
    {
        try {
            handlePreRollDamage(config)
        }
        catch (error) {
            logger.warn?.("attackAbilityChoice: preRollDamageV2 failed", error)
        }
    })
}
