import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLocalTransformationMutationAdapter } from "@src/infrastructure/mutations/createLocalTransformationMutationAdapter.js";

describe("createLocalTransformationMutationAdapter", () => {
  let actor;
  let actorRepository;
    let getTransformationQueryService;
    let transformationQueryService;
  let itemRepository;
  let creatureTypeService;
  let compendiumRepository;
  let stageGrantResolver;
  let actionExecutor;
  let logger;

  let adapter;

  beforeEach(() => {
    actor = { id: "actor-1" };

    actorRepository = {
      getById: vi.fn().mockReturnValue(actor),
      setTransformation: vi.fn(),
      clearTransformation: vi.fn(),
    };

    transformationQueryService = {
        getForActor: vi.fn(),
    };

    getTransformationQueryService = vi.fn(() => transformationQueryService);

    itemRepository = {
      addTransformationItem: vi.fn(),
      removeTransformationItems: vi.fn(),
    };

    creatureTypeService = {
      applyCreatureSubType: vi.fn(),
      restoreBaseCreatureType: vi.fn(),
    };

    compendiumRepository = {
      getDocumentByUuid: vi.fn(),
    };

    stageGrantResolver = {
      resolve: vi.fn(),
    };

    actionExecutor = {
      execute: vi.fn(),
    };

    logger = {
      warn: vi.fn(),
    };

    adapter = createLocalTransformationMutationAdapter({
      actorRepository,
      getTransformationQueryService,
      itemRepository,
      creatureTypeService,
      compendiumRepository,
      stageGrantResolver,
      actionExecutor,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Factory                                                             */
  /* ------------------------------------------------------------------ */

  it("returns a frozen adapter", () => {
    expect(Object.isFrozen(adapter)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* applyTransformation                                                 */
  /* ------------------------------------------------------------------ */

  it("sets transformation flags for actor", async () => {
    const definition = { id: "def-1" };

    await adapter.applyTransformation({
      actorId: actor.id,
      definition,
      stage: 2,
    });

    expect(actorRepository.setTransformation)
      .toHaveBeenCalledWith(actor, "def-1", 2);
  });

  it("does nothing if actor is missing (applyTransformation)", async () => {
    actorRepository.getById.mockReturnValue(null);

    await adapter.applyTransformation({
      actorId: "missing",
      definition: { id: "def-1" },
    });

    expect(actorRepository.setTransformation).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* initializeTransformation                                            */
  /* ------------------------------------------------------------------ */

  it("initializes transformation at stage 1", async () => {
    const definition = { id: "def-1" };

    stageGrantResolver.resolve.mockReturnValue({ items: [] });

    await adapter.initializeTransformation({
      actorId: actor.id,
      definition,
    });

    expect(stageGrantResolver.resolve)
      .toHaveBeenCalledWith({ definition, stage: 1 });
  });

  /* ------------------------------------------------------------------ */
  /* advanceStage                                                        */
  /* ------------------------------------------------------------------ */

  it("advances transformation stage using definition from query service", async () => {
    const definition = { id: "def-1" };
  
    transformationQueryService.getForActor
      .mockReturnValue({ definition });
  
    stageGrantResolver.resolve.mockReturnValue({ items: [] });
  
    await adapter.advanceStage({
      actorId: actor.id,
      stage: 3,
    });
  
    expect(stageGrantResolver.resolve)
      .toHaveBeenCalledWith({ definition, stage: 3 });
  });

  it("does nothing if definition is missing (advanceStage)", async () => {
    transformationQueryService.getForActor
      .mockReturnValue({});
  
    await adapter.advanceStage({
      actorId: actor.id,
      stage: 2,
    });
  
    expect(stageGrantResolver.resolve).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* clearTransformation                                                 */
  /* ------------------------------------------------------------------ */

  it("clears transformation and restores base creature type", async () => {
    await adapter.clearTransformation({ actorId: actor.id });

    expect(creatureTypeService.restoreBaseCreatureType)
      .toHaveBeenCalledWith(actor);

    expect(itemRepository.removeTransformationItems)
      .toHaveBeenCalledWith(actor);

    expect(actorRepository.clearTransformation)
      .toHaveBeenCalledWith(actor);
  });

  /* ------------------------------------------------------------------ */
  /* applyStage via initialize/advance                                   */
  /* ------------------------------------------------------------------ */

  it("adds transformation items from grants and applies creature subtype", async () => {
    const definition = { id: "def-1" };

    stageGrantResolver.resolve.mockReturnValue({
      items: [
        {
          uuid: "Item.123",
          replacesUuid: null,
          isPrerequisite: false,
        },
      ],
      creatureSubType: "undead",
    });

    compendiumRepository.getDocumentByUuid
      .mockResolvedValue({ id: "item-doc" });

    await adapter.initializeTransformation({
      actorId: actor.id,
      definition,
    });

    expect(itemRepository.addTransformationItem)
      .toHaveBeenCalledWith({
        actor,
        sourceItem: { id: "item-doc" },
        context: { definitionId: "def-1", stage: 1 },
        replacesUuid: null,
        isPrerequisite: false,
      });

    expect(creatureTypeService.applyCreatureSubType)
      .toHaveBeenCalledWith(actor, "undead");
  });

  it("warns and skips missing compendium items", async () => {
    const definition = { id: "def-1" };

    stageGrantResolver.resolve.mockReturnValue({
      items: [{ uuid: "Missing.Item" }],
    });

    compendiumRepository.getDocumentByUuid.mockResolvedValue(null);

    await adapter.initializeTransformation({
      actorId: actor.id,
      definition,
    });

    expect(logger.warn)
      .toHaveBeenCalledWith("Missing item", "Missing.Item");

    expect(itemRepository.addTransformationItem).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* applyTriggerActions                                                 */
  /* ------------------------------------------------------------------ */

  it("delegates trigger actions to actionExecutor", async () => {
    const payload = {
      actorId: actor.id,
      actions: ["doThing"],
      context: {},
      variables: {},
      handlers: {},
    };

    await adapter.applyTriggerActions(payload);

    expect(actionExecutor.execute).toHaveBeenCalledWith(payload);
  });
});
