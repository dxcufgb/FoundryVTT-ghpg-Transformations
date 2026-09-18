import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { ContextValidationDTO } from "../../../helpers/validationDTOs/context/ContextValidationDTO.js"
import { RollService } from "../../../../services/rolls/RollService.js"
import { Vampire } from "../../../../domain/transformation/subclasses/vampire/Vampire.js"
import { TRUE_APPEARANCE_EFFECT_NAME, TRUE_APPEARANCE_SAVE_ACTIVITY_NAME, TRUE_APPEARANCE_SAVE_ITEM_UUID } from "../../../../domain/transformation/subclasses/vampire/triggers/trueAppearanceTriggerCommon.js"

const THE_SANGUINE_CURSE_UUID =
          "Compendium.transformations.gh-transformations.Item.Zd5sRelguKUDcoAP"
const GREATER_SANGUINE_CURSE_UUID =
          "Compendium.transformations.gh-transformations.Item.ZCqnYQJ2nFR8AWQq"
const ULTIMATE_SANGUINE_CURSE_UUID =
          "Compendium.transformations.gh-transformations.Item.xhjdYqMyYbPOLGKc"
const FANGED_BITE_UUID =
          "Compendium.transformations.gh-transformations.Item.TreKDUe7BregxPRU"
const FZEG_CLAW_UUID =
          "Compendium.transformations.gh-transformations.Item.0ZgPuhqfVv3Nk0x4"
const FZEG_BLOODLINE_UUID =
          "Compendium.transformations.gh-transformations.Item.1WKmzJQpwJ3MO0uc"
const FZEG_CLAW_ATTACK_ACTIVITY_ID = "LL3fnYXElb0RgP7W"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID = "ddjFKkSGslAQQjB4"
const FANGED_BITE_NECROTIC_SAVE_ACTIVITY_ID = "ldCWwpvlC7HO9lI0"
const FANGED_BITE_NECROTIC_SAVE_ACTIVITY_NAME = "Necrotic Save"
const MIDI_ATTACK_ACTIVITY_NAME = "Midi Attack"
const SOMAN_BLOODLINE_UUID =
          "Compendium.transformations.gh-transformations.Item.JwXmICxuswhNaTxu"
const FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID =
          "Compendium.transformations.gh-transformations.Item.v002gdymkyOVGowv"
const FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_UUID =
          "Compendium.transformations.gh-transformations.Item.jLyYcsZUVMYntiTI"
const SANGROMANCY_SPECIALIST_UUID =
          "Compendium.transformations.gh-transformations.Item.qmepd5HkL0LpxOJv"
const STAGE4_GENERIC_CHOICE_UUID =
          "Compendium.transformations.gh-transformations.Item.TKHTXSYMDDTYBVWW"
const SUPREME_SANGUINE_CURSE_UUID = TRUE_APPEARANCE_SAVE_ITEM_UUID
const SUPREME_SANGUINE_CURSE_HIDE_ACTIVITY_ID = "AzOP7WrBai44pmmW"
const SUPREME_SANGUINE_CURSE_SAVE_ACTIVITY_ID = "3L9NR9UMGa1buZxK"
const BEGUILERS_CHARM_UUID =
          "Compendium.transformations.gh-transformations.Item.zqHnVx3qp8v5MqM6"
const IMPROVED_FANGED_BITE_UUID =
          "Compendium.transformations.gh-transformations.Item.85DUuTRth5jW8GG2"
const MIST_FORM_UUID =
          "Compendium.transformations.gh-transformations.Item.5pMyJHeDUAqvJQBP"
const MIST_FORM_ACTIVITY_ID = "11TUnYLvZX54T2Nr"
const MIST_FORM_GASEOUS_FORM_UUID =
          "Compendium.transformations.gh-transformations.Item.6LlQahEJutMQJ5sG"
const BEGUILERS_CHARM_NAME = "Beguiler\u2019s Charm"
const SANGROMANCY_SPECIALIST_ENHANCE_ACTIVITY_ID = "M2YmojFFjgHvVd5i"
const SANGROMANCY_SPECIALIST_RESTORE_ACTIVITY_ID = "LLijwYKmrdpZ1KS3"
const FINAL_STRIGOI_BLOODLINE_UUID =
          "Compendium.transformations.gh-transformations.Item.ZGlWZUaFfDrupEaq"
const FINAL_STRIGOI_RAT_SWARM_UUID =
          "Compendium.transformations.creatures.Actor.yAoEQH7ckUUugY6K"
const FINAL_STRIGOI_BAT_SWARM_UUID =
          "Compendium.transformations.creatures.Actor.UJ5odgO59V6gJUs9"
const FINAL_STRIGOI_WOLF_UUID =
          "Compendium.transformations.creatures.Actor.DRgCTbNj4NxJRqMC"
const FINAL_STRIGOI_MISTY_STEP_UUID =
          "Compendium.transformations.gh-transformations.Item.hVpWqojJj0uPtd0R"
const SANGROMANCY_SPECIALIST_ACTIVITY_NAME = "Enhance Cantrip Damage"
const TRUE_APPEARANCE_HIDE_ACTIVITY_NAME = "Hide True Appearance"
const STAGE4_MAXIMUM_DAYS_PER_FEED = 1
const STAGE3_MAXIMUM_DAYS_PER_FEED = 2
const STAGE1_MAXIMUM_DAYS_PER_FEED = 7
const STAGE2_MAXIMUM_DAYS_PER_FEED = 4
const ABILITY_KEYS = Object.freeze([
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha"
])

const stage1Choices = Object.freeze([
    {
        name: "Strigoi Bloodline",
        uuid: "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        img: "modules/transformations/Icons/Transformations/Vampire/Strigoi%20Bloodline.png",
        identifier: "strigoi-bloodline",
        descriptionSnippet:
            "You can take the Hide action as a Bonus Action",
        advancementCount: 2,
        effectCount: 0,
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.value ?? 0) === 12
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.skills?.ste?.proficient ?? 0) === 1
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.dex.value = 12
            actorDto.skills.ste.proficient = 1
        },
        configureBloodlineItemValidation: item =>
        {
            item.numberOfAdvancements = 2
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 0,
                        dex: 2,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addAdvancement(advancement =>
            {
                advancement.type = "Trait"
                advancement.addConfiguration(configuration =>
                {
                    configuration.allowReplacements = false
                    configuration.grants = ["skills:ste"]
                    configuration.mode = "upgrade"
                })
            })
        }
    },
    {
        name: "Soman Bloodline",
        uuid: "Compendium.transformations.gh-transformations.Item.JwXmICxuswhNaTxu",
        img: "modules/transformations/Icons/Transformations/Vampire/Soman%20Bloodline.png",
        identifier: "soman-bloodline",
        descriptionSnippet: "You gain a Climb Speed equal to your Speed",
        advancementCount: 1,
        effectCount: 1,
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.str?.value ?? 0) === 11
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.value ?? 0) === 11
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.movement?.climb ?? 0) ===
                Number(actor.system?.attributes?.movement?.walk ?? 0)
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.str.value = 11
            actorDto.abilities.dex.value = 11
        },
        configureBloodlineItemValidation: item =>
        {
            item.numberOfAdvancements = 1
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 19
                    configuration.fixed = {
                        str: 1,
                        dex: 1,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addEffect(effect =>
            {
                effect.name = "Soman Bloodline"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.attributes.movement.climb",
                        mode: 2,
                        value: "@attributes.movement.walk",
                        priority: 20
                    }
                ]
            })
        }
    },
    {
        name: "Fzeg Bloodline",
        uuid: "Compendium.transformations.gh-transformations.Item.1WKmzJQpwJ3MO0uc",
        img: "modules/transformations/Icons/Transformations/Vampire/Fzeg%20Bloodline.png",
        identifier: "fzeg-bloodline",
        descriptionSnippet: "You gain a Claw attack",
        advancementCount: 2,
        effectCount: 1,
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.str?.value ?? 0) === 12
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.movement?.walk ?? 0) === 40
            )
            await waiters.waitForCondition(() =>
                Boolean(getItemBySourceUuid(actor, FZEG_CLAW_UUID))
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.str.value = 12
            actorDto.hasItemWithSourceUuids.push(FZEG_CLAW_UUID)
        },
        configureBloodlineItemValidation: item =>
        {
            item.numberOfAdvancements = 2
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 2,
                        dex: 0,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addAdvancement(advancement => {
                advancement.type = "ItemGrant"
                advancement.addConfiguration(configuration =>
                {
                    configuration.items = [FZEG_CLAW_UUID]
                    configuration.optional = false
                })
            })
            item.addEffect(effect =>
            {
                effect.name = "Fzeg Bloodline"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.attributes.movement.walk",
                        mode: 2,
                        value: "+10",
                        priority: 20
                    }
                ]
            })
        }
    }
])

const DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE = stage1Choices[0]

const stage2Choices = Object.freeze([
    {
        name: "Eyes of the Night",
        uuid: "Compendium.transformations.gh-transformations.Item.3JGiaLxVh3KNd8Br",
        img: "modules/transformations/Icons/Transformations/Vampire/Eyes%20of%20the%20Night.png",
        identifier: "eyes-of-the-night",
        descriptionSnippet: "You gain Darkvision out to 60 feet",
        advancementCount: 0,
        activityCount: 0,
        effectCount: 1,
        usesMax: "",
        finalAwait: async ({actor, waiters, staticVars}) =>
        {
            const expectedDarkvision =
                      Number(staticVars.initialDarkvision ?? 0) + 60

            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.senses?.darkvision ?? 0) ===
                expectedDarkvision
            )
        },
        configureAppliedActorValidation: (actorDto, {staticVars}) =>
        {
            actorDto.stats.darkvision =
                Number(staticVars.initialDarkvision ?? 0) + 60
        },
        configureChoiceItemValidation: item =>
        {
            item.addEffect(effect =>
            {
                effect.name = "Eyes of the Night"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.attributes.senses.darkvision",
                        mode: 2,
                        value: "+60",
                        priority: 20,
                        fieldName: "Senses (Darkvision)",
                        fieldDescription: ""
                    }
                ]
            })
        }
    },
    {
        name: "Grave-Touched Soul",
        uuid: "Compendium.transformations.gh-transformations.Item.G8cE7iKgR6oa9yYe",
        img: "modules/transformations/Icons/Transformations/Vampire/Grave-Touched%20Soul.png",
        identifier: "grave-touched-soul",
        descriptionSnippet: "You gain Resistance to Necrotic damage",
        advancementCount: 1,
        activityCount: 0,
        effectCount: 0,
        usesMax: "",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Array.from(actor.system?.traits?.dr?.value ?? [])
                .includes("necrotic")
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.stats.resistances = ["necrotic"]
        },
        configureChoiceItemValidation: item =>
        {
            item.addAdvancement(advancement =>
            {
                advancement.type = "Trait"
                advancement.addConfiguration(configuration =>
                {
                    configuration.allowReplacements = false
                    configuration.grants = ["dr:necrotic"]
                    configuration.mode = "default"
                })
            })
        }
    },
    {
        name: "Inhuman Reflexes",
        uuid: "Compendium.transformations.gh-transformations.Item.rviGB0iP3bPoH6dZ",
        img: "modules/transformations/Icons/Transformations/Vampire/Inhuman%20Reflexes.png",
        identifier: "inhuman-reflexes",
        descriptionSnippet: "You have Advantage on Dexterity saving throws",
        advancementCount: 0,
        activityCount: 0,
        effectCount: 1,
        usesMax: "",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.save?.roll?.mode ?? 0) === 1
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.dex.save.roll.mode = 1
        },
        configureChoiceItemValidation: item =>
        {
            item.addEffect(effect =>
            {
                effect.name = "Inhuman Reflexes"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.abilities.dex.save.roll.mode",
                        mode: 2,
                        value: "+1",
                        priority: 20,
                        fieldName: "DND5E AdvantageMode",
                        fieldDescription: ""
                    }
                ]
            })
        }
    },
    {
        name: "Undead Resilience",
        uuid: "Compendium.transformations.gh-transformations.Item.E4IbeEVR4pGBOCIw",
        img: "modules/transformations/Icons/Transformations/Vampire/Undead%20Resilience.png",
        identifier: "undead-resilience",
        descriptionSnippet:
            "you cannot use it again until you finish a Long Rest",
        advancementCount: 0,
        activityCount: 1,
        effectCount: 0,
        usesMax: "1",
        finalAwait: async () => {},
        configureAppliedActorValidation: () => {},
        configureChoiceItemValidation: item =>
        {
            item.addActivity(activity =>
            {
                activity.id = "PKnfExKlJ20Rt4Kx"
                activity.type = "heal"
                activity.activationType = "special"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.affects.type = "self"
                activity.target.prompt = true
                activity.consumption.numberOfTargets = 1
                activity.addConsumptionTarget(target =>
                {
                    target.target = ""
                    target.type = "itemUses"
                    target.value = "1"
                })
                activity.uses.max = ""
                activity.healing.customEnabled = true
                activity.healing.custom = "1"
                activity.healing.scalingNumber = 1
                activity.healing.types = ["healing"]
                activity.healing.numberOfTypes = 1
                activity.healing.bonus = ""
            })
        }
    }
])

const stage2ChoicePairs = Object.freeze(
    createStage2ChoicePairs(stage2Choices)
)
const DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES = Object.freeze([
    stage2Choices[0].uuid,
    stage2Choices[2].uuid
])
const stage3Choices = Object.freeze([
    {
        name: BEGUILERS_CHARM_NAME,
        uuid: BEGUILERS_CHARM_UUID,
        img:
            "modules/transformations/Icons/Transformations/Vampire/Beguilers%20Charm.png",
        identifier: "beguilers-charm",
        descriptionSnippet:
            "the creature has the Charmed condition for 24 hours",
        propertiesIncludes: [],
        advancementCount: 0,
        activityCount: 1,
        effectCount: 1,
        usesMax: "",
        finalAwait: async () => {},
        configureAppliedActorValidation: () => {},
        configureChoiceItemValidation: item =>
        {
            item.addActivity(activity =>
            {
                activity.id = "8Yh61E6lBAych7av"
                activity.name = "Unearthly Charm"
                activity.type = "save"
                activity.activationType = "action"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.value = 30
                activity.range.units = "ft"
                activity.target.affects.type = "creature"
                activity.target.affects.count = "1"
                activity.target.affects.special = "Humanoid or Beast"
                activity.target.prompt = false
                activity.saveAbility = ["cha"]
                activity.saveDcFormula = "8 + @prof + @mod"
                activity.uses.max = ""
            })
            item.addEffect(effect =>
            {
                effect.name = "Vampires Charm"
                effect.description =
                    "<p>The creature has been charmed by a vampire and is their thrall for 24 hours or until the vampire charms another creature or decides to release this creature from it's charm.</p>"
                effect.transfer = false
                effect.statuses = ["charmed"]
                effect.changes.count = 0
            })
        }
    },
    {
        name: "Improved Fanged Bite",
        uuid: IMPROVED_FANGED_BITE_UUID,
        img:
            "modules/transformations/Icons/Transformations/Vampire/Improved%20Fanged%20Bite.png",
        identifier: "improved-fanged-bite",
        descriptionSnippet: "you can make 2 Fanged Bite attacks",
        propertiesIncludes: ["trait"],
        advancementCount: 0,
        activityCount: 0,
        effectCount: 0,
        usesMax: "",
        finalAwait: async () => {},
        configureAppliedActorValidation: () => {},
        configureChoiceItemValidation: () => {}
    },
    {
        name: "Mist Form",
        uuid: MIST_FORM_UUID,
        img:
            "modules/transformations/Icons/Transformations/Vampire/Mist%20Form.png",
        identifier: "mist-form",
        descriptionSnippet:
            "You can cast the Gaseous Form spell a number of times equal to your Vampire Transformation Stage",
        propertiesIncludes: [],
        advancementCount: 0,
        activityCount: 1,
        effectCount: 0,
        usesMax: null,
        resolveUsesMax: actor => getActorTransformationStage(actor, 3),
        finalAwait: async () => {},
        configureAppliedActorValidation: () => {},
        configureChoiceItemValidation: item =>
        {
            item.uses.addRecovery(recovery =>
            {
                recovery.period = "lr"
                recovery.type = "recoverAll"
            })
            item.addActivity(activity =>
            {
                activity.id = MIST_FORM_ACTIVITY_ID
                activity.type = "cast"
                activity.activationType = "action"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.prompt = true
                activity.spellUuid = MIST_FORM_GASEOUS_FORM_UUID
                activity.consumption.numberOfTargets = 1
                activity.addConsumptionTarget(target =>
                {
                    target.target = ""
                    target.type = "itemUses"
                    target.value = "1"
                })
                activity.uses.max = ""
            })
        }
    },
    {
        name: "Sangromancy Specialist",
        uuid: SANGROMANCY_SPECIALIST_UUID,
        requiresSpellSlots: true,
        img:
            "modules/transformations/Icons/Transformations/Vampire/Sangromancy%20Specialist.png",
        identifier: "sangromancy-specialist",
        descriptionSnippet:
            "You gain an extra 1d12 Sangromancy Hit Point Dice per Vampire Transformation",
        propertiesIncludes: [],
        advancementCount: 0,
        activityCount: 2,
        effectCount: 0,
        usesMax: null,
        resolveUsesMax: actor => getActorTransformationStage(actor, 3),
        finalAwait: async () => {},
        configureAppliedActorValidation: () => {},
        configureChoiceItemValidation: item =>
        {
            item.uses.addRecovery(recovery =>
            {
                recovery.period = "lr"
                recovery.type = "recoverAll"
            })
            item.addActivity(activity =>
            {
                activity.id = SANGROMANCY_SPECIALIST_ENHANCE_ACTIVITY_ID
                activity.name = SANGROMANCY_SPECIALIST_ACTIVITY_NAME
                activity.type = "utility"
                activity.activationType = "special"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.affects.type = "self"
                activity.target.prompt = false
                activity.consumption.numberOfTargets = 0
                activity.uses.max = ""
            })
            item.addActivity(activity =>
            {
                activity.id = SANGROMANCY_SPECIALIST_RESTORE_ACTIVITY_ID
                activity.name = "Restore Sangromancy Hit Die"
                activity.type = "utility"
                activity.activationType = "special"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.affects.type = "self"
                activity.target.prompt = false
                activity.consumption.numberOfTargets = 1
                activity.addConsumptionTarget(target =>
                {
                    target.target = ""
                    target.type = "itemUses"
                    target.value = "-1"
                })
                activity.uses.max = ""
            })
        }
    }
])
const stage3ChoicePairs = Object.freeze(
    createStage2ChoicePairs(stage3Choices).map(pair => ({
        ...pair,
        requiresSpellSlots:
            pair.choices.some(choice => choice.requiresSpellSlots === true)
    }))
)
const DEFAULT_TRUE_APPEARANCE_STAGE3_CHOICE_UUIDS = Object.freeze([
    BEGUILERS_CHARM_UUID,
    IMPROVED_FANGED_BITE_UUID
])
const DEFAULT_STAGE4_PREREQUISITE_STAGE3_CHOICE_UUIDS = Object.freeze([
    ...DEFAULT_TRUE_APPEARANCE_STAGE3_CHOICE_UUIDS
])
const DEFAULT_STAGE3_CHOICE_UUIDS = Object.freeze([
    SANGROMANCY_SPECIALIST_UUID,
    BEGUILERS_CHARM_UUID
])
const REGENERATION_STAGE4_CHOICE = Object.freeze({
    name: "Regeneration",
    uuid: STAGE4_GENERIC_CHOICE_UUID,
    img: "modules/transformations/Icons/Transformations/Vampire/Regeneration.png",
    identifier: "regeneration",
    descriptionSnippet:
        "You regain 15 Hit Points at the start of your turn if you have at least 1 Hit Point but less than 60 Hit Points",
    advancementCount: 0,
    activityCount: 1,
    effectCount: 0,
    usesMax: "",
    configureChoiceItemValidation: item =>
    {
        item.addActivity(activity =>
        {
            activity.id = "DEym6OhDBDw7aBn8"
            activity.type = "heal"
            activity.activationType = "turnStart"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.uses.max = ""
            activity.healing.customEnabled = true
            activity.healing.custom = "15"
            activity.healing.scalingNumber = 1
            activity.healing.types = ["healing"]
            activity.healing.numberOfTypes = 1
            activity.healing.bonus = ""
        })
    }
})
const stage4Choices = Object.freeze([
    {
        name: "Final Strigoi Bloodline",
        uuid: FINAL_STRIGOI_BLOODLINE_UUID,
        selectedUuids: [
            FINAL_STRIGOI_BLOODLINE_UUID,
            STAGE4_GENERIC_CHOICE_UUID
        ],
        prerequisiteStage1Choice: stage1Choices[0],
        additionalChoiceValidations: [REGENERATION_STAGE4_CHOICE],
        img:
            "modules/transformations/Icons/Transformations/Vampire/Final%20Strigoi%20Bloodline.png",
        identifier: "final-strigoi-bloodline",
        descriptionSnippet:
            "You can summon 2d4 Swarms of Rats, Swarms of Bats, or Wolves as a Bonus Action",
        advancementCount: 1,
        activityCount: 2,
        effectCount: 0,
        usesMax: "1",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.value ?? 0) === 14
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.dex.value = 14
        },
        configureChoiceItemValidation: item =>
        {
            item.uses.addRecovery(recovery =>
            {
                recovery.period = "lr"
                recovery.type = "recoverAll"
            })
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 0,
                        dex: 2,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addActivity(activity =>
            {
                activity.id = "pimXS6toQbamBlbn"
                activity.type = "summon"
                activity.activationType = "bonus"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.value = 60
                activity.range.units = "ft"
                activity.target.affects.type = "space"
                activity.target.prompt = true
                activity.uses.max = ""
                activity.addSummon(summon =>
                {
                    summon.count = "2d4"
                    summon.name = ""
                    summon.numberOfTypes = 0
                    summon.uuid = FINAL_STRIGOI_RAT_SWARM_UUID
                })
                activity.addSummon(summon =>
                {
                    summon.count = "2d4"
                    summon.name = ""
                    summon.numberOfTypes = 0
                    summon.uuid = FINAL_STRIGOI_BAT_SWARM_UUID
                })
                activity.addSummon(summon =>
                {
                    summon.count = "2d4"
                    summon.name = ""
                    summon.numberOfTypes = 0
                    summon.uuid = FINAL_STRIGOI_WOLF_UUID
                })
            })
            item.addActivity(activity =>
            {
                activity.id = "e1njrp5cbRvWX2IY"
                activity.type = "cast"
                activity.activationType = "action"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.prompt = true
                activity.spellUuid = FINAL_STRIGOI_MISTY_STEP_UUID
                activity.uses.max = "4"
                activity.uses.addRecovery(recovery =>
                {
                    recovery.period = "lr"
                    recovery.type = "recoverAll"
                })
            })
        }
    },
    {
        name: "Final Soman Bloodline",
        uuid: FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID,
        selectedUuids: [
            FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID,
            STAGE4_GENERIC_CHOICE_UUID
        ],
        prerequisiteStage1Choice: stage1Choices[1],
        additionalChoiceValidations: [REGENERATION_STAGE4_CHOICE],
        img:
            "modules/transformations/Icons/Transformations/Vampire/Final%20Soman%20Bloodline.png",
        identifier: "final-soman-bloodline",
        descriptionSnippet: "rises as a Vampire Spawn 24 hours later",
        advancementCount: 1,
        activityCount: 1,
        effectCount: 0,
        usesMax: "",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.str?.value ?? 0) === 12
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.value ?? 0) === 12
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.str.value = 12
            actorDto.abilities.dex.value = 12
        },
        configureChoiceItemValidation: item =>
        {
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 1,
                        dex: 1,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addActivity(activity =>
            {
                activity.id = "P1Z99mX8Z6kV2H1e"
                activity.type = "summon"
                activity.activationType = "special"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.affects.type = ""
                activity.target.prompt = true
                activity.uses.max = ""
                activity.addSummon(summon =>
                {
                    summon.count = "1"
                    summon.name = ""
                    summon.numberOfTypes = 0
                    summon.uuid =
                        "Compendium.transformations.creatures.Actor.BJvQl9I2K6XRqT9C"
                })
            })
        }
    },
    {
        name: "Final Fzeg Bloodline",
        uuid: FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_UUID,
        selectedUuids: [
            FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_UUID,
            STAGE4_GENERIC_CHOICE_UUID
        ],
        prerequisiteStage1Choice: stage1Choices[2],
        additionalChoiceValidations: [REGENERATION_STAGE4_CHOICE],
        img:
            "modules/transformations/Icons/Transformations/Vampire/Final%20Fzeg%20Bloodline.png",
        identifier: "final-fzeg-bloodline",
        descriptionSnippet:
            "damage done by your Claw attack becomes 3d6 plus your Strength modifier",
        advancementCount: 1,
        activityCount: 0,
        effectCount: 1,
        usesMax: "",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.str?.value ?? 0) === 14
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.movement?.walk ?? 0) === 50
            )
            await waiters.waitForCondition(() =>
                ["bludgeoning", "piercing", "slashing"].every(damageType =>
                    Array.from(actor.system?.traits?.dr?.value ?? [])
                    .includes(damageType)
                )
            )
            await waiters.waitForCondition(() =>
                ["mgc", "sil"].every(bypass =>
                    Array.from(actor.system?.traits?.dr?.bypasses ?? [])
                    .includes(bypass)
                )
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.str.value = 14
            actorDto.stats.movementSpeed = {
                type: "walk",
                value: 50
            }
            actorDto.stats.resistances = [
                "bludgeoning",
                "piercing",
                "slashing"
            ]
            actorDto.stats.resistanceBypasses = [
                "mgc",
                "sil"
            ]
            actorDto.hasItemWithSourceUuids.push(FZEG_CLAW_UUID)
        },
        configureChoiceItemValidation: item =>
        {
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 2,
                        dex: 0,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addEffect(effect =>
            {
                effect.name = "Final Fzeg Bloodline"
                effect.transfer = true
                effect.changes.count = 6
                effect.changes.changes = [
                    {
                        key: "system.traits.dr.value",
                        mode: 2,
                        value: "bludgeoning",
                        priority: 20
                    },
                    {
                        key: "system.traits.dr.value",
                        mode: 2,
                        value: "piercing",
                        priority: 20
                    },
                    {
                        key: "system.traits.dr.value",
                        mode: 2,
                        value: "slashing",
                        priority: 20
                    },
                    {
                        key: "system.traits.dr.bypasses",
                        mode: 0,
                        value: "mgc",
                        priority: 20
                    },
                    {
                        key: "system.traits.dr.bypasses",
                        mode: 0,
                        value: "sil",
                        priority: 20
                    },
                    {
                        key: "system.attributes.movement.walk",
                        mode: 2,
                        value: "+10",
                        priority: 20
                    }
                ]
            })
        }
    }
])

const fangedBiteBehaviorCases = Object.freeze([
    {
        name: "Strigoi Bloodline with attack-roll advantage upgrades Midi Attack damage",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        attackHasAdvantage: true,
        expectedFormula: "2d4 + 1"
    },
    {
        name: "Strigoi Bloodline upgrades Midi Attack damage when advantage is selected in the attack workflow",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        attackHasAdvantage: false,
        damageWorkflowAdvantage: true,
        expectedFormula: "2d4 + 1"
    },
    {
        name: "Strigoi Bloodline without advantage keeps Midi Attack damage unchanged",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        attackHasAdvantage: false,
        expectedFormula: "1d6 + 1"
    },
    {
        name: "Soman Bloodline with advantage keeps Midi Attack damage unchanged",
        stage1ChoiceName: "Soman Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.JwXmICxuswhNaTxu",
        attackHasAdvantage: true,
        expectedFormula: "1d6 + 1"
    }
])

const fangedBiteNecroticSaveBehaviorCases = Object.freeze([
    {
        name: "Fanged Bite Necrotic Save keeps 1d6 damage without Soman Bloodline",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        expectedFormula: "1d6"
    },
    {
        name: "Fanged Bite Necrotic Save keeps 1d6 damage with the override item but without Soman Bloodline",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        extraItemSourceUuid: FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID,
        expectedFormula: "1d6"
    },
    {
        name: "Fanged Bite Necrotic Save becomes 1d8 with Soman Bloodline",
        stage1ChoiceName: "Soman Bloodline",
        stage1ChoiceUuid: SOMAN_BLOODLINE_UUID,
        expectedFormula: "1d8"
    },
    {
        name: "Fanged Bite Necrotic Save becomes 3d8 with the override item",
        stage1ChoiceName: "Soman Bloodline",
        stage1ChoiceUuid: SOMAN_BLOODLINE_UUID,
        extraItemSourceUuid: FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID,
        expectedFormula: "3d8"
    }
])

const fzegClawMidiAttackBehaviorCases = Object.freeze([
    {
        name: "Fzeg Claw Midi Attack keeps 1d8 + 1 damage without the override item",
        expectedRollFormula: "1d8 + 1"
    },
    {
        name: "Fzeg Claw Midi Attack becomes 3d6 + 1 with the override item",
        extraItemSourceUuid: FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_UUID,
        expectedRollFormula: "3d6 + 1"
    }
])

const sangromancyResourceBehaviorCases = Object.freeze([
    {
        name: "Sangromancy Specialist consumes item charges before class hit dice",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 2
            }
        ],
        charges: 2,
        rollButtonText: "Roll 2 Dice",
        expectedFormula: "2d6",
        expectedUsesSpent: 2,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 2
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die",
            "Roll 2 Dice"
        ],
        expectedAbsentButtons: [
            "Roll 3 Dice"
        ]
    },
    {
        name: "Sangromancy Specialist item charges roll using the actor's highest class hit die denomination",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 2
            },
            {
                className: "Fighter",
                levels: 1,
                hitDiceValue: 0
            }
        ],
        charges: 2,
        rollButtonText: "Roll 2 Dice",
        expectedFormula: "2d10",
        expectedUsesSpent: 2,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 2
            },
            {
                className: "Fighter",
                remainingHitDice: 0
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die",
            "Roll 2 Dice"
        ],
        expectedAbsentButtons: [
            "Roll 3 Dice"
        ]
    },
    {
        name: "Sangromancy Specialist spends class hit dice from the highest denomination first after charges are depleted",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 1
            },
            {
                className: "Fighter",
                levels: 1,
                hitDiceValue: 1
            }
        ],
        charges: 0,
        rollButtonText: "Roll 2 Dice",
        expectedFormula: "1d10 + 1d6",
        expectedUsesSpent: 0,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 0
            },
            {
                className: "Fighter",
                remainingHitDice: 0
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die",
            "Roll 2 Dice"
        ],
        expectedAbsentButtons: [
            "Roll 3 Dice"
        ]
    },
    {
        name: "Sangromancy Specialist respects the total available resource pool",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 0
            }
        ],
        charges: 1,
        rollButtonText: "Roll 1 Die",
        expectedFormula: "1d6",
        expectedUsesSpent: 1,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 0
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die"
        ],
        expectedAbsentButtons: [
            "Roll 2 Dice",
            "Roll 3 Dice"
        ]
    }
])

const trueAppearanceAutoTriggerCases = Object.freeze([
    {
        name: "True Appearance bloodied trigger uses Midi Save",
        trigger: "bloodied"
    },
    {
        name: "True Appearance concentration trigger uses Midi Save",
        trigger: "concentration"
    },
    {
        name: "True Appearance unconscious trigger uses Midi Save",
        trigger: "unconscious"
    }
])

const placeholderChoices = Object.freeze([
    ...stage1Choices,
    ...stage2Choices,
    ...stage3Choices.map(choice => ({
        name: choice.name,
        uuid: choice.uuid
    })),
    ...stage4Choices.map(choice => ({
        name: choice.name,
        uuid: choice.uuid
    })),
    {
        name: REGENERATION_STAGE4_CHOICE.name,
        uuid: REGENERATION_STAGE4_CHOICE.uuid
    }
])

function createStage2ChoicePairs(choices)
{
    const pairs = []

    for (let index = 0; index < choices.length; index++) {
        for (
            let comparisonIndex = index + 1;
            comparisonIndex < choices.length;
            comparisonIndex++
        )
        {
            const firstChoice = choices[index]
            const secondChoice = choices[comparisonIndex]

            pairs.push({
                name: `${firstChoice.name} and ${secondChoice.name}`,
                uuids: [firstChoice.uuid, secondChoice.uuid],
                choices: [firstChoice, secondChoice]
            })
        }
    }

    return pairs
}

function resolveCurrentActor(actor)
{
    return game?.actors?.get?.(actor?.id) ?? actor
}

function getActorTransformationStage(actor, fallbackStage = null)
{
    const currentActor = resolveCurrentActor(actor)
    const resolvedStage = Number(
        currentActor?.getFlag?.("transformations", "stage") ??
        currentActor?.flags?.transformations?.stage ??
        fallbackStage
    )

    return Number.isFinite(resolvedStage) ? resolvedStage : fallbackStage
}

function getItemBySourceUuid(actor, sourceUuid)
{
    const currentActor = resolveCurrentActor(actor)

    return currentActor?.items?.find?.(item =>
        item.flags?.transformations?.sourceUuid === sourceUuid
    ) ?? null
}

function getAbilityScoreAdvancementDialogElement()
{
    const dialogApplication = Array.from(
        ui?.windows?.values?.() ?? []
    ).find(window =>
        window?.constructor?.name === "AbilityScoreAdvancementDialog"
    )

    return dialogApplication?.element ??
        document.querySelector(".ability-score-advancement-dialog") ??
        document.querySelector(".ability-score-advancement")
}

async function waitForAppliedStageWithoutAbilityScoreDialog({
    runtime,
    actor,
    waiters,
    stage,
    sourceName
})
{
    await waiters.waitForNextFrame()

    const openedDialog = getAbilityScoreAdvancementDialogElement()
    if (openedDialog) {
        throw new Error(
            `${sourceName} ability score dialog opened unexpectedly`
        )
    }

    await waiters.waitForStageFinished(
        runtime,
        actor,
        waiters.waitForCondition,
        stage
    )

    const remainingDialog = getAbilityScoreAdvancementDialogElement()
    if (remainingDialog) {
        throw new Error(
            `${sourceName} ability score dialog opened unexpectedly`
        )
    }
}

function getItemActivities(item)
{
    const activities = item?.system?.activities

    if (!activities) return []

    if (Array.isArray(activities)) {
        return activities.filter(Boolean)
    }

    if (Array.isArray(activities?.contents)) {
        return activities.contents.filter(Boolean)
    }

    if (typeof activities?.values === "function") {
        return Array.from(activities.values()).filter(Boolean)
    }

    if (typeof activities?.[Symbol.iterator] === "function") {
        return Array.from(activities).filter(Boolean)
    }

    return Object.values(activities).filter(Boolean)
}

function getMidiAttackActivity(item, activityId = null)
{
    return getItemActivities(item).find(activity =>
        activity?.id === activityId ||
        activity?._id === activityId ||
        activity?.name === MIDI_ATTACK_ACTIVITY_NAME ||
        activity?.macroData?.name === MIDI_ATTACK_ACTIVITY_NAME
    ) ?? null
}

function getMainFangedBiteActivity(item)
{
    return getMidiAttackActivity(item, FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID)
}

function getFangedBiteNecroticSaveActivity(item)
{
    return getItemActivities(item).find(activity =>
        activity?.id === FANGED_BITE_NECROTIC_SAVE_ACTIVITY_ID ||
        activity?._id === FANGED_BITE_NECROTIC_SAVE_ACTIVITY_ID ||
        activity?.name === FANGED_BITE_NECROTIC_SAVE_ACTIVITY_NAME
    ) ?? null
}

function getFzegClawMidiAttackActivity(item)
{
    return getMidiAttackActivity(item, FZEG_CLAW_ATTACK_ACTIVITY_ID) ??
        getItemActivities(item).at(0) ??
        null
}

function getSangromancySpecialistActivity(item)
{
    return getItemActivities(item).find(activity =>
        activity?.name === SANGROMANCY_SPECIALIST_ACTIVITY_NAME
    ) ?? null
}

function getTrueAppearanceItem(actor)
{
    return getItemBySourceUuid(actor, TRUE_APPEARANCE_SAVE_ITEM_UUID)
}

function getTrueAppearanceSaveActivity(item)
{
    return getItemActivities(item).find(activity =>
        activity?.name === TRUE_APPEARANCE_SAVE_ACTIVITY_NAME
    ) ?? null
}

function getTrueAppearanceHideActivity(item)
{
    return getItemActivities(item).find(activity =>
        normalizeText(activity?.name) ===
        normalizeText(TRUE_APPEARANCE_HIDE_ACTIVITY_NAME)
    ) ?? null
}

async function createHidingTrueAppearanceEffect(actor)
{
    const currentActor = resolveCurrentActor(actor)
    if (!currentActor) {
        return
    }

    if (currentActor.effects.some(effect =>
        effect.name === TRUE_APPEARANCE_EFFECT_NAME
    ))
    {
        return
    }

    await currentActor.createEmbeddedDocuments("ActiveEffect", [
        {
            name: TRUE_APPEARANCE_EFFECT_NAME,
            disabled: false
        }
    ])
}

async function tryCreateHidingTrueAppearanceEffectFromActivity({
    actor,
    runtime,
    waiters
})
{
    const currentActor = resolveCurrentActor(actor)
    if (!currentActor) {
        return false
    }

    const trueAppearanceItem = getTrueAppearanceItem(currentActor)
    const hideActivity = getTrueAppearanceHideActivity(trueAppearanceItem)

    if (!hideActivity || typeof hideActivity.use !== "function") {
        return false
    }

    await hideActivity.use()

    if (runtime && waiters) {
        await waiters.waitForDomainStability({
            actor: currentActor,
            asyncTrackers: runtime.dependencies.utils.asyncTrackers
        })
        await waiters.waitForNextFrame()
    }

    return resolveCurrentActor(actor).effects.some(effect =>
        effect.name === TRUE_APPEARANCE_EFFECT_NAME
    )
}

async function ensureHidingTrueAppearanceEffect({
    actor,
    runtime,
    waiters
})
{
    const currentActor = resolveCurrentActor(actor)
    if (currentActor?.effects?.some?.(effect =>
        effect.name === TRUE_APPEARANCE_EFFECT_NAME
    ))
    {
        return currentActor
    }

    const wasCreatedByActivity =
              await tryCreateHidingTrueAppearanceEffectFromActivity({
                  actor,
                  runtime,
                  waiters
              })

    if (!wasCreatedByActivity) {
        await createHidingTrueAppearanceEffect(actor)
    }

    if (runtime && waiters) {
        await waitForHidingTrueAppearanceState({
            actor,
            runtime,
            waiters,
            present: true
        })
    }

    return resolveCurrentActor(actor)
}

async function waitForHidingTrueAppearanceState({
    actor,
    runtime,
    waiters,
    present
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
    {
        const currentActor = resolveCurrentActor(actor)

        return currentActor.effects.some(effect =>
            effect.name === TRUE_APPEARANCE_EFFECT_NAME
        ) === present
    })
}

function assertHidingTrueAppearanceState({
    actor,
    assert,
    present
})
{
    const actorDto = new ActorValidationDTO(resolveCurrentActor(actor))

    if (present) {
        actorDto.effects.has.push(TRUE_APPEARANCE_EFFECT_NAME)
    } else {
        actorDto.effects.notHas.push(TRUE_APPEARANCE_EFFECT_NAME)
    }

    validate(actorDto, {assert})
}

function normalizeText(value)
{
    return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

async function createCharacterClassWithHitDice({
    actor,
    helpers,
    className,
    hitDiceValue,
    hitDiceMax = null,
    levels = 1
})
{
    const resolvedHitDiceMax = hitDiceMax == null
        ? Math.max(hitDiceValue, levels)
        : hitDiceMax
    const sourceClass = await helpers.getCharacterClass(className)
    const classItem = await helpers.createActorItemAndWait(
        actor,
        sourceClass,
        {
            setTransformationFlags: false,
            setDdbImporterFlag: false,
            applyAdvancements: false,
            levels
        }
    )

    await classItem.update({
        "system.hd.value": hitDiceValue,
        "system.hd.max": resolvedHitDiceMax,
        "system.hd.spent": Math.max(resolvedHitDiceMax - hitDiceValue, 0)
    })

    return actor.items.get(classItem.id) ?? classItem
}

async function setupStage3ScenarioSpellSlotPrerequisite({
    actor,
    helpers,
    loopVars,
    staticVars
})
{
    if (!loopVars?.requiresSpellSlots) {
        return
    }

    staticVars.classItems = {
        Wizard: await createCharacterClassWithHitDice({
            actor,
            helpers,
            className: "Wizard",
            levels: 4,
            hitDiceValue: 2
        })
    }
}

async function configureSangromancySpecialistCharges({
    actor,
    item,
    charges
})
{
    await actor.setFlag(
        "transformations",
        "vampire.sangromancyHitDieMax",
        charges
    )

    await item.update({
        "system.uses.max": charges,
        "system.uses.value": charges,
        "system.uses.spent": 0
    })
}

async function prepareSangromancySpecialistChatCard({
    actor,
    runtime,
    helpers,
    waiters,
    staticVars,
    loopVars
})
{
    staticVars.sangromancySpecialist = getItemBySourceUuid(
        actor,
        SANGROMANCY_SPECIALIST_UUID
    )

    if (!staticVars.sangromancySpecialist) {
        throw new Error("Sangromancy Specialist item not present on actor")
    }

    await configureSangromancySpecialistCharges({
        actor,
        item: staticVars.sangromancySpecialist,
        charges: loopVars.charges
    })

    staticVars.sangromancyActivity = getSangromancySpecialistActivity(
        staticVars.sangromancySpecialist
    )

    if (!staticVars.sangromancyActivity) {
        throw new Error(
            "Enhance Cantrip Damage activity not present on Sangromancy Specialist"
        )
    }

    staticVars.initialMessageIds = new Set(
        game.messages.contents.map(message => message.id)
    )

    const activityUseResult = await staticVars.sangromancyActivity.use({actor})

    await waiters.waitForCondition(() =>
        game.messages.get(
            activityUseResult?.message?.id ??
            activityUseResult?.chatMessage?.id ??
            activityUseResult?.changes?.message?.id ??
            ""
        ) != null ||
        game.messages.contents.some(message =>
            !staticVars.initialMessageIds.has(message.id)
        )
    )

    staticVars.message =
        game.messages.get(
            activityUseResult?.message?.id ??
            activityUseResult?.chatMessage?.id ??
            activityUseResult?.changes?.message?.id ??
            ""
        ) ??
        game.messages.contents.find(message =>
            !staticVars.initialMessageIds.has(message.id)
        ) ??
        game.messages.contents.at(-1)

    if (!staticVars.message) {
        throw new Error("Enhance Cantrip Damage activity did not create a chat message")
    }

    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
        message: staticVars.message
    })
}

async function bindSangromancySpecialistCard({
    actor,
    runtime,
    message
})
{
    const currentMessage = game.messages.get(message?.id) ?? message ?? null
    const html = document.createElement("div")
    html.innerHTML = currentMessage?.content ?? ""

    const transformation =
              runtime.services.transformationRegistry.getEntryForActor(actor)

    await transformation?.TransformationClass?.onRenderChatMessage?.({
        message: currentMessage,
        html,
        actor,
        actorRepository: runtime.infrastructure.actorRepository,
        itemRepository: runtime.infrastructure.itemRepository,
        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
        RollService
    })

    return html
}

async function clickSangromancySpecialistCardButton({
    actor,
    runtime,
    message,
    waiters,
    text
})
{
    const html = await bindSangromancySpecialistCard({
        actor,
        runtime,
        message
    })
    const button = Array.from(
        html.querySelectorAll("button")
    ).find(candidate =>
        normalizeText(candidate.textContent) === normalizeText(text)
    )

    if (!button) {
        throw new Error(
            `Sangromancy Specialist chat card button not found with text "${text}"`
        )
    }

    button.click()
    await waiters.waitForNextFrame()
}

function createVampireActorValidationDTO(
    actor,
    requiredSourceUuids = [],
    maximumDaysPerFeed  = STAGE1_MAXIMUM_DAYS_PER_FEED
)
{
    const actorDto = new ActorValidationDTO(actor)

    actorDto.hasItemWithSourceUuids = [...requiredSourceUuids]
    actorDto.flags.match.push({
        path: "transformations.vampire",
        expected: {
            maximumDaysPerFeed
        }
    })

    return actorDto
}

function expectUsesMaxMatchesVampireFeedWindow(expect, usesMax)
{
    expect(
        [
            "@flags.transformations.vampire.maximumDaysPerFeed",
            String(STAGE1_MAXIMUM_DAYS_PER_FEED),
            STAGE1_MAXIMUM_DAYS_PER_FEED
        ].includes(usesMax),
        `Unexpected uses.max value: ${usesMax}`
    ).to.equal(true)
}

function captureVampireStage2InitialState(actor, staticVars)
{
    staticVars.initialDarkvision =
        Number(actor.system?.attributes?.senses?.darkvision ?? 0)
}

function addTheSanguineCurseValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [THE_SANGUINE_CURSE_UUID]
        item.itemName = "The Sanguine Curse"
        item.type = "feat"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/The%20Sanguine%20Curse.png"
        item.identifier = "the-sanguine-curse"
        item.descriptionIncludes =
            "You must feed at least once within seven days"
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = 0
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.name = "Feed"
            activity.type = "utility"
            activity.activationType = "action"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "ft"
            activity.range.value = "5"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.consumption.numberOfTargets = 1
            activity.addConsumptionTarget(target =>
            {
                target.target = ""
                target.type = "itemUses"
                target.value = "-7"
            })
            activity.uses.max = ""
        })
    })
}

function addFangedBiteValidation(actorDto, {
    necroticSaveFormula = "1d6",
    stageNumber = 1
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [FANGED_BITE_UUID]
        item.itemName = "Fanged Bite"
        item.type = "weapon"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/Fanged%20Bite.png"
        item.identifier = "fanged-bite"
        item.descriptionIncludes =
            "If the attack hits a creature that has blood"
        item.systemType = "natural"
        item.equipped = true
        item.proficient = 1
        item.propertiesIncludes = ["fin"]
        item.numberOfAdvancements = 0
        item.numberOfActivities = 2
        item.numberOfEffects = 0
        item.range.units = "ft"
        item.range.value = 5
        item.range.reach = 5
        item.range.long = 5
        item.uses.max = ""
        item.flags.match.push({
            path: "midi-qol",
            expected: {
                onUseMacroName:
                    "[preAttackRollConfig]ItemMacro"
            }
        })
        item.flags.match.push({
            path: "dae.macro",
            expected: {
                name: "Fanged Bite"
            }
        })
        item.addDamagePart("base", damagePart =>
        {
            damagePart.roll = "1d6"
            damagePart.bonus = "@mod"
            damagePart.damageTypes = ["piercing"]
        })
        item.addActivity(activity =>
        {
            activity.id = FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID
            activity.type = "attack"
            activity.activationType = "action"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "ft"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.consumption.numberOfTargets = 0
            activity.attackType = "melee"
            activity.attackFlat = false
            activity.attackMode = "oneHanded"
            activity.attackRollPerTarget = "default"
            activity.triggeredActivityRollAs = "firstTarget"
            activity.macroName = "Midi Attack"
            activity.damageIncludeBase = true
            activity.uses.max = ""
        })
        item.addActivity(activity =>
        {
            activity.name = "Necrotic Save"
            activity.type = "save"
            activity.activationType = "special"
            activity.range.units = "ft"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.saveAbility = ["con"]
            activity.saveDcFormula = `8 + @prof + @flags.transformations.stage`
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = necroticSaveFormula
                damagePart.damageTypes = ["necrotic"]
            })
        })
    })
}

function addFzegClawValidation(actorDto, {
    midiAttackFormula = "1d8",
    midiAttackBonus = "@mod"
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [FZEG_CLAW_UUID]
        item.itemName = "Claw"
        item.type = "weapon"
        item.addActivity(activity =>
        {
            activity.id = FZEG_CLAW_ATTACK_ACTIVITY_ID
            activity.type = "attack"
            activity.activationType = "action"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "ft"
            activity.range.value = "5"
            activity.target.prompt = false
            activity.uses.max = ""
            activity.attackType = "melee"
            activity.attackFlat = false
            activity.attackMode = "oneHanded"
            activity.attackRollPerTarget = "default"
            activity.damageIncludeBase = true
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = midiAttackFormula
                damagePart.bonus = midiAttackBonus
            })
        })
    })
}

function createSyntheticTransformationItemSource(
    sourceUuid,
    name = "Synthetic Vampire Override"
)
{
    return {
        name,
        type: "feat",
        uuid: sourceUuid,
        img: "",
        flags: {
            transformations: {
                sourceUuid
            }
        },
        system: {
            activities: {},
            uses: {
                spent: 0,
                recovery: [],
                max: ""
            },
            advancement: [],
            description: {
                value: "",
                chat: ""
            },
            identifier: "",
            source: {
                revision: 1,
                rules: "2024",
                book: "GHPG",
                custom: "Synthetic Test Item",
                license: ""
            },
            prerequisites: {
                items: [],
                repeatable: false,
                level: null
            },
            requirements: "",
            type: {
                value: "transformation",
                subtype: "vampire"
            }
        },
        effects: []
    }
}

function addSangromancySpecialistValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SANGROMANCY_SPECIALIST_UUID]
        item.itemName = "Sangromancy Specialist"
        item.addActivity(activity =>
        {
            activity.name = SANGROMANCY_SPECIALIST_ACTIVITY_NAME
            activity.type = "utility"
            activity.activationType = "special"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.consumption.numberOfTargets = 0
            activity.uses.max = ""
        })
    })
}

function addGreaterSanguineCurseValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [GREATER_SANGUINE_CURSE_UUID]
        item.itemName = "Greater Sanguine Curse"
        item.type = "feat"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/Greater%20Sanguine%20Curse.png"
        item.identifier = "greater-sanguine-curse"
        item.descriptionIncludes = "You must feed every 4 days"
        item.systemType = ""
        item.systemSubType = ""
        item.numberOfAdvancements = 0
        item.numberOfActivities = 0
        item.numberOfEffects = 0
        item.uses.max = ""
    })
}

function addSupremeSanguineCurseValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SUPREME_SANGUINE_CURSE_UUID]
        item.itemName = "Supreme Sanguine Curse"
        item.type = "feat"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/Supreme%20Sanguine%20Curse.png"
        item.identifier = "supreme-sanguine-curse"
        item.descriptionIncludes = "You must feed every 2 days"
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = 0
        item.numberOfActivities = 2
        item.numberOfEffects = 1
        item.uses.max = ""
        item.addActivity(activity =>
        {
            activity.id = SUPREME_SANGUINE_CURSE_HIDE_ACTIVITY_ID
            activity.name = TRUE_APPEARANCE_HIDE_ACTIVITY_NAME
            activity.type = "utility"
            activity.activationType = "action"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.uses.max = ""
            activity.addEffect(effect =>
            {
                effect.name = TRUE_APPEARANCE_EFFECT_NAME
            })
        })
        item.addActivity(activity =>
        {
            activity.id = SUPREME_SANGUINE_CURSE_SAVE_ACTIVITY_ID
            activity.type = "save"
            activity.activationType = "special"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "self"
            activity.target.prompt = false
            activity.saveAbility = ["con"]
            activity.uses.max = ""
        })
        item.addEffect(effect =>
        {
            effect.name = TRUE_APPEARANCE_EFFECT_NAME
            effect.description = "<p>You are Hiding your Hideous Form</p>"
            effect.transfer = false
            effect.changes.count = 0
        })
    })
}

function addUltimateSanguineCurseValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [ULTIMATE_SANGUINE_CURSE_UUID]
        item.itemName = "Ultimate Sanguine Curse"
        item.type = "feat"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/Ultimate%20Sanguine%20Curse.png"
        item.identifier = "ultimate-sanguine-curse"
        item.descriptionIncludes = "You must feed every day"
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = 0
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.uses.max = ""
        item.addActivity(activity =>
        {
            activity.id = "XJcdTHbRCIOCPkjM"
            activity.type = "save"
            activity.activationType = "special"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.saveAbility = ["con"]
            activity.saveDcFormula = "20"
            activity.uses.max = ""
        })
    })
}

function addStage1ChoiceItemValidation(actorDto, loopVars)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [loopVars.uuid]
        item.itemName = loopVars.name
        item.type = "feat"
        item.img = loopVars.img
        item.identifier = loopVars.identifier
        item.descriptionIncludes = loopVars.descriptionSnippet
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = loopVars.advancementCount
        item.numberOfActivities = 0
        item.numberOfEffects = loopVars.effectCount
        item.uses.max = ""

        loopVars.configureBloodlineItemValidation(item)
    })
}

function addStage2ChoiceItemValidation(actorDto, choice)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [choice.uuid]
        item.itemName = choice.name
        item.type = "feat"
        item.img = choice.img
        item.identifier = choice.identifier
        item.descriptionIncludes = choice.descriptionSnippet
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = choice.advancementCount
        item.numberOfActivities = choice.activityCount
        item.numberOfEffects = choice.effectCount
        item.uses.max = choice.usesMax

        choice.configureChoiceItemValidation(item)
    })
}

function addStage2ChoicePairItemValidations(actorDto, loopVars)
{
    loopVars.choices.forEach(choice =>
    {
        addStage2ChoiceItemValidation(actorDto, choice)
    })
}

function addStage3ChoiceItemValidation(actorDto, actor, choice)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [choice.uuid]
        item.itemName = choice.name
        item.type = "feat"
        item.img = choice.img
        item.identifier = choice.identifier
        item.descriptionIncludes = choice.descriptionSnippet
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = choice.propertiesIncludes
        item.numberOfAdvancements = choice.advancementCount
        item.numberOfActivities = choice.activityCount
        item.numberOfEffects = choice.effectCount
        item.uses.max =
            typeof choice.resolveUsesMax === "function"
                ? choice.resolveUsesMax(actor)
                : choice.usesMax

        choice.configureChoiceItemValidation(item)
    })
}

function addStage3ChoicePairItemValidations(actorDto, actor, loopVars)
{
    loopVars.choices.forEach(choice =>
    {
        addStage3ChoiceItemValidation(actorDto, actor, choice)
    })
}

function addStage4ChoiceItemValidations(actorDto, choice)
{
    const choicesToValidate = [
        choice,
        ...(choice.additionalChoiceValidations ?? [])
    ]

    choicesToValidate.forEach(stage4Choice =>
    {
        actorDto.addItem(item =>
        {
            item.expectedItemUuids = [stage4Choice.uuid]
            item.itemName = stage4Choice.name
            item.type = "feat"
            item.img = stage4Choice.img
            item.identifier = stage4Choice.identifier
            item.descriptionIncludes = stage4Choice.descriptionSnippet
            item.systemType = "transformation"
            item.systemSubType = "vampire"
            item.propertiesIncludes = ["trait"]
            item.numberOfAdvancements = stage4Choice.advancementCount
            item.numberOfActivities = stage4Choice.activityCount
            item.numberOfEffects = stage4Choice.effectCount
            item.uses.max = stage4Choice.usesMax

            stage4Choice.configureChoiceItemValidation(item)
        })
    })
}

function buildVampireStage1BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        THE_SANGUINE_CURSE_UUID,
        FANGED_BITE_UUID,
        loopVars.uuid
    ], STAGE1_MAXIMUM_DAYS_PER_FEED)

    addTheSanguineCurseValidation(actorDto)
    addFangedBiteValidation(actorDto, {
        stageNumber: getActorTransformationStage(actor, 1)
    })
    addStage1ChoiceItemValidation(actorDto, loopVars)

    return actorDto
}

function buildVampireStage1AppliedActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        loopVars.uuid
    ], STAGE1_MAXIMUM_DAYS_PER_FEED)

    addStage1ChoiceItemValidation(actorDto, loopVars)
    loopVars.configureAppliedActorValidation(actorDto)

    return actorDto
}

function buildVampireStage2BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        GREATER_SANGUINE_CURSE_UUID,
        ...loopVars.uuids
    ], STAGE2_MAXIMUM_DAYS_PER_FEED)

    addGreaterSanguineCurseValidation(actorDto)
    addStage2ChoicePairItemValidations(actorDto, loopVars)

    return actorDto
}

function buildVampireStage2AppliedActorValidationDTO(
    actor,
    loopVars,
    staticVars
)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        GREATER_SANGUINE_CURSE_UUID,
        ...loopVars.uuids
    ], STAGE2_MAXIMUM_DAYS_PER_FEED)

    addGreaterSanguineCurseValidation(actorDto)
    addStage2ChoicePairItemValidations(actorDto, loopVars)

    loopVars.choices.forEach(choice =>
    {
        choice.configureAppliedActorValidation(actorDto, {staticVars})
    })

    return actorDto
}

function buildVampireStage3BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        SUPREME_SANGUINE_CURSE_UUID,
        ...loopVars.uuids
    ], STAGE3_MAXIMUM_DAYS_PER_FEED)

    addSupremeSanguineCurseValidation(actorDto)
    addStage3ChoicePairItemValidations(actorDto, actor, loopVars)

    return actorDto
}

function buildVampireStage3AppliedActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        SUPREME_SANGUINE_CURSE_UUID,
        ...loopVars.uuids
    ], STAGE3_MAXIMUM_DAYS_PER_FEED)

    addSupremeSanguineCurseValidation(actorDto)
    addStage3ChoicePairItemValidations(actorDto, actor, loopVars)

    loopVars.choices.forEach(choice =>
    {
        choice.configureAppliedActorValidation(actorDto)
    })

    return actorDto
}

function buildVampireStage4BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        ULTIMATE_SANGUINE_CURSE_UUID,
        ...loopVars.selectedUuids
    ], STAGE4_MAXIMUM_DAYS_PER_FEED)

    addUltimateSanguineCurseValidation(actorDto)
    addStage4ChoiceItemValidations(actorDto, loopVars)

    return actorDto
}

function buildVampireStage4AppliedActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        ULTIMATE_SANGUINE_CURSE_UUID,
        ...loopVars.selectedUuids
    ], STAGE4_MAXIMUM_DAYS_PER_FEED)

    addUltimateSanguineCurseValidation(actorDto)
    addStage4ChoiceItemValidations(actorDto, loopVars)
    loopVars.configureAppliedActorValidation(actorDto)

    return actorDto
}

function configureFixedVampireAbilityScoreAdvancement(itemName)
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: itemName,
            choice: {}
        }
    ]
}

function buildSangromancySpecialistRequiredPath()
{
    return [
        {
            stage: 1,
            choose: DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid
        },
        {
            stage: 2,
            choose: DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES
        },
        {
            stage: 3,
            choose: DEFAULT_STAGE3_CHOICE_UUIDS
        }
    ]
}

function buildTrueAppearanceRequiredPath()
{
    return [
        {
            stage: 1,
            choose: DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid
        },
        {
            stage: 2,
            choose: DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES
        },
        {
            stage: 3,
            choose: DEFAULT_TRUE_APPEARANCE_STAGE3_CHOICE_UUIDS
        }
    ]
}

export const vampireTestDef = {
    id: "vampire",
    name: "Vampire",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: [
        {
            name: loopVars =>
                `stage 1 grants vampire base items with ${loopVars.name}`,

            loop: () => stage1Choices,

            steps: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.uuid,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE1_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(getItemBySourceUuid(actor, THE_SANGUINE_CURSE_UUID))
                )

                await waiters.waitForCondition(() =>
                    Boolean(getItemBySourceUuid(actor, FANGED_BITE_UUID))
                )
            },

            finalAssertions: async ({actor, assert, expect, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage1BaseActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})

                const sanguineCurse = getItemBySourceUuid(
                    actor,
                    THE_SANGUINE_CURSE_UUID
                )
                expectUsesMaxMatchesVampireFeedWindow(
                    expect,
                    sanguineCurse?.system?.uses?.max
                )
            }
        },
        {
            name: loopVars => `stage 1 applies ${loopVars.name}`,

            loop: () => stage1Choices,

            steps: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.uuid,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    Boolean(getItemBySourceUuid(actor, loopVars.uuid))
                )

                await loopVars.finalAwait({actor, waiters})
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage1AppliedActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars =>
                `stage 2 grants vampire stage 2 items with ${loopVars.name}`,

            loop: () => stage2ChoicePairs,

            steps: [
                {
                    stage: 1,
                    choose: () => DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName:
                            DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.name
                        })
                        captureVampireStage2InitialState(actor, staticVars)
                    }
                },
                {
                    stage: 2,
                    choose: loopVars => loopVars.uuids,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE2_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, GREATER_SANGUINE_CURSE_UUID)
                    )
                )

                for (const sourceUuid of loopVars.uuids) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, sourceUuid))
                    )
                }
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage2BaseActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars => `stage 2 applies ${loopVars.name}`,

            loop: () => stage2ChoicePairs,

            steps: [
                {
                    stage: 1,
                    choose: () => DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName:
                            DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.name
                        })
                        captureVampireStage2InitialState(actor, staticVars)
                    }
                },
                {
                    stage: 2,
                    choose: loopVars => loopVars.uuids,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars, staticVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE2_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, GREATER_SANGUINE_CURSE_UUID)
                    )
                )

                for (const choice of loopVars.choices) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, choice.uuid))
                    )
                    await choice.finalAwait({actor, waiters, staticVars})
                }
            },

            finalAssertions: async ({actor, assert, loopVars, staticVars}) =>
            {
                const actorDto = buildVampireStage2AppliedActorValidationDTO(
                    actor,
                    loopVars,
                    staticVars
                )

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars =>
                `stage 3 grants vampire stage 3 items with ${loopVars.name}`,

            loop: () => stage3ChoicePairs,

            setup: async ({actor, helpers, loopVars, staticVars}) =>
            {
                await setupStage3ScenarioSpellSlotPrerequisite({
                    actor,
                    helpers,
                    loopVars,
                    staticVars
                })
            },

            steps: [
                {
                    stage: 1,
                    choose: () => DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName:
                            DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.name
                        })
                    }
                },
                {
                    stage: 2,
                    choose: () => DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: "Vampire Stage 2 prerequisites"
                        })
                    }
                },
                {
                    stage: 3,
                    choose: loopVars => loopVars.uuids,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 3,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE3_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, SUPREME_SANGUINE_CURSE_UUID)
                    )
                )

                for (const choice of loopVars.choices) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, choice.uuid))
                    )
                    await choice.finalAwait({actor, waiters})
                }
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage3BaseActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars => `stage 3 applies ${loopVars.name}`,

            loop: () => stage3ChoicePairs,

            setup: async ({actor, helpers, loopVars, staticVars}) =>
            {
                await setupStage3ScenarioSpellSlotPrerequisite({
                    actor,
                    helpers,
                    loopVars,
                    staticVars
                })
            },

            steps: [
                {
                    stage: 1,
                    choose: () => DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName:
                            DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.name
                        })
                    }
                },
                {
                    stage: 2,
                    choose: () => DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: "Vampire Stage 2 prerequisites"
                        })
                    }
                },
                {
                    stage: 3,
                    choose: loopVars => loopVars.uuids,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 3,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE3_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, SUPREME_SANGUINE_CURSE_UUID)
                    )
                )

                for (const choice of loopVars.choices) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, choice.uuid))
                    )
                    await choice.finalAwait({actor, waiters})
                }
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage3AppliedActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars =>
                `stage 4 grants vampire stage 4 items with ${loopVars.name}`,

            loop: () => stage4Choices,

            steps: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.prerequisiteStage1Choice.uuid,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName: loopVars.prerequisiteStage1Choice.name
                        })
                    }
                },
                {
                    stage: 2,
                    choose: () => DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: "Vampire Stage 2 prerequisites"
                        })
                    }
                },
                {
                    stage: 3,
                    choose: () => DEFAULT_STAGE4_PREREQUISITE_STAGE3_CHOICE_UUIDS,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 3,
                            sourceName: "Vampire Stage 3 prerequisites"
                        })
                    }
                },
                {
                    stage: 4,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 4,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE4_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, ULTIMATE_SANGUINE_CURSE_UUID)
                    )
                )

                for (const sourceUuid of loopVars.selectedUuids) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, sourceUuid))
                    )
                }
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage4BaseActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars => `stage 4 applies ${loopVars.name}`,

            loop: () => stage4Choices,

            steps: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.prerequisiteStage1Choice.uuid,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName: loopVars.prerequisiteStage1Choice.name
                        })
                    }
                },
                {
                    stage: 2,
                    choose: () => DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: "Vampire Stage 2 prerequisites"
                        })
                    }
                },
                {
                    stage: 3,
                    choose: () => DEFAULT_STAGE4_PREREQUISITE_STAGE3_CHOICE_UUIDS,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 3,
                            sourceName: "Vampire Stage 3 prerequisites"
                        })
                    }
                },
                {
                    stage: 4,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 4,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE4_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, ULTIMATE_SANGUINE_CURSE_UUID)
                    )
                )

                for (const sourceUuid of loopVars.selectedUuids) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, sourceUuid))
                    )
                }

                await loopVars.finalAwait({actor, waiters})
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage4AppliedActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: [
        {
            name: loopVars => loopVars.name,

            loop: () => fangedBiteBehaviorCases,

            setup: async ({loopVars}) =>
            {
                configureFixedVampireAbilityScoreAdvancement(
                    loopVars.stage1ChoiceName
                )
            },

            requiredPath: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.stage1ChoiceUuid
                }
            ],

            steps: [
                async ({actor, waiters, staticVars, loopVars}) =>
                {
                    const fangedBite = getItemBySourceUuid(
                        actor,
                        FANGED_BITE_UUID
                    )

                    if (!fangedBite) {
                        throw new Error("Fanged Bite item not present on actor")
                    }

                    const midiAttackActivity = getMainFangedBiteActivity(
                        fangedBite
                    )

                    if (!midiAttackActivity) {
                        throw new Error(
                            "Fanged Bite Midi Attack activity not present on actor"
                        )
                    }

                    const damageRollFormula = "1d6 + 1"

                    staticVars.fangedBite = fangedBite
                    staticVars.midiAttackActivity = midiAttackActivity
                    staticVars.damageRolls = [
                        {
                            formula: damageRollFormula,
                            _formula: damageRollFormula,
                            parts: [damageRollFormula],
                            options: {
                                types: ["piercing"]
                            }
                        }
                    ]

                    Hooks.call("dnd5e.preRollAttack", {
                        subject: {
                            actor,
                            item: fangedBite,
                            activity: midiAttackActivity
                        },
                        advantage: loopVars.attackHasAdvantage,
                        disadvantage: false
                    })

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()

                    Hooks.call("dnd5e.preRollDamageV2", {
                        workflow: {
                            actor,
                            item: fangedBite,
                            activity: midiAttackActivity,
                            advantage:
                                loopVars.damageWorkflowAdvantage ??
                                loopVars.attackHasAdvantage
                        },
                        rolls: staticVars.damageRolls
                    }, {}, {})

                    if (
                        loopVars.attackHasAdvantage ||
                        loopVars.damageWorkflowAdvantage
                    )
                    {
                        await waiters.waitForNextFrame()
                    }

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({actor, assert, staticVars, loopVars}) =>
            {
                const actorDto = createVampireActorValidationDTO(actor, [
                    FANGED_BITE_UUID,
                    loopVars.stage1ChoiceUuid
                ])

                addFangedBiteValidation(actorDto, {
                    stageNumber: getActorTransformationStage(actor, 1)
                })
                validate(actorDto, {assert})

                const contextDto = new ContextValidationDTO({
                    advantage:
                        loopVars.damageWorkflowAdvantage ??
                        loopVars.attackHasAdvantage,
                    rolls: staticVars.damageRolls.map(roll => ({
                        formula: roll.formula,
                        _formula: roll._formula,
                        part: roll.parts?.[0]
                    }))
                })

                contextDto.advantage =
                    loopVars.damageWorkflowAdvantage ??
                    loopVars.attackHasAdvantage
                contextDto.rolls = {
                    values: [
                        {
                            formula: loopVars.expectedFormula,
                            _formula: loopVars.expectedFormula,
                            part: loopVars.expectedFormula
                        }
                    ],
                    mode: "equal"
                }

                validate(contextDto, {assert})
            }
        },
        {
            name: loopVars => loopVars.name,

            loop: () => fangedBiteNecroticSaveBehaviorCases,

            setup: async ({loopVars}) =>
            {
                configureFixedVampireAbilityScoreAdvancement(
                    loopVars.stage1ChoiceName
                )
            },

            requiredPath: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.stage1ChoiceUuid
                }
            ],

            steps: [
                async ({actor, helpers, waiters, staticVars, loopVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    if (loopVars.extraItemSourceUuid) {
                        await helpers.createActorItemAndWait(
                            currentActor,
                            createSyntheticTransformationItemSource(
                                loopVars.extraItemSourceUuid
                            )
                        )
                    }

                    const liveActor = resolveCurrentActor(actor)
                    const fangedBite = getItemBySourceUuid(
                        liveActor,
                        FANGED_BITE_UUID
                    )

                    if (!fangedBite) {
                        throw new Error("Fanged Bite item not present on actor")
                    }

                    const necroticSaveActivity =
                              getFangedBiteNecroticSaveActivity(fangedBite)

                    if (!necroticSaveActivity) {
                        throw new Error(
                            "Fanged Bite Necrotic Save activity not present on actor"
                        )
                    }

                    staticVars.fangedBite = fangedBite
                    staticVars.necroticSaveActivity = necroticSaveActivity
                    staticVars.detachedNecroticSaveActivity = {
                        id: necroticSaveActivity.id ?? necroticSaveActivity._id,
                        _id: necroticSaveActivity._id ?? necroticSaveActivity.id,
                        name: necroticSaveActivity.name
                    }
                    staticVars.damageRolls = [
                        {
                            formula: "1d6",
                            _formula: "1d6",
                            parts: ["1d6"],
                            options: {
                                types: ["necrotic"]
                            }
                        }
                    ]
                    staticVars.damageConfig = {
                        workflow: {
                            actor: liveActor,
                            item: fangedBite,
                            activity: staticVars.detachedNecroticSaveActivity
                        },
                        actor: liveActor,
                        item: fangedBite,
                        activity: staticVars.detachedNecroticSaveActivity,
                        rolls: staticVars.damageRolls
                    }

                    Hooks.call(
                        "dnd5e.preRollDamageV2",
                        staticVars.damageConfig,
                        {},
                        {}
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({actor, assert, staticVars, loopVars}) =>
            {
                const currentActor = resolveCurrentActor(actor)
                const requiredSourceUuids = [
                    FANGED_BITE_UUID,
                    loopVars.stage1ChoiceUuid
                ]

                if (loopVars.extraItemSourceUuid) {
                    requiredSourceUuids.push(loopVars.extraItemSourceUuid)
                }

                const actorDto = createVampireActorValidationDTO(
                    currentActor,
                    requiredSourceUuids
                )

                addFangedBiteValidation(actorDto, {
                    stageNumber: getActorTransformationStage(currentActor, 1)
                })
                validate(actorDto, {assert})

                const contextDto = new ContextValidationDTO({
                    rolls: staticVars.damageRolls.map(roll => ({
                        formula: roll.formula,
                        _formula: roll._formula,
                        part: roll.parts?.[0]
                    }))
                })

                contextDto.rolls = {
                    values: [
                        {
                            formula: loopVars.expectedFormula,
                            _formula: loopVars.expectedFormula,
                            part: loopVars.expectedFormula
                        }
                    ],
                    mode: "equal"
                }

                validate(contextDto, {assert})
            }
        },
        {
            name: loopVars => loopVars.name,

            loop: () => fzegClawMidiAttackBehaviorCases,

            setup: async () =>
            {
                configureFixedVampireAbilityScoreAdvancement("Fzeg Bloodline")
            },

            requiredPath: [
                {
                    stage: 1,
                    choose: FZEG_BLOODLINE_UUID
                }
            ],

            steps: [
                async ({actor, helpers, waiters, staticVars, loopVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    if (loopVars.extraItemSourceUuid) {
                        await helpers.createActorItemAndWait(
                            currentActor,
                            createSyntheticTransformationItemSource(
                                loopVars.extraItemSourceUuid
                            )
                        )
                    }

                    const liveActor = resolveCurrentActor(actor)
                    const fzegClaw = getItemBySourceUuid(
                        liveActor,
                        FZEG_CLAW_UUID
                    )

                    if (!fzegClaw) {
                        throw new Error("Fzeg Claw item not present on actor")
                    }

                    const midiAttackActivity =
                              getFzegClawMidiAttackActivity(fzegClaw)

                    if (!midiAttackActivity) {
                        throw new Error(
                            "Fzeg Claw Midi Attack activity not present on actor"
                        )
                    }

                    staticVars.fzegClaw = fzegClaw
                    staticVars.midiAttackActivity = midiAttackActivity
                    staticVars.detachedMidiAttackActivity = {
                        id: midiAttackActivity.id ?? midiAttackActivity._id,
                        _id: midiAttackActivity._id ?? midiAttackActivity.id,
                        name: midiAttackActivity.name || MIDI_ATTACK_ACTIVITY_NAME
                    }
                    staticVars.damageRolls = [
                        {
                            formula: "1d8 + 1",
                            _formula: "1d8 + 1",
                            parts: ["1d8 + 1"],
                            options: {
                                types: ["slashing"]
                            }
                        }
                    ]
                    staticVars.damageConfig = {
                        workflow: {
                            actor: liveActor,
                            item: fzegClaw,
                            activity: staticVars.detachedMidiAttackActivity
                        },
                        actor: liveActor,
                        item: fzegClaw,
                        activity: staticVars.detachedMidiAttackActivity,
                        rolls: staticVars.damageRolls
                    }

                    Hooks.call(
                        "dnd5e.preRollDamageV2",
                        staticVars.damageConfig,
                        {},
                        {}
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({actor, assert, staticVars, loopVars}) =>
            {
                const currentActor = resolveCurrentActor(actor)
                const requiredSourceUuids = [
                    FZEG_BLOODLINE_UUID,
                    FZEG_CLAW_UUID
                ]

                if (loopVars.extraItemSourceUuid) {
                    requiredSourceUuids.push(loopVars.extraItemSourceUuid)
                }

                const actorDto = createVampireActorValidationDTO(
                    currentActor,
                    requiredSourceUuids
                )

                addFzegClawValidation(actorDto)
                validate(actorDto, {assert})

                const contextDto = new ContextValidationDTO({
                    rolls: staticVars.damageRolls.map(roll => ({
                        formula: roll.formula,
                        _formula: roll._formula,
                        part: roll.parts?.[0]
                    }))
                })

                contextDto.rolls = {
                    values: [
                        {
                            formula: loopVars.expectedRollFormula,
                            _formula: loopVars.expectedRollFormula,
                            part: loopVars.expectedRollFormula
                        }
                    ],
                    mode: "equal"
                }

                validate(contextDto, {assert})
            }
        },
        {
            name:
                "Sangromancy Specialist grants Enhance Cantrip Damage and renders a vampire midi chat card",

            setup: async ({actor, helpers, staticVars}) =>
            {
                staticVars.classItems = {
                    Wizard: await createCharacterClassWithHitDice({
                        actor,
                        helpers,
                        className: "Wizard",
                        levels: 4,
                        hitDiceValue: 2
                    })
                }
            },

            requiredPath: buildSangromancySpecialistRequiredPath(),

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    await prepareSangromancySpecialistChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        loopVars: {
                            charges: 2
                        }
                    })
                }
            ],

            await: async ({staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard({
                    preferLive: false
                })
                await staticVars.chatCardHelper.waitForButton(
                    {
                        text: "Roll 1 Die"
                    },
                    {
                        preferLive: false
                    }
                )
                await staticVars.chatCardHelper.waitForButton(
                    {
                        text: "Roll 2 Dice"
                    },
                    {
                        preferLive: false
                    }
                )
            },

            assertions: async ({actor, expect, assert, staticVars}) =>
            {
                const actorDto = createVampireActorValidationDTO(actor, [
                    SANGROMANCY_SPECIALIST_UUID
                ], STAGE3_MAXIMUM_DAYS_PER_FEED)
                addSangromancySpecialistValidation(actorDto)
                validate(actorDto, {assert})

                const activity = getSangromancySpecialistActivity(
                    staticVars.sangromancySpecialist
                )

                expect(activity).to.exist
                expect(activity?.name).to.equal(
                    SANGROMANCY_SPECIALIST_ACTIVITY_NAME
                )
                expect(staticVars.message?.flags?.transformations?.vampireActivity)
                .to.equal("sangromancyEnhanceCantripDamage")
                expect(staticVars.message?.flags?.transformations?.state)
                .to.equal("initial")
                expect(
                    staticVars.message?.flags?.transformations?.maxDice
                ).to.equal(2)

                const card = staticVars.chatCardHelper.getCardElement({
                    require: true
                })
                expect(card.dataset.vampireActivity)
                .to.equal("sangromancyEnhanceCantripDamage")
                expect(String(staticVars.message?.content ?? ""))
                .to.contain('data-transformations-card="true"')
                expect(
                    staticVars.chatCardHelper.hasButton({
                        text: "Roll 1 Die"
                    })
                ).to.equal(true)
                expect(
                    staticVars.chatCardHelper.hasButton({
                        text: "Roll 2 Dice"
                    })
                ).to.equal(true)
                expect(
                    staticVars.chatCardHelper.hasButton({
                        text: "Roll 3 Dice"
                    })
                ).to.equal(false)
            }
        },
        {
            name: loopVars => loopVars.name,

            loop: () => sangromancyResourceBehaviorCases,

            setup: async ({actor, helpers, loopVars, staticVars}) =>
            {
                staticVars.classItems = {}

                for (const classDefinition of loopVars.classDefinitions) {
                    staticVars.classItems[classDefinition.className] =
                        await createCharacterClassWithHitDice({
                            actor,
                            helpers,
                            className: classDefinition.className,
                            levels: classDefinition.levels,
                            hitDiceValue: classDefinition.hitDiceValue,
                            hitDiceMax: classDefinition.hitDiceMax ?? null
                        })
                }
            },

            requiredPath: buildSangromancySpecialistRequiredPath(),

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    await prepareSangromancySpecialistChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        loopVars
                    })
                }
            ],

            await: async ({staticVars, loopVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard({
                    preferLive: false
                })

                for (const buttonText of loopVars.expectedPresentButtons) {
                    await staticVars.chatCardHelper.waitForButton(
                        {
                            text: buttonText
                        },
                        {
                            preferLive: false
                        }
                    )
                }
            },

            assertions: async ({
                actor,
                runtime,
                expect,
                assert,
                helpers,
                waiters,
                loopVars,
                staticVars
            }) =>
            {
                const actorDto = createVampireActorValidationDTO(actor, [
                    SANGROMANCY_SPECIALIST_UUID
                ], STAGE3_MAXIMUM_DAYS_PER_FEED)
                addSangromancySpecialistValidation(actorDto)
                validate(actorDto, {assert})

                for (const buttonText of loopVars.expectedPresentButtons) {
                    expect(
                        staticVars.chatCardHelper.hasButton({
                            text: buttonText
                        }),
                        `Expected button "${buttonText}" on Sangromancy Specialist card`
                    ).to.equal(true)
                }

                for (const buttonText of loopVars.expectedAbsentButtons) {
                    expect(
                        staticVars.chatCardHelper.hasButton({
                            text: buttonText
                        }),
                        `Did not expect button "${buttonText}" on Sangromancy Specialist card`
                    ).to.equal(false)
                }

                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    rollHelper.queueRoll({
                        formula: loopVars.expectedFormula,
                        total: 7
                    })

                    await clickSangromancySpecialistCardButton({
                        actor,
                        runtime,
                        message: staticVars.message,
                        waiters,
                        text: loopVars.rollButtonText
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === loopVars.expectedFormula
                        )
                    )

                    await waiters.waitForCondition(() =>
                        staticVars.chatCardHelper.getMessage()
                            ?.flags?.transformations?.state === "rolled"
                    )

                    const presentedRolls =
                              await staticVars.chatCardHelper.waitForPresentedRolls({
                                  count: 1,
                                  preferLive: false
                              })

                    const currentSangromancySpecialist =
                              actor.items.get(staticVars.sangromancySpecialist.id) ??
                              getItemBySourceUuid(actor, SANGROMANCY_SPECIALIST_UUID)

                    expect(
                        currentSangromancySpecialist?.system?.uses?.spent
                    ).to.equal(loopVars.expectedUsesSpent)
                    expect(
                        staticVars.chatCardHelper.hasButton({
                            text: loopVars.rollButtonText
                        })
                    ).to.equal(false)

                    for (const classState of loopVars.expectedClassStates) {
                        await waiters.waitForCondition(() =>
                            Number(
                                staticVars.classItems[classState.className]
                                    ?.system?.hd?.value ?? 0
                            ) === classState.remainingHitDice
                        )

                        expect(
                            Number(
                                staticVars.classItems[classState.className]
                                    ?.system?.hd?.value ?? 0
                            )
                        ).to.equal(classState.remainingHitDice)
                    }

                    const contextDto = new ContextValidationDTO({
                        advantage: false,
                        rolls: presentedRolls.map(roll => ({
                            formula: roll.formula
                        }))
                    })
                    contextDto.advantage = false
                    contextDto.rolls = {
                        values: [
                            {
                                formula: loopVars.expectedFormula
                            }
                        ],
                        mode: "equal"
                    }

                    validate(contextDto, {assert})
                } finally {
                    rollHelper.restore()
                }
            }
        },
        {
            name:
                "True Appearance revealTrueAppearance removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await Vampire.revealTrueAppearance(currentActor)
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance revealTrueAppearance does nothing when the hiding effect is missing",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor}) =>
                {
                    await Vampire.revealTrueAppearance(resolveCurrentActor(actor))
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance Midi Save applies stage 3 DC on preUseActivity",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    staticVars.trueAppearanceItem =
                        getTrueAppearanceItem(currentActor)
                    staticVars.trueAppearanceActivity =
                        getTrueAppearanceSaveActivity(
                            staticVars.trueAppearanceItem
                        )

                    if (!staticVars.trueAppearanceItem) {
                        throw new Error(
                            "True Appearance save item not present on actor"
                        )
                    }

                    if (!staticVars.trueAppearanceActivity) {
                        throw new Error(
                            "True Appearance Midi Save activity not present on actor"
                        )
                    }

                    staticVars.usageConfig = {}
                    staticVars.dialogConfig = {
                        dc: {
                            value: 0
                        }
                    }
                    staticVars.messageConfig = {}

                    Hooks.call(
                        "dnd5e.preUseActivity",
                        staticVars.trueAppearanceActivity,
                        staticVars.usageConfig,
                        staticVars.dialogConfig,
                        staticVars.messageConfig
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({expect, staticVars}) =>
            {
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.formula
                ).to.equal("16")
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.value
                ).to.equal(16)
                expect(
                    staticVars.trueAppearanceActivity?.system?.save?.dc?.formula
                ).to.equal("16")
                expect(staticVars.dialogConfig?.dc?.value).to.equal(16)
                expect(staticVars.messageConfig?.dc?.value).to.equal(16)
            }
        },
        {
            name:
                "True Appearance Midi Save applies stage 4 DC on preActivityUse",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    await currentActor.setFlag("transformations", "stage", 4)
                    await waiters.waitForCondition(() =>
                        resolveCurrentActor(actor).getFlag(
                            "transformations",
                            "stage"
                        ) === 4
                    )

                    staticVars.trueAppearanceItem =
                        getTrueAppearanceItem(currentActor)
                    staticVars.trueAppearanceActivity =
                        getTrueAppearanceSaveActivity(
                            staticVars.trueAppearanceItem
                        )

                    if (!staticVars.trueAppearanceActivity) {
                        throw new Error(
                            "True Appearance Midi Save activity not present on actor"
                        )
                    }

                    staticVars.dialogConfig = {}
                    staticVars.messageConfig = {}

                    Hooks.call(
                        "dnd5e.preActivityUse",
                        staticVars.trueAppearanceActivity,
                        {},
                        staticVars.dialogConfig,
                        staticVars.messageConfig
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({expect, staticVars}) =>
            {
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.formula
                ).to.equal("20")
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.value
                ).to.equal(20)
                expect(
                    staticVars.trueAppearanceActivity?.system?.save?.dc?.formula
                ).to.equal("20")
                expect(staticVars.messageConfig?.dc?.value).to.equal(20)
            }
        },
        {
            name:
                "True Appearance DC override does not apply to the wrong activity",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    staticVars.activity = {
                        name: "Not Midi Save",
                        actor: currentActor,
                        item: getTrueAppearanceItem(currentActor),
                        save: {
                            dc: {
                                calculation: "",
                                formula: "",
                                value: 0
                            }
                        },
                        system: {
                            save: {
                                dc: {
                                    calculation: "",
                                    formula: "",
                                    value: 0
                                }
                            }
                        }
                    }

                    Hooks.call(
                        "dnd5e.preUseActivity",
                        staticVars.activity,
                        {},
                        {},
                        {}
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({expect, staticVars}) =>
            {
                expect(staticVars.activity?.save?.dc?.formula).to.equal("")
                expect(staticVars.activity?.save?.dc?.value).to.equal(0)
            }
        },
        {
            name: loopVars => loopVars.name,

            loop: () => trueAppearanceAutoTriggerCases,

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    staticVars.trueAppearanceItem =
                        getTrueAppearanceItem(currentActor)
                    staticVars.trueAppearanceActivity =
                        getTrueAppearanceSaveActivity(
                            staticVars.trueAppearanceItem
                        )

                    if (!staticVars.trueAppearanceActivity) {
                        throw new Error(
                            "True Appearance Midi Save activity not present on actor"
                        )
                    }

                    staticVars.trueAppearanceUseCount = 0

                    Object.defineProperty(
                        staticVars.trueAppearanceActivity,
                        "use",
                        {
                            configurable: true,
                            writable: true,
                            value: async function use()
                            {
                                staticVars.trueAppearanceUseCount += 1
                                return true
                            }
                        }
                    )
                },
                async ({actor, runtime, loopVars}) =>
                {
                    await runtime.services.triggerRuntime.run(
                        loopVars.trigger,
                        resolveCurrentActor(actor)
                    )
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await waiters.waitForCondition(() =>
                    staticVars.trueAppearanceUseCount === 1
                )
            },

            assertions: async ({actor, assert, expect, staticVars}) =>
            {
                expect(staticVars.trueAppearanceUseCount).to.equal(1)
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: true
                })
            }
        },
        {
            name:
                "True Appearance failed Midi Save removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await runtime.services.triggerRuntime.run("savingThrow", currentActor, {
                        saves: {
                            current: {
                                ability: "con",
                                naturalRoll: 5,
                                total: 10,
                                success: false,
                                item: {
                                    sourceUuid: TRUE_APPEARANCE_SAVE_ITEM_UUID
                                }
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance successful Midi Save keeps Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await runtime.services.triggerRuntime.run("savingThrow", currentActor, {
                        saves: {
                            current: {
                                ability: "con",
                                naturalRoll: 17,
                                total: 17,
                                success: true,
                                item: {
                                    sourceUuid: TRUE_APPEARANCE_SAVE_ITEM_UUID
                                }
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: true
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: true
                })
            }
        },
        {
            name:
                "True Appearance sunlight Radiant damage reveals the actor",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await currentActor.setFlag("transformations", "damageTypePerMidiId", {
                        "sunlight-source": "radiant"
                    })

                    await Vampire.onPreCalculateDamage({
                        actor: currentActor,
                        target: currentActor,
                        damage: 7,
                        details: {
                            midi: {
                                sourceActorUuid: "sunlight-source"
                            },
                            item: {
                                name: "Sunlight"
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance ignores non-sunlight Radiant damage",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await currentActor.setFlag("transformations", "damageTypePerMidiId", {
                        "moonbeam-source": "radiant"
                    })

                    await Vampire.onPreCalculateDamage({
                        actor: currentActor,
                        target: currentActor,
                        damage: 7,
                        details: {
                            midi: {
                                sourceActorUuid: "moonbeam-source"
                            },
                            item: {
                                name: "Moonbeam"
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: true
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: true
                })
            }
        },
        {
            name:
                "True Appearance feeding frenzy reveal removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await Vampire.handleFeedingFrenzyReveal(currentActor)
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance hallowed ground reveal removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await Vampire.handleHallowedGroundReveal(currentActor)
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance manual reveal activity removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })
                    const item = getTrueAppearanceItem(currentActor)

                    await Vampire.onActivityUse(
                        {
                            name: "Reveal Yourself",
                            parent: {
                                parent: item
                            }
                        },
                        {
                            workflow: {
                                actor: currentActor,
                                item
                            }
                        },
                        null
                    )
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        }
    ]
}
