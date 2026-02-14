import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTriggerVariableResolver } from
  "@src/services/triggers/createTriggerVariableResolver.js";

describe("createTriggerVariableResolver", () => {
  let formulaEvaluator;
  let logger;
  let resolver;

  beforeEach(() => {
    formulaEvaluator = {
      evaluate: vi.fn(),
    };

    logger = {
      error: vi.fn(),
    };

    resolver = createTriggerVariableResolver({
      formulaEvaluator,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("returns empty object if rawVariables is missing or empty", () => {
    expect(
      resolver.resolve({
        actor: {},
        transformation: {},
        rawVariables: null,
        context: {},
      })
    ).toEqual({});

    expect(
      resolver.resolve({
        actor: {},
        transformation: {},
        rawVariables: [],
        context: {},
      })
    ).toEqual({});
  });

  /* ------------------------------------------------------------------ */
  /* Static variables                                                   */
  /* ------------------------------------------------------------------ */

  it("resolves static variables", () => {
    const result = resolver.resolve({
      actor: {},
      transformation: {},
      rawVariables: [
        { name: "a", type: "static", value: 10 },
        { name: "b", type: "static", value: "test" },
      ],
      context: {},
    });

    expect(result).toEqual({
      a: 10,
      b: "test",
    });
  });

  /* ------------------------------------------------------------------ */
  /* Formula variables                                                  */
  /* ------------------------------------------------------------------ */

  it("resolves formula variables using evaluator and scope", () => {
    formulaEvaluator.evaluate
      .mockReturnValueOnce(5);

    const actor = {
      system: {
        attributes: {
          prof: 3,
        },
      },
    };

    const transformation = {
      stage: 2,
      definition: { id: "def-1" },
    };

    const result = resolver.resolve({
      actor,
      transformation,
      rawVariables: [
        {
          name: "damage",
          type: "formula",
          value: "@prof + @stage",
        },
      ],
      context: { trigger: "hit" },
    });

    expect(formulaEvaluator.evaluate)
  .toHaveBeenCalledWith({
    formula: "@prof + @stage",
    scope: expect.objectContaining({
      actor,
      transformation,
      context: { trigger: "hit" },
      variables: expect.any(Object),
      prof: 3,
      stage: 2,
    }),
  });

    expect(result).toEqual({
      damage: 5,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Variable chaining                                                  */
  /* ------------------------------------------------------------------ */

  it("allows formulas to reference previously resolved variables", () => {
    formulaEvaluator.evaluate
      .mockImplementation(({ formula, scope }) => {
        if (formula === "2") return 2;
        if (formula === "@variables.a + 3") {
          return scope.variables.a + 3;
        }
      });

    const result = resolver.resolve({
      actor: {},
      transformation: {},
      rawVariables: [
        { name: "a", type: "formula", value: "2" },
        { name: "b", type: "formula", value: "@variables.a + 3" },
      ],
      context: {},
    });

    expect(result).toEqual({
      a: 2,
      b: 5,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Error handling                                                     */
  /* ------------------------------------------------------------------ */

  it("logs error and continues when a variable fails", () => {
    formulaEvaluator.evaluate
      .mockImplementation(() => {
        throw new Error("boom");
      });

    const result = resolver.resolve({
      actor: { id: "actor-1" },
      transformation: {
        definition: { id: "def-1" },
      },
      rawVariables: [
        {
          name: "bad",
          type: "formula",
          value: "@missing",
        },
        {
          name: "good",
          type: "static",
          value: 42,
        },
      ],
      context: { trigger: "test" },
    });

    expect(logger.error)
      .toHaveBeenCalledWith(
        "Failed to resolve trigger variable",
        expect.objectContaining({
          variable: expect.objectContaining({
            name: "bad",
          }),
          actorId: "actor-1",
          transformationId: "def-1",
          context: { trigger: "test" },
          err: expect.any(Error),
        })
      );

    expect(result).toEqual({
      good: 42,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen resolver", () => {
    expect(Object.isFrozen(resolver)).toBe(true);
  });
});
