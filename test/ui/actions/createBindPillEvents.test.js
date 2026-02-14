import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBindPillEvents } from
  "@src/ui/actions/createBindPillEvents.js";

describe("createBindPillEvents", () => {
  let dialogFactory;
  let logger;
  let bindPillEvents;

  beforeEach(() => {
    dialogFactory = {
      openTransformationConfig: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    bindPillEvents = createBindPillEvents({
      dialogFactory,
      logger,
    });
  });

  function makeEvent() {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
  }

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("logs error and exits if pill or app is missing", () => {
    bindPillEvents({
      app: null,
      pill: null,
      pillMode: "add",
    });

    expect(logger.error)
      .toHaveBeenCalledWith(
        "bindPillEvents called without pill or app",
        expect.any(Object)
      );
  });

  it("logs error on invalid pill mode", () => {
    bindPillEvents({
      app: {},
      pill: {},
      pillMode: "explode",
    });

    expect(logger.error)
      .toHaveBeenCalledWith(
        "bindPillEvents called with invalid mode",
        "explode"
      );
  });

  /* ------------------------------------------------------------------ */
  /* Add mode                                                           */
  /* ------------------------------------------------------------------ */

  it("binds click handler in add mode and opens dialog", () => {
    const clickHandlers = [];

    const pill = {
      addEventListener: vi.fn((_, fn) => {
        clickHandlers.push(fn);
      }),
    };

    const app = {
      actor: { id: "actor-1" },
    };

    const transformation = { id: "trans-1" };

    bindPillEvents({
      app,
      pill,
      pillMode: "add",
      transformation,
    });

    expect(clickHandlers).toHaveLength(1);

    const event = makeEvent();
    clickHandlers[0](event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();

    expect(dialogFactory.openTransformationConfig)
      .toHaveBeenCalledWith({
        actor: app.actor,
        transformation,
      });
  });

  /* ------------------------------------------------------------------ */
  /* Stage mode                                                         */
  /* ------------------------------------------------------------------ */

  it("binds click handler on stage button and opens dialog", () => {
    const clickHandlers = [];

    const stageButton = {
      addEventListener: vi.fn((_, fn) => {
        clickHandlers.push(fn);
      }),
    };

    const pill = {
      querySelector: vi.fn(() => stageButton),
    };

    const app = {
      actor: { id: "actor-1" },
    };

    const transformation = { id: "trans-1" };

    bindPillEvents({
      app,
      pill,
      pillMode: "stage",
      transformation,
    });

    expect(stageButton.addEventListener)
      .toHaveBeenCalledWith("click", expect.any(Function));

    const event = makeEvent();
    clickHandlers[0](event);

    expect(dialogFactory.openTransformationConfig)
      .toHaveBeenCalledWith({
        actor: app.actor,
        transformation,
      });
  });

  it("warns if stage button is missing", () => {
    const pill = {
      querySelector: vi.fn(() => null),
    };

    bindPillEvents({
      app: { actor: {} },
      pill,
      pillMode: "stage",
      transformation: {},
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Stage button not found on transformation pill",
        pill
      );
  });
});
