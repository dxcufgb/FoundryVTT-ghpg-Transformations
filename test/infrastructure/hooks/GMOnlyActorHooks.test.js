import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerGMOnlyActorHooks } from "@src/infrastructure/hooks/GMOnlyActorHooks.js";

/* ------------------------------------------------------------------ */
/* Capture Hooks callbacks                                             */
/* ------------------------------------------------------------------ */

const hooks = {};

beforeEach(() => {
  // reset captured hooks
  Object.keys(hooks).forEach(k => delete hooks[k]);

  globalThis.Hooks = {
    on: vi.fn((event, callback) => {
      hooks[event] = callback;
    }),
  };
});

/* ------------------------------------------------------------------ */

describe("registerGMOnlyActorHooks", () => {
  let deps;

  beforeEach(() => {
    deps = {
      game: {},
      ActorClass: class {},
      ui: {},

      actorRepository: {
        resolveActor: vi.fn(),
      },

      triggerRuntime: {
        run: vi.fn(),
      },

      transformationQueryService: {
        getForActor: vi.fn(),
      },

      constants: {
        CONDITION: {
          BLOODIED: "bloodied",
          UNCONSCIOUS: "unconscious",
        },
      },

      registerActorSheetControlsAdapter: vi.fn(),

      logger: {
        debug: vi.fn(),
        error: vi.fn(),
      },
    };

    registerGMOnlyActorHooks(deps);
  });

  /* ------------------------------------------------------------------ */
  /* Adapter registration                                               */
  /* ------------------------------------------------------------------ */

  it("registers the GM-only actor sheet controls adapter", () => {
    expect(deps.registerActorSheetControlsAdapter).toHaveBeenCalledTimes(1);
    expect(deps.registerActorSheetControlsAdapter).toHaveBeenCalledWith({
      game: deps.game,
      ActorClass: deps.ActorClass,
      transformationQueryService: deps.transformationQueryService,
      ui: deps.ui,
      logger: deps.logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* createActiveEffect hook                                            */
  /* ------------------------------------------------------------------ */

  it("runs bloodied trigger on createActiveEffect", async () => {
    const actor = {
      getFlag: vi.fn().mockReturnValue(undefined),
    };

    deps.transformationQueryService.getForActor.mockResolvedValue({});

    await hooks.createActiveEffect(
      { name: "Bloodied", parent: actor },
      { some: "option" },
      "user-id"
    );

    expect(deps.triggerRuntime.run)
      .toHaveBeenCalledWith("bloodied", actor);
  });

  it("skips createActiveEffect when executionContext is macro", async () => {
    const actor = {
      getFlag: vi.fn().mockReturnValue("macro"),
    };

    await hooks.createActiveEffect(
      { name: "Bloodied", parent: actor },
      {},
      "user-id"
    );

    expect(deps.triggerRuntime.run).not.toHaveBeenCalled();
  });

  it("does nothing if no transformation exists (createActiveEffect)", async () => {
    const actor = {
      getFlag: vi.fn().mockReturnValue(undefined),
    };

    deps.transformationQueryService.getForActor.mockResolvedValue(null);

    await hooks.createActiveEffect(
      { name: "Bloodied", parent: actor },
      {},
      "user-id"
    );

    expect(deps.triggerRuntime.run).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* applyActiveEffect hook                                             */
  /* ------------------------------------------------------------------ */

  it("runs bloodied trigger on applyActiveEffect when unconscious", async () => {
    const actor = {
      getFlag: vi.fn().mockReturnValue(undefined),
    };

    deps.actorRepository.resolveActor.mockReturnValue(actor);
    deps.transformationQueryService.getForActor.mockResolvedValue({});

    await hooks.applyActiveEffect({}, {
      effect: { name: "Unconscious" },
    });

    expect(deps.triggerRuntime.run)
      .toHaveBeenCalledWith("bloodied", actor);
  });

  it("skips applyActiveEffect when executionContext is macro", async () => {
    const actor = {
      getFlag: vi.fn().mockReturnValue("macro"),
    };

    deps.actorRepository.resolveActor.mockReturnValue(actor);

    await hooks.applyActiveEffect({}, {
      effect: { name: "Unconscious" },
    });

    expect(deps.triggerRuntime.run).not.toHaveBeenCalled();
  });

  it("logs and skips unknown effects on applyActiveEffect", async () => {
    const actor = {
      getFlag: vi.fn().mockReturnValue(undefined),
    };

    deps.actorRepository.resolveActor.mockReturnValue(actor);
    deps.transformationQueryService.getForActor.mockResolvedValue({});

    await hooks.applyActiveEffect({}, {
      effect: { name: "Some Weird Effect" },
    });

    expect(deps.triggerRuntime.run).not.toHaveBeenCalled();
    expect(deps.logger.debug)
      .toHaveBeenCalledWith("Unhandled effect", "some weird effect");
  });
});
