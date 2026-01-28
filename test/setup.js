import { webcrypto } from "node:crypto";
import { beforeEach, vi } from "vitest";

class FakeApplicationV2 {
  static get defaultOptions() {
    return {};
  }

  activateListeners() {}
  close() {}
}

beforeEach(() => {
  vi.resetModules();
});

/* ------------------------------------------------------------------ */
/* Web crypto (browser parity)                                         */
/* ------------------------------------------------------------------ */
global.crypto = webcrypto;

/* ------------------------------------------------------------------ */
/* Foundry v11 Application base                                        */
/* ------------------------------------------------------------------ */
class MockApplication {
  constructor(..._args) {}

  static DEFAULT_OPTIONS = {};

  async render() {}
  async close() {}
  getData() {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* HandlebarsApplicationMixin                                          */
/* ------------------------------------------------------------------ */
const HandlebarsApplicationMixin = Base => {
  if (!Base) {
    throw new Error(
      "HandlebarsApplicationMixin called with undefined Base"
    );
  }

  return class extends Base {
    static DEFAULT_OPTIONS = {};

    constructor(...args) {
      super(...args);
    }

    async render() {}
    async close() {}
    getData() {
      return {};
    }
  };
};

/* ------------------------------------------------------------------ */
/* Global Foundry namespace (single definition, no overwrites)         */
/* ------------------------------------------------------------------ */
global.foundry = {
  applications: {
    api: {
      ApplicationV2: FakeApplicationV2,
      HandlebarsApplicationMixin: Base => {
        if (!Base) {
          throw new Error(
            "HandlebarsApplicationMixin called with undefined Base"
          );
        }
        return class extends Base {};
      },
    },
    handlebars: {
      renderTemplate: vi.fn(),
      loadTemplates: vi.fn(async () => [])
    }
  }
};

/* ------------------------------------------------------------------ */
/* Mock Foundry ES module imports (THIS is what you were missing)      */
/* ------------------------------------------------------------------ */
vi.mock("foundry/applications/api.js", () => ({
  Application: MockApplication,
  HandlebarsApplicationMixin
}));

vi.mock("foundry/applications", () => ({
  Application: MockApplication,
  HandlebarsApplicationMixin
}));

vi.mock("@src/flags/applyTransformationFlags.js", () => ({
  applyTransformationFlags: vi.fn(async () => {})
}));

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */
global.Hooks = {
  _once: {},
  _on: {},

  once(event, fn) {
    this._once[event] = fn;
  },

  on(event, fn) {
    // store it in case you ever want to inspect it
    this._on[event] = this._on[event] ?? [];
    this._on[event].push(fn);
  }
};

/* ------------------------------------------------------------------ */
/* Game                                                               */
/* ------------------------------------------------------------------ */
global.game = {
  ready: Promise.resolve(),
  user: { isGM: true },
  actors: [],
  socket: {
    on: vi.fn()
  }
};

/* ------------------------------------------------------------------ */
/* Socketlib                                                          */
/* ------------------------------------------------------------------ */
global.socketlib = {
  registerModule: vi.fn(() => ({}))
};

/* ------------------------------------------------------------------ */
/* Misc globals Foundry assumes exist                                 */
/* ------------------------------------------------------------------ */
global.Actor = function Actor() {};

global.fromUuid = vi.fn(async uuid => ({
  uuid,
  name: "Mock Document"
}));

loadTemplates: vi.fn(async () => [])

global.socketlib = {
  registerModule: vi.fn(() => ({
    register: vi.fn()
  }))
};

globalThis.ui = {
  notifications: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};

global.CONFIG = {
  DND5E: {
    featureTypes: {},
    characterFlags: {}
  }
};

global.mergeObject = vi.fn((a, b) => ({
  ...a,
  ...b,
}));