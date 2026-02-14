import { describe, it, expect, vi } from "vitest";
import { createEffectService } from
  "@src/infrastructure/foundry/createEffectService.js";

import { makeActor } from "../../helpers/actorHelper.js";
import { makeEffect } from "../../helpers/effectHelper.js";

describe("createEffectService", () => {
  const logger = { debug: vi.fn() };

  it("removeEffect removes matching effects", async () => {
    const actor = makeActor({
      effects: [
        makeEffect({ id: "1" }),
        makeEffect({ id: "2" })
      ]
    });

    const service = createEffectService({ logger });

    await service.removeEffect(actor, e => e.id === "1");

    expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith(
      "ActiveEffect",
      ["1"]
    );
  });

  it("removeEffectsBySource removes effects by transformation source", async () => {
    const actor = makeActor({
      effects: [
        makeEffect({ id: "1", source: "a" }),
        makeEffect({ id: "2", source: "b" })
      ]
    });

    const service = createEffectService({ logger });

    await service.removeEffectsBySource(actor, "a");

    expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith(
      "ActiveEffect",
      ["1"]
    );
  });

  it("hasEffect returns true when predicate matches", () => {
    const actor = makeActor({
      effects: [
        makeEffect({ id: "1" })
      ]
    });

    const service = createEffectService({ logger });

    expect(
      service.hasEffect(actor, e => e.id === "1")
    ).toBe(true);
  });
});
