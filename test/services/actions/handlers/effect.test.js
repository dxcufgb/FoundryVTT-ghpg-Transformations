import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEffectAction } from
  "@src/services/actions/handlers/effect.js";

describe("createEffectAction", () => {
  let activeEffectRepository;
  let logger;
  let effectAction;

  beforeEach(() => {
    activeEffectRepository = {
      hasByName: vi.fn(),
      create: vi.fn().mockResolvedValue(undefined),
      getIdsByName: vi.fn(),
      removeByIds: vi.fn().mockResolvedValue(undefined),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    effectAction = createEffectAction({
      activeEffectRepository,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns and does nothing if mode or name is missing", async () => {
    await effectAction({
      actor: { id: "a1" },
      action: { data: {} },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "EFFECT action missing mode or name",
        expect.any(Object)
      );

    expect(activeEffectRepository.create)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Apply mode                                                         */
  /* ------------------------------------------------------------------ */

  it("applies an effect when not already present", async () => {
    const actor = { id: "actor-1" };

    activeEffectRepository.hasByName
      .mockReturnValue(false);

    await effectAction({
      actor,
      action: {
        data: {
          mode: "apply",
          name: "Bloodied",
        },
      },
      context: { foo: "bar" },
    });

    expect(activeEffectRepository.create)
      .toHaveBeenCalledWith({
        actor,
        name: "Bloodied",
        source: "transformation",
        context: { foo: "bar" },
      });
  });

  it("skips applying effect if already present", async () => {
    const actor = { id: "actor-1" };

    activeEffectRepository.hasByName
      .mockReturnValue(true);

    await effectAction({
      actor,
      action: {
        data: {
          mode: "apply",
          name: "Bloodied",
        },
      },
      context: {},
    });

    expect(activeEffectRepository.create)
      .not.toHaveBeenCalled();

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "Effect already present, skipping",
        actor.id,
        "Bloodied"
      );
  });

  it("uses provided source when applying effect", async () => {
    const actor = { id: "actor-1" };

    activeEffectRepository.hasByName
      .mockReturnValue(false);

    await effectAction({
      actor,
      action: {
        data: {
          mode: "apply",
          name: "Cursed",
          source: "item",
        },
      },
      context: {},
    });

    expect(activeEffectRepository.create)
      .toHaveBeenCalledWith({
        actor,
        name: "Cursed",
        source: "item",
        context: {},
      });
  });

  /* ------------------------------------------------------------------ */
  /* Remove mode                                                        */
  /* ------------------------------------------------------------------ */

  it("removes effects by name when present", async () => {
    const actor = { id: "actor-1" };

    activeEffectRepository.getIdsByName
      .mockReturnValue(["id-1", "id-2"]);

    await effectAction({
      actor,
      action: {
        data: {
          mode: "remove",
          name: "Bloodied",
        },
      },
      context: {},
    });

    expect(activeEffectRepository.removeByIds)
      .toHaveBeenCalledWith(actor, ["id-1", "id-2"]);
  });

  it("does nothing if no effects exist to remove", async () => {
    activeEffectRepository.getIdsByName
      .mockReturnValue([]);

    await effectAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          mode: "remove",
          name: "Bloodied",
        },
      },
      context: {},
    });

    expect(activeEffectRepository.removeByIds)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Unknown mode                                                       */
  /* ------------------------------------------------------------------ */

  it("warns on unknown mode", async () => {
    await effectAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          mode: "explode",
          name: "Bloodied",
        },
      },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown EFFECT action mode",
        "explode"
      );
  });
});
