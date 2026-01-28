import { describe, it, expect } from "vitest";
import { stringUtils } from "@src/utils/stringUtils.js";

describe("stringUtils", () => {
  const { capitalize, humanizeClassName } =
    stringUtils({ logger: {} });

  /* ------------------------------------------------------------------ */
  /* capitalize                                                         */
  /* ------------------------------------------------------------------ */

  describe("capitalize", () => {
    it("capitalizes the first character of a string", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("does not alter the rest of the string", () => {
      expect(capitalize("hELLO")).toBe("HELLO");
    });

    it("works with a single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("empty string returns empty", () => {
      expect(capitalize("")).toBe("");
    });
  });

  /* ------------------------------------------------------------------ */
  /* humanizeClassName                                                   */
  /* ------------------------------------------------------------------ */

  describe("humanizeClassName", () => {
    it("adds spaces between camelCase words", () => {
      expect(humanizeClassName("someClassName"))
        .toBe("some Class Name");
    });

    it("adds spaces between PascalCase words", () => {
      expect(humanizeClassName("SomeClassName"))
        .toBe("Some Class Name");
    });

    it("returns the same string if no word boundaries exist", () => {
      expect(humanizeClassName("simple"))
        .toBe("simple");
    });

    it("does not lowercase or uppercase characters", () => {
      expect(humanizeClassName("myClassName"))
        .toBe("my Class Name");
    });
  });
});
