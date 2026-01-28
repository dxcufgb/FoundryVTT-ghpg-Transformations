import { describe, it, expect, vi, beforeEach } from "vitest";
import { createDirectMacroInvoker } from
  "@src/macros/createDirectMacroInvoker.js";

describe("createDirectMacroInvoker", () => {
  let macroRegistry;
  let activeEffectRepository;
  let itemRepository;
  let logger;
  let invoker;

  beforeEach(() => {
    macroRegistry = {
      get: vi.fn(),
    };

    activeEffectRepository = {};
    itemRepository = {};

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    invoker = createDirectMacroInvoker({
      macroRegistry,
      activeEffectRepository,
      itemRepository,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Factory                                                            */
  /* ------------------------------------------------------------------ */

  it("returns a frozen invoker", () => {
    expect(Object.isFrozen(invoker)).toBe(true);
  });

  /* ------------------------------------------------------------------ */
  /* Happy path                                                         */
  /* ------------------------------------------------------------------ */

  it("invokes the correct macro handler", async () => {
    const handler = vi.fn().mockResolvedValue("result");

    const createHandlers = vi.fn().mockReturnValue({
      apply: handler,
    });

    macroRegistry.get.mockReturnValue({
      createHandlers,
    });

    const actor = { id: "actor-1" };
    const context = { trigger: "bloodied" };

    const result = await invoker.invoke({
      transformationType: "werewolf",
      action: "apply",
      actor,
      context,
    });

    expect(macroRegistry.get)
      .toHaveBeenCalledWith("werewolf");

    expect(createHandlers)
      .toHaveBeenCalledWith({
        logger,
        activeEffectRepository,
        itemRepository,
      });

    expect(handler)
      .toHaveBeenCalledWith({
        actor,
        trigger: context.trigger,
        context,
      });

    expect(result).toBe("result");
  });

  /* ------------------------------------------------------------------ */
  /* Errors                                                             */
  /* ------------------------------------------------------------------ */

  it("throws if transformation type is unknown", async () => {
    macroRegistry.get.mockReturnValue(undefined);

    await expect(
      invoker.invoke({
        transformationType: "unknown",
        action: "apply",
        actor: {},
        context: {},
      })
    ).rejects.toThrow("Unknown transformation: unknown");
  });

  it("throws if handler for action does not exist", async () => {
    macroRegistry.get.mockReturnValue({
      createHandlers: vi.fn().mockReturnValue({}),
    });

    await expect(
      invoker.invoke({
        transformationType: "werewolf",
        action: "missingAction",
        actor: {},
        context: {},
      })
    ).rejects.toThrow(
      "Handler 'missingAction' not found for werewolf"
    );
  });
});
