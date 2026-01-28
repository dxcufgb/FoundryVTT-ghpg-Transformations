import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransformationChoiceDialog } from
  "@src/ui/dialogs/TransformationChoiceDialog.js";

describe("TransformationChoiceDialog", () => {
  let choices;
  let onResolve;
  let dialog;

  beforeEach(() => {
    choices = [
      { id: "t1", label: "One" },
      { id: "t2", label: "Two" },
    ];

    onResolve = vi.fn();

    dialog = new TransformationChoiceDialog({
      choices,
      onResolve,
    });
  });

  it("stores choices and onResolve", () => {
    expect(dialog.choices).toBe(choices);
    expect(dialog.onResolve).toBe(onResolve);
  });

  it("returns choices from getData()", () => {
    expect(dialog.getData()).toEqual({ choices });
  });

  it("resolves choice and closes dialog on click", () => {
    let clickHandler;

    const html = {
      find: vi.fn(() => ({
        on: vi.fn((event, handler) => {
          if (event === "click") {
            clickHandler = handler;
          }
        }),
      })),
    };

    dialog.close = vi.fn();

    dialog.activateListeners(html);

    clickHandler({
      currentTarget: {
        dataset: { choice: "t2" },
      },
    });

    expect(onResolve).toHaveBeenCalledWith("t2");
    expect(dialog.close).toHaveBeenCalled();
  });
});
