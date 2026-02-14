import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGeneralHandlers } from
  "@src/macros/createGeneralHandlers.js";

describe("createGeneralHandlers", () => {
  let activeEffectRepository;
  let itemRepository;
  let logger;
  let handlers;

  beforeEach(() => {
    activeEffectRepository = {
      removeEffectsOnLongRest: vi.fn().mockResolvedValue(undefined),
    };

    itemRepository = {
      removeItemsOnLongRest: vi.fn().mockResolvedValue(undefined),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    handlers = createGeneralHandlers({
      activeEffectRepository,
      itemRepository,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Factory                                                            */
  /* ------------------------------------------------------------------ */

  it("returns a frozen handlers object", () => {
    expect(Object.isFrozen(handlers)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* removeOnLongRest                                                    */
  /* ------------------------------------------------------------------ */

  it("removes items and effects when trigger is longRest", async () => {
    const actor = { id: "actor-1" };

    await handlers.removeOnLongRest({
      actor,
      trigger: "longRest",
    });

    expect(itemRepository.removeItemsOnLongRest)
      .toHaveBeenCalledWith(actor);

    expect(activeEffectRepository.removeEffectsOnLongRest)
      .toHaveBeenCalledWith(actor);
  });

  it("does nothing when trigger is not longRest", async () => {
    const actor = { id: "actor-1" };

    await handlers.removeOnLongRest({
      actor,
      trigger: "shortRest",
    });

    expect(itemRepository.removeItemsOnLongRest)
      .not.toHaveBeenCalled();

    expect(activeEffectRepository.removeEffectsOnLongRest)
      .not.toHaveBeenCalled();
  });
});
