import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mock domain catalog class                                           */
/* ------------------------------------------------------------------ */

const catalogCtorSpy = vi.fn();

vi.mock("@src/domain/rollTable/RollTableEffectCatalog.js", () => ({
  RollTableEffectCatalog: vi.fn().mockImplementation(
    function (args) {
      catalogCtorSpy(args);
      Object.assign(this, args);
    }
  ),
}));

import { RollTableEffectCatalog } from
  "@src/domain/rollTable/RollTableEffectCatalog.js";

import { createRollTableEffectCatalog } from
  "@src/services/rolltables/createRollTableEffectCatalog.js";

describe("createRollTableEffectCatalog", () => {
  let transformationRegistry;
  let logger;
  let deps;

  beforeEach(() => {
    vi.clearAllMocks();

    transformationRegistry = {
      getAllEntries: vi.fn(),
    };

    logger = {
      warn: vi.fn(),
    };

    deps = {
      transformationRegistry,
      constants: { CONDITION: {} },
      effectChangeBuilder: {},
      chatService: {},
      actorRepository: {},
      logger,
    };
  });

  it("collects roll table effects from transformation registry", () => {
    class EffectA {}
    class EffectB {}

    transformationRegistry.getAllEntries.mockReturnValue([
      {
        TransformationRollTableEffects: {
          EffectA,
        },
      },
      {
        TransformationRollTableEffects: {
          EffectB,
        },
      },
    ]);

    const catalog = createRollTableEffectCatalog(deps);

    expect(RollTableEffectCatalog)
      .toHaveBeenCalledTimes(1);

    expect(catalogCtorSpy)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          effectsByKey: {
            EffectA,
            EffectB,
          },
          constants: deps.constants,
          effectChangeBuilder: deps.effectChangeBuilder,
          chatService: deps.chatService,
          actorRepository: deps.actorRepository,
        })
      );

    expect(Object.isFrozen(catalog)).toBe(true);
  });

  it("warns and skips duplicate effect keys", () => {
    class EffectA1 {}
    class EffectA2 {}

    transformationRegistry.getAllEntries.mockReturnValue([
      {
        TransformationRollTableEffects: {
          DUPLICATE: EffectA1,
        },
      },
      {
        TransformationRollTableEffects: {
          DUPLICATE: EffectA2,
        },
      },
    ]);

    createRollTableEffectCatalog(deps);

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Duplicate roll table effect key",
        "DUPLICATE"
      );

    expect(catalogCtorSpy)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          effectsByKey: {
            DUPLICATE: EffectA1,
          },
        })
      );
  });

  it("ignores registry entries without roll table effects", () => {
    transformationRegistry.getAllEntries.mockReturnValue([
      {},
      { TransformationRollTableEffects: null },
      { TransformationRollTableEffects: undefined },
    ]);

    createRollTableEffectCatalog(deps);

    expect(catalogCtorSpy)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          effectsByKey: {},
        })
      );
  });
});
