import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mock resolveValue                                                   */
/* ------------------------------------------------------------------ */

vi.mock("@src/services/actions/utils/resolveValue.js", () => ({
  resolveValue: vi.fn(),
}));

import { resolveValue } from
  "@src/services/actions/utils/resolveValue.js";

import { createHpAction } from
  "@src/services/actions/handlers/hp.js";

describe("createHpAction", () => {
  let actorRepository;
  let logger;
  let hpAction;

  beforeEach(() => {
    actorRepository = {
      addTempHp: vi.fn().mockResolvedValue(undefined),
      addHp: vi.fn().mockResolvedValue(undefined),
      applyDamage: vi.fn().mockResolvedValue(undefined),
      setActorHp: vi.fn().mockResolvedValue(undefined),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    resolveValue.mockReturnValue(5);

    hpAction = createHpAction({
      actorRepository,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns and exits if mode or value is missing", async () => {
    await hpAction({
      actor: { id: "actor-1" },
      action: { data: {} },
      context: {},
      variables: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "HP action missing mode or value",
        expect.any(Object)
      );

    expect(actorRepository.addHp)
      .not.toHaveBeenCalled();
  });

  it("warns and exits if resolved value is not a number", async () => {
    resolveValue.mockReturnValue("not-a-number");

    await hpAction({
      actor: { id: "actor-1" },
      action: {
        data: { mode: "heal", value: "foo" },
      },
      context: {},
      variables: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "HP action value is not a number",
        "foo"
      );

    expect(actorRepository.addHp)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Modes                                                              */
  /* ------------------------------------------------------------------ */

  it("applies temporary HP", async () => {
    const actor = { id: "actor-1" };

    await hpAction({
      actor,
      action: {
        data: { mode: "temp", value: 5 },
      },
      context: {},
      variables: {},
    });

    expect(actorRepository.addTempHp)
      .toHaveBeenCalledWith(actor, 5);
  });

  it("heals HP", async () => {
    const actor = { id: "actor-1" };

    await hpAction({
      actor,
      action: {
        data: { mode: "heal", value: 5 },
      },
      context: {},
      variables: {},
    });

    expect(actorRepository.addHp)
      .toHaveBeenCalledWith(actor, 5);
  });

  it("applies damage", async () => {
    const actor = { id: "actor-1" };

    await hpAction({
      actor,
      action: {
        data: { mode: "damage", value: 5 },
      },
      context: {},
      variables: {},
    });

    expect(actorRepository.applyDamage)
      .toHaveBeenCalledWith(actor, 5);
  });

  it("sets actor HP", async () => {
    const actor = { id: "actor-1" };

    await hpAction({
      actor,
      action: {
        data: { mode: "set", value: 5 },
      },
      context: {},
      variables: {},
    });

    expect(actorRepository.setActorHp)
      .toHaveBeenCalledWith(actor, 5);
  });

  /* ------------------------------------------------------------------ */
  /* Unknown mode                                                       */
  /* ------------------------------------------------------------------ */

  it("warns on unknown HP action mode", async () => {
    await hpAction({
      actor: { id: "actor-1" },
      action: {
        data: { mode: "explode", value: 5 },
      },
      context: {},
      variables: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown HP action mode",
        "explode"
      );
  });
});
