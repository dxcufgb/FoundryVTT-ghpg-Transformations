import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformationService } from
    "@src/services/transformations/createTransformationServices.js";

describe("createTransformationService", () => {
  let mutationGateway;
  let transformationQueryService;
  let variableResolver;
  let logger;
  let service;

  beforeEach(() => {
    mutationGateway = {
      applyTransformation: vi.fn(),
      clearTransformation: vi.fn(),
      initializeTransformation: vi.fn(),
      advanceStage: vi.fn(),
      applyTriggerActions: vi.fn(),
    };

    transformationQueryService = {
      getForActor: vi.fn(),
      getDefinitionById: vi.fn(),
    };

    variableResolver = {
      resolve: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    service = createTransformationService({
      mutationGateway,
      transformationQueryService,
      variableResolver,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* applyTransformation                                                */
  /* ------------------------------------------------------------------ */

  it("applies a transformation for an actor", async () => {
    const actor = { id: "actor-1" };
    const transformation = {
      definition: { id: "def-1" },
    };

    await service.applyTransformation(actor, transformation);

    expect(mutationGateway.applyTransformation)
      .toHaveBeenCalledWith({
        actorId: "actor-1",
        definition: transformation.definition,
        stage: 1,
      });
  });

  it("throws if actor is missing when applying transformation", async () => {
    await expect(
      service.applyTransformation(null, {})
    ).rejects.toThrow(
      "TransformationService requires actor"
    );
  });

  it("throws if transformation is invalid", async () => {
    await expect(
      service.applyTransformation({ id: "actor-1" }, null)
    ).rejects.toThrow(
      "TransformationService requires a valid transformation"
    );
  });

  /* ------------------------------------------------------------------ */
  /* clearTransformation                                                */
  /* ------------------------------------------------------------------ */

  it("clears transformation for actor", async () => {
    const actor = { id: "actor-1" };

    await service.clearTransformation(actor);

    expect(mutationGateway.clearTransformation)
      .toHaveBeenCalledWith({
        actorId: "actor-1",
      });
  });

  it("throws if actor is missing when clearing transformation", async () => {
    await expect(
      service.clearTransformation(null)
    ).rejects.toThrow(
      "TransformationService requires actor"
    );
  });

  /* ------------------------------------------------------------------ */
  /* onActorFlagsUpdated                                                */
  /* ------------------------------------------------------------------ */

  it("initializes transformation when transformation flag changes", async () => {
    const actor = {
      id: "actor-1",
      flags: {
        dnd5e: {
          transformations: "item-1",
        },
      },
    };

    transformationQueryService.getDefinitionById
      .mockResolvedValue({ id: "def-1" });

    await service.onActorFlagsUpdated({
      actor,
      diff: {
        flags: {
          dnd5e: {
            transformations: "item-1",
          },
        },
      },
    });

    expect(mutationGateway.initializeTransformation)
      .toHaveBeenCalledWith({
        actorId: "actor-1",
        definition: { id: "def-1" },
      });
  });

  it("advances stage when transformationStage flag changes", async () => {
    const actor = {
      id: "actor-1",
      flags: {
        dnd5e: {
          transformationStage: 2,
        },
      },
    };

    await service.onActorFlagsUpdated({
      actor,
      diff: {
        flags: {
          dnd5e: {
            transformationStage: 2,
          },
        },
      },
    });

    expect(mutationGateway.advanceStage)
      .toHaveBeenCalledWith({
        actorId: "actor-1",
        stage: 2,
      });
  });

  it("does nothing if diff has no dnd5e flags", async () => {
    await service.onActorFlagsUpdated({
      actor: {},
      diff: {},
    });

    expect(mutationGateway.initializeTransformation)
      .not.toHaveBeenCalled();

    expect(mutationGateway.advanceStage)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* onTrigger                                                          */
  /* ------------------------------------------------------------------ */

  it("executes trigger actions when present", async () => {
    const actor = { id: "actor-1" };

    const transformation = {
      stage: 2,
      getTriggerActions: vi.fn().mockReturnValue([
        { type: "HP" },
      ]),
      getTriggerVariables: vi.fn().mockReturnValue({
        foo: "bar",
      }),
    };

    transformationQueryService.getForActor
      .mockResolvedValue(transformation);

    variableResolver.resolve
      .mockReturnValue({ resolved: true });

    await service.onTrigger(actor, "longRest");

    expect(mutationGateway.applyTriggerActions)
      .toHaveBeenCalledWith({
        actorId: "actor-1",
        actions: [{ type: "HP" }],
        context: {
          trigger: "longRest",
          stage: 2,
        },
        variables: { resolved: true },
      });
  });

  it("does nothing if no transformation is active", async () => {
    transformationQueryService.getForActor
      .mockResolvedValue(null);

    await service.onTrigger({ id: "actor-1" }, "longRest");

    expect(mutationGateway.applyTriggerActions)
      .not.toHaveBeenCalled();
  });

  it("does nothing if trigger has no actions", async () => {
    transformationQueryService.getForActor
      .mockResolvedValue({
        getTriggerActions: () => [],
      });

    await service.onTrigger({ id: "actor-1" }, "longRest");

    expect(mutationGateway.applyTriggerActions)
      .not.toHaveBeenCalled();
  });

  it("throws if actor is missing in onTrigger", async () => {
    await expect(
      service.onTrigger(null, "longRest")
    ).rejects.toThrow(
      "TransformationService requires actor"
    );
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen service", () => {
    expect(Object.isFrozen(service)).toBe(true);
  });
});
