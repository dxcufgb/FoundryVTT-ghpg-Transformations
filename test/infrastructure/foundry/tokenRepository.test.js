import { describe, it, expect, vi } from "vitest";
import { createTokenRepository } from
  "@src/infrastructure/foundry/tokenRepository.js";

describe("createTokenRepository", () => {
  it("getByUuid calls fromUuid and returns the result", async () => {
    const token = { id: "token-1" };

    global.fromUuid = vi.fn(async uuid => {
      expect(uuid).toBe("uuid-123");
      return token;
    });

    const repo = createTokenRepository({ logger: {} });

    const result = await repo.getByUuid("uuid-123");

    expect(fromUuid).toHaveBeenCalledOnce();
    expect(result).toBe(token);
  });

  it("propagates errors from fromUuid", async () => {
    const error = new Error("boom");

    global.fromUuid = vi.fn(async () => {
      throw error;
    });

    const repo = createTokenRepository({ logger: {} });

    await expect(
      repo.getByUuid("bad-uuid")
    ).rejects.toThrow("boom");
  });
});
