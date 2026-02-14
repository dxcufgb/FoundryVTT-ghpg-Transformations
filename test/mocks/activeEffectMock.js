export function mockActiveEffect({
    changes = [],
    disabled = false,
    origin = "Actor.test",
  } = {}) {
    return {
      changes,
      disabled,
      origin,
    };
  }
  