import { describe, it, expect } from "vitest";
import { objectUtils } from "@src/utils/objectUtils.js";

describe("objectUtils.getObjectValuesAsList", () => {
  const { getObjectValuesAsList } = objectUtils({ logger: {} });

  it("returns the values of an object as a list", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };

    expect(getObjectValuesAsList(obj))
      .toEqual([1, 2, 3]);
  });

  it("returns an empty array for an empty object", () => {
    expect(getObjectValuesAsList({}))
      .toEqual([]);
  });

  it("does not wrap the object itself", () => {
    const obj = { a: 1 };

    const result = getObjectValuesAsList(obj);

    expect(result).not.toEqual([obj]);
  });

  it("does not mutate the input object", () => {
    const obj = { a: 1, b: 2 };

    getObjectValuesAsList(obj);

    expect(obj).toEqual({ a: 1, b: 2 });
  });
});
