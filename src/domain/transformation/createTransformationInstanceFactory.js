import { Transformation } from "./Transformation.js"

export function createTransformationInstanceFactory()
{

    function create({
        actor,
        definition,
        stage = 0,
        TransformationClass
    })
    {
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
            stage
        })
    }

    return Object.freeze({
        create
    })
}
