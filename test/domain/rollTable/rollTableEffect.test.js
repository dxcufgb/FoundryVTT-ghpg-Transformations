import { describe, it, expect, vi, beforeEach } from "vitest";
import { RollTableEffect } from "@src/domain/rollTable/RollTableEffect.js";

describe("RollTableEffect", () => {
  let deps;

  beforeEach(() => {
    deps = {
      actor: { id: "actor1" },
      effectChangeBuilder: {},
      activeEffectRepository: {
        create: vi.fn()
      },
      actorRepository: {},
      constants: {},
      chatService: {
        post: vi.fn()
      },
      stringUtils: {
        humanizeClassName: vi.fn(name => `Human ${name}`)
      },
      moduleFolderPath: "icons/test.png"
    };

    global.ChatMessage = {
      getSpeaker: vi.fn(() => ({ actor: "actor1" }))
    };
  });

  describe("static meta", () => {
    it("provides default meta with key.name equal to class name", () => {
      class TestEffect extends RollTableEffect {}

      const meta = TestEffect.meta;

      expect(meta.key.name).toBe("TestEffect");
    });

    it("respects subclass-defined meta", () => {
      class TestEffect extends RollTableEffect {}
      TestEffect.meta = {
        key: { name: "CustomName" }
      };

      const meta = TestEffect.meta;

      expect(meta.key.name).toBe("CustomName");
    });
  });

  describe("constructor", () => {
    it("initializes default state", () => {
      const effect = new RollTableEffect(deps);

      expect(effect.actor).toBe(deps.actor);
      expect(effect.effects).toEqual([]);
      expect(effect.flags).toEqual({ transformations: {} });
      expect(effect.description).toBe("");
      expect(effect.runActiveEffect).toBe(true);
    });
  });

  describe("apply()", () => {
    it("creates an active effect by default", async () => {
      const effect = new RollTableEffect(deps);
      effect.effects = [{ key: "data.hp", value: 5 }];

      await effect.apply();

      expect(deps.activeEffectRepository.create).toHaveBeenCalledWith({
        actor: deps.actor,
        name: "Human RollTableEffect",
        description: "",
        icon: "icons/test.png",
        changes: effect.effects,
        flags: effect.flags
      });
    });

    it("does not create an active effect when runActiveEffect is false", async () => {
      const effect = new RollTableEffect(deps);
      effect.runActiveEffect = false;

      await effect.apply();

      expect(deps.activeEffectRepository.create).not.toHaveBeenCalled();
    });

    it("calls beforeApply and afterApply hooks", async () => {
      const effect = new RollTableEffect(deps);
      effect.beforeApply = vi.fn();
      effect.afterApply = vi.fn();

      await effect.apply();

      expect(effect.beforeApply).toHaveBeenCalled();
      expect(effect.afterApply).toHaveBeenCalled();
    });
  });

  describe("effect helpers", () => {
    it("adds effects via addEffects", () => {
      const effect = new RollTableEffect(deps);

      effect.addEffects([{ a: 1 }]);
      effect.addEffects([{ b: 2 }]);

      expect(effect.effects).toEqual([{ a: 1 }, { b: 2 }]);
    });

    it("adds flags via addFlag", () => {
      const effect = new RollTableEffect(deps);

      effect.addFlag("testFlag", true);

      expect(effect.flags.transformations.testFlag).toBe(true);
    });
  });

  describe("getIconPath", () => {
    it("returns the module folder path", () => {
      const effect = new RollTableEffect(deps);

      expect(effect.getIconPath()).toBe("icons/test.png");
    });
  });

  describe("postChat", () => {
    it("posts a chat message when chatService exists", async () => {
      const effect = new RollTableEffect(deps);

      await effect.postChat({ content: "Hello" });

      expect(deps.chatService.post).toHaveBeenCalledWith({
        speaker: { actor: "actor1" },
        content: "Hello",
        flavor: null,
        whisper: null
      });
    });

    it("does nothing if chatService is missing", async () => {
      const effect = new RollTableEffect({
        ...deps,
        chatService: null
      });

      await expect(
        effect.postChat({ content: "Hello" })
      ).resolves.not.toThrow();
    });
  });
});
