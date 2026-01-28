import { describe, it, expect } from "vitest";
import { canShowTransformationControls } from
  "@src/ui/policies/canShowTransformationControls.js";

describe("canShowTransformationControls", () => {

  class FakeActor {}

  it("returns false if app.document is not an ActorClass instance", () => {
    const app = {
      document: {},
      actor: { type: "character" },
    };

    expect(
      canShowTransformationControls({
        app,
        ActorClass: FakeActor,
      })
    ).toBe(false);
  });

  it("returns false if app.actor is missing", () => {
    const app = {
      document: new FakeActor(),
      actor: null,
    };

    expect(
      canShowTransformationControls({
        app,
        ActorClass: FakeActor,
      })
    ).toBe(false);
  });

  it("returns false if actor type is not character", () => {
    const app = {
      document: new FakeActor(),
      actor: { type: "npc" },
    };

    expect(
      canShowTransformationControls({
        app,
        ActorClass: FakeActor,
      })
    ).toBe(false);
  });

  it("returns true for a character actor document", () => {
    const actor = { type: "character" };

    const app = {
      document: new FakeActor(),
      actor,
    };

    expect(
      canShowTransformationControls({
        app,
        ActorClass: FakeActor,
      })
    ).toBe(true);
  });
});
