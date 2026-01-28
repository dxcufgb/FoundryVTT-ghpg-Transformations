import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerTransformationConfigAdapter } from
  "@src/ui/adapters/transformationConfigAdapter.js";

describe("registerTransformationConfigAdapter", () => {
  let app;
  let html;
  let dialogFactory;
  let transformations;
  let clickHandler;

  beforeEach(() => {
    clickHandler = null;

    app = {
      actor: { id: "actor-1" },
      isEditable: true,
    };

    html = {
      addEventListener: vi.fn((event, handler) => {
        if (event === "click") {
          clickHandler = handler;
        }
      }),
    };

    dialogFactory = {
      openTransformationConfig: vi.fn(),
    };

    transformations = [{ id: "t1" }];

    registerTransformationConfigAdapter({
      app,
      html,
      dialogFactory,
      transformations,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Registration                                                       */
  /* ------------------------------------------------------------------ */

  it("registers a click event handler", () => {
    expect(html.addEventListener)
      .toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );

    expect(clickHandler).toBeTypeOf("function");
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("does nothing if no button with data-action is found", () => {
    clickHandler({
      target: {
        closest: () => null,
      },
    });

    expect(dialogFactory.openTransformationConfig)
      .not.toHaveBeenCalled();
  });

  it("does nothing if action is not showConfiguration", () => {
    clickHandler({
      target: {
        closest: () => ({
          dataset: {
            action: "explode",
            config: "transformation",
          },
        }),
      },
    });

    expect(dialogFactory.openTransformationConfig)
      .not.toHaveBeenCalled();
  });

  it("does nothing if config is not transformation", () => {
    clickHandler({
      target: {
        closest: () => ({
          dataset: {
            action: "showConfiguration",
            config: "somethingElse",
          },
        }),
      },
    });

    expect(dialogFactory.openTransformationConfig)
      .not.toHaveBeenCalled();
  });

  it("does nothing if app is not editable", () => {
    app.isEditable = false;

    clickHandler({
      target: {
        closest: () => ({
          dataset: {
            action: "showConfiguration",
            config: "transformation",
          },
        }),
      },
    });

    expect(dialogFactory.openTransformationConfig)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Success path                                                       */
  /* ------------------------------------------------------------------ */

  it("opens transformation config dialog when conditions match", () => {
    clickHandler({
      target: {
        closest: () => ({
          dataset: {
            action: "showConfiguration",
            config: "transformation",
          },
        }),
      },
    });

    expect(dialogFactory.openTransformationConfig)
      .toHaveBeenCalledWith({
        actor: app.actor,
        transformations,
        parent: app,
      });
  });
});
