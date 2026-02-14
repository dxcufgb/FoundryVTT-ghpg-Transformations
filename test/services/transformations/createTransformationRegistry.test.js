import { describe, it, expect, beforeEach } from "vitest";
import { createTransformationRegistry } from
  "@src/services/transformations/createTransformationRegistry.js";

describe("createTransformationRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = createTransformationRegistry();
  });

  function makeTransformation({
    itemId = "item-1",
    uuid = "Compendium.test.item",
    type = "beast",
    effects,
  } = {}) {
    class TransformationClass {}
    TransformationClass.itemId = itemId;
    TransformationClass.type = type;

    return {
      uuid,
      TransformationClass,
      TransformationDefinition: {},
      TransformationStages: [],
      TransformationTriggers: {},
      TransformationRollTableEffects: effects,
      TransformationMacros: {},
    };
  }

  /* ------------------------------------------------------------------ */
  /* Registration                                                       */
  /* ------------------------------------------------------------------ */

  it("throws if TransformationClass.itemId is missing", () => {
    expect(() =>
      registry.register({
        uuid: "uuid",
        TransformationClass: {},
      })
    ).toThrow(
      "TransformationClass must define itemId"
    );
  });

  it("throws if uuid is missing", () => {
    class T {}
    T.itemId = "item-1";

    expect(() =>
      registry.register({
        TransformationClass: T,
      })
    ).toThrow(
      "Transformation must define uuid"
    );
  });

  it("registers a transformation entry", () => {
    const entry = makeTransformation();

    registry.register(entry);

    const stored =
      registry.getEntryByItemId("item-1");

    expect(stored).toMatchObject({
      itemId: "item-1",
      uuid: entry.uuid,
      TransformationClass: entry.TransformationClass,
    });

    expect(Object.isFrozen(stored)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* Lookup                                                             */
  /* ------------------------------------------------------------------ */

  it("returns entry for actor based on flags", () => {
    const entry = makeTransformation();
    registry.register(entry);

    const actor = {
      flags: {
        dnd5e: {
          transformations: "item-1",
        },
      },
    };

    const result =
      registry.getEntryForActor(actor);

    expect(result.itemId).toBe("item-1");
  });

  it("returns null if actor has no transformation flag", () => {
    expect(
      registry.getEntryForActor({})
    ).toBeNull();
  });

  it("returns all registered entries", () => {
    registry.register(
      makeTransformation({ itemId: "a" })
    );
    registry.register(
      makeTransformation({ itemId: "b" })
    );

    const entries = registry.getAllEntries();

    expect(entries).toHaveLength(2);
  });

  /* ------------------------------------------------------------------ */
  /* Roll table effects by type                                          */
  /* ------------------------------------------------------------------ */

  it("returns roll table effects grouped by transformation type", () => {
    class EffectA {}
    class EffectB {}

    registry.register(
      makeTransformation({
        type: "beast",
        effects: { A: EffectA },
      })
    );

    registry.register(
      makeTransformation({
        itemId: "item-2",
        type: "dragon",
        effects: { B: EffectB },
      })
    );

    const result =
      registry.getRollTableEffectsByType();

    expect(result).toEqual({
      beast: { A: EffectA },
      dragon: { B: EffectB },
    });
  });

  /* ------------------------------------------------------------------ */
  /* Roll table effects by key                                           */
  /* ------------------------------------------------------------------ */

  it("returns roll table effects indexed by meta.key", () => {
    class EffectA {}
    EffectA.meta = { key: "KEY_A" };

    registry.register(
      makeTransformation({
        effects: { A: EffectA },
      })
    );

    const result =
      registry.getRollTableEffectsByKey();

    expect(result).toEqual({
      KEY_A: EffectA,
    });

    expect(Object.isFrozen(result)).toBe(true);
  });

  it("throws if roll table effect is missing meta.key", () => {
    class BadEffect {}

    registry.register(
      makeTransformation({
        effects: { Bad: BadEffect },
      })
    );

    expect(() =>
      registry.getRollTableEffectsByKey()
    ).toThrow(
      "RollTableEffect missing meta.key"
    );
  });

  it("throws on duplicate roll table effect keys", () => {
    class EffectA {}
    EffectA.meta = { key: "DUPLICATE" };

    class EffectB {}
    EffectB.meta = { key: "DUPLICATE" };

    registry.register(
      makeTransformation({
        effects: { A: EffectA },
      })
    );

    registry.register(
      makeTransformation({
        itemId: "item-2",
        effects: { B: EffectB },
      })
    );

    expect(() =>
      registry.getRollTableEffectsByKey()
    ).toThrow(
      "Duplicate RollTableEffect key detected"
    );
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen registry API", () => {
    expect(Object.isFrozen(registry)).toBe(true);
  });
});
