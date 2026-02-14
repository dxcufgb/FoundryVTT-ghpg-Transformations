import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformationConfigController } from
  "@src/ui/controllers/transformationConfigController.js";

describe("createTransformationConfigController", () => {
  let transformationService;
  let transformationQueryService;
  let actorQueryService;
  let logger;
  let controller;

  beforeEach(() => {
    transformationService = {
      clearTransformation: vi.fn().mockResolvedValue(undefined),
      applyTransformation: vi.fn().mockResolvedValue(undefined),
    };

    transformationQueryService = {
      getDefinitionById: vi.fn(),
    };

    actorQueryService = {
      getById: vi.fn(),
    };

    logger = {
      warn: vi.fn(),
    };

    controller = createTransformationConfigController({
      transformationService,
      transformationQueryService,
      actorQueryService,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Actor resolution                                                   */
  /* ------------------------------------------------------------------ */

  it("warns and exits if actor is not found", async () => {
    actorQueryService.getById
      .mockResolvedValue(null);

    await controller.applySelection({
      actorId: "actor-1",
      transformationId: "t1",
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "TransformationConfigController: actor not found",
        "actor-1"
      );

    expect(transformationService.applyTransformation)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Clear transformation                                               */
  /* ------------------------------------------------------------------ */

  it("clears transformation when transformationId is 'None'", async () => {
    const actor = { id: "actor-1" };

    actorQueryService.getById
      .mockResolvedValue(actor);

    await controller.applySelection({
      actorId: actor.id,
      transformationId: "None",
    });

    expect(transformationService.clearTransformation)
      .toHaveBeenCalledWith(actor);

    expect(transformationService.applyTransformation)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Definition resolution                                              */
  /* ------------------------------------------------------------------ */

  it("warns and exits if definition is not found", async () => {
    const actor = { id: "actor-1" };

    actorQueryService.getById
      .mockResolvedValue(actor);

    transformationQueryService.getDefinitionById
      .mockResolvedValue(null);

    await controller.applySelection({
      actorId: actor.id,
      transformationId: "t1",
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "TransformationConfigController: definition not found",
        "t1"
      );

    expect(transformationService.applyTransformation)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Apply transformation                                               */
  /* ------------------------------------------------------------------ */

  it("applies transformation when actor and definition exist", async () => {
    const actor = { id: "actor-1" };
    const definition = { id: "def-1" };

    actorQueryService.getById
      .mockResolvedValue(actor);

    transformationQueryService.getDefinitionById
      .mockResolvedValue(definition);

    await controller.applySelection({
      actorId: actor.id,
      transformationId: "def-1",
    });

    expect(transformationService.applyTransformation)
      .toHaveBeenCalledWith(
        actor,
        { definition }
      );
  });
});
