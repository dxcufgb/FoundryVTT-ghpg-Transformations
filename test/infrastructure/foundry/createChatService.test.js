import { describe, it, expect, vi, beforeEach } from "vitest";
import { createChatService } from
  "@src/infrastructure/foundry/createChatService.js";

/* -------------------------------------------------- */
/* Global Foundry mock                                */
/* -------------------------------------------------- */

global.ChatMessage = {
  create: vi.fn(async data => data)
};

/* -------------------------------------------------- */
/* Tests                                              */
/* -------------------------------------------------- */

describe("createChatService", () => {
  let logger;
  let chatService;

  beforeEach(() => {
    logger = { debug: vi.fn(), warn: vi.fn() };
    chatService = createChatService({ logger });
    ChatMessage.create.mockClear();
  });

  it("does nothing when content is missing", async () => {
    const result = await chatService.post({
      speaker: { actor: "actor-id" }
    });

    expect(result).toBeUndefined();
    expect(ChatMessage.create).not.toHaveBeenCalled();
  });

  it("creates a chat message with provided data", async () => {
    const speaker = { actor: "actor-id" };

    const result = await chatService.post({
      speaker,
      content: "Hello world",
      flavor: "Flavor text",
      whisper: ["GM"]
    });

    expect(ChatMessage.create).toHaveBeenCalledWith({
      speaker,
      content: "Hello world",
      flavor: "Flavor text",
      whisper: ["GM"]
    });

    expect(result.content).toBe("Hello world");
  });
});
