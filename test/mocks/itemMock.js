export function mockItem({
    name = "Test Item",
    type = "feat", // or "spell", "weapon"
    system = {},
    actor = null,
  } = {}) {
    return {
      name,
      type,
      system,
      actor,
      uuid: "Item.test",
      toObject: () => ({ name, type, system }),
    };
  }
  