import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@src/domain/transformation/definition/utils/resolveExpression.js", () => ({
  resolveExpression: vi.fn()
}));

import { resolveExpression } from "@src/domain/transformation/definition/utils/resolveExpression.js";
import { interpolateMessage } from "@src/domain/transformation/definition/utils/interpolateMessage.js";


describe("interpolateMessage", () => {
    beforeEach(() => {
      resolveExpression.mockReset();
    });
  
    it("replaces a single @expression", () => {
        resolveExpression.mockReturnValue("42");
      
        const result = interpolateMessage(
          "The answer is @value.",
          { value: 42 }
        );
      
        expect(resolveExpression).toHaveBeenCalledWith(
          "@value.",
          { value: 42 }
        );
      
        expect(result).toBe("The answer is 42");
    });
  
    it("replaces multiple @expressions", () => {
      resolveExpression
        .mockReturnValueOnce("Alice")
        .mockReturnValueOnce("Bob");
  
      const result = interpolateMessage(
        "@a meets @b.",
        { a: "Alice", b: "Bob" }
      );
  
      expect(resolveExpression).toHaveBeenCalledTimes(2);
      expect(result).toBe("Alice meets Bob");
    });
  
    it("supports dotted expressions", () => {
      resolveExpression.mockReturnValue("10");
  
      const result = interpolateMessage(
        "HP: @actor.hp",
        { actor: { hp: 10 } }
      );
  
      expect(resolveExpression).toHaveBeenCalledWith(
        "@actor.hp",
        expect.any(Object)
      );
  
      expect(result).toBe("HP: 10");
    });
  
    it("replaces null or undefined values with an empty string", () => {
      resolveExpression.mockReturnValue(null);
  
      const result = interpolateMessage(
        "Value: @missing",
        {}
      );
  
      expect(result).toBe("Value: ");
    });
  
    it("leaves text without expressions unchanged", () => {
      const result = interpolateMessage(
        "Nothing to see here.",
        {}
      );
  
      expect(resolveExpression).not.toHaveBeenCalled();
      expect(result).toBe("Nothing to see here.");
    });
  });
  