import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateMacroPayload } from "@src/infrastructure/macros/validateMacroPayload.js";

describe("validateMacroPayload", () => {
  let logger;

  beforeEach(() => {
    logger = {
      warn: vi.fn(),
    };
  });

  /* ------------------------------------------------------------------ */
  /* Helper: valid baseline payload                                     */
  /* ------------------------------------------------------------------ */

  function makeValidPayload(overrides = {}) {
    return {
      args: {
        actorUuid: "Actor.123",
        tokenUuid: "Token.456",
      },
      transformationType: "polymorph",
      action: "apply",
      trigger: "manual",
      ...overrides,
    };
  }

  /* ------------------------------------------------------------------ */
  /* Failure cases                                                       */
  /* ------------------------------------------------------------------ */

  it("fails when payload is missing or not an object", () => {
    const result = validateMacroPayload(null, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: not an object",
      null
    );
  });

  it("fails when args is missing or invalid", () => {
    const payload = makeValidPayload({ args: null });

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: missing args",
      payload
    );
  });

  it("fails when actorUuid is missing or invalid", () => {
    const payload = makeValidPayload({
      args: { tokenUuid: "Token.456" },
    });

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: actorUuid missing or invalid",
      payload
    );
  });

  it("fails when tokenUuid is missing or invalid", () => {
    const payload = makeValidPayload({
      args: { actorUuid: "Actor.123" },
    });

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: tokenUuid missing or invalid",
      payload
    );
  });

  it("fails when transformationType is missing or invalid", () => {
    const payload = makeValidPayload({ transformationType: null });

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: transformationType missing or invalid",
      payload
    );
  });

  it("fails when action is missing or invalid", () => {
    const payload = makeValidPayload({ action: 123 });

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: action missing or invalid",
      payload
    );
  });

  it("fails when trigger is missing or invalid", () => {
    const payload = makeValidPayload({ trigger: undefined });

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid macro payload: trigger missing or invalid",
      payload
    );
  });

  /* ------------------------------------------------------------------ */
  /* Success case                                                        */
  /* ------------------------------------------------------------------ */

  it("returns true and does not warn for a valid payload", () => {
    const payload = makeValidPayload();

    const result = validateMacroPayload(payload, { logger });

    expect(result).toBe(true);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
