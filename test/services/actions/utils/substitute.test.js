import { describe, it, expect } from "vitest";
import { substitute } from
  "@src/services/actions/utils/substitute.js";

describe("substitute", () => {
  /* ------------------------------------------------------------------ */
  /* Non-string handling                                                */
  /* ------------------------------------------------------------------ */

  it("returns non-string expressions unchanged", () => {
    expect(substitute(5, {})).toBe(5);
    expect(substitute(null, {})).toBeNull();
    expect(substitute(undefined, {})).toBeUndefined();
    expect(substitute({ foo: "bar" }, {}))
      .toEqual({ foo: "bar" });
  });

  /* ------------------------------------------------------------------ */
  /* Basic substitution                                                 */
  /* ------------------------------------------------------------------ */

  it("substitutes simple variables", () => {
    const result = substitute(
      "Value is @value",
      { value: 42 }
    );

    expect(result).toBe("Value is 42");
  });

  it("supports nested paths", () => {
    const result = substitute(
      "Actor HP: @actor.hp",
      {
        actor: { hp: 15 },
      }
    );

    expect(result).toBe("Actor HP: 15");
  });

  it("substitutes multiple variables in one expression", () => {
    const result = substitute(
      "@a + @b = @sum",
      {
        a: 2,
        b: 3,
        sum: 5,
      }
    );

    expect(result).toBe("2 + 3 = 5");
  });

  /* ------------------------------------------------------------------ */
  /* Value coercion                                                     */
  /* ------------------------------------------------------------------ */

  it("stringifies non-string values", () => {
    const result = substitute(
      "Active: @active, Count: @count",
      {
        active: false,
        count: 0,
      }
    );

    expect(result).toBe(
      "Active: false, Count: 0"
    );
  });

  /* ------------------------------------------------------------------ */
  /* Error handling                                                     */
  /* ------------------------------------------------------------------ */

  it("throws if a variable cannot be resolved", () => {
    expect(() =>
      substitute(
        "Missing @foo",
        {}
      )
    ).toThrowError(
      "Unresolved variable '@foo' in expression 'Missing @foo'"
    );
  });

  it("throws if a nested path cannot be resolved", () => {
    expect(() =>
      substitute(
        "HP: @actor.hp",
        { actor: {} }
      )
    ).toThrowError(
      "Unresolved variable '@actor.hp' in expression 'HP: @actor.hp'"
    );
  });

  /* ------------------------------------------------------------------ */
  /* No-op cases                                                        */
  /* ------------------------------------------------------------------ */

  it("returns the original string if no placeholders exist", () => {
    const result = substitute(
      "Nothing to replace here",
      { foo: "bar" }
    );

    expect(result).toBe("Nothing to replace here");
  });
});
