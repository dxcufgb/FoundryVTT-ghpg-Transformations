export function createGMTransformationHandlers({
  gateway,
  logger
})
{
  logger.debug("createGMTransformationHandlers", { gateway })

  return Object.freeze({
    applyTransformation: payload =>
    {
      logger.debug("createGMTransformationHandlers.applyTransformation", { payload })
      return gateway.applyTransformation(payload)
    },

    initializeTransformation: payload =>
    {
      logger.debug("createGMTransformationHandlers.initializeTransformation", { payload })
      return gateway.initializeTransformation(payload)
    },

    advanceStage: payload =>
    {
      logger.debug("createGMTransformationHandlers.advanceStage", { payload })
      return gateway.advanceStage(payload)
    },

    clearTransformation: payload =>
    {
      logger.debug("createGMTransformationHandlers.clearTransformation", { payload })
      return gateway.clearTransformation(payload)
    },

    applyTriggerActions: payload =>
    {
      logger.debug("createGMTransformationHandlers.applyTriggerActions", { payload })
      return gateway.applyTriggerActions(payload)
    }
  })
}
