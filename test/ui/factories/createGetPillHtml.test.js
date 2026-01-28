import { describe, it, expect, vi } from "vitest";
import { createGetPillHtml } from
  "@src/ui/factories/createGetPillHtml.js";

describe("createGetPillHtml", () => {

  it("throws if renderTemplate is not injected", () => {
    expect(() =>
      createGetPillHtml({
        renderTemplate: null,
        templates: {},
      })
    ).toThrow("renderTemplate was not injected");
  });

  it("throws if actorTransformationPill template is missing", async () => {
    const renderTemplate = vi.fn();

    const getPillHtml = createGetPillHtml({
      renderTemplate,
      templates: {},
    });

    await expect(
      getPillHtml({ foo: "bar" })
    ).rejects.toThrow(
      "actorTransformationPill template not cached"
    );
  });

  it("renders pill HTML using renderTemplate", async () => {
    const html = "<div>Pill</div>";

    const renderTemplate = vi
      .fn()
      .mockResolvedValue(html);

    const getPillHtml = createGetPillHtml({
      renderTemplate,
      templates: {
        actorTransformationPill: "pill.hbs",
      },
      logger: {
        debug: vi.fn(),
      },
    });

    const data = { actorId: "actor-1" };

    const result = await getPillHtml(data);

    expect(renderTemplate).toHaveBeenCalledWith(
      "pill.hbs",
      data
    );

    expect(result).toBe(html);
  });
});
