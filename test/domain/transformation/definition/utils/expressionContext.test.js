import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@src/domain/transformation/definition/utils/resolveExpression.js", () => ({
  resolveExpression: vi.fn()
}));

import { resolveExpression } from "@src/domain/transformation/definition/utils/resolveExpression.js";
import { buildExpressionContext } from "@src/domain/transformation/definition/utils/expressionContext.js";

describe("buildExpressionContext", () => {
    beforeEach(() => {
      resolveExpression.mockReset();
    });
  
    function makeActor(overrides = {}) {
      return {
        name: "Test Actor",
        system: {
          attributes: {
            prof: 3,
            hp: { value: 10, max: 20, temp: 5 }
          },
          details: {
            level: 7
          }
        },
        flags: {
          dnd5e: {
            transformationStage: 2,
            transformations: "transformation-id"
          }
        },
        ...overrides
      };
    }
  
    it("builds the base context from actor and context", () => {
      const actor = makeActor();
      const context = { stage: 4 };
  
      const result = buildExpressionContext(actor, context);
  
      expect(result).toMatchObject({
        stage: 4,
        prof: 3,
        level: 7,
  
        transformation: {
          stage: 4
        },
  
        actor: {
          name: "Test Actor",
          hp: 10,
          maxHp: 20,
          tempHp: 5,
          level: 7
        },
  
        flags: {
          dnd5e: {
            transformationStage: 2
          },
          transformations: {
            id: "transformation-id"
          }
        }
      });
    });
  
    it("uses defaults when actor data is missing", () => {
      const actor = {
        name: "Bare Actor",
        system: {},
        flags: {}
      };
  
      const result = buildExpressionContext(actor);
  
      expect(result.stage).toBe(1);
      expect(result.prof).toBe(0);
      expect(result.level).toBe(1);
  
      expect(result.actor.hp).toBe(0);
      expect(result.actor.maxHp).toBe(0);
      expect(result.actor.tempHp).toBe(0);
    });
  
    it("evaluates derived expressions and adds them to the context", () => {
      const actor = makeActor();
      const context = {
        stage: 2,
        derived: {
          power: "actor.level * 2"
        }
      };
  
      resolveExpression.mockReturnValue(14);
  
      const result = buildExpressionContext(actor, context);
  
      expect(resolveExpression).toHaveBeenCalledWith(
        "actor.level * 2",
        expect.any(Object)
      );
  
      expect(result.power).toBe(14);
    });
  
    it("evaluates multiple derived expressions", () => {
      const actor = makeActor();
      const context = {
        derived: {
          a: "1",
          b: "2"
        }
      };
  
      resolveExpression
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);
  
      const result = buildExpressionContext(actor, context);
  
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });
  });
  
