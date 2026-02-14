import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRollTableAction } from
  "@src/services/actions/handlers/rollTable.js";

describe("createRollTableAction", () => {
  let rollTableService;
  let rollTableEffectResolver;
  let logger;
  let rollTableAction;

  beforeEach(() => {
    rollTableService = {
      roll: vi.fn(),
    };

    rollTableEffectResolver = {
      resolve: vi.fn(),
    };

    logger = {
      warn: vi.fn(),
    };

    rollTableAction = createRollTableAction({
      rollTableService,
      rollTableEffectResolver,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("does nothing if roll returns null", async () => {
    rollTableService.roll.mockResolvedValue(null);

    await rollTableAction({
      actor: {},
      action: { data: { uuid: "table-uuid" } },
      context: {},
    });

    expect(rollTableEffectResolver.resolve)
      .not.toHaveBeenCalled();
  });

  it("does nothing if roll outcome has no effectKey", async () => {
    rollTableService.roll.mockResolvedValue({
      effectKey: null,
    });

    await rollTableAction({
      actor: {},
      action: { data: { uuid: "table-uuid" } },
      context: {},
    });

    expect(rollTableEffectResolver.resolve)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Effect resolution                                                   */
  /* ------------------------------------------------------------------ */

  it("warns and exits if no effect is resolved", async () => {
    const outcome = { effectKey: "SomeEffect" };

    rollTableService.roll.mockResolvedValue(outcome);
    rollTableEffectResolver.resolve.mockReturnValue(null);

    await rollTableAction({
      actor: { id: "actor-1" },
      action: { data: { uuid: "table-uuid" } },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "No roll table effect resolved",
        outcome
      );
  });

  /* ------------------------------------------------------------------ */
  /* Happy path                                                         */
  /* ------------------------------------------------------------------ */

  it("applies resolved roll table effect", async () => {
    const effect = {
      apply: vi.fn().mockResolvedValue(undefined),
    };

    rollTableService.roll.mockResolvedValue({
      effectKey: "Stage1",
    });

    rollTableEffectResolver.resolve
      .mockReturnValue(effect);

    const actor = { id: "actor-1" };
    const context = { stage: 1 };

    await rollTableAction({
      actor,
      action: {
        data: {
          uuid: "table-uuid",
          mode: "normal",
        },
      },
      context,
    });

    expect(rollTableService.roll)
      .toHaveBeenCalledWith({
        uuid: "table-uuid",
        mode: "normal",
        context,
      });

    expect(rollTableEffectResolver.resolve)
      .toHaveBeenCalledWith({
        actor,
        effectKey: "Stage1",
      });

    expect(effect.apply)
      .toHaveBeenCalled();
  });
});
