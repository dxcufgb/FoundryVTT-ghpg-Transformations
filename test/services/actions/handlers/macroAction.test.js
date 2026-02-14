import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMacroAction } from
  "@src/services/actions/handlers/macroAction.js";

describe("createMacroAction", () => {
  let directMacroInvoker;
  let logger;
  let macroAction;

  beforeEach(() => {
    directMacroInvoker = {
      invoke: vi.fn().mockResolvedValue(undefined),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    macroAction = createMacroAction({
      directMacroInvoker,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns and exits if transformationType or action is missing", async () => {
    await macroAction({
      actor: { uuid: "actor-uuid" },
      action: { data: {} },
      context: {},
      variables: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Invalid MACRO action payload",
        expect.any(Object)
      );

    expect(directMacroInvoker.invoke)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Happy path                                                         */
  /* ------------------------------------------------------------------ */

  it("invokes macro with composed context", async () => {
    const actor = {
      id: "actor-1",
      uuid: "actor-uuid",
    };

    const action = {
      data: {
        transformationType: "werewolf",
        action: "howl",
        args: {
          foo: "bar",
        },
      },
    };

    const context = {
      trigger: "longRest",
      baz: "qux",
    };

    const variables = {
      roll: 12,
    };

    await macroAction({
      actor,
      action,
      context,
      variables,
    });

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "Executing MACRO action",
        "werewolf",
        "howl",
        "longRest"
      );

    expect(directMacroInvoker.invoke)
      .toHaveBeenCalledWith({
        actor,
        transformationType: "werewolf",
        action: "howl",
        context: {
          actorUuid: "actor-uuid",
          foo: "bar",
          roll: 12,
          trigger: "longRest",
          baz: "qux",
        },
      });
  });
});
