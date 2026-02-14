import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMacroExecutor } from
  "@src/macros/createMacroExecutor.js";

import * as payloadValidator from
  "@src/infrastructure/macros/validateMacroPayload.js";

import * as macroLock from
  "@src/infrastructure/macros/withMacroExecutionLock.js";

describe("createMacroExecutor", () => {
  let actorRepository;
  let tokenRepository;
  let itemRepository;
  let socketGateway;
  let activeEffectRepository;
  let macroRegistry;
  let macroContextFactory;
  let logger;
  let notify;

  let executor;

  beforeEach(() => {
    actorRepository = {
      getByUuid: vi.fn(),
    };

    tokenRepository = {
      getByUuid: vi.fn(),
    };

    itemRepository = {};
    activeEffectRepository = {};

    socketGateway = {
      canMutateLocally: vi.fn(),
      emit: vi.fn(),
    };

    macroRegistry = {
      get: vi.fn(),
    };

    macroContextFactory = {
      createFromToken: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    notify = {
      warn: vi.fn(),
    };

    vi.spyOn(payloadValidator, "validateMacroPayload")
      .mockReturnValue(true);

    vi.spyOn(macroLock, "withMacroExecutionLock")
      .mockImplementation(async (_ctx, fn) => {
        await fn();
      });

    executor = createMacroExecutor({
      actorRepository,
      tokenRepository,
      itemRepository,
      socketGateway,
      activeEffectRepository,
      macroRegistry,
      macroContextFactory,
      logger,
      notify,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Factory                                                            */
  /* ------------------------------------------------------------------ */

  it("returns a frozen executor", () => {
    expect(Object.isFrozen(executor)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* macroWrapper                                                       */
  /* ------------------------------------------------------------------ */

  it("executes macro locally when GM", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);
  
    const payload = {
      args: {
        actorUuid: "actor-uuid",
        tokenUuid: "token-uuid",
      },
      transformationType: "wolf",
      action: "apply",
      trigger: "manual",
    };
  
    // Make executeMacro complete early without side effects
    vi.spyOn(payloadValidator, "validateMacroPayload")
      .mockReturnValue(false);
  
    await executor.macroWrapper(payload);
  
    // GM path: should NOT emit socket event
    expect(socketGateway.emit).not.toHaveBeenCalled();
  
    // And validation was attempted, proving executeMacro ran
    expect(payloadValidator.validateMacroPayload)
      .toHaveBeenCalledWith(payload, { logger });
  });

  it("emits macro execution when not GM", async () => {
    socketGateway.canMutateLocally.mockReturnValue(false);

    const payload = { foo: "bar" };

    await executor.macroWrapper(payload);

    expect(socketGateway.emit)
      .toHaveBeenCalledWith("EXECUTE_MACRO", payload);
  });

  /* ------------------------------------------------------------------ */
  /* executeMacro – happy path                                          */
  /* ------------------------------------------------------------------ */

  it("executes macro handler inside execution lock", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);

    const actor = { id: "actor-1" };
    const token = { id: "token-1" };
    const context = { actorId: "actor-1" };

    actorRepository.getByUuid.mockResolvedValue(actor);
    tokenRepository.getByUuid.mockResolvedValue(token);
    macroContextFactory.createFromToken.mockReturnValue(context);

    const handler = vi.fn().mockResolvedValue(undefined);

    macroRegistry.get.mockReturnValue({
      createHandlers: vi.fn().mockReturnValue({
        apply: handler,
      }),
    });

    const payload = {
      args: {
        actorUuid: "actor-uuid",
        tokenUuid: "token-uuid",
      },
      transformationType: "wolf",
      action: "apply",
      trigger: "manual",
    };

    await executor.executeMacro(payload);

    expect(handler).toHaveBeenCalledWith({
      actor,
      token,
      trigger: "manual",
      context,
    });

    expect(macroLock.withMacroExecutionLock)
      .toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* executeMacro – early exits                                         */
  /* ------------------------------------------------------------------ */

  it("aborts if payload is invalid", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);
    payloadValidator.validateMacroPayload.mockReturnValue(false);

    await executor.executeMacro({});

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Macro execution aborted due to invalid payload"
      );
  });

  it("warns if actor or token is missing", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);
    actorRepository.getByUuid.mockResolvedValue(null);
    tokenRepository.getByUuid.mockResolvedValue(null);

    await executor.executeMacro({
      args: { actorUuid: "a", tokenUuid: "t" },
    });

    expect(logger.warn)
      .toHaveBeenCalled();
  });

  it("notifies on unknown transformation", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);

    actorRepository.getByUuid.mockResolvedValue({});
    tokenRepository.getByUuid.mockResolvedValue({});
    macroRegistry.get.mockReturnValue(null);

    await executor.executeMacro({
      args: { actorUuid: "a", tokenUuid: "t" },
      transformationType: "unknown",
    });

    expect(notify.warn)
      .toHaveBeenCalledWith(
        "Unknown transformation: unknown"
      );
  });

  it("notifies when action is unsupported", async () => {
    socketGateway.canMutateLocally.mockReturnValue(true);

    actorRepository.getByUuid.mockResolvedValue({});
    tokenRepository.getByUuid.mockResolvedValue({});
    macroContextFactory.createFromToken.mockReturnValue({});

    macroRegistry.get.mockReturnValue({
      createHandlers: vi.fn().mockReturnValue({}),
    });

    await executor.executeMacro({
      args: { actorUuid: "a", tokenUuid: "t" },
      transformationType: "wolf",
      action: "missing",
    });

    expect(notify.warn)
      .toHaveBeenCalledWith(
        "Action 'missing' not supported by wolf"
      );
  });
});
