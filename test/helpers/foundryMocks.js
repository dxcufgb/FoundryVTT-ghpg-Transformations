import { vi } from "vitest";

/**
 * Creates a Foundry-like document mock with working setFlag.
 *
 * @param {object} base - Initial document properties
 * @returns {object} document mock
 */
export function createFoundryDocumentMock(base = {}) {
  return {
    flags: {},

    ...base,

    setFlag: vi.fn(function (scope, key, value) {
      this.flags ??= {};
      this.flags[scope] ??= {};
      this.flags[scope][key] = value;
      return value;
    }),
  };
}
