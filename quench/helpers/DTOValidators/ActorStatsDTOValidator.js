import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class ActorStatsDTOValidator extends BaseDTOValidator
{
    static rules = {

        ac: path("actor.system.attributes.ac.value").equals(),
        exhaustion: path("actor.system.attributes.exhaustion").equals(),
        movementBonus: path("actor.system.attributes.movement.bonus").equals(),
        resistances: path("actor.system.traits.dr.value").equalsArray(),
        immunities: path("actor.system.traits.di.value").equalsArray(),
        vulnerabilities: path("actor.system.traits.dv.value").equalsArray(),
        deathSaveDelta: resolve(ctx =>
        {
            const death = ctx.actor.system?.attributes?.death

            if (!death)
                return 0

            return (death.success ?? 0) -
                (death.failure ?? 0)
        }).equals()
    }

    validate(actor, dto)
    {
        if (!actor)
            throw new Error(`[${this.path}] Missing actor`)

        // run rule DSL
        super.validate(this.buildValidationDTO(dto), { actor })

        //     // structured validations
        //     this.validateHp(actor, dto.hp)
        //     this.validateMovementSpeed(actor, dto.movementSpeed)

        return true
    }

    // // ------------------------------------------------
    // // HP
    // // ------------------------------------------------

    // validateHp(actor, hpChecks)
    // {
    //     if (!hpChecks?.length) return

    //     hpChecks.forEach((hpCheck, index) =>
    //     {
    //         const actual =
    //             actor.system?.attributes?.hp?.[hpCheck.variant]

    //         this.assert.equal(
    //             actual,
    //             hpCheck.value,
    //             `[${this.path}.hp[${index}]] Expected ${hpCheck.value} but got ${actual}`
    //         )
    //     })
    // }

    // // ------------------------------------------------
    // // MOVEMENT SPEED
    // // ------------------------------------------------

    // validateMovementSpeed(actor, movementSpeed)
    // {
    //     if (!movementSpeed) return

    //     const actual =
    //         actor.system?.attributes?.movement?.[movementSpeed.type]

    //     this.assert.equal(
    //         actual,
    //         movementSpeed.value,
    //         `[${this.path}.movementSpeed] Expected ${movementSpeed.value} but got ${actual}`
    //     )
    // }
}
