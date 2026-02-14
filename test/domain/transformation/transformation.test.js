import { describe, it, expect } from "vitest";
import {
  Transformation
} from
  "@src/domain/transformation/Transformation.js";

function makeDefinition(overrides = {}) {
  return {
    id: "item-id",
    name: "Test Transformation",
    img: "icon.png",
    meta: {},
    getTrigger: () => null,
    ...overrides
  };
}

describe("Transformation", () => {
  it("throws if actorId is missing", () => {
    expect(() =>
      new Transformation({
        definition: makeDefinition()
      })
    ).toThrow("actorId");
  });

  it("throws if definition is missing", () => {
    expect(() =>
      new Transformation({
        actorId: "actor-1"
      })
    ).toThrow("TransformationDefinition");
  });

  it("creates a frozen transformation with default stage", () => {
    const definition = makeDefinition();

    const t = new Transformation({
      actorId: "actor-1",
      definition
    });

    expect(t.actorId).toBe("actor-1");
    expect(t.definition).toBe(definition);
    expect(t.stage).toBe(1);
    expect(Object.isFrozen(t)).toBe(true);
  });

  it("exposes identity getters", () => {
    const definition = makeDefinition({
      id: "abc",
      name: "Wolf Form",
      img: "wolf.png"
    });

    const t = new Transformation({
      actorId: "actor-1",
      definition,
      stage: 2
    });

    expect(t.itemId).toBe("abc");
    expect(t.name).toBe("Wolf Form");
    expect(t.img).toBe("wolf.png");
  });

  it("returns stage via getStage()", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition(),
      stage: 3
    });

    expect(t.getStage()).toBe(3);
  });

  it("returns trigger actions and variables when defined", () => {
    const definition = makeDefinition({
      getTrigger: () => ({
        actions: [{ type: "TEST_ACTION" }],
        variables: [{ name: "x", value: 1 }]
      })
    });

    const t = new Transformation({
      actorId: "actor-1",
      definition
    });

    expect(t.getTriggerActions("onHit")).toEqual([
      { type: "TEST_ACTION" }
    ]);

    expect(t.getTriggerVariables("onHit")).toEqual([
      { name: "x", value: 1 }
    ]);
  });

  it("returns empty arrays when trigger is missing", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition()
    });

    expect(t.getTriggerActions("missing")).toEqual([]);
    expect(t.getTriggerVariables("missing")).toEqual([]);
  });

  it("applies domain rule for lower roll results", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition()
    });

    expect(t.shouldApplyLowerRollResult(10, 5)).toBe(true);
    expect(t.shouldApplyLowerRollResult(5, 10)).toBe(false);
  });

  it("builds roll table name with optional prefix", () => {
    const definition = makeDefinition({
      meta: { tablePrefix: "Beast" }
    });

    const t = new Transformation({
      actorId: "actor-1",
      definition,
      stage: 2
    });

    expect(t.getRollTableName()).toBe("Beast Stage 2");
  });

  it("builds roll table name without prefix", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition(),
      stage: 1
    });

    expect(t.getRollTableName()).toBe(" Stage 1");
  });

  it("describes stage change actions", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition(),
      stage: 2
    });

    expect(t.describeStageChange()).toEqual([
      { type: "CLEAR_TRANSFORMATION_EFFECTS" },
      { type: "APPLY_STAGE_ITEMS", stage: 2 }
    ]);
  });

  it("describes roll table result actions", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition()
    });

    expect(t.describeRollTableResult("Burning")).toEqual([
      { type: "REMOVE_ACTIVE_EFFECTS" },
      { type: "APPLY_EFFECT", name: "Burning" }
    ]);
  });

  it("provides null default implementations for hooks", () => {
    const t = new Transformation({
      actorId: "actor-1",
      definition: makeDefinition()
    });

    expect(t.onDamage()).toBeNull();
    expect(t.onShortRest()).toBeNull();
    expect(t.onLongRest()).toBeNull();
    expect(t.onInitiative()).toBeNull();
    expect(t.onConcentration()).toBeNull();
    expect(t.onHitDieRoll()).toBeNull();
    expect(t.onSavingThrow()).toBeNull();
    expect(t.onBloodied()).toBeNull();
    expect(t.onUnconscious()).toBeNull();
  });
});
