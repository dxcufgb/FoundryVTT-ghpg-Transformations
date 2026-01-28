import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerDnd5eHooks } from "@src/infrastructure/hooks/dnd5eHooks.js";
import { flushPromises } from "../../helpers/flushHelper.js";

describe("registerDnd5eHooks", () => {
  let hooks;
  let triggerRuntime;
  let transformationService;
  let logger;

  beforeEach(() => {
    hooks = {};
    global.Hooks = {
      on: vi.fn((event, fn) => {
        hooks[event] = fn;
      })
    };

    triggerRuntime = {
      run: vi.fn()
    };

    transformationService = {
      onHitDieRoll: vi.fn(),
      onPreSavingThrow: vi.fn(),
      onSavingThrow: vi.fn()
    };

    logger = {
      debug: vi.fn()
    };

    registerDnd5eHooks({
      transformationService,
      triggerRuntime,
      logger
    });
  });

  it("runs damage trigger on dnd5e.damageActor", async () => {
    const actor = { id: "a1" };

    hooks["dnd5e.damageActor"](actor);
    await flushPromises();

    expect(triggerRuntime.run)
      .toHaveBeenCalledWith("damage", actor);
  });

  it("runs shortRest trigger on short rest", async () => {
    const actor = { id: "a1" };

    hooks["dnd5e.restCompleted"](actor, { type: "short" });
    await flushPromises();

    expect(triggerRuntime.run)
      .toHaveBeenCalledWith("shortRest", actor);
  });

  it("runs longRest trigger on long rest", async () => {
    const actor = { id: "a1" };

    hooks["dnd5e.restCompleted"](actor, { longRest: true });
    await flushPromises();

    expect(triggerRuntime.run)
      .toHaveBeenCalledWith("longRest", actor);
  });

  it("runs initiative trigger on roll initiative", async () => {
    const actor = { id: "a1" };

    hooks["dnd5e.rollInitiative"](actor);
    await flushPromises();

    expect(triggerRuntime.run)
      .toHaveBeenCalledWith("initiative", actor);
  });

  it("runs concentration trigger only for concentration spells", async () => {
    const actor = { id: "a1" };
    const spell = {
      type: "spell",
      system: {
        duration: { concentration: true }
      }
    };

    hooks["dnd5e.beginConcentrating"](actor, spell);
    await flushPromises();

    expect(triggerRuntime.run)
      .toHaveBeenCalledWith("concentration", actor);
  });

  it("does not run concentration trigger for non-spells", async () => {
    const actor = { id: "a1" };
    const item = { type: "feat" };

    hooks["dnd5e.beginConcentrating"](actor, item);
    await flushPromises();

    expect(triggerRuntime.run).not.toHaveBeenCalled();
  });

  it("delegates hit die rolls to transformationService", async () => {
    const context = { actor: { id: "a1" } };

    hooks["dnd5e.preRollHitDieV2"](context);
    await flushPromises();

    expect(transformationService.onHitDieRoll)
      .toHaveBeenCalledWith(context);
  });

  it("delegates saving throws only for spells", async () => {
    const context = {
      workflow: {
        item: { type: "spell" }
      }
    };

    hooks["dnd5e.preRollSavingThrow"](context);
    await flushPromises();

    expect(transformationService.onPreSavingThrow)
      .toHaveBeenCalledWith(context);
  });

  it("ignores non-spell saving throws", async () => {
    const context = {
      workflow: {
        item: { type: "feat" }
      }
    };

    hooks["dnd5e.preRollSavingThrow"](context);
    await flushPromises();

    expect(transformationService.onPreSavingThrow)
      .not.toHaveBeenCalled();
  });
});
