import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerActorSheetControlsAdapter } from
  "@src/ui/adapters/actorSheetControlsAdapter.js";

describe("registerActorSheetControlsAdapter", () => {
  let game;
  let ActorClass;
  let transformationQueryService;
  let ui;
  let logger;
  let hookCallback;

  beforeEach(() => {
    hookCallback = null;

    global.Hooks = {
      on: vi.fn((event, cb) => {
        if (event === "getHeaderControlsApplicationV2") {
          hookCallback = cb;
        }
      }),
    };

    game = {};
    ActorClass = function Actor() {};

    transformationQueryService = {
      getAll: vi.fn().mockResolvedValue([{ id: "t1" }]),
    };

    ui = {
      policies: {
        canShowTransformationControls: vi.fn(),
      },
      dialogs: {
        openTransformationConfig: vi.fn().mockResolvedValue(undefined),
      },
    };

    logger = {
      debug: vi.fn(),
      error: vi.fn(),
    };
  });

  /* ------------------------------------------------------------------ */
  /* Registration                                                       */
  /* ------------------------------------------------------------------ */

  it("registers the header controls hook", () => {
    registerActorSheetControlsAdapter({
      game,
      ActorClass,
      transformationQueryService,
      ui,
      logger,
    });

    expect(Hooks.on)
      .toHaveBeenCalledWith(
        "getHeaderControlsApplicationV2",
        expect.any(Function)
      );

    expect(hookCallback).toBeTypeOf("function");
  });

  /* ------------------------------------------------------------------ */
  /* Policy gating                                                      */
  /* ------------------------------------------------------------------ */

  it("does nothing if policy blocks transformation controls", () => {
    ui.policies.canShowTransformationControls
      .mockReturnValue(false);

    registerActorSheetControlsAdapter({
      game,
      ActorClass,
      transformationQueryService,
      ui,
      logger,
    });

    const controls = [];
    const app = { actor: { id: "a1" } };

    hookCallback(app, controls);

    expect(controls).toHaveLength(0);
  });

  /* ------------------------------------------------------------------ */
  /* Control injection                                                  */
  /* ------------------------------------------------------------------ */

  it("adds transformation control when policy allows", () => {
    ui.policies.canShowTransformationControls
      .mockReturnValue(true);

    registerActorSheetControlsAdapter({
      game,
      ActorClass,
      transformationQueryService,
      ui,
      logger,
    });

    const controls = [];
    const app = { actor: { id: "a1" } };

    hookCallback(app, controls);

    expect(controls).toHaveLength(1);

    const control = controls[0];

    expect(control).toMatchObject({
      name: "Change Transformation",
      label: "Change Transformation",
      icon: "fas fa-dna",
      onClick: expect.any(Function),
    });
  });

  /* ------------------------------------------------------------------ */
  /* Click behavior                                                     */
  /* ------------------------------------------------------------------ */

  it("loads transformations and opens config dialog on click", async () => {
    ui.policies.canShowTransformationControls
      .mockReturnValue(true);

    registerActorSheetControlsAdapter({
      game,
      ActorClass,
      transformationQueryService,
      ui,
      logger,
    });

    const controls = [];
    const app = { actor: { id: "actor-1" } };

    hookCallback(app, controls);

    await controls[0].onClick();

    expect(transformationQueryService.getAll)
      .toHaveBeenCalled();

    expect(ui.dialogs.openTransformationConfig)
      .toHaveBeenCalledWith({
        actor: app.actor,
        transformations: [{ id: "t1" }],
      });
  });

  it("logs error if dialog opening fails", async () => {
    ui.policies.canShowTransformationControls
      .mockReturnValue(true);

    const error = new Error("boom");

    ui.dialogs.openTransformationConfig
      .mockRejectedValue(error);

    registerActorSheetControlsAdapter({
      game,
      ActorClass,
      transformationQueryService,
      ui,
      logger,
    });

    const controls = [];
    const app = { actor: { id: "actor-1" } };

    hookCallback(app, controls);

    await controls[0].onClick();

    expect(logger.error)
      .toHaveBeenCalledWith(
        "Failed to open TransformationConfig",
        error
      );
  });
});
