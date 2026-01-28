import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock(
  "@src/domain/actions/conditionSchema.js",
  () => ({
    conditionsMet: vi.fn()
  })
);

import { conditionsMet } from
  "@src/domain/actions/conditionSchema.js";

import { createActionExecutor } from
  "@src/infrastructure/actions/createActionExecutor.js";

describe("createActionExecutor", () => {
  let actor;
  let actorRepository;
  let logger;
  let executor;

  beforeEach(() => {
    actor = { id: "actor-1" };

    actorRepository = {
      getById: vi.fn(() => actor)
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn()
    };

    executor = createActionExecutor({
      actorRepository,
      logger
    });

    vi.clearAllMocks();
  });

  it("does nothing if actor is not found", async () => {
    actorRepository.getById.mockReturnValue(null);

    await executor.execute({
      actorId: "missing",
      actions: [{ type: "TEST" }]
    });

    expect(actorRepository.getById).toHaveBeenCalled();
    expect(conditionsMet).not.toHaveBeenCalled();
  });

  it("does nothing if actions is not an array", async () => {
    await executor.execute({
      actorId: actor.id,
      actions: null
    });

    expect(conditionsMet).not.toHaveBeenCalled();
  });

  it("skips action when conditions are not met", async () => {
    conditionsMet.mockReturnValue(false);

    const handler = vi.fn();

    await executor.execute({
      actorId: actor.id,
      actions: [
        { type: "TEST", when: { stage: 2 } }
      ],
      handlers: {
        TEST: handler
      },
      context: {},
      variables: {}
    });

    expect(conditionsMet).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it("warns and skips when handler is missing", async () => {
    conditionsMet.mockReturnValue(true);

    await executor.execute({
      actorId: actor.id,
      actions: [
        { type: "MISSING_HANDLER" }
      ],
      handlers: {},
      context: {},
      variables: {}
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "No handler for action type",
      "MISSING_HANDLER"
    );
  });

  it("executes handler when conditions are met", async () => {
    conditionsMet.mockReturnValue(true);

    const handler = vi.fn();

    const action = {
      type: "TEST",
      when: { stage: 1 }
    };

    const context = { stage: 1 };
    const variables = { x: 2 };

    await executor.execute({
      actorId: actor.id,
      actions: [action],
      handlers: {
        TEST: handler
      },
      context,
      variables
    });

    expect(handler).toHaveBeenCalledWith({
      actor,
      action,
      context,
      variables
    });
  });

  it("processes multiple actions independently", async () => {
    conditionsMet
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const handler = vi.fn();

    await executor.execute({
      actorId: actor.id,
      actions: [
        { type: "TEST" },
        { type: "TEST" }
      ],
      handlers: {
        TEST: handler
      },
      context: {},
      variables: {}
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
