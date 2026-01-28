import { describe, it, expect } from "vitest";
import { makeActor } from "../../helpers/actorHelper.js"
import { conditionsMet } from "@src/domain/actions/conditionSchema.js";

describe("conditionsMet", () => {
  it("returns true when no conditions are provided", () => {
    const actor = makeActor();
    expect(conditionsMet(actor)).toBe(true);
    expect(conditionsMet(actor, null)).toBe(true);
    expect(conditionsMet(actor, {})).toBe(true);
  });

  describe("stage conditions", () => {
    it("passes when stage matches array condition", () => {
      const actor = makeActor();
      expect(
        conditionsMet(actor, { stage: [1, 2] }, { stage: 2 })
      ).toBe(true);
    });

    it("fails when stage does not match array condition", () => {
      const actor = makeActor();
      expect(
        conditionsMet(actor, { stage: [1, 2] }, { stage: 3 })
      ).toBe(false);
    });

    it("respects min/max stage bounds", () => {
      const actor = makeActor();
      expect(
        conditionsMet(actor, { stage: { min: 2, max: 4 } }, { stage: 3 })
      ).toBe(true);

      expect(
        conditionsMet(actor, { stage: { min: 2, max: 4 } }, { stage: 1 })
      ).toBe(false);
    });
  });

  describe("actor conditions", () => {
    it("checks for available spell slots", () => {
      const actor = makeActor({
        overrides:{
          system: {
              spells: {
                  spell1: { max: 1 }
              }
          }
        }
      });

      expect(
        conditionsMet(actor, { actor: { hasSpellSlots: true } })
      ).toBe(true);
    });

    it("checks for transformation flag", () => {
      const actor = makeActor({
        overrides: {
          flags: {
            transformations: {
              test: "foo"
            }
          }
        }
      });

      expect(
        conditionsMet(actor, { actor: { hasFlag: "foo" } })
      ).toBe(true);

      expect(
        conditionsMet(actor, { actor: { hasFlag: "bar" } })
      ).toBe(false);
    });

    it("detects bloodied state", () => {
      const actor = makeActor({
        overrides: {
          system: {
            attributes: {
              hp: { value: 5, max: 20 }
            }
          }
        }
      });

      expect(
        conditionsMet(actor, { actor: { isBloodied: true } })
      ).toBe(true);
    });
  });

  describe("item conditions", () => {
    it("requires items with specific source UUIDs", () => {
      const actor = makeActor({
        items: [
          { flags: { transformations: { sourceUuid: "abc" } } }
        ]
      });

      expect(
        conditionsMet(actor, { items: { has: ["abc"] } })
      ).toBe(true);

      expect(
        conditionsMet(actor, { items: { has: ["xyz"] } })
      ).toBe(false);
    });

    it("checks remaining item uses", () => {
      const actor = makeActor({
        items: [
          {
            flags: { transformations: { sourceUuid: "abc" } },
            system: { uses: { max: 3, spent: 1 } }
          }
        ]
      });

      expect(
        conditionsMet(actor, {
          items: {
            has: ["abc"],
            usesRemaining: { min: 1, max: 2 }
          }
        })
      ).toBe(true);

      expect(
        conditionsMet(actor, {
          items: {
            has: ["abc"],
            usesRemaining: { min: 3 }
          }
        })
      ).toBe(false);
    });
  });

  describe("effect conditions", () => {
    it("checks for required effects", () => {
      const actor = makeActor({
        effects: [{ name: "Stunned" }]
      });

      expect(
        conditionsMet(actor, { effects: { has: ["Stunned"] } })
      ).toBe(true);
    });

    it("checks for missing effects", () => {
      const actor = makeActor({
        effects: [{ name: "Poisoned" }]
      });

      expect(
        conditionsMet(actor, { effects: { missing: ["Stunned"] } })
      ).toBe(true);
    });
  });

  describe("save conditions", () => {
    it("checks failed save", () => {
      const actor = makeActor();
      const context = {
        saves: {
          dex: { success: false }
        }
      };

      expect(
        conditionsMet(actor, { saveFailed: "dex" }, context)
      ).toBe(true);
    });

    it("checks successful save", () => {
      const actor = makeActor();
      const context = {
        saves: {
          wis: { success: true }
        }
      };

      expect(
        conditionsMet(actor, { saveSucceeded: "wis" }, context)
      ).toBe(true);
    });
  });

  it("fails if any condition fails", () => {
    const actor = makeActor();

    expect(
      conditionsMet(
        actor,
        {
          stage: [1],
          actor: { isBloodied: true }
        },
        { stage: 2 }
      )
    ).toBe(false);
  });
});
