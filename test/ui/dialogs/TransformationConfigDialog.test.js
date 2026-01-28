import { TransformationConfigDialog } from
  "@src/ui/dialogs/TransformationConfigDialog.js";

it("applies selected transformation and closes dialog on save", async () => {
  const controller = {
    applySelection: vi.fn().mockResolvedValue(undefined),
  };

  const logger = {
    debug: vi.fn(),
  };

  const dialog = new TransformationConfigDialog({
    actorId: "actor-1",
    viewModel: {},
    controller,
    logger,
  });

  dialog.close = vi.fn();

  const preventDefault = vi.fn();

  const get = vi.fn().mockReturnValue("transformation-1");

  global.FormData = vi.fn(function () {
    this.get = get;
  });

  await dialog._handleSave(
    { preventDefault },
    { form: {} }
  );

  expect(preventDefault).toHaveBeenCalled();

  expect(controller.applySelection)
    .toHaveBeenCalledWith({
      actorId: "actor-1",
      transformationId: "transformation-1",
    });

  expect(dialog.close).toHaveBeenCalled();
});
