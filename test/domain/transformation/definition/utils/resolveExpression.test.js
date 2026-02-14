import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveExpression } from "@src/domain/transformation/definition/utils/resolveExpression.js";

describe("resolveExpression", () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns numbers unchanged", () => {
    expect(resolveExpression(5)).toBe(5);
  });

  it("returns 0 for non-string, non-number values", () => {
    expect(resolveExpression(null)).toBe(0);
    expect(resolveExpression(undefined)).toBe(0);
    expect(resolveExpression({})).toBe(0);
  });

  it("resolves @variables from context", () => {
    const result = resolveExpression("@a + 2", { a: 3 });
    expect(result).toBe(5);
  });

  it("resolves dotted paths from context", () => {
    const result = resolveExpression(
      "@actor.hp + @actor.temp",
      { actor: { hp: 10, temp: 3 } }
    );
    expect(result).toBe(13);
  });

  it("treats missing variables as 0", () => {
    const result = resolveExpression("@missing + 5", {});
    expect(result).toBe(5);
  });

  it("floors the result of expressions", () => {
    const result = resolveExpression("5 / 2", {});
    expect(result).toBe(2);
  });

  it("rejects unsafe expressions", () => {
    const result = resolveExpression("process.exit()", {});
    expect(result).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("returns 0 when evaluation throws", () => {
    const result = resolveExpression("(", {});
    expect(result).toBe(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("allows parentheses and whitespace", () => {
    const result = resolveExpression("( @a + 3 ) * 2", { a: 2 });
    expect(result).toBe(10);
  });
});
