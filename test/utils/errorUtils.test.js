import { describe, it, expect } from "vitest";
import { ErrorUtils } from "@src/utils/errorUtils.js";

describe("ErrorUtils.throwIfErrors", () => {
  const { throwIfErrors } = ErrorUtils({});

  it("does nothing when errors array is empty", () => {
    expect(() => throwIfErrors([])).not.toThrow();
  });

  it("does nothing when no error has throwError=true", () => {
    const errors = [
      {
        objectType: "Actor",
        reason: "Invalid name",
        throwError: false,
      },
      {
        objectType: "Item",
        reason: "Missing icon",
        throwError: false,
      },
    ];

    expect(() => throwIfErrors(errors)).not.toThrow();
  });

  it("throws when any error has throwError=true", () => {
    const errors = [
      {
        objectType: "Actor",
        reason: "Invalid name",
        throwError: false,
      },
      {
        objectType: "Item",
        reason: "Missing icon",
        throwError: true,
      },
    ];

    expect(() => throwIfErrors(errors))
      .toThrowError(
        "Validation failed:\n" +
        "• Actor:Invalid name\n" +
        "• Item:Missing icon"
      );
  });

  it("includes all errors in the thrown message", () => {
    const errors = [
      {
        objectType: "A",
        reason: "First",
        throwError: true,
      },
      {
        objectType: "B",
        reason: "Second",
        throwError: true,
      },
    ];

    try {
      throwIfErrors(errors);
    } catch (err) {
      expect(err.message).toContain("A:First");
      expect(err.message).toContain("B:Second");
    }
  });
});
