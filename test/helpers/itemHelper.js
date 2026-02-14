import { vi } from "vitest";

export function makeItem({
  id = crypto.randomUUID(),
  uuid,
  type,
  flags = {},
  system = {}
} = {}) {
  return {
    id,
    uuid,
    type,
    system,
    flags,
    getFlag(scope, key) {
      return flags?.[scope]?.[key];
    },
    setFlag: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toObject() {
      return { system, flags };
    }
  };
}
