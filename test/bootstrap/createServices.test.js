import { describe, it, expect, vi, beforeEach } from "vitest";

describe("createServices", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("wires all services and freezes the result", async () => {
    // ─────────────────────────────────────────────────────────────
    // Sentinels (unique identities)
    // ─────────────────────────────────────────────────────────────
    const transformationRegistry = { __type: "registry" };
    const transformationQueryService = { __type: "queryService" };
    const transformationService = { __type: "service" };
    const rollTableEffectCatalog = { __type: "catalog" };
    const rollTableEffectResolver = { __type: "resolver" };
    const triggerRuntime = { __type: "runtime" };
    const actorQueryService = { __type: "actorQuery" };
    const transformationMutationGateway = { __type: "mutationGateway" };

    // ─────────────────────────────────────────────────────────────
    // Mocks (CRITICAL: doMock BEFORE import)
    // ─────────────────────────────────────────────────────────────
    vi.doMock("@src/services/transformations/createTransformationRegistry.js", () => ({
      createTransformationRegistry: vi.fn(() => transformationRegistry)
    }));

    const registerTransformations = vi.fn();
    vi.doMock("@src/domain/transformation/manifest.js", () => ({
      registerTransformations
    }));

    vi.doMock("@src/services/rollTables/createRollTableEffectCatalog.js", () => ({
      createRollTableEffectCatalog: vi.fn(() => rollTableEffectCatalog)
    }));

    vi.doMock("@src/services/rollTables/createRollTableEffectResolver.js", () => ({
      createRollTableEffectResolver: vi.fn(() => rollTableEffectResolver)
    }));

    vi.doMock("@src/domain/transformation/createTransformationInstanceFactory.js", () => ({
      createTransformationInstanceFactory: vi.fn(() => ({}))
    }));

    vi.doMock("@src/domain/transformation/createTransformationDefinitionFactory.js", () => ({
      createTransformationDefinitionFactory: vi.fn(() => ({}))
    }));

    vi.doMock("@src/services/transformations/createTransformationQueryService.js", () => ({
      createTransformationQueryService: vi.fn(() => transformationQueryService)
    }));

    vi.doMock("@src/services/actor/createActorQueryService.js", () => ({
      createActorQueryService: vi.fn(() => actorQueryService)
    }));

    vi.doMock("@src/services/actions/handlers/index.js", () => ({
      createActionHandlers: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/TransformationMutationGateway.js", () => ({
      createTransformationMutationGateway: vi.fn(() => transformationMutationGateway)
    }));

    vi.doMock("@src/services/formulas/createFormulaEvaluator.js", () => ({
      createFormulaEvaluator: vi.fn(() => ({}))
    }));

    vi.doMock("@src/services/triggers/createTriggerVariableResolver.js", () => ({
      createTriggerVariableResolver: vi.fn(() => ({}))
    }));

    vi.doMock("@src/services/transformations/createTransformationServices.js", () => ({
      createTransformationService: vi.fn(() => transformationService)
    }));

    vi.doMock("@src/services/triggers/createTriggerRuntime.js", () => ({
      createTriggerRuntime: vi.fn(() => triggerRuntime)
    }));

    // ─────────────────────────────────────────────────────────────
    // Import AFTER mocks
    // ─────────────────────────────────────────────────────────────
    const { createServices } = await import(
      "@src/bootstrap/createServices.js"
    );

    // ─────────────────────────────────────────────────────────────
    // Call
    // ─────────────────────────────────────────────────────────────
    const services = createServices({
      dependencies: {
        utils: {
          effectChangeBuilder: {},
          stringUtils: {}
        },
        constants: {
          MODULE_FOLDER: "test"
        },
        logger: {}
      },
      infrastructure: {
        actorRepository: {},
        chatService: {},
        directMacroInvoker: {},
        activeEffectRepository: {},
        rollTableService: {},
        itemRepository: {},
        compendiumRepository: {},
        actionExecutor: {},
        socketGateway: {},
        localMutationAdapter: {}
      }
    });

    // ─────────────────────────────────────────────────────────────
    // Assertions
    // ─────────────────────────────────────────────────────────────
    expect(registerTransformations).toHaveBeenCalledWith(transformationRegistry);

    expect(services.transformationRegistry).toBe(transformationRegistry);
    expect(services.transformationQueryService).toBe(transformationQueryService);
    expect(services.transformationService).toBe(transformationService);
    expect(services.rollTableEffectCatalog).toBe(rollTableEffectCatalog);
    expect(services.rollTableEffectResolver).toBe(rollTableEffectResolver);
    expect(services.triggerRuntime).toBe(triggerRuntime);
    expect(services.actorQueryService).toBe(actorQueryService);
    expect(services.transformationMutationGateway).toBe(transformationMutationGateway);

    expect(Object.isFrozen(services)).toBe(true);
  });
});
