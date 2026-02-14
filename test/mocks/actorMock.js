export function mockActor({
    name = "Test Actor",
    type = "character",
    system = {},
    items = [],
    effects = [],
  } = {}) {
    return {
      name,
      type,
      system,
      items,
      effects,
      uuid: "Actor.test",
      getRollData: () => ({ ...system }),
    };
  }
  