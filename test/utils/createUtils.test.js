import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all imported utilities
vi.mock("@src/utils/EffectChangeBuilder.js", () => ({
  EffectChangeBuilder: vi.fn(),
}));

vi.mock("@src/utils/enumUtils.js", () => ({
  enumUtils: vi.fn(),
}));

vi.mock("@src/utils/errorUtils.js", () => ({
  ErrorUtils: vi.fn(),
}));

vi.mock("@src/utils/objectUtils.js", () => ({
  objectUtils: vi.fn(),
}));

vi.mock("@src/utils/stringUtils.js", () => ({
  stringUtils: vi.fn(),
}));

import { createUtils } from "@src/utils/createUtils.js";
import { EffectChangeBuilder } from "@src/utils/EffectChangeBuilder.js";
import { enumUtils } from "@src/utils/enumUtils.js";
import { ErrorUtils } from "@src/utils/errorUtils.js";
import { objectUtils } from "@src/utils/objectUtils.js";
import { stringUtils } from "@src/utils/stringUtils.js";

describe("createUtils", () => {
  let constants;
  let logger;

  beforeEach(() => {
    vi.clearAllMocks();
  
    constants = { SOME: "CONST" };
    logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
  
    EffectChangeBuilder.mockImplementation(function () {
      return "effectChangeBuilder";
    });
  
    enumUtils.mockReturnValue("enumUtils");
    ErrorUtils.mockReturnValue("ErrorUtils");
    objectUtils.mockReturnValue("objectUtils");
    stringUtils.mockReturnValue("stringUtils");
  });

  it("creates and wires all utility modules", () => {
    const utils = createUtils({
      constants,
      logger,
    });

    expect(EffectChangeBuilder)
      .toHaveBeenCalledWith({
        constants,
        logger,
      });

    expect(stringUtils)
      .toHaveBeenCalledWith({ logger });

    expect(objectUtils)
      .toHaveBeenCalledWith({ logger });

    expect(enumUtils)
      .toHaveBeenCalledWith({ logger });

    expect(ErrorUtils)
      .toHaveBeenCalledWith({ logger });

      expect(utils.effectChangeBuilder)
      .toBeInstanceOf(EffectChangeBuilder);
    
    expect(utils).toMatchObject({
      stringUtils: "stringUtils",
      objectUtils: "objectUtils",
      enumUtils: "enumUtils",
      ErrorUtils: "ErrorUtils",
    });
  });

  it("returns a frozen utils object", () => {
    const utils = createUtils({
      constants,
      logger,
    });

    expect(Object.isFrozen(utils)).toBe(true);
  });
});
