import {
    applyAbilityToRollConfig,
    createAbilityOptions,
    getAbilityChoiceDialogClass,
    getAttackAbilityChoices,
    getDefaultAbility,
    handlePreRollAttack,
    handlePreRollDamage,
    isModuleItem
} from "../../infrastructure/hooks/attackAbilityChoiceHooks.js"

function createActor({str = 1, dex = 3, elvenAccuracy = false} = {})
{
    return {
        system: {
            abilities: {
                str: {mod: str},
                dex: {mod: dex}
            }
        },
        getFlag(scope, key)
        {
            if (scope === "dnd5e" && key === "elvenAccuracy") return elvenAccuracy
            return null
        }
    }
}

function createActivity({
    actor = createActor(),
    ability = "",
    available = ["str", "dex"],
    flat = false,
    itemFlags = {transformations: {addedByTransformation: true}}
} = {})
{
    const mods = available.map(key => actor.system.abilities[key]?.mod ?? 0)
    return {
        id: "attackActivity",
        type: "attack",
        actor,
        item: {flags: itemFlags, _stats: {}},
        attack: {ability, flat},
        availableAbilities: new Set(available),
        ability: ability || available[mods.indexOf(Math.max(...mods))]
    }
}

function createFormData(values)
{
    return {get: key => values[key] ?? null}
}

quench.registerBatch(
    "transformations.AttackAbilityChoice",
    ({describe, it, expect}) =>
    {
        describe("isModuleItem", function()
        {
            it("accepts items granted by a transformation", function()
            {
                expect(isModuleItem({flags: {transformations: {addedByTransformation: true}}})).to.equal(true)
            })

            it("accepts items dragged from the module compendium", function()
            {
                expect(isModuleItem({
                    flags: {},
                    _stats: {compendiumSource: "Compendium.transformations.items.Item.abc"}
                })).to.equal(true)
            })

            it("rejects items from anywhere else", function()
            {
                expect(isModuleItem({
                    flags: {},
                    _stats: {compendiumSource: "Compendium.dnd5e.items.Item.abc"}
                })).to.equal(false)
                expect(isModuleItem(null)).to.equal(false)
            })
        })

        describe("getAttackAbilityChoices", function()
        {
            it("offers Strength and Dexterity for a 'Strength or Dexterity' attack", function()
            {
                expect(getAttackAbilityChoices(createActivity())).to.deep.equal(["str", "dex"])
            })

            it("offers nothing when the attack names one ability", function()
            {
                expect(getAttackAbilityChoices(createActivity({ability: "str"}))).to.deep.equal([])
            })

            it("offers nothing when only one of the two abilities is available", function()
            {
                expect(getAttackAbilityChoices(createActivity({available: ["str"]}))).to.deep.equal([])
            })

            it("offers nothing for a flat attack bonus", function()
            {
                expect(getAttackAbilityChoices(createActivity({flat: true}))).to.deep.equal([])
            })
        })

        describe("dropdown options", function()
        {
            it("labels each ability with its modifier", function()
            {
                const options = createAbilityOptions(createActor({str: -1, dex: 4}), ["str", "dex"])
                expect(options.map(option => option.value)).to.deep.equal(["str", "dex"])
                expect(options[0].label).to.contain("(-1)")
                expect(options[1].label).to.contain("(+4)")
            })

            it("defaults to the ability with the highest modifier", function()
            {
                const activity = createActivity({actor: createActor({str: 5, dex: 2})})
                expect(getDefaultAbility(activity, ["str", "dex"])).to.equal("str")
            })
        })

        describe("applyAbilityToRollConfig", function()
        {
            it("replaces @mod with the chosen ability's modifier", function()
            {
                const rollConfig = {parts: ["@mod", "@prof"], data: {mod: 3, prof: 2}, options: {}}
                applyAbilityToRollConfig(rollConfig, {actor: createActor({str: 1, dex: 3}), ability: "str"})

                expect(rollConfig.data.mod).to.equal(1)
                expect(rollConfig.data.prof).to.equal(2)
                expect(rollConfig.options.transformationsAbility).to.equal("str")
            })

            it("leaves rolls without @mod alone", function()
            {
                const rollConfig = {parts: ["@prof"], data: {prof: 2}, options: {}}
                applyAbilityToRollConfig(rollConfig, {actor: createActor(), ability: "str"})

                expect(rollConfig.data.mod).to.equal(undefined)
            })
        })

        describe("handlePreRollAttack", function()
        {
            it("swaps in the ability dialog and applies the chosen ability", function()
            {
                const activity = createActivity({actor: createActor({str: 1, dex: 3})})
                const config = {subject: activity}
                const dialog = {
                    applicationClass: dnd5e.applications.dice.AttackRollConfigurationDialog,
                    options: {buildConfig: (process, rollConfig) => rollConfig.parts.push("@mod")}
                }

                handlePreRollAttack(config, dialog)

                expect(config.ability).to.equal("dex")
                expect(dialog.applicationClass).to.equal(getAbilityChoiceDialogClass())
                expect(dialog.options.transformationsAbilityOptions.map(o => o.value))
                    .to.deep.equal(["str", "dex"])

                const rollConfig = {parts: [], data: {mod: 3}, options: {}}
                dialog.options.buildConfig(config, rollConfig, createFormData({ability: "str"}), 0)
                expect(rollConfig.data.mod).to.equal(1)

                const fastForward = {parts: [], data: {mod: 3}, options: {}}
                dialog.options.buildConfig(config, fastForward, null, 0)
                expect(fastForward.data.mod).to.equal(3)
            })

            it("does nothing when dnd5e already offers the ability dropdown", function()
            {
                const config = {subject: createActivity()}
                const dialog = {options: {abilityOptions: [{value: "str"}, {value: "dex"}]}}

                handlePreRollAttack(config, dialog)

                expect(dialog.applicationClass).to.equal(undefined)
                expect(dialog.options.buildConfig).to.equal(undefined)
            })

            it("does nothing for items outside the module", function()
            {
                const config = {subject: createActivity({itemFlags: {}})}
                const dialog = {options: {}}

                handlePreRollAttack(config, dialog)

                expect(dialog.options.buildConfig).to.equal(undefined)
            })
        })

        describe("handlePreRollDamage", function()
        {
            it("uses the ability picked on the attack roll", function()
            {
                const activity = createActivity({actor: createActor({str: 1, dex: 3})})
                const originalGet = game.messages.get.bind(game.messages)
                const attackMessage = {
                    getAssociatedRolls: () => [{rolls: [{options: {transformationsAbility: "str"}}]}]
                }
                game.messages.get = id => (id === "attack-message" ? attackMessage : originalGet(id))

                try {
                    const card = document.createElement("div")
                    card.dataset.messageId = "attack-message"
                    const button = document.createElement("button")
                    card.append(button)

                    const config = {
                        subject: activity,
                        event: {target: button},
                        rolls: [{parts: ["1d8 + @mod"], data: {mod: 3}}]
                    }
                    handlePreRollDamage(config)

                    expect(config.rolls[0].data.mod).to.equal(1)
                }
                finally {
                    delete game.messages.get
                }
            })
        })
    }
)
