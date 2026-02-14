import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------ */
/* Mock dependencies                                            */
/* ------------------------------------------------------------ */
vi.mock("@src/infrastructure/macros/createMacroContextFactory.js", () => ({
    createMacroContextFactory: vi.fn(),
  }));
  
  vi.mock("@src/macros/createMacroExecutor.js", () => ({
    createMacroExecutor: vi.fn(),
  }));

/* ------------------------------------------------------------ */
/* Import modules AFTER globals + mocks                          */
/* ------------------------------------------------------------ */

import { createMacroContextFactory } from
  "@src/infrastructure/macros/createMacroContextFactory.js";

import { createMacroExecutor } from
  "@src/macros/createMacroExecutor.js";

import { bootstrapMacros } from
    "@src/macros/createMacros.js";

const notify = {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    };

describe("bootstrapMacros", () => {
  let infrastructure;
  let logger;
  let macroExecutor;

  beforeEach(() => {
    infrastructure = {
      actorRepository: {},
      tokenRepository: {},
      itemRepository: {},
      socketGateway: {},
      activeEffectRepository: {},
      macroRegistry: {},
      };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    createMacroContextFactory.mockReturnValue({
      createFromToken: vi.fn(),
    });

    macroExecutor = {
      macroWrapper: vi.fn(),
    };

    createMacroExecutor.mockReturnValue(macroExecutor);
  });

  it("bootstraps macro execution and exposes executeMacro", () => {
    const result = bootstrapMacros({
        infrastructure,
        notify,
        logger,
    });

    expect(createMacroContextFactory)
      .toHaveBeenCalledWith({ logger });

    expect(createMacroExecutor)
      .toHaveBeenCalledWith({
        actorRepository: infrastructure.actorRepository,
        tokenRepository: infrastructure.tokenRepository,
        socketGateway: infrastructure.socketGateway,
        activeEffectRepository: infrastructure.activeEffectRepository,
        itemRepository: infrastructure.itemRepository,
        macroRegistry: infrastructure.macroRegistry,
        macroContextFactory:
          createMacroContextFactory.mock.results[0].value,
        logger,
        notify,
      });

    expect(result).toEqual({
      executeMacro: macroExecutor.macroWrapper,
    });

    expect(Object.isFrozen(result)).toBe(true);
  });
});
