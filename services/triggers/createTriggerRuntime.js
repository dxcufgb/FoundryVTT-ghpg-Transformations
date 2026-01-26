export function createTriggerRuntime({ transformationService }) {
    async function run(triggerName, actor) {
        if (!actor) return;
        return transformationService.onTrigger(actor, triggerName);
    }

    return Object.freeze({ run });
}