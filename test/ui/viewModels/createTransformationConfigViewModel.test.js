import { describe, it, expect } from "vitest";
import { createTransformationConfigViewModel } from
  "@src/ui/viewModels/createTransformationConfigViewModel.js";

describe("createTransformationConfigViewModel", () => {
  it("marks 'None' as active when actor has no transformation", () => {
    const actor = {
      id: "actor-1",
      name: "Clara",
      flags: {},
    };

    const transformations = [
      {
        itemId: "wolf",
        definition: {
          name: "Wolf Form",
          img: "wolf.png",
        },
      },
    ];

    const vm = createTransformationConfigViewModel({
      actor,
      transformations,
    });

    expect(vm.selectedTransformation).toBe("None");

    expect(vm.transformations[0]).toEqual({
      itemId: "None",
      name: "None",
      active: true,
      img: "systems/dnd5e/icons/svg/statuses/incapacitated.svg",
    });

    expect(vm.transformations[1].active).toBe(false);
  });

  it("marks the active transformation based on actor flags", () => {
    const actor = {
      id: "actor-1",
      name: "Clara",
      flags: {
        dnd5e: {
          transformations: "wolf",
        },
      },
    };

    const transformations = [
      {
        itemId: "wolf",
        definition: {
          name: "Wolf Form",
          img: "wolf.png",
        },
      },
      {
        itemId: "bear",
        definition: {
          name: "Bear Form",
          img: "bear.png",
        },
      },
    ];

    const vm = createTransformationConfigViewModel({
      actor,
      transformations,
    });

    expect(vm.selectedTransformation).toBe("wolf");

    const none = vm.transformations.find(t => t.itemId === "None");
    const wolf = vm.transformations.find(t => t.itemId === "wolf");
    const bear = vm.transformations.find(t => t.itemId === "bear");

    expect(none.active).toBe(false);
    expect(wolf.active).toBe(true);
    expect(bear.active).toBe(false);
  });

  it("exposes actor id and name only", () => {
    const actor = {
      id: "actor-123",
      name: "Test Actor",
      flags: {},
      system: { hp: 10 },
    };

    const vm = createTransformationConfigViewModel({
      actor,
      transformations: [],
    });

    expect(vm.actor).toEqual({
      id: "actor-123",
      name: "Test Actor",
    });
  });

  it("always includes the 'None' option first", () => {
    const actor = {
      id: "actor-1",
      name: "Clara",
      flags: {},
    };

    const vm = createTransformationConfigViewModel({
      actor,
      transformations: [],
    });

    expect(vm.transformations[0].itemId).toBe("None");
  });
});
