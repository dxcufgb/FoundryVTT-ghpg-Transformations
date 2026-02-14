import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformationPillController } from
  "@src/ui/controllers/transformationPillController.js";

describe("createTransformationPillController", () => {
  let dialogs;
  let logger;
  let controller;

  beforeEach(() => {
    dialogs = {
      openTransformationConfig: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
    };

    controller = createTransformationPillController({
      dialogs,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("does nothing if pillElement is missing", () => {
    expect(() =>
      controller.bind({
        app: {},
        pillElement: null,
        viewModel: {},
      })
    ).not.toThrow();
  });

  /* ------------------------------------------------------------------ */
  /* Add mode                                                           */
  /* ------------------------------------------------------------------ */

  it("opens transformation config when clicked in add mode", () => {
    const clickHandlers = [];

    const pillElement = {
      addEventListener: vi.fn((event, cb) => {
        if (event === "click") {
          clickHandlers.push(cb);
        }
      }),
    };

    const app = {
      actor: { id: "actor-1" },
    };

    const transformations = [{ id: "t1" }];

    controller.bind({
      app,
      pillElement,
      viewModel: { mode: "add" },
      transformations,
    });

    expect(clickHandlers).toHaveLength(1);

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    clickHandlers[0]({
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();

    expect(dialogs.openTransformationConfig)
      .toHaveBeenCalledWith({
        actor: app.actor,
        transformations,
      });
  });

  /* ------------------------------------------------------------------ */
  /* Stage mode                                                         */
  /* ------------------------------------------------------------------ */

  it("advances transformation stage when stage button is clicked", async () => {
    const stageClickHandlers = [];

    const stageButton = {
      addEventListener: vi.fn((event, cb) => {
        if (event === "click") {
          stageClickHandlers.push(cb);
        }
      }),
    };

    const pillElement = {
      querySelector: vi.fn(() => stageButton),
    };

    const actor = {
      id: "actor-1",
      flags: {
        dnd5e: {
          transformationStage: 2,
        },
      },
      update: vi.fn().mockResolvedValue(undefined),
    };

    const app = { actor };

    controller.bind({
      app,
      pillElement,
      viewModel: {
        mode: "stage",
        editable: true,
      },
    });

    expect(stageClickHandlers).toHaveLength(1);

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    await stageClickHandlers[0]({
      preventDefault,
      stopPropagation,
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "Advancing transformation stage",
        actor.id,
        2,
        "→",
        3
      );

    expect(actor.update)
      .toHaveBeenCalledWith({
        "flags.dnd5e.transformationStage": 3,
      });
  });

  /* ------------------------------------------------------------------ */
  /* Stage mode guards                                                  */
  /* ------------------------------------------------------------------ */

  it("does nothing in stage mode when not editable", () => {
    const pillElement = {
      querySelector: vi.fn(),
    };

    controller.bind({
      app: {},
      pillElement,
      viewModel: {
        mode: "stage",
        editable: false,
      },
    });

    expect(pillElement.querySelector)
      .not.toHaveBeenCalled();
  });

  it("does nothing if stage button is missing", () => {
    const pillElement = {
      querySelector: vi.fn(() => null),
    };

    controller.bind({
      app: {},
      pillElement,
      viewModel: {
        mode: "stage",
        editable: true,
      },
    });

    expect(pillElement.querySelector)
      .toHaveBeenCalled();
  });
});
