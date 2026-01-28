import { describe, it, expect } from "vitest";
import { createTransformationPillViewModel } from
  "@src/ui/viewModels/createTransformationPillViewModel.js";

describe("createTransformationPillViewModel", () => {
  it("returns add-mode view model when no transformation is present", () => {
    const actor = { id: "actor-1" };

    const vm = createTransformationPillViewModel({
      actor,
      transformation: null,
      editable: true,
    });

    expect(vm).toEqual({
      mode: "add",
      label: "None",
      editable: true,
      data: null,
    });
  });

  it("returns stage-mode view model when transformation is present", () => {
    const actor = { id: "actor-1" };

    const transformation = {
      itemId: "wolf",
      stage: 2,
      definition: {
        name: "Wolf Form",
        uuid: "Compendium.test.wolf",
        img: "wolf.png",
      },
    };

    const vm = createTransformationPillViewModel({
      actor,
      transformation,
      editable: false,
    });

    expect(vm).toEqual({
      mode: "stage",
      label: "Wolf Form",
      editable: false,
      data: {
        itemId: "wolf",
        uuid: "Compendium.test.wolf",
        img: "wolf.png",
        stage: 2,
      },
    });
  });

  it("passes editable flag through unchanged", () => {
    const vm = createTransformationPillViewModel({
      actor: {},
      transformation: null,
      editable: false,
    });

    expect(vm.editable).toBe(false);
  });

  it("does not leak transformation object into the view model", () => {
    const transformation = {
      itemId: "wolf",
      stage: 1,
      definition: {
        name: "Wolf",
        uuid: "uuid",
        img: "img.png",
      },
      secretInternalStuff: "nope",
    };

    const vm = createTransformationPillViewModel({
      actor: {},
      transformation,
      editable: true,
    });

    expect(vm.data.secretInternalStuff).toBeUndefined();
  });
});