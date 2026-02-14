import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformationMutationGateway } from
  "@src/infrastructure/foundry/TransformationMutationGateway.js";

describe("createTransformationMutationGateway", () => {
  let socketGateway;
  let localMutationAdapter;
  let actionExecutor;
  let actionHandlers;
  let logger;
  let gateway;

  beforeEach(() => {
    socketGateway = {
      canMutateLocally: vi.fn(),
      isReady: vi.fn(),
      executeAsGM: vi.fn()
    };

    localMutationAdapter = {
      applyTransformation: vi.fn(),
      initializeTransformation: vi.fn(),
      advanceStage: vi.fn(),
      clearTransformation: vi.fn()
    };

    actionExecutor = {
      execute: vi.fn()
    };

    actionHandlers = { TEST: vi.fn() };

    logger = {
      debug: vi.fn(),
      error: vi.fn()
    };

    gateway = createTransformationMutationGateway({
      socketGateway,
      localMutationAdapter,
      actionExecutor,
      actionHandlers,
      logger
    });
  });

  it("executes local mutation when allowed", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);

    const payload = { a: 1 };
    localMutationAdapter.applyTransformation.mockResolvedValue("ok");

    const result = await gateway.applyTransformation(payload);

    expect(localMutationAdapter.applyTransformation)
      .toHaveBeenCalledWith(payload);
    expect(result).toBe("ok");
  });

  it("throws if local adapter is missing method", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);
    delete localMutationAdapter.advanceStage;

    await expect(
      gateway.advanceStage({ stage: 2 })
    ).rejects.toThrow(
      "Local mutation adapter missing method: advanceStage"
    );
  });

  it("executes trigger actions locally via actionExecutor", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);

    const payload = {
      actorId: "a",
      actions: []
    };

    await gateway.applyTriggerActions(payload);

    expect(actionExecutor.execute).toHaveBeenCalledWith({
      ...payload,
      handlers: actionHandlers
    });
  });

  it("forwards mutation to GM when local mutation is not allowed", async () => {
    socketGateway.canMutateLocally.mockReturnValue(false);
    socketGateway.isReady.mockReturnValue(true);
    socketGateway.executeAsGM.mockResolvedValue("gm-result");

    const payload = { id: "x" };

    const result = await gateway.clearTransformation(payload);

    expect(socketGateway.executeAsGM)
      .toHaveBeenCalledWith("clearTransformation", payload);
    expect(result).toBe("gm-result");
  });

  it("throws if socket gateway is not ready", async () => {
    socketGateway.canMutateLocally.mockReturnValue(false);
    socketGateway.isReady.mockReturnValue(false);

    await expect(
      gateway.initializeTransformation({})
    ).rejects.toThrow(
      "Socket gateway not ready for action: initializeTransformation"
    );
  });
});
