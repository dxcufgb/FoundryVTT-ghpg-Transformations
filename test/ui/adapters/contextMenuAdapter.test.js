import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerContextMenuAdapter } from
  "@src/ui/adapters/contextMenuAdapter.js";

describe("registerContextMenuAdapter", () => {
  let app;
  let html;
  let services;
  let dialogs;
  let logger;
  let handler;

  beforeEach(() => {
    handler = null;

    app = {
      actor: { id: "actor-1" },
    };

    html = {
      on: vi.fn((event, selector, cb) => {
        if (event === "contextmenu") {
          handler = cb;
        }
      }),
    };

    services = {
      transformationMutation: {
        advanceStage: vi.fn(),
      },
    };

    dialogs = {
      openTransformationConfig: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    registerContextMenuAdapter({
      app,
      html,
      services,
      dialogs,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Registration                                                       */
  /* ------------------------------------------------------------------ */

  it("registers a contextmenu handler", () => {
    expect(html.on)
      .toHaveBeenCalledWith(
        "contextmenu",
        "[data-context-action]",
        expect.any(Function)
      );

    expect(handler).toBeTypeOf("function");
  });

  /* ------------------------------------------------------------------ */
  /* configure-transformation                                           */
  /* ------------------------------------------------------------------ */

  it("opens transformation config dialog", () => {
    handler({
      currentTarget: {
        dataset: {
          contextAction: "configure-transformation",
        },
      },
    });

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "Context menu action:",
        "configure-transformation"
      );

    expect(dialogs.openTransformationConfig)
      .toHaveBeenCalledWith({
        actor: app.actor,
        parent: app,
      });
  });

  /* ------------------------------------------------------------------ */
  /* advance-transformation                                             */
  /* ------------------------------------------------------------------ */

  it("advances transformation stage", () => {
    handler({
      currentTarget: {
        dataset: {
          contextAction: "advance-transformation",
        },
      },
    });

    expect(services.transformationMutation.advanceStage)
      .toHaveBeenCalledWith({
        actorId: app.actor.id,
      });
  });

  /* ------------------------------------------------------------------ */
  /* Unknown action                                                     */
  /* ------------------------------------------------------------------ */

  it("warns on unknown context menu action", () => {
    handler({
      currentTarget: {
        dataset: {
          contextAction: "explode-reality",
        },
      },
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown context menu action:",
        "explode-reality"
      );
  });
});
