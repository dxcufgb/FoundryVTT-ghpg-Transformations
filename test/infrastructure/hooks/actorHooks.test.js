import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerActorHooks } from
    "@src/infrastructure/hooks/actorHooks.js";
  
    const flushPromises = () =>
        new Promise(resolve => setTimeout(resolve, 0));

describe("registerActorHooks", () => {
  let Hooks;
  let transformationService;
  let transformationQueryService;
  let ui;
  let dialogFactory;
  let logger;

  beforeEach(() => {
    // Fake global Hooks
    Hooks = {
      on: vi.fn()
    };
    global.Hooks = Hooks;

    transformationService = {
      onActorFlagsUpdated: vi.fn()
    };

    transformationQueryService = {
      getForActor: vi.fn(),
      getAll: vi.fn()
    };

    ui = {
      viewModels: {
        createTransformationPillViewModel: vi.fn()
      },
      renderers: {
        pillRenderer: {
          render: vi.fn()
        }
      },
      controllers: {
        pillController: {
          bind: vi.fn()
        }
      }
    };

    dialogFactory = {
      openContextMenu: vi.fn()
    };

    logger = {
      debug: vi.fn()
    };

    // Fake minimal DOM
    global.document = {
      createRange: () => ({
        createContextualFragment: html => html
      })
    };

    registerActorHooks({
      transformationService,
      transformationQueryService,
      ui,
      dialogFactory,
      logger
    });
  });

  it("registers all expected hooks", () => {
    const hookNames = Hooks.on.mock.calls.map(c => c[0]);

    expect(hookNames).toContain("renderActorSheetV2");
    expect(hookNames).toContain("updateActor");
    expect(hookNames).toContain("threeDotMenu");
  });

  it("handles renderActorSheetV2 and binds pill UI", async () => {
    const [, renderHook] =
      Hooks.on.mock.calls.find(c => c[0] === "renderActorSheetV2");

    const actor = { id: "a1" };

    const app = {
      actor,
      element: {
        querySelector: vi.fn(() => ({
          parentElement: {
            append: vi.fn(),
            querySelector: vi.fn(() => ({}))
          }
        }))
      }
    };

    transformationQueryService.getForActor.mockResolvedValue("active");
    transformationQueryService.getAll.mockResolvedValue(["t1", "t2"]);

    ui.viewModels.createTransformationPillViewModel
      .mockReturnValue("vm");

    ui.renderers.pillRenderer.render
      .mockResolvedValue("<div></div>");

      renderHook(app, {}, { editable: true });

      await flushPromises();

    expect(transformationQueryService.getForActor)
      .toHaveBeenCalledWith(actor);

    expect(ui.viewModels.createTransformationPillViewModel)
      .toHaveBeenCalled();

    expect(ui.controllers.pillController.bind)
      .toHaveBeenCalled();
  });

  it("calls transformationService on actor flag updates", async () => {
    const [, updateHook] =
      Hooks.on.mock.calls.find(c => c[0] === "updateActor");

    const actor = { id: "a1" };

    await updateHook(
      actor,
      { flags: { dnd5e: { transformations: "x" } } },
      {},
      "user1"
    );

    expect(transformationService.onActorFlagsUpdated)
      .toHaveBeenCalledWith({
        actor,
        diff: { flags: { dnd5e: { transformations: "x" } } },
        userId: "user1"
      });
  });

  it("ignores updateActor when dnd5e flags are not present", async () => {
    const [, updateHook] =
      Hooks.on.mock.calls.find(c => c[0] === "updateActor");

    await updateHook({}, {}, {}, "user");

    expect(transformationService.onActorFlagsUpdated)
      .not.toHaveBeenCalled();
  });

  it("opens context menu on threeDotMenu hook", () => {
    const [, menuHook] =
      Hooks.on.mock.calls.find(c => c[0] === "threeDotMenu");

    const app = {};
    const button = {};

    menuHook({ app, button });

    expect(dialogFactory.openContextMenu)
      .toHaveBeenCalledWith(app, button);
  });
});
