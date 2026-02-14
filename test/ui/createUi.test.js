import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all imported factories
vi.mock("@src/ui/dialogs/dialogFactory.js", () => ({
  createDialogFactory: vi.fn(),
}));

vi.mock("@src/ui/controllers/transformationConfigController.js", () => ({
  createTransformationConfigController: vi.fn(),
}));

vi.mock("@src/ui/controllers/transformationPillController.js", () => ({
  createTransformationPillController: vi.fn(),
}));

vi.mock("@src/ui/renderers/transformationPillRenderer.js", () => ({
  createTransformationPillRenderer: vi.fn(),
}));

import { createUi } from "@src/ui/createUi.js";
import { createDialogFactory } from
  "@src/ui/dialogs/dialogFactory.js";
import { createTransformationConfigController } from
  "@src/ui/controllers/transformationConfigController.js";
import { createTransformationPillController } from
  "@src/ui/controllers/transformationPillController.js";
import { createTransformationPillRenderer } from
  "@src/ui/renderers/transformationPillRenderer.js";

describe("createUi", () => {
  let services;
  let infrastructure;
  let renderTemplate;
  let logger;

  beforeEach(() => {
    vi.clearAllMocks();

    services = {
      transformationService: {},
      transformationQueryService: {},
      actorQueryService: {},
    };

    infrastructure = {};

    renderTemplate = vi.fn();
    logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };

    createTransformationConfigController.mockReturnValue(
      "configController"
    );

    createDialogFactory.mockReturnValue(
      "dialogs"
    );

    createTransformationPillRenderer.mockReturnValue(
      "pillRenderer"
    );

    createTransformationPillController.mockReturnValue(
      "pillController"
    );
  });

  it("wires UI dependencies and exposes public surface", () => {
    const ui = createUi({
      services,
      infrastructure,
      renderTemplate,
      logger,
    });

    // Controllers
    expect(createTransformationConfigController)
      .toHaveBeenCalledWith({
        transformationService: services.transformationService,
        transformationQueryService:
          services.transformationQueryService,
        actorQueryService: services.actorQueryService,
        logger,
      });

    // Dialog factory
    expect(createDialogFactory)
      .toHaveBeenCalledWith({
        viewModels: {
          createTransformationConfigViewModel:
            expect.any(Function),
        },
        controllers: {
          transformationConfigController: "configController",
        },
        logger,
      });

    // Renderer
    expect(createTransformationPillRenderer)
      .toHaveBeenCalledWith({
        renderTemplate,
        templates: {
          actorTransformationPill:
            "modules/transformations/scripts/templates/components/transformation-pill.hbs",
        },
        logger,
      });

    // Pill controller
    expect(createTransformationPillController)
      .toHaveBeenCalledWith({
        dialogs: "dialogs",
        logger,
      });

    // Public API shape
    expect(ui).toEqual({
      dialogs: "dialogs",
      controllers: {
        pillController: "pillController",
      },
      renderers: {
        pillRenderer: "pillRenderer",
      },
      viewModels: {
        createTransformationPillViewModel:
          expect.any(Function),
      },
      policies: {
        canShowTransformationControls:
          expect.any(Function),
      },
    });
  });

  it("returns a frozen UI object", () => {
    const ui = createUi({
      services,
      infrastructure,
      renderTemplate,
      logger,
    });

    expect(Object.isFrozen(ui)).toBe(true);
  });
});