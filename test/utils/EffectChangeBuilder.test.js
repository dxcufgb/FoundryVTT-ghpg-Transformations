import { describe, it, expect, vi, beforeEach } from "vitest";
import { EffectChangeBuilder } from
  "@src/utils/EffectChangeBuilder.js";

// Fake Foundry constant
global.CONST = {
  ACTIVE_EFFECT_MODES: {
    ADD: "ADD",
  },
};

describe("EffectChangeBuilder", () => {
  let constants;
  let logger;
  let builder;

  beforeEach(() => {
    logger = {
      warn: vi.fn(),
    };

    constants = {
      SKILL: {
        ATHLETICS: "athletics",
      },
      ABILITY: {
        STR: "str",
      },
      ATTRIBUTE: {
        ROLLABLE: {
          INIT: "init",
          contains: vi.fn(id =>
            ["init"].includes(id)
          ),
        },
        contains: vi.fn(id =>
          ["init", "hp"].includes(id)
        ),
      },
      MOVEMENT_TYPE: {
        contains: vi.fn(id =>
          ["walk", "fly"].includes(id)
        ),
      },
      OVERRIDE_TYPE: {
        MOVEMENT_TYPE: "movement",
        ATTRIBUTES: "attributes",
      },
      ROLL_TYPE: {
        ABILITY_CHECK: "check",
        SAVING_THROW: "save",
      },
    };

    builder = new EffectChangeBuilder({
      constants,
      logger,
    });
  });

  it("creates advantage for a skill", () => {
    const result = builder.getAdvantage("athletics");

    expect(result).toEqual([
      {
        key: "system.skills.athletics.roll.mode",
        mode: "ADD",
        value: 1,
      },
    ]);
  });

  it("creates disadvantage for an ability check", () => {
    const result = builder.getDisadvantage(
      "str",
      constants.ROLL_TYPE.ABILITY_CHECK
    );

    expect(result).toEqual([
      {
        key: "system.abilities.str.check.roll.mode",
        mode: "ADD",
        value: -1,
      },
    ]);
  });

  it("creates advantage for an ability saving throw", () => {
    const result = builder.getAdvantage(
      "str",
      constants.ROLL_TYPE.SAVING_THROW
    );

    expect(result).toEqual([
      {
        key: "system.abilities.str.save.roll.mode",
        mode: "ADD",
        value: 1,
      },
    ]);
  });

  it("creates disadvantage for a rollable attribute", () => {
    const result = builder.getDisadvantage("init");

    expect(result).toEqual([
      {
        key: "system.attributes.init.roll.mode",
        mode: "ADD",
        value: -1,
      },
    ]);
  });

  it("warns and returns empty array for unknown identifier", () => {
    const result = builder.getAdvantage("unknown");

    expect(result).toEqual([]);
    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown identifier in EffectChangeBuilder",
        "unknown"
      );
  });

  it("returns movement override type", () => {
    const result = builder.findOverrideType("walk");

    expect(result).toBe(
      constants.OVERRIDE_TYPE.MOVEMENT_TYPE
    );
  });

  it("returns attribute override type", () => {
    const result = builder.findOverrideType("init");

    expect(result).toBe(
      constants.OVERRIDE_TYPE.ATTRIBUTES
    );
  });

  it("warns and returns null for unknown override identifier", () => {
    const result = builder.findOverrideType("nonsense");

    expect(result).toBeNull();
    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown identifier in findOverrideType",
        "nonsense"
      );
  });
});
