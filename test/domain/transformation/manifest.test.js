import { describe, it, expect, vi, beforeEach } from "vitest";

/* ───────────────────────────────────────────────────────────── */
/* Mock subclasses */
/* ───────────────────────────────────────────────────────────── */

vi.mock(
  "@src/domain/transformation/subclasses/index.js",
  () => ({
    Alpha: {
      Class: { uuid: "alpha-uuid" },
      Definition: "AlphaDefinition",
      Stages: "AlphaStages",
      Triggers: "AlphaTriggers",
      Effects: "AlphaEffects",
      Macros: "AlphaMacros"
    },
    Beta: {
      Class: { uuid: "beta-uuid" },
      Definition: "BetaDefinition",
      Stages: "BetaStages",
      Triggers: "BetaTriggers",
      Effects: "BetaEffects",
      Macros: "BetaMacros"
    }
  })
);

/* ───────────────────────────────────────────────────────────── */

import { registerTransformations } from
  "@src/domain/transformation/manifest.js";

/* ───────────────────────────────────────────────────────────── */

describe("registerTransformations", () => {
  let registry;

  beforeEach(() => {
    registry = {
      register: vi.fn()
    };
  });

  it("registers all transformation subclasses", () => {
    registerTransformations(registry);

    expect(registry.register).toHaveBeenCalledTimes(2);
  });

  it("registers each transformation with correct payload", () => {
    registerTransformations(registry);

    expect(registry.register).toHaveBeenNthCalledWith(1, {
      uuid: "alpha-uuid",
      TransformationClass: expect.any(Object),
      TransformationDefinition: "AlphaDefinition",
      TransformationStages: "AlphaStages",
      TransformationTriggers: "AlphaTriggers",
      TransformationRollTableEffects: "AlphaEffects",
      TransformationMacros: "AlphaMacros"
    });

    expect(registry.register).toHaveBeenNthCalledWith(2, {
      uuid: "beta-uuid",
      TransformationClass: expect.any(Object),
      TransformationDefinition: "BetaDefinition",
      TransformationStages: "BetaStages",
      TransformationTriggers: "BetaTriggers",
      TransformationRollTableEffects: "BetaEffects",
      TransformationMacros: "BetaMacros"
    });
  });
});
