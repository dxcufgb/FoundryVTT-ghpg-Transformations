vi.mock("@src/ui/dialogs/TransformationConfigDialog.js", () => {
    const TransformationConfigDialog = vi.fn(function (args) {
      this.render = vi.fn();
      this.args = args;
    });
  
    return { TransformationConfigDialog };
  });
  
  import { describe, it, expect, vi, beforeEach } from "vitest";
  import { createDialogFactory } from
    "@src/ui/dialogs/dialogFactory.js";
  import { TransformationConfigDialog } from
    "@src/ui/dialogs/TransformationConfigDialog.js";
  
  describe("createDialogFactory", () => {
    let controllers;
    let viewModels;
    let logger;
    let dialogFactory;
  
    beforeEach(() => {
      controllers = {
        transformationConfigController: {},
      };
  
      viewModels = {
        createTransformationConfigViewModel: vi.fn(),
      };
  
      logger = {
        warn: vi.fn(),
      };
  
      dialogFactory = createDialogFactory({
        controllers,
        viewModels,
        logger,
      });
    });
  
    it("creates dialog and renders it", () => {
      const actor = { id: "actor-1" };
      const transformations = [{ id: "t1" }];
      const viewModel = { foo: "bar" };
  
      viewModels.createTransformationConfigViewModel
        .mockReturnValue(viewModel);
  
      dialogFactory.openTransformationConfig({
        actor,
        transformations,
      });
  
      expect(TransformationConfigDialog)
        .toHaveBeenCalledWith({
          actorId: actor.id,
          viewModel,
          controller: controllers.transformationConfigController,
          logger,
        });
  
      const instance =
        TransformationConfigDialog.mock.instances[0];
  
      expect(instance.render)
        .toHaveBeenCalledWith(true);
    });
  });
  