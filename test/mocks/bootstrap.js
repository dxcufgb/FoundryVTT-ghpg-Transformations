// test/mocks/bootstrap.js
import { vi } from "vitest";

export const mockLogger = {
  log: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  setLogLevel: vi.fn()
};

export const mockInfrastructure = {
  macroRegistry: {},
  activeEffectRepository: {},
  itemRepository: {},
  actorRepository: {
    clearAllMacroExecutionsForActor: vi.fn()
  },
  socketGateway: {
    setSocket: vi.fn()
  }
};

export const mockServices = {
  transformationService: {},
  transformationQueryService: {},
  transformationRegistry: {
    getAllEntries: () => []
  },
  triggerRuntime: {}
};

vi.mock("@src/infrastructure/logging/logger.js", () => ({
  createLogger: () => mockLogger
}));

vi.mock("@src/bootstrap/createDependencies.js", () => ({
  createDependencies: () => ({})
}));

vi.mock("@src/bootstrap/createInfrastructure.js", () => ({
  createInfrastructure: () => mockInfrastructure
}));

vi.mock("@src/bootstrap/createServices.js", () => ({
  createServices: () => mockServices
}));

vi.mock("@src/ui/createUi.js", () => ({
  createUi: vi.fn(() => ({}))
}));

vi.mock("@src/infrastructure/templates/preloadTemplates.js", () => ({
  preloadTemplates: vi.fn()
}));

vi.mock("@src/infrastructure/hooks/dnd5eHooks.js", () => ({
  registerDnd5eHooks: vi.fn()
}));

vi.mock("@src/infrastructure/hooks/actorHooks.js", () => ({
  registerActorHooks: vi.fn()
}));

vi.mock("@src/infrastructure/hooks/GMOnlyDnd5eHooks.js", () => ({
  registerGMOnlyDnd5eHooks: vi.fn()
}));

vi.mock("@src/infrastructure/hooks/GMOnlyActorHooks.js", () => ({
  registerGMOnlyActorHooks: vi.fn()
}));

vi.mock("@src/bootstrap/registerTransformtaionsMacros.js", () => ({
  registerTransformationMacros: vi.fn()
}));

vi.mock("@src/macros/createMacros.js", () => ({
  bootstrapMacros: vi.fn(() => ({
    executeMacro: vi.fn()
  }))
}));

vi.mock("@src/infrastructure/config/createDnd5eConfig.js", () => ({
  createDnd5eConfig: vi.fn()
}));
