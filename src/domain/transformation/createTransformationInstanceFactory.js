import { Transformation } from "./Transformation.js"

export function createTransformationInstanceFactory({
    logger
})
{
    logger.debug("createTransformationInstanceFactory", {})

    function create({
        actor,
        definition,
        stage = 0,
        TransformationClass
    })
    {
        logger.debug("createTransformationInstanceFactory.create", {
            actor,
            definition,
            stage,
            TransformationClass
        })
        if (!actor) {
            throw new Error(
                "TransformationInstanceFactory.create requires actor"
            )
        }

        const actorId = actor.id ?? actor.getFlag("transformations", "fallbackActorId")

        if (!actorId) {
            throw new Error(
                "TransformationInstanceFactory.create requires actor to have an id"
            )
        }

        if (!definition) {
            throw new Error(
                "TransformationInstanceFactory.create requires definition"
            )
        }

        const transformation = TransformationClass ?? Transformation

        return new transformation({
            actorId: actorId,
            definition,
            stage,
            logger
        })
    }

    return Object.freeze({
        create
    })
}
