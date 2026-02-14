import { describe, it, expect } from "vitest";
import { interpolate } from
  "@src/services/actions/utils/interpolate.js";

describe("interpolate", () => {
  it("replaces simple variables", () => {
    const result = interpolate(
      "Hello @actor.name",
      {
        actor: { name: "Alice" },
        transformation: {},
        variables: {},
      }
    );

    expect(result).toBe("Hello Alice");
  });

  it("supports nested paths", () => {
    const result = interpolate(
      "Stage @transformation.stage",
      {
        actor: {},
        transformation: { stage: 3 },
        variables: {},
      }
    );

    expect(result).toBe("Stage 3");
  });

  it("prefers variables over actor and transformation", () => {
    const result = interpolate(
      "HP: @value",
      {
        actor: { value: 5 },
        transformation: { value: 10 },
        variables: { value: 42 },
      }
    );

    expect(result).toBe("HP: 42");
  });

  it("falls back to actor when variable is missing", () => {
    const result = interpolate(
      "Name: @actor.name",
      {
        actor: { name: "Bob" },
        transformation: {},
        variables: {},
      }
    );

    expect(result).toBe("Name: Bob");
  });

  it("replaces missing values with empty string", () => {
    const result = interpolate(
      "Unknown: '@missing.value'",
      {
        actor: {},
        transformation: {},
        variables: {},
      }
    );

    expect(result).toBe("Unknown: ''");
  });

  it("replaces multiple placeholders in one template", () => {
    const result = interpolate(
      "@actor.name reached stage @transformation.stage with @power",
      {
        actor: { name: "Clara" },
        transformation: { stage: 2 },
        variables: { power: "fire" },
      }
    );
  
    expect(result).toBe(
      "Clara reached stage 2 with fire"
    );
  });

  it("leaves template unchanged if no placeholders exist", () => {
    const result = interpolate(
      "Nothing to see here",
      {
        actor: {},
        transformation: {},
        variables: {},
      }
    );

    expect(result).toBe("Nothing to see here");
  });

  it("handles numeric and boolean values correctly", () => {
    const result = interpolate(
      "Count: @count, Active: @active",
      {
        actor: {},
        transformation: {},
        variables: {
          count: 0,
          active: false,
        },
      }
    );

    expect(result).toBe(
      "Count: 0, Active: false"
    );
  });
});
