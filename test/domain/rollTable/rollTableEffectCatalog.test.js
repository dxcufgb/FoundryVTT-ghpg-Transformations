import { describe, it, expect, vi } from "vitest";
import { RollTableEffectCatalog } from "@src/domain/rollTable/RollTableEffectCatalog.js";

describe("RollTableEffectCatalog", () => {
  it("creates an instance of the effect class for a known key", () => {
    // Arrange
    const constructorArgs = {};
    const FakeEffectClass = vi.fn(function (args) {
      Object.assign(constructorArgs, args);
    });

    const catalog = new RollTableEffectCatalog({
      effectsByKey: {
        testEffect: FakeEffectClass
      }
    });

    const deps = {
      effectKey: "testEffect",
      actor: { id: "actor1" },
      effectChangeBuilder: {},
      activeEffectRepository: {},
      chatService: {},
      actorRepository: {},
      constants: {},
      stringUtils: {},
      moduleFolderPath: "icons/test.png"
    };

    // Act
    const instance = catalog.createInstance(deps);

    // Assert
    expect(instance).toBeInstanceOf(FakeEffectClass);
    expect(FakeEffectClass).toHaveBeenCalledWith({
      actor: deps.actor,
      constants: deps.constants,
      activeEffectRepository: deps.activeEffectRepository,
      effectChangeBuilder: deps.effectChangeBuilder,
      chatService: deps.chatService,
      actorRepository: deps.actorRepository,
      stringUtils: deps.stringUtils,
      moduleFolderPath: deps.moduleFolderPath
    });
  });

  it("returns null when the effect key is not registered", () => {
    const catalog = new RollTableEffectCatalog({
      effectsByKey: {}
    });

    const instance = catalog.createInstance({
      effectKey: "missingEffect"
    });

    expect(instance).toBeNull();
  });
});
