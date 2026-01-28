import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformationPillRenderer } from
  "@src/ui/renderers/transformationPillRenderer.js";

describe("createTransformationPillRenderer", () => {
  let renderTemplate;
  let templates;
  let logger;
  let renderer;

  beforeEach(() => {
    renderTemplate = vi.fn().mockResolvedValue("<div>Pill</div>");

    templates = {
      actorTransformationPill: "pill-template.hbs",
    };

    logger = {
      debug: vi.fn(),
    };

    renderer = createTransformationPillRenderer({
      renderTemplate,
      templates,
      logger,
    });
  });

  it("returns null when viewModel is missing", async () => {
    const result = await renderer.render(null);

    expect(result).toBeNull();
    expect(renderTemplate).not.toHaveBeenCalled();
  });

  it("renders the transformation pill template with the view model", async () => {
    const viewModel = {
      mode: "stage",
      stage: 2,
    };

    const result = await renderer.render(viewModel);

    expect(renderTemplate).toHaveBeenCalledWith(
      templates.actorTransformationPill,
      viewModel
    );

    expect(result).toBe("<div>Pill</div>");
  });
});
