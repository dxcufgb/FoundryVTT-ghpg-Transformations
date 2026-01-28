import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTriggerRuntime } from
  "@src/services/triggers/createTriggerRuntime.js";

describe("createTriggerRuntime", () => {
  let transformationService;
  let logger;
  let runtime;

  beforeEach(() => {
    transformationService = {
      onTrigger: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
    };

    runtime = createTriggerRuntime({
      transformationService,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* run                                                                */
  /* ------------------------------------------------------------------ */

  it("logs and does nothing if actor is missing", async () => {
    const result = await runtime.run("longRest", null);

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "TriggerRuntime.run called",
        "longRest",
        null
      );

    expect(transformationService.onTrigger)
      .not.toHaveBeenCalled();

    expect(result).toBeUndefined();
  });

  it("delegates trigger execution to transformationService", async () => {
    const actor = { id: "actor-1" };
    transformationService.onTrigger
      .mockResolvedValue("done");

    const result = await runtime.run("longRest", actor);

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "TriggerRuntime.run called",
        "longRest",
        actor
      );

    expect(transformationService.onTrigger)
      .toHaveBeenCalledWith(actor, "longRest");

    expect(result).toBe("done");
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen runtime", () => {
    expect(Object.isFrozen(runtime)).toBe(true);
  });
});
