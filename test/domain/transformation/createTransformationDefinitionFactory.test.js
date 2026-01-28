import { describe, it, expect, vi } from "vitest";
import { makeFactory } from "../../helpers/factoryHelper.js";

beforeEach(() => {
    TransformationDefinition.mockClear();
    RollTableEffectCatalog.mockClear();
});
  

/* ───────────────────────────────────────────────────────────── */
/* Mocks */
/* ───────────────────────────────────────────────────────────── */

vi.mock(
  "@src/domain/transformation/TransformationDefinition.js",
  () => ({
    TransformationDefinition: vi.fn(function (args) {
      this.args = args;
      this.validate = vi.fn();
    })
  })
);

vi.mock(
  "@src/domain/rollTable/RollTableEffectCatalog.js",
  () => ({
    RollTableEffectCatalog: vi.fn(function (args) {
      this.args = args;
    })
  })
);

import { TransformationDefinition } from
  "@src/domain/transformation/TransformationDefinition.js";

import { RollTableEffectCatalog } from
  "@src/domain/rollTable/RollTableEffectCatalog.js";

/* ───────────────────────────────────────────────────────────── */
/* Helpers */
/* ───────────────────────────────────────────────────────────── */

function makeTransformationClass(id = "item-id") {
  class FakeTransformation {}
  FakeTransformation.itemId = id;
  return FakeTransformation;
}

/* ───────────────────────────────────────────────────────────── */
/* Tests */
/* ───────────────────────────────────────────────────────────── */

describe("createTransformationDefinitionFactory", () => {

  it("returns null and warns when item is missing", () => {
    const { factory, logger } = makeFactory();

    const result = factory.create({
      id: "id",
      uuid: "uuid",
      stages: {},
      TransformationClass: makeTransformationClass()
    });

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("returns null and warns when stages are missing", () => {
    const { factory, logger } = makeFactory();

    const result = factory.create({
      id: "id",
      uuid: "uuid",
      item: {},
      TransformationClass: makeTransformationClass()
    });

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("creates a TransformationDefinition with normalized triggers", () => {
    const { factory } = makeFactory();

    factory.create({
      id: "id",
      uuid: "uuid",
      item: { system: {} },
      stages: { 1: {} },
      TransformationClass: makeTransformationClass(),
      triggers: {
        onHit: {
          actions: [
            {
              type: "damage",
              when: { stage: 1 },
              once: "perTurn",
              data: { amount: 5 }
            }
          ],
          variables: [
            { type: "number", name: "x", value: 2 }
          ]
        }
      }
    });

    expect(TransformationDefinition).toHaveBeenCalled();

    const callArgs = TransformationDefinition.mock.calls[0][0];

    expect(callArgs.triggers).toBeInstanceOf(Map);
    expect(callArgs.triggers.has("onHit")).toBe(true);

    const trigger = callArgs.triggers.get("onHit");
    expect(trigger.actions).toHaveLength(1);
    expect(trigger.variables).toHaveLength(1);
  });

  it("skips triggers with no valid actions", () => {
    const { factory } = makeFactory();

    factory.create({
      id: "id",
      uuid: "uuid",
      item: {},
      stages: {},
      TransformationClass: makeTransformationClass(),
      triggers: {
        badTrigger: {
          actions: [{ foo: "bar" }]
        }
      }
    });

    const callArgs = TransformationDefinition.mock.calls[0][0];
    expect(callArgs.triggers.size).toBe(0);
  });

  it("creates RollTableEffectCatalog when registry entry provides effects", () => {
    const { factory } = makeFactory({
      registryEntry: {
        TransformationRollTableEffects: {
          test: class {}
        }
      }
    });

    factory.create({
      id: "id",
      uuid: "uuid",
      item: {},
      stages: {},
      TransformationClass: makeTransformationClass()
    });

    expect(RollTableEffectCatalog).toHaveBeenCalledTimes(1);
  });

  it("does not create RollTableEffectCatalog when no effects are registered", () => {
    const { factory } = makeFactory({
      registryEntry: null
    });
  
    class FakeTransformation {}
    FakeTransformation.itemId = "item-id";
  
    factory.create({
      id: "id",
      uuid: "uuid",
      item: {},
      stages: {},
      TransformationClass: FakeTransformation
    });
  
    expect(RollTableEffectCatalog).not.toHaveBeenCalled();
  });
    
  it("calls validate on the TransformationDefinition if available", () => {
    const { factory } = makeFactory();

    factory.create({
      id: "id",
      uuid: "uuid",
      item: {},
      stages: {},
      TransformationClass: makeTransformationClass()
    });

    const instance = TransformationDefinition.mock.instances[0];
    expect(instance.validate).toHaveBeenCalled();
  });

});
