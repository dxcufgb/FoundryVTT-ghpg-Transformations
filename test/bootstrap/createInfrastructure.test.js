import { describe, it, expect, vi, beforeEach } from "vitest";

describe("createInfrastructure", () => {
  beforeEach(() => {
    vi.resetModules();

    global.fromUuid = vi.fn();
    global.game = { user: { isGM: true } };
    global.Registry = {
      services: {
        getTransformationQueryService: {}
      }
    };
  });

  it("wires all infrastructure services and freezes the result", async () => {
    const mockActorRepo = { __type: "actorRepo" };

    // 🔴 CRITICAL: doMock BEFORE import
    vi.doMock("@src/infrastructure/foundry/actorRepository.js", () => ({
      createActorRepository: vi.fn(() => mockActorRepo)
    }));

    // you may stub the rest minimally or let them be real if harmless
    vi.doMock("@src/infrastructure/foundry/tokenRepository.js", () => ({
      createTokenRepository: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/itemRepository.js", () => ({
      createItemRepository: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/activeEffectsRepository.js", () => ({
      createActiveEffectRepository: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/compendiumRepository.js", () => ({
      createCompendiumRepository: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/rolltables/createRollTableService.js", () => ({
      createRollTableService: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/socket/createSocketGateway.js", () => ({
      createSocketGateway: vi.fn(() => ({}))
    }));

    vi.doMock("@src/macros/macroRegistry.js", () => ({
      createMacroRegistry: vi.fn(() => ({}))
    }));

    vi.doMock("@src/macros/createDirectMacroInvoker.js", () => ({
      createDirectMacroInvoker: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/actions/createActionExecutor.js", () => ({
      createActionExecutor: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/mutations/createLocalTransformationMutationAdapter.js", () => ({
      createLocalTransformationMutationAdapter: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/createChatService.js", () => ({
      createChatService: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/creatureSubTypeService.js", () => ({
      createCreatureTypeService: vi.fn(() => ({}))
    }));

    vi.doMock("@src/infrastructure/foundry/createEffectService.js", () => ({
      createEffectService: vi.fn(() => ({}))
    }));

    vi.doMock("@src/domain/transformation/createStageGrantResolver.js", () => ({
      createStageGrantResolver: vi.fn(() => ({}))
    }));

    // 🔴 IMPORT AFTER doMock
    const { createInfrastructure } = await import(
      "@src/bootstrap/createInfrastructure.js"
    );

    const infrastructure = createInfrastructure({
      getGame: () => ({}),
      logger: {},
      dependencies: { utils: {}, constants: {} }
    });

    expect(infrastructure.actorRepository).toBe(mockActorRepo);
    expect(Object.isFrozen(infrastructure)).toBe(true);
  });
});
