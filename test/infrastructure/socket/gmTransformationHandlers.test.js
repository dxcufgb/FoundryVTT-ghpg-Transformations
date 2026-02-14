import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGMTransformationHandlers } from
  "@src/infrastructure/socket/gmTransformationHandlers.js";

describe("createGMTransformationHandlers", () => {
  let gateway;
  let logger;
  let handlers;

  beforeEach(() => {
    gateway = {
      applyTransformation: vi.fn(),
      initializeTransformation: vi.fn(),
      advanceStage: vi.fn(),
      clearTransformation: vi.fn(),
      applyTriggerActions: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    handlers = createGMTransformationHandlers({
      gateway,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Factory                                                            */
  /* ------------------------------------------------------------------ */

  it("returns a frozen handlers object", () => {
    expect(Object.isFrozen(handlers)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* Delegation                                                         */
  /* ------------------------------------------------------------------ */

  it("delegates applyTransformation to gateway", () => {
    const payload = { foo: "bar" };

    handlers.applyTransformation(payload);

    expect(gateway.applyTransformation)
      .toHaveBeenCalledWith(payload);
  });

  it("delegates initializeTransformation to gateway", () => {
    const payload = { foo: "bar" };

    handlers.initializeTransformation(payload);

    expect(gateway.initializeTransformation)
      .toHaveBeenCalledWith(payload);
  });

  it("delegates advanceStage to gateway", () => {
    const payload = { stage: 2 };

    handlers.advanceStage(payload);

    expect(gateway.advanceStage)
      .toHaveBeenCalledWith(payload);
  });

  it("delegates clearTransformation to gateway", () => {
    const payload = { actorId: "actor-1" };

    handlers.clearTransformation(payload);

    expect(gateway.clearTransformation)
      .toHaveBeenCalledWith(payload);
  });

  it("delegates applyTriggerActions to gateway", () => {
    const payload = { actions: ["doThing"] };

    handlers.applyTriggerActions(payload);

    expect(gateway.applyTriggerActions)
      .toHaveBeenCalledWith(payload);
  });
});
