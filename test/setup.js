import { webcrypto } from "node:crypto";
import { beforeEach, vi } from "vitest";

/* ------------------------------------------------------------------ */
/* Web crypto (browser parity)                                         */
/* ------------------------------------------------------------------ */
global.crypto = webcrypto;

/* ------------------------------------------------------------------ */
/* Foundry globals (defined ONCE)                                      */
/* ------------------------------------------------------------------ */
global.fromUuid = vi.fn(async uuid => {
  return null; // or a fake document if needed
});

global.ui = {
  notifications: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};

global.ChatMessage = {
  create: vi.fn(),
  getSpeaker: vi.fn(() => ({})),
};

global.Hooks = {
  _once: Object.create(null),
  _on: Object.create(null),

  once(event, fn) {
    this._once[event] = fn;
  },

  on(event, fn) {
    this._on[event] = fn;
  },

  call(event, ...args) {
    this._on[event]?.(...args);
  },

  callAll(event, ...args) {
    this._on[event]?.(...args);
  }
};

global.Roll = {
  safeEval: vi.fn(),
};

global.foundry = {
  applications: {
    api: {
      ApplicationV2: class {
        render() {}
        close() {}
        activateListeners() {}
      },
      HandlebarsApplicationMixin: Base => class extends Base {
        activateListeners(html) {
          if (super.activateListeners) {
            super.activateListeners(html);
          }
        }
      }
    },
    handlebars: {
      renderTemplate: vi.fn(),
      loadTemplates: vi.fn(),
    },
  },
};

global.game = {
  ready: Promise.resolve(),

  user: {
    id: "USER_ID",
    isGM: false,
    character: null
  },

  users: [
    { id: "USER_ID", isGM: false, active: true }
  ],

  actors: {
    getName: vi.fn()
  },

  settings: {
    get: vi.fn(),
    set: vi.fn()
  },

  socket: {
    on: vi.fn(),
    emit: vi.fn(),
  }
};

global.Actor = class Actor {
  constructor() {
    this.type = "character";
  }
};

global.socketlib = {
  registerModule: vi.fn(() => ({
    register: vi.fn(),
    executeAsGM: vi.fn(),
  })),
};

/* ------------------------------------------------------------------ */
/* Mock factories (NOT instances)                                      */
/* ------------------------------------------------------------------ */

export function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
  };
}

export function createMockActorRepository() {
  return {
    getById: vi.fn(),
    getByUuid: vi.fn(),
    setTransformation: vi.fn(),
    clearTransformation: vi.fn(),
    advanceStage: vi.fn(),
    hasMacroExecution: vi.fn(),
    setMacroExecution: vi.fn(),
    clearMacroExecution: vi.fn(),
    addHp: vi.fn(),
    addTempHp: vi.fn(),
    applyDamage: vi.fn(),
    setActorHp: vi.fn(),
  };
}

export function createMockItemRepository() {
  return {
    addItemFromUuid: vi.fn(),
    removeBySourceUuid: vi.fn(),
    findEmbeddedByUuidFlag: vi.fn(),
    getRemainingUses: vi.fn(),
    consumeUses: vi.fn(),
    removeItemsOnLongRest: vi.fn(),
  };
}

export function createMockActiveEffectRepository() {
  return {
    hasByName: vi.fn(),
    create: vi.fn(),
    getIdsByName: vi.fn(() => []),
    removeByIds: vi.fn(),
    removeEffectsOnLongRest: vi.fn(),
  };
}

export function createMockSocketGateway() {
  return {
    canMutateLocally: vi.fn(),
    emit: vi.fn(),
    register: vi.fn(),
    executeAsGM: vi.fn(),
  };
}

/* ------------------------------------------------------------------ */
/* Unified test context                                                */
/* ------------------------------------------------------------------ */

export function createTestContext() {
  const logger = createMockLogger();

  return {
    logger,
    actorRepository: createMockActorRepository(),
    itemRepository: createMockItemRepository(),
    activeEffectRepository: createMockActiveEffectRepository(),
    socketGateway: createMockSocketGateway(),

    reset() {
      vi.clearAllMocks();
    },
  };
}
