import { vi } from "vitest";

export function makeActor(input = {}) {
  let overrides = {};
  let effects = [];
  let items = [];

  // Allow makeActor([effects])
  if (Array.isArray(input)) {
    effects = input;
  } else {
    ({ overrides = {}, effects = [], items = [] } = input);
  }

  const effectsArray = Array.isArray(effects)
    ? effects
    : Array.from(effects ?? []);

  let itemCollection;

  if (items instanceof Map) {
    itemCollection = items;
  } else {
    const normalizedItems = Array.isArray(items)
      ? items
      : Array.from(items ?? []);

    itemCollection = new Map(
      normalizedItems.map(i => [i.id, i])
    );
  }

  const actor = {
    id: "actor-1",

    createEmbeddedDocuments: vi.fn(async (_type, docs) => docs),
    deleteEmbeddedDocuments: vi.fn(async () => {}),

    system: {
      attributes: {
        hp: { value: 10, max: 20 }
      },
      spells: {}
    },

    flags: {
      transformations: {}
    },

    ...overrides
  };

  // ✅ FORCE canonical collections (cannot be overridden)
  actor.effects = effectsArray;

  actor.items = {
    get: id => itemCollection.get(id) ?? null,
    find: fn => Array.from(itemCollection.values()).find(fn),
    filter: fn => Array.from(itemCollection.values()).filter(fn),
    some: fn => Array.from(itemCollection.values()).some(fn),
    map: fn => Array.from(itemCollection.values()).map(fn),
    [Symbol.iterator]: function* () {
      yield* itemCollection.values();
    }
  };

  return actor;
}
