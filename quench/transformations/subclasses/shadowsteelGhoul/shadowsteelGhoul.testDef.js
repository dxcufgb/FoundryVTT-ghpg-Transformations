import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

const DEBILITATING_MAGIC_NAME = "Debilitating Magic"
const DEBILITATING_MAGIC_UUID =
    "Compendium.transformations.gh-transformations.Item.jAHcNJNgWzYnzltV"
const DEBILITATING_MAGIC_CHOICE_UUIDS = Object.freeze([
    "Compendium.transformations.gh-transformations.Item.isnJl7FKtG06YPAu",
    "Compendium.transformations.gh-transformations.Item.uz5tgoO2cJUssjij",
    "Compendium.transformations.gh-transformations.Item.KjT5KJkSNDcrmQqr",
    "Compendium.transformations.gh-transformations.Item.6W4JqizsNFN16T5X",
    "Compendium.transformations.gh-transformations.Item.jiWt9gfGaLUfY0Fd",
    "Compendium.transformations.gh-transformations.Item.bwyV8maZr7H0NHNi"
])
const DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID =
    DEBILITATING_MAGIC_CHOICE_UUIDS[0]

const SHADOWSTEEL_CURSER_UUID =
    "Compendium.transformations.gh-transformations.Item.RshxXEgOJC48inhb"
const SHADOWSTEEL_ADEPT_UUID =
    "Compendium.transformations.gh-transformations.Item.GwljdRzCeN45tXwU"
const SHADOWSTEEL_WEAPON_UUID =
    "Compendium.transformations.gh-transformations.Item.Wzrt24WLkhcY77sr"
const SHADOWSTEEL_CURSER_ALLOWED_ABILITY_KEYS = Object.freeze([
    "wis",
    "int",
    "cha"
])

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

function buildDebilitatingMagicLoopCases()
{
    return DEBILITATING_MAGIC_CHOICE_UUIDS.map(choiceUuid => ({
        debilitatingMagicChoiceUuid: choiceUuid
    }))
}

async function chooseDebilitatingMagic({
    choiceUuid = DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID
} = {})
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: DEBILITATING_MAGIC_NAME,
            choice: choiceUuid
        }
    ]
}

async function waitForStage1Stability({
    runtime,
    actor,
    waiters
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
}

function resolveShadowsteelCurserAbilityKey(actor)
{
    return SHADOWSTEEL_CURSER_ALLOWED_ABILITY_KEYS.find(abilityKey =>
        Number(actor?.system?.abilities?.[abilityKey]?.value ?? 0) < 20
    ) ?? null
}

async function chooseShadowsteelCurserAbilityIncrease({
    runtime,
    actor,
    waiters,
    staticVars
})
{
    await waiters.waitForCondition(() =>
        getAbilityScoreAdvancementDialogElement() != null
    )

    const dialog = getAbilityScoreAdvancementDialogElement()
    if (!dialog) {
        throw new Error("Shadowsteel Curser ability score dialog did not open")
    }

    const abilityKey = staticVars.curserAbilityKey
    const increaseButton = dialog.querySelector(
        `[data-action='increase'][data-ability-key='${abilityKey}']`
    )

    if (!increaseButton) {
        throw new Error(
            `Shadowsteel Curser increase button not found for ${abilityKey}`
        )
    }

    if (increaseButton.disabled) {
        throw new Error(
            `Shadowsteel Curser increase button was disabled for ${abilityKey}`
        )
    }

    increaseButton.click()
    await waiters.waitForNextFrame()

    const selectedValue = dialog.querySelector(
        `[data-ability-row='${abilityKey}'] [data-selected-value]`
    )

    await waiters.waitForCondition(() =>
        selectedValue?.textContent?.trim() ===
        String(staticVars.curserExpectedAbilityValue)
    )

    const confirmButton = dialog.querySelector("[data-action='confirm']")
    if (!confirmButton) {
        throw new Error("Shadowsteel Curser confirm button not found")
    }

    confirmButton.click()
    await waiters.waitForNextFrame()

    await waiters.waitForCondition(() =>
        getAbilityScoreAdvancementDialogElement() == null
    )
    await waiters.waitForStageFinished(
        runtime,
        actor,
        waiters.waitForCondition,
        1
    )
}

export const shadowsteelGhoulTestDef = {
    id: "shadowsteelGhoul",
    name: "Shadowsteel Ghoul",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: (loopVars) =>
                `stage 1 with Debilitating Magic choice ${loopVars.debilitatingMagicChoiceUuid}`,
            loop: () => buildDebilitatingMagicLoopCases(),
            setup: async ({loopVars}) =>
            {
                await chooseDebilitatingMagic({
                    choiceUuid: loopVars.debilitatingMagicChoiceUuid
                })
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                }
            ],
            finalAwait: waitForStage1Stability,
            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    loopVars.debilitatingMagicChoiceUuid,
                    SHADOWSTEEL_WEAPON_UUID
                ]

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 1 with Shadowsteel Curser",
            setup: async ({actor, staticVars}) =>
            {
                await chooseDebilitatingMagic()
                staticVars.curserAbilityKey =
                    resolveShadowsteelCurserAbilityKey(actor)

                if (!staticVars.curserAbilityKey) {
                    throw new Error(
                        "No valid Shadowsteel Curser ability was available to increase"
                    )
                }

                staticVars.curserExpectedAbilityValue =
                    Number(
                        actor.system?.abilities?.[staticVars.curserAbilityKey]
                            ?.value ?? 0
                    ) + 1
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_CURSER_UUID,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await chooseShadowsteelCurserAbilityIncrease({
                            runtime,
                            actor,
                            waiters,
                            staticVars
                        })
                    }
                }
            ],
            finalAwait: waitForStage1Stability,
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_CURSER_UUID,
                    SHADOWSTEEL_ADEPT_UUID
                ]
                actorDto.abilities[staticVars.curserAbilityKey].value =
                    staticVars.curserExpectedAbilityValue
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_CURSER_UUID]
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 1 with Shadowsteel Weapon",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                }
            ],
            finalAwait: waitForStage1Stability,
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID
                ]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_WEAPON_UUID]
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.addActivity(activity =>
                    {
                        activity.name = "Shadowsteel Weapon Heal on Kill"
                        activity.activationType = "special"
                    })
                })

                validate(actorDto, {assert})
            }
        }
    ]
}
