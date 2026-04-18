export function createGMTransformationHandlers({
  gateway,
  logger
})
{
  logger.debug("createGMTransformationHandlers", { gateway })

  return Object.freeze({
    applyTransformation: payload =>
    {
      const resolvedGateway = resolveGateway(gateway)
      logger.debug("createGMTransformationHandlers.applyTransformation", { payload })
      assertGatewayMethod(resolvedGateway, "applyTransformation")
      return resolvedGateway.applyTransformation(payload)
    },

    initializeTransformation: payload =>
    {
      const resolvedGateway = resolveGateway(gateway)
      logger.debug("createGMTransformationHandlers.initializeTransformation", { payload })
      assertGatewayMethod(resolvedGateway, "initializeTransformation")
      return resolvedGateway.initializeTransformation(payload)
    },

    advanceStage: payload =>
    {
      const resolvedGateway = resolveGateway(gateway)
      logger.debug("createGMTransformationHandlers.advanceStage", { payload })
      assertGatewayMethod(resolvedGateway, "advanceStage")
      return resolvedGateway.advanceStage(payload)
    },

    clearTransformation: payload =>
    {
      const resolvedGateway = resolveGateway(gateway)
      logger.debug("createGMTransformationHandlers.clearTransformation", { payload })
      assertGatewayMethod(resolvedGateway, "clearTransformation")
      return resolvedGateway.clearTransformation(payload)
    },

    applyTriggerActions: payload =>
    {
      const resolvedGateway = resolveGateway(gateway)
      logger.debug("createGMTransformationHandlers.applyTriggerActions", { payload })
      assertGatewayMethod(resolvedGateway, "applyTriggerActions")
      return resolvedGateway.applyTriggerActions(payload)
    }
  })
}

function resolveGateway(gateway)
{
  return typeof gateway === "function"
    ? gateway()
    : gateway
}

function assertGatewayMethod(gateway, methodName)
{
  if (typeof gateway?.[methodName] === "function") return

  throw new Error(
    `GM transformation handler missing gateway method: ${methodName}`
  )
}
