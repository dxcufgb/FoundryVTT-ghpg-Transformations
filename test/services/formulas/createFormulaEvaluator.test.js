import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mock substitute                                                     */
/* ------------------------------------------------------------------ */

vi.mock("@src/services/actions/utils/substitute.js", () => ({
  substitute: vi.fn(),
}));

import { substitute } from
  "@src/services/actions/utils/substitute.js";

import { createFormulaEvaluator } from
  "@src/services/formulas/createFormulaEvaluator.js";

describe("createFormulaEvaluator", () => {
  let logger;
  let evaluator;

  beforeEach(() => {
    logger = {
      error: vi.fn(),
    };

    // Stub Foundry Roll
    globalThis.Roll = {
      safeEval: vi.fn(),
    };

    evaluator = createFormulaEvaluator({ logger });
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("returns null if formula is falsy", () => {
    expect(
      evaluator.evaluate({ formula: null, scope: {} })
    ).toBeNull();
  });

  /* ------------------------------------------------------------------ */
  /* Happy path                                                         */
  /* ------------------------------------------------------------------ */

  it("substitutes and evaluates formula", () => {
    substitute.mockReturnValue("2 + 3");
    Roll.safeEval.mockReturnValue(5);

    const result = evaluator.evaluate({
      formula: "@a + @b",
      scope: { a: 2, b: 3 },
    });

    expect(substitute)
      .toHaveBeenCalledWith(
        "@a + @b",
        { a: 2, b: 3 }
      );

    expect(Roll.safeEval)
      .toHaveBeenCalledWith("2 + 3");

    expect(result).toBe(5);
  });

  /* ------------------------------------------------------------------ */
  /* Error handling                                                     */
  /* ------------------------------------------------------------------ */

  it("returns null and logs if substitute throws", () => {
    substitute.mockImplementation(() => {
      throw new Error("bad substitute");
    });

    const result = evaluator.evaluate({
      formula: "@missing",
      scope: {},
    });

    expect(result).toBeNull();

    expect(logger.error)
      .toHaveBeenCalledWith(
        "Formula evaluation failed",
        expect.objectContaining({
          formula: "@missing",
          scope: {},
          err: expect.any(Error),
        })
      );
  });

  it("returns null and logs if Roll.safeEval throws", () => {
    substitute.mockReturnValue("2 +");
    Roll.safeEval.mockImplementation(() => {
      throw new Error("bad eval");
    });

    const result = evaluator.evaluate({
      formula: "2 +",
      scope: {},
    });

    expect(result).toBeNull();

    expect(logger.error)
      .toHaveBeenCalledWith(
        "Formula evaluation failed",
        expect.objectContaining({
          formula: "2 +",
          scope: {},
          err: expect.any(Error),
        })
      );
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen evaluator", () => {
    expect(Object.isFrozen(evaluator)).toBe(true);
  });
});
