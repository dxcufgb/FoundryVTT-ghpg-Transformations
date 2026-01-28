import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mock resolveValue                                                   */
/* ------------------------------------------------------------------ */

vi.mock("@src/services/actions/utils/resolveValue.js", () => ({
  resolveValue: vi.fn(),
}));

import { resolveValue } from
  "@src/services/actions/utils/resolveValue.js";

import { createSaveAction } from
  "@src/services/actions/handlers/save.js";

describe("createSaveAction", () => {
  let logger;
  let saveAction;

  beforeEach(() => {
    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    saveAction = createSaveAction({ logger });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns and exits if ability or key is missing", async () => {
    await saveAction({
      actor: {},
      action: { data: {} },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "SAVE action missing ability or key",
        expect.any(Object)
      );
  });

  it("warns and exits if resolved DC is not finite", async () => {
    resolveValue.mockReturnValue(NaN);

    await saveAction({
      actor: {},
      action: {
        data: {
          ability: "dex",
          dc: "foo",
          key: "trap",
        },
      },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "SAVE action has invalid DC",
        "foo"
      );
  });

  /* ------------------------------------------------------------------ */
  /* Roll handling                                                      */
  /* ------------------------------------------------------------------ */

  it("does nothing if rollAbilitySave returns null", async () => {
    resolveValue.mockReturnValue(12);

    const actor = {
      rollAbilitySave: vi.fn().mockResolvedValue(null),
    };

    const context = {};

    await saveAction({
      actor,
      action: {
        data: {
          ability: "dex",
          dc: 12,
          key: "trap",
        },
      },
      context,
    });

    expect(context.saves).toBeUndefined();
  });

  /* ------------------------------------------------------------------ */
  /* Success case                                                       */
  /* ------------------------------------------------------------------ */

  it("stores successful save result in context", async () => {
    resolveValue.mockReturnValue(12);

    const actor = {
      id: "actor-1",
      rollAbilitySave: vi.fn().mockResolvedValue({
        total: 15,
      }),
    };

    const context = {};

    await saveAction({
      actor,
      action: {
        data: {
          ability: "dex",
          dc: 12,
          key: "trap",
        },
      },
      context,
    });

    expect(actor.rollAbilitySave)
      .toHaveBeenCalledWith(
        "dex",
        {
          dc: 12,
          chatMessage: true,
          fastForward: false,
        }
      );

    expect(context.saves.trap).toEqual({
      ability: "dex",
      dc: 12,
      total: 15,
      success: true,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Failure case                                                       */
  /* ------------------------------------------------------------------ */

  it("stores failed save result in context", async () => {
    resolveValue.mockReturnValue(12);

    const actor = {
      id: "actor-1",
      rollAbilitySave: vi.fn().mockResolvedValue({
        total: 8,
      }),
    };

    const context = {};

    await saveAction({
      actor,
      action: {
        data: {
          ability: "wis",
          dc: 12,
          key: "fear",
        },
      },
      context,
    });

    expect(context.saves.fear).toEqual({
      ability: "wis",
      dc: 12,
      total: 8,
      success: false,
    });
  });
});
