import { describe, it, expect } from "vitest";
import {
  TransformationDefinition
} from
  "@src/domain/transformation/TransformationDefinition.js";

function makeItem(overrides = {}) {
  return {
    name: "Wolf Form",
    img: "wolf.png",
    pack: "test-pack",
    system: { foo: "bar" },
    flags: {
      transformations: {
        tablePrefix: "Beast"
      }
    },
    ...overrides
  };
}

function makeStages() {
  return new Map([
    [1, { grants: {} }],
    [2, { grants: {} }]
  ]);
}

function makeTriggers() {
  return new Map([
    ["onHit", { actions: [], variables: [] }]
  ]);
}

describe("TransformationDefinition", () => {
  it("throws if id is missing", () => {
    expect(() =>
      new TransformationDefinition({
        uuid: "uuid",
        item: makeItem(),
        stages: makeStages(),
        triggers: makeTriggers()
      })
    ).toThrow("requires id");
  });

  it("throws if uuid is missing", () => {
    expect(() =>
      new TransformationDefinition({
        id: "id",
        item: makeItem(),
        stages: makeStages(),
        triggers: makeTriggers()
      })
    ).toThrow("requires uuid");
  });

  it("throws if item is missing", () => {
    expect(() =>
      new TransformationDefinition({
        id: "id",
        uuid: "uuid",
        stages: makeStages(),
        triggers: makeTriggers()
      })
    ).toThrow("requires item");
  });

  it("throws if stages are missing", () => {
    expect(() =>
      new TransformationDefinition({
        id: "id",
        uuid: "uuid",
        item: makeItem(),
        triggers: makeTriggers()
      })
    ).toThrow("requires stages");
  });

  it("throws if triggers are missing", () => {
    expect(() =>
      new TransformationDefinition({
        id: "id",
        uuid: "uuid",
        item: makeItem(),
        stages: makeStages()
      })
    ).toThrow("requires triggers");
  });

  it("constructs a frozen definition with derived fields", () => {
    const item = makeItem();

    const def = new TransformationDefinition({
      id: "id",
      uuid: "uuid",
      item,
      stages: makeStages(),
      triggers: makeTriggers()
    });

    expect(def.id).toBe("id");
    expect(def.uuid).toBe("uuid");

    expect(def.name).toBe(item.name);
    expect(def.label).toBe(item.name);
    expect(def.img).toBe(item.img);
    expect(def.pack).toBe(item.pack);
    expect(def.system).toBe(item.system);

    expect(def.meta).toEqual({
      tablePrefix: "Beast"
    });

    expect(Object.isFrozen(def)).toBe(true);
    expect(Object.isFrozen(def.meta)).toBe(true);
  });

  it("defaults rollTableEffects to null", () => {
    const def = new TransformationDefinition({
      id: "id",
      uuid: "uuid",
      item: makeItem(),
      stages: makeStages(),
      triggers: makeTriggers()
    });

    expect(def.rollTableEffects).toBeNull();
  });

  it("returns stages via getStage()", () => {
    const stages = makeStages();

    const def = new TransformationDefinition({
      id: "id",
      uuid: "uuid",
      item: makeItem(),
      stages,
      triggers: makeTriggers()
    });

    expect(def.getStage(1)).toEqual({ grants: {} });
    expect(def.getStage(999)).toBeNull();
  });

  it("returns triggers via getTrigger()", () => {
    const triggers = makeTriggers();

    const def = new TransformationDefinition({
      id: "id",
      uuid: "uuid",
      item: makeItem(),
      stages: makeStages(),
      triggers
    });

    expect(def.getTrigger("onHit")).toEqual({
      actions: [],
      variables: []
    });

    expect(def.getTrigger("missing")).toBeNull();
  });

  it("provides a callable validate hook", () => {
    const def = new TransformationDefinition({
      id: "id",
      uuid: "uuid",
      item: makeItem(),
      stages: makeStages(),
      triggers: makeTriggers()
    });

    expect(() => def.validate()).not.toThrow();
  });
});
