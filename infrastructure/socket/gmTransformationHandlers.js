export function createGMTransformationHandlers({
  gateway,
  logger
}) {
  return Object.freeze({
    applyTransformation: payload =>
      gateway.applyTransformation(payload),

    initializeTransformation: payload =>
      gateway.initializeTransformation(payload),

    advanceStage: payload =>
      gateway.advanceStage(payload),

    clearTransformation: payload =>
      gateway.clearTransformation(payload),

    applyTriggerActions: payload =>
      gateway.applyTriggerActions(payload)
  });
}
