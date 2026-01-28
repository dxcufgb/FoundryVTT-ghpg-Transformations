import { describe, it, expect, vi, beforeEach } from "vitest";
import { createD20RollAction } from
  "@src/ui/actions/d20RollAction.js";
import {
  ABILITY,
  SKILL,
  ROLL_TYPE,
  ROLL_MODE
} from "@src/config/constants.js";
import { enumUtils } from "@src/utils/enumUtils.js";

vi.mock("@src/utils/enumUtils.js", () => ({
  enumUtils: {
    enumContains: vi.fn(),
  },
}));

describe("createD20RollAction", () => {
  let ui;
  let actor;
  let rollAction;

  beforeEach(() => {
    ui = {
      notifications: {
        warn: vi.fn(),
      },
    };

    actor = {
      rollSavingThrow: vi.fn(),
      rollAbilityCheck: vi.fn(),
      rollSkill: vi.fn(),
    };

    rollAction = createD20RollAction({ ui });

    enumUtils.enumContains.mockReset();
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns if actor is missing", async () => {
    await rollAction.roll({
      actor: null,
      identifier: "str",
      rollType: ROLL_TYPE.ABILITY_CHECK,
    });

    expect(ui.notifications.warn)
      .toHaveBeenCalledWith("Select a token.");
  });

  it("warns on unknown roll type", async () => {
    enumUtils.enumContains.mockReturnValue(false);

    await rollAction.roll({
      actor,
      identifier: "weird",
    });

    expect(ui.notifications.warn)
      .toHaveBeenCalledWith("Unknown roll type");
  });

  /* ------------------------------------------------------------------ */
  /* Ability rolls                                                      */
  /* ------------------------------------------------------------------ */

  it("rolls ability saving throw with DC", async () => {
    enumUtils.enumContains
      .mockImplementation((set, id) => set === ABILITY);

    await rollAction.roll({
      actor,
      identifier: "str",
      rollType: ROLL_TYPE.SAVING_THROW,
      dc: 15,
    });

    expect(actor.rollSavingThrow)
      .toHaveBeenCalledWith({
        ability: "str",
        target: 15,
      });
  });

  it("rolls ability check with advantage", async () => {
    enumUtils.enumContains
      .mockImplementation((set, id) => set === ABILITY);

    await rollAction.roll({
      actor,
      identifier: "dex",
      rollType: ROLL_TYPE.ABILITY_CHECK,
      mode: ROLL_MODE.ADVANTAGE.int,
    });

    expect(actor.rollAbilityCheck)
      .toHaveBeenCalledWith({
        ability: "dex",
        advantage: true,
      });
  });

  /* ------------------------------------------------------------------ */
  /* Skill rolls                                                        */
  /* ------------------------------------------------------------------ */

  it("rolls skill check", async () => {
    enumUtils.enumContains
      .mockImplementation((set, id) => set === SKILL);

    await rollAction.roll({
      actor,
      identifier: "stealth",
    });

    expect(actor.rollSkill)
      .toHaveBeenCalledWith({
        skill: "stealth",
      });
  });

  it("rolls skill check with disadvantage", async () => {
    enumUtils.enumContains
      .mockImplementation((set, id) => set === SKILL);

    await rollAction.roll({
      actor,
      identifier: "perception",
      mode: ROLL_MODE.DISADVANTAGE.int,
    });

    expect(actor.rollSkill)
      .toHaveBeenCalledWith({
        skill: "perception",
        disadvantage: true,
      });
  });
});
