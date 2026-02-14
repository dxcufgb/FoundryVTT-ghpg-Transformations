import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { preloadTemplates } from
  "@src/infrastructure/templates/preloadTemplates.js";

describe("preloadTemplates", () => {
  let originalFoundry;
  let loadTemplates;

  beforeEach(() => {
    loadTemplates = vi.fn().mockResolvedValue(undefined);

    // Preserve any existing global
    originalFoundry = globalThis.foundry;

    globalThis.foundry = {
      applications: {
        handlebars: {
          loadTemplates,
        },
      },
    };
  });

  afterEach(() => {
    // Restore global state
    globalThis.foundry = originalFoundry;
  });

  it("loads all transformation templates", async () => {
    await preloadTemplates();

    expect(loadTemplates).toHaveBeenCalledTimes(1);
    expect(loadTemplates).toHaveBeenCalledWith([
      "modules/transformations/scripts/templates/components/context-menu.hbs",
      "modules/transformations/scripts/templates/components/transformation-pill.hbs",
      "modules/transformations/scripts/templates/dialogs/transformation-choice.hbs",
      "modules/transformations/scripts/templates/dialogs/transformation-config.hbs",
    ]);
  });
});
