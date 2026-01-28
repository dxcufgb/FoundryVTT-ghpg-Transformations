import { describe, it, expect, vi, beforeEach } from "vitest";
import { withMacroExecutionLock } from "@src/infrastructure/macros/withMacroExecutionLock.js";

describe("withMacroExecutionLock", () => {
  let actor;
  let logger;
  let actorRepository;
  let execute;

  const baseArgs = {
    transformationType: "polymorph",
    action: "apply",
    trigger: "manual",
  };

  beforeEach(() => {
    actor = { id: "actor-1" };

    logger = {
      debug: vi.fn(),
      error: vi.fn(),
    };

    actorRepository = {
      hasMacroExecution: vi.fn(),
      setMacroExecution: vi.fn().mockResolvedValue(undefined),
      clearMacroExecution: vi.fn().mockResolvedValue(undefined),
    };

    execute = vi.fn().mockResolvedValue(undefined);
  });

  /* ------------------------------------------------------------------ */
  /* Argument validation                                                 */
  /* ------------------------------------------------------------------ */

  it("throws if actor is missing", async () => {
    await expect(
      withMacroExecutionLock(
        {
          ...baseArgs,
          actor: null,
          logger,
        },
        execute,
        { actorRepository }
      )
    ).rejects.toThrow("withMacroExecutionLock requires actor");
  });

  /* ------------------------------------------------------------------ */
  /* Lock already present                                                */
  /* ------------------------------------------------------------------ */

  it("suppresses execution when macro is already locked", async () => {
    actorRepository.hasMacroExecution.mockReturnValue(true);

    await withMacroExecutionLock(
      {
        ...baseArgs,
        actor,
        logger,
      },
      execute,
      { actorRepository }
    );

    expect(execute).not.toHaveBeenCalled();
    expect(actorRepository.setMacroExecution).not.toHaveBeenCalled();
    expect(actorRepository.clearMacroExecution).not.toHaveBeenCalled();

    expect(logger.debug).toHaveBeenCalledWith(
      "Macro execution suppressed (already running)",
      actor.id,
      "macro:polymorph:apply:manual"
    );
  });

  /* ------------------------------------------------------------------ */
  /* Successful execution                                                */
  /* ------------------------------------------------------------------ */

  it("sets and clears the macro execution lock around execution", async () => {
    actorRepository.hasMacroExecution.mockReturnValue(false);

    await withMacroExecutionLock(
      {
        ...baseArgs,
        actor,
        logger,
      },
      execute,
      { actorRepository }
    );

    const flagKey = "macro:polymorph:apply:manual";

    expect(actorRepository.setMacroExecution)
      .toHaveBeenCalledWith(actor, flagKey);

    expect(execute).toHaveBeenCalled();

    expect(actorRepository.clearMacroExecution)
      .toHaveBeenCalledWith(actor, flagKey);

    expect(logger.debug).toHaveBeenCalledWith(
      "Macro execution released",
      actor.id,
      flagKey
    );
  });

  /* ------------------------------------------------------------------ */
  /* Failure during execution                                            */
  /* ------------------------------------------------------------------ */

  it("logs, clears lock, and rethrows when execute throws", async () => {
    actorRepository.hasMacroExecution.mockReturnValue(false);

    const error = new Error("boom");
    execute.mockRejectedValue(error);

    await expect(
      withMacroExecutionLock(
        {
          ...baseArgs,
          actor,
          logger,
        },
        execute,
        { actorRepository }
      )
    ).rejects.toThrow("boom");

    const flagKey = "macro:polymorph:apply:manual";

    expect(actorRepository.setMacroExecution)
      .toHaveBeenCalledWith(actor, flagKey);

    expect(actorRepository.clearMacroExecution)
      .toHaveBeenCalledWith(actor, flagKey);

    expect(logger.error).toHaveBeenCalledWith(
      "Macro execution failed",
      actor.id,
      flagKey,
      error
    );
  });
});
