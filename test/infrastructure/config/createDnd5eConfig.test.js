import { describe, it, expect, beforeEach } from "vitest";
import { createDnd5eConfig } from
  "@src/infrastructure/config/createDnd5eConfig.js";

describe("createDnd5eConfig", () => {
  beforeEach(() => {
    global.CONFIG = {
      DND5E: {
        featureTypes: {},
        characterFlags: {}
      }
    };
  });

  it("registers transformation feature type and character flags", () => {
    const constants = {
      TRANSFORMATION_FEATURE: "Transformation Feature"
    };

    const transformationSubTypes = {
      beast: "Beast",
      dragon: "Dragon"
    };

    createDnd5eConfig({
      constants,
      transformationSubTypes
    });

    // featureTypes
    expect(CONFIG.DND5E.featureTypes.transformation).toEqual({
      label: "Transformation Feature",
      subtypes: transformationSubTypes
    });

    // characterFlags.transformations
    expect(CONFIG.DND5E.characterFlags.transformations).toEqual({
      type: String,
      choices: transformationSubTypes,
      name: "Transformation",
      hint: "Transformation active on the character",
      section: "Transformations"
    });

    // characterFlags.transformationStage
    expect(CONFIG.DND5E.characterFlags.transformationStage).toEqual({
      type: Number,
      choices: { 1: "1", 2: "2", 3: "3", 4: "4" },
      name: "Transformation Stage",
      hint: "Stage of active transformation",
      section: "Transformations"
    });
  });
});
