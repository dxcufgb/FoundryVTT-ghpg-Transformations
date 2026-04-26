export async function triggerFunction(runtime, trigger, actor)
{
    switch (trigger) {
        case ("longRest"):
            await runtime.services.triggerRuntime.run("longRest", actor)
            break
        case ("bloodied"):
            await runtime.services.triggerRuntime.run("bloodied", actor)
            break
        case ("initiative"):
            await runtime.services.triggerRuntime.run("initiative", actor)
            break
        case ("concentration"):
            await runtime.services.triggerRuntime.run("concentration", actor)
            break
        case ("preRollHitDie"):
            await runtime.services.triggerRuntime.run("preRollHitDie", actor)
            break
        case ("preRollSavingThrow"):
            await runtime.services.triggerRuntime.run("preRollSavingThrow", actor)
            break
        case ("preRollDamage"):
            await runtime.services.triggerRuntime.run("preRollDamage", actor)
            break
        case ("rollSavingThrow"):
            await runtime.services.triggerRuntime.run("rollSavingThrow", actor)
            break
        case ("attack"):
            await runtime.services.triggerRuntime.run("attack", actor)
            break
        case ("unconscious"):
            await runtime.services.triggerRuntime.run("unconscious", actor)
            break
        case ("zeroHp"):
            await runtime.services.triggerRuntime.run("zeroHp", actor)
            break
    }
}
