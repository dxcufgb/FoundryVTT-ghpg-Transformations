import {
    hasCompleteTransformationStageChoiceSelection,
    normalizeTransformationStageChoiceCount,
    normalizeTransformationStageChoiceSelection,
    serializeTransformationStageChoiceSelection
} from "../../utils/transformationStageChoiceSelection.js"

export function createStageChoiceResolver({
    tracker,
    compendiumRepository,
    requiresService,
    logger
})
{
    logger.debug("createStageChoiceResolver", {
        tracker,
        compendiumRepository,
        requiresService
    })

    async function resolve({
        actor,
        definition,
        stage,
        requestChoice
    })
    {
        logger.debug("createStageChoiceResolver.resolve", {
            actor,
            definition,
            stage,
            requestChoice
        })

        const stageDef = definition.stages[stage]
        if (!stageDef?.choices?.items?.length) return null
        const choiceCount = normalizeTransformationStageChoiceCount(
            stageDef?.choices?.count
        )

        return tracker.track((async () =>
        {
            const existing = actor.getFlag(
                "transformations",
                "stageChoices"
            )?.[definition.id]?.[stage]

            const existingSelections =
                      normalizeTransformationStageChoiceSelection(
                          existing,
                          choiceCount
                      )

            if (
                hasCompleteTransformationStageChoiceSelection(
                    existing,
                    choiceCount
                ) &&
                existingSelections.every(choiceUuid =>
                    isChoiceRuntimeValid({
                        actor,
                        stageDef,
                        choiceUuid
                    })
                )
            ) {
                return serializeTransformationStageChoiceSelection(
                    existingSelections,
                    choiceCount
                )
            }

            const candidates = await buildChoiceList({
                actor,
                stageDef
            })

            if (!candidates.length) return null

            const validChoices = candidates.filter(choice =>
                isChoiceRuntimeValid({
                    actor,
                    stageDef,
                    choiceUuid: choice.uuid
                })
            )

            if (!validChoices.length) return null

            if (validChoices.length <= choiceCount) {
                if (typeof requestChoice === "function") {
                    return requestChoice({
                        actor,
                        stage,
                        choices: validChoices,
                        choiceCount,
                        autoSelect: true
                    })
                }

                return serializeTransformationStageChoiceSelection(
                    validChoices.map(choice => choice.uuid),
                    choiceCount
                )
            }

            return requestChoice({
                actor,
                stage,
                choices: validChoices,
                choiceCount
            })

        })())
    }

    async function buildChoiceList({ actor, stageDef })
    {
        logger.debug("createStageChoiceResolver.buildChoiceList", { actor, stageDef })
        return tracker.track((async () =>
        {

            const results = []
            const itemDefs = stageDef?.choices?.items ?? []

            for (const def of itemDefs) {

                const item = await compendiumRepository.getDocumentByUuid(def.uuid)

                if (!item) {
                    logger.warn("Choice item not found", def.uuid)
                    continue
                }

                results.push({
                    id: def.uuid,
                    uuid: def.uuid,
                    name: item.name,
                    img: item.img,
                    description: item.system?.description?.value ?? "",
                    sourceItem: item
                })
            }

            return results

        })())
    }

    function isChoiceRuntimeValid({
        actor,
        stageDef,
        choiceUuid
    })
    {
        logger.debug("createStageChoiceResolver.isChoiceRuntimeValid", {
            actor,
            stageDef,
            choiceUuid
        })
        const choiceDef = stageDef?.choices?.items
            ?.find(c => c.uuid === choiceUuid)

        if (!choiceDef) return false

        // --- requires.items ---------------------------------------------

        if (choiceDef.requires?.items?.length) {
            const hasAll = requiresService.actorHasItems({
                actor,
                items: choiceDef.requires.items
            })
            if (!hasAll) return false
        }

        // --- requires.actor ---------------------------------------------

        if (choiceDef.requires?.actor) {
            const hasRequirement = requiresService.actorHasRequirement({
                actor,
                choiceDef
            })
            if (!hasRequirement) return false
        }

        return true
    }

    return Object.freeze({
        resolve,
        whenIdle: tracker.whenIdle
    })
}
