import { describe, it, expect } from "vitest";
import * as constants from "@src/config/constants.js";

describe("constants module", () => {
  it("exports expected top-level constants", () => {
    expect(constants.MODULE_NAME).toBe("transformations");
    expect(constants.MODULE_FOLDER).toBeDefined();
    expect(constants.TRANSFORMATION_FEATURE).toBeDefined();
  });

  it("exports frozen enum objects", () => {
    const frozenEnums = [
      constants.SKILL,
      constants.ABILITY,
      constants.ROLL_TYPE,
      constants.MOVEMENT_TYPE,
      constants.OVERRIDE_TYPE,
      constants.ATTRIBUTE,
      constants.ROLL_MODE,
      constants.CONDITION,
      constants.TRIGGER_FLAG,
      constants.ITEM_TYPE
    ];

    for (const enumObject of frozenEnums) {
      expect(Object.isFrozen(enumObject)).toBe(true);
    }

    // Nested freeze matters too
    expect(Object.isFrozen(constants.ATTRIBUTE.ROLLABLE)).toBe(true);
  });

  it("does not allow mutation of enum objects", () => {
    const original = constants.ABILITY.STRENGTH;

    try {
      constants.ABILITY.STRENGTH = "nope";
    } catch {}

    expect(constants.ABILITY.STRENGTH).toBe(original);
  });

  it("ROLL_MODE entries have consistent shape", () => {
    for (const mode of Object.values(constants.ROLL_MODE)) {
      expect(typeof mode.shortText).toBe("string");
      expect(typeof mode.int).toBe("number");
    }
  });
});
