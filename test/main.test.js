import { describe, it, expect } from "vitest";
import "@test/mocks/bootstrap.js";
vi.mock("@src/infrastructure/socket/registerSockets.js", () => ({
  registerSockets: vi.fn(),
}));
describe("Transformations module bootstrap", () => {
  beforeEach(() => {
    vi.resetModules(); // critical

    // Default non-GM
    global.game.user.isGM = false;
  });

  it("registers init, setup, ready, and socketlib hooks", async () => {
    // Importing main.js should register hooks immediately
    await import("@src/main.js");

    expect(Hooks._once.init).toBeTypeOf("function");
    expect(Hooks._once.setup).toBeTypeOf("function");
    expect(Hooks._once.ready).toBeTypeOf("function");
    expect(Hooks._once["socketlib.ready"]).toBeTypeOf("function");
  });

  it("initializes Registry on setup and freezes it", async () => {
    const { Registry } = await import("@src/bootstrap/registry.js");
    await import("@src/main.js");

    await Hooks._once.setup();

    expect(Registry.logger).toBeDefined();
    expect(Registry.infrastructure).toBeDefined();
    expect(Registry.services).toBeDefined();

    expect(Object.isFrozen(Registry)).toBe(true);
    expect(Object.isFrozen(Registry.services)).toBe(true);
  });

  it("registers GM-only hooks when user is GM", async () => {
    game.user.isGM = true
    const { registerGMOnlyActorHooks } = await import(
      "@src/infrastructure/hooks/GMOnlyActorHooks.js"
    );

    await import("@src/main.js");
    await Hooks._once.setup();

    expect(registerGMOnlyActorHooks).toHaveBeenCalled();
  });

  it("registers socketlib and sockets", async () => {
    const {
      registerSockets
    } = await import(
      "@src/infrastructure/socket/registerSockets.js"
    );

    await import("@src/main.js");
    await Hooks._once["socketlib.ready"]();

    expect(socketlib.registerModule).toHaveBeenCalled();
    expect(registerSockets).toHaveBeenCalled();
  });

  it("bootstraps macros on ready", async () => {
    const { bootstrapMacros } = await import(
      "@src/macros/createMacros.js"
    );

    await import("@src/main.js");
    await Hooks._once.ready();

    expect(bootstrapMacros).toHaveBeenCalled();
    expect(game.transformations).toBeDefined();
  });
});

beforeEach(() => {
  vi.resetModules();
});