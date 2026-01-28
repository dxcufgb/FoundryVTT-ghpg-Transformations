import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mock interpolate                                                   */
/* ------------------------------------------------------------------ */

vi.mock("@src/services/actions/utils/interpolate.js", () => ({
  interpolate: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/* Stub Foundry global BEFORE import                                  */
/* ------------------------------------------------------------------ */

const createSpy = vi.fn();
const getSpeakerSpy = vi.fn();

globalThis.ChatMessage = {
  create: createSpy,
  getSpeaker: getSpeakerSpy,
};

/* ------------------------------------------------------------------ */
/* Imports                                                            */
/* ------------------------------------------------------------------ */

import { interpolate } from
  "@src/services/actions/utils/interpolate.js";

import { createChatAction } from
  "@src/services/actions/handlers/chat.js";

describe("createChatAction", () => {
  let logger;
  let chatAction;

  beforeEach(() => {
    vi.clearAllMocks();

    logger = {
      debug: vi.fn(),
    };

    getSpeakerSpy.mockReturnValue({ alias: "Actor Name" });
    interpolate.mockReturnValue("Interpolated message");

    chatAction = createChatAction({ logger });
  });

  /* ------------------------------------------------------------------ */
  /* No-op behavior                                                     */
  /* ------------------------------------------------------------------ */

  it("does nothing if action has no message template", async () => {
    await chatAction({
      actor: { id: "a1" },
      action: { data: {} },
      context: {},
      variables: {},
    });

    expect(interpolate).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
    expect(logger.debug).not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Happy path                                                         */
  /* ------------------------------------------------------------------ */

  it("interpolates template and creates a chat message", async () => {
    const actor = { id: "actor-1" };

    const action = {
      data: {
        message: "Hello {{actor.name}}",
      },
    };

    const context = {
      transformation: { id: "wolf" },
    };

    const variables = {
      foo: "bar",
    };

    await chatAction({
      actor,
      action,
      context,
      variables,
    });

    expect(interpolate)
      .toHaveBeenCalledWith(
        "Hello {{actor.name}}",
        {
          actor,
          transformation: context.transformation,
          variables,
        }
      );

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "CHAT action",
        {
          actor: actor.id,
          message: "Interpolated message",
        }
      );

    expect(getSpeakerSpy)
      .toHaveBeenCalledWith({ actor });

    expect(createSpy)
      .toHaveBeenCalledWith({
        speaker: { alias: "Actor Name" },
        content: "Interpolated message",
      });
  });
});
