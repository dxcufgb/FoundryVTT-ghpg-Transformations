import { describe, it, expect } from "vitest";
import { enumUtils } from "@src/utils/enumUtils.js";

describe("enumUtils", () => {
  it("returns true when enum contains the identifier", () => {
    const { enumContains } = enumUtils({ logger: {} });

    const TEST_ENUM = {
      A: "a",
      B: "b",
      C: "c",
    };

    expect(enumContains(TEST_ENUM, "a")).toBe(true);
    expect(enumContains(TEST_ENUM, "b")).toBe(true);
    expect(enumContains(TEST_ENUM, "c")).toBe(true);
  });

  it("returns false when enum does not contain the identifier", () => {
    const { enumContains } = enumUtils({ logger: {} });

    const TEST_ENUM = {
      A: "a",
      B: "b",
    };

    expect(enumContains(TEST_ENUM, "c")).toBe(false);
    expect(enumContains(TEST_ENUM, null)).toBe(false);
    expect(enumContains(TEST_ENUM, undefined)).toBe(false);
  });

  it("works with numeric enum values", () => {
    const { enumContains } = enumUtils({ logger: {} });

    const NUM_ENUM = {
      ZERO: 0,
      ONE: 1,
      TWO: 2,
    };

    expect(enumContains(NUM_ENUM, 1)).toBe(true);
    expect(enumContains(NUM_ENUM, 3)).toBe(false);
  });

  it("does not mutate the enum container", () => {
    const { enumContains } = enumUtils({ logger: {} });

    const TEST_ENUM = {
      A: "a",
      B: "b",
    };

    enumContains(TEST_ENUM, "a");

    expect(TEST_ENUM).toEqual({
      A: "a",
      B: "b",
    });
  });
});
