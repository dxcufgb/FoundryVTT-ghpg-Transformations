export function mockRollTable({
    results = [{ text: "Result" }],
  } = {}) {
    return {
      async draw() {
        return {
          results,
        };
      },
    };
  }
  