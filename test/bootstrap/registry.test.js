import { describe, it, expect } from "vitest";
import { Registry } from "@src/bootstrap/registry.js";

describe("Registry", () => {
  it("is sealed", () => {
    expect(Object.isSealed(Registry)).toBe(true);
  });

  it("has the expected initial keys set to null", () => {
    expect(Registry).toMatchObject({
      dependencies: null,
      services: null,
      infrastructure: null,
      macros: null,
      logger: null
    });
  });

  it("allows reassignment of existing properties", () => {
    const services = {};
    Registry.services = services;

    expect(Registry.services).toBe(services);
  });

  it("does not allow adding new properties", () => {
    // In strict mode this throws, otherwise it silently fails.
    try {
      Registry.newProperty = 123;
    } catch {}

    expect("newProperty" in Registry).toBe(false);
  });

  it("does not allow deleting properties", () => {
    try {
      delete Registry.logger;
    } catch {}

    expect("logger" in Registry).toBe(true);
  });
});
