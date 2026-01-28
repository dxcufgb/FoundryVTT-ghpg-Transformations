import { describe, it, expect, vi, beforeEach } from "vitest";
import { createItemAction } from
  "@src/services/actions/handlers/item.js";

describe("createItemAction", () => {
  let itemRepository;
  let logger;
  let itemAction;

  beforeEach(() => {
    itemRepository = {
      addItemFromUuid: vi.fn().mockResolvedValue(undefined),
      findEmbeddedByUuidFlag: vi.fn(),
      getRemainingUses: vi.fn(),
      consumeUses: vi.fn().mockResolvedValue(undefined),
      removeBySourceUuid: vi.fn().mockResolvedValue(undefined),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    itemAction = createItemAction({
      itemRepository,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns and exits if uuid is missing", async () => {
    await itemAction({
      actor: { id: "actor-1" },
      action: { data: {} },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Item action missing uuid",
        expect.any(Object)
      );

    expect(itemRepository.addItemFromUuid)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Add mode                                                           */
  /* ------------------------------------------------------------------ */

  it("adds an item by uuid", async () => {
    const actor = { id: "actor-1" };
    const context = {};

    await itemAction({
      actor,
      action: {
        data: {
          uuid: "item-uuid",
          mode: "add",
        },
      },
      context,
    });

    expect(itemRepository.addItemFromUuid)
      .toHaveBeenCalledWith(
        actor,
        "item-uuid",
        { context }
      );
  });

  /* ------------------------------------------------------------------ */
  /* Consume mode                                                       */
  /* ------------------------------------------------------------------ */

  it("does nothing if item to consume is not found", async () => {
    itemRepository.findEmbeddedByUuidFlag
      .mockReturnValue(null);

    await itemAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          uuid: "item-uuid",
          mode: "consume",
        },
      },
      context: {},
    });

    expect(itemRepository.consumeUses)
      .not.toHaveBeenCalled();
  });

  it("does nothing if not enough uses remain", async () => {
    const item = { name: "Potion" };

    itemRepository.findEmbeddedByUuidFlag
      .mockReturnValue(item);
    itemRepository.getRemainingUses
      .mockReturnValue(0);

    await itemAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          uuid: "item-uuid",
          mode: "consume",
          uses: 2,
        },
      },
      context: {},
    });

    expect(itemRepository.consumeUses)
      .not.toHaveBeenCalled();
  });

  it("consumes item uses when available", async () => {
    const item = { name: "Potion" };

    itemRepository.findEmbeddedByUuidFlag
      .mockReturnValue(item);
    itemRepository.getRemainingUses
      .mockReturnValue(5);

    await itemAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          uuid: "item-uuid",
          mode: "consume",
          uses: 2,
        },
      },
      context: {},
    });

    expect(itemRepository.consumeUses)
      .toHaveBeenCalledWith(item, 2);
  });

  /* ------------------------------------------------------------------ */
  /* Remove mode                                                        */
  /* ------------------------------------------------------------------ */

  it("removes items by source uuid", async () => {
    const actor = { id: "actor-1" };

    await itemAction({
      actor,
      action: {
        data: {
          uuid: "item-uuid",
          mode: "remove",
        },
      },
      context: {},
    });

    expect(itemRepository.removeBySourceUuid)
      .toHaveBeenCalledWith(actor, "item-uuid");
  });

  /* ------------------------------------------------------------------ */
  /* Unknown mode                                                       */
  /* ------------------------------------------------------------------ */

  it("warns on unknown item action mode", async () => {
    await itemAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          uuid: "item-uuid",
          mode: "explode",
        },
      },
      context: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown item action mode",
        "explode",
        expect.any(Object)
      );
  });

  /* ------------------------------------------------------------------ */
  /* Blocker                                                            */
  /* ------------------------------------------------------------------ */

  it("sets context.blocked when blocker is true", async () => {
    const context = {};

    await itemAction({
      actor: { id: "actor-1" },
      action: {
        data: {
          uuid: "item-uuid",
          mode: "add",
          blocker: true,
        },
      },
      context,
    });

    expect(context.blocked).toBe(true);
  });
});
