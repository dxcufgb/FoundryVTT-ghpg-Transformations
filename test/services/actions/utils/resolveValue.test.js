import { describe, it, expect } from "vitest";
import { resolveValue } from
  "@src/services/actions/utils/resolveValue.js";

describe("resolveValue", () => {
  /* ------------------------------------------------------------------ */
  /* Primitive handling                                                 */
  /* ------------------------------------------------------------------ */

  it("returns numbers as-is", () => {
    expect(resolveValue(5, {})).toBe(5);
    expect(resolveValue(0, {})).toBe(0);
    expect(resolveValue(-3, {})).toBe(-3);
  });

  it("returns null for non-string, non-number values", () => {
    expect(resolveValue(null, {})).toBeNull();
    expect(resolveValue(undefined, {})).toBeNull();
    expect(resolveValue({}, {})).toBeNull();
    expect(resolveValue([], {})).toBeNull();
  });

  /* ------------------------------------------------------------------ */
  /* Variable resolution                                                */
  /* ------------------------------------------------------------------ */

  it("resolves simple variables from context", () => {
    const context = { hp: 10 };

    expect(resolveValue("@hp", context)).toBe(10);
  });

  it("resolves nested paths from context", () => {
    const context = {
      actor: { hp: 12 },
    };

    expect(resolveValue("@actor.hp", context)).toBe(12);
  });

  it("replaces missing paths with 0", () => {
    const context = {};

    expect(resolveValue("@missing", context)).toBe(0);
  });

  it("replaces non-numeric values with 0", () => {
    const context = { foo: "bar" };

    expect(resolveValue("@foo", context)).toBe(0);
  });

  /* ------------------------------------------------------------------ */
  /* Expression evaluation                                              */
  /* ------------------------------------------------------------------ */

  it("evaluates arithmetic expressions", () => {
    const context = { a: 5, b: 3 };

    expect(resolveValue("@a + @b", context)).toBe(8);
    expect(resolveValue("@a * 2", context)).toBe(10);
    expect(resolveValue("@a - @b", context)).toBe(2);
  });

  it("supports nested variables in expressions", () => {
    const context = {
      actor: { hp: 20 },
      damage: 7,
    };

    expect(
      resolveValue("@actor.hp - @damage", context)
    ).toBe(13);
  });

  it("treats missing variables as 0 in expressions", () => {
    const context = { a: 5 };

    expect(resolveValue("@a + @b", context)).toBe(5);
  });

  /* ------------------------------------------------------------------ */
  /* Invalid expressions                                                */
  /* ------------------------------------------------------------------ */

  it("returns null for invalid expressions", () => {
    const context = { a: 5 };

    expect(
      resolveValue("@a +", context)
    ).toBeNull();

    expect(
      resolveValue("(", context)
    ).toBeNull();
  });
});
