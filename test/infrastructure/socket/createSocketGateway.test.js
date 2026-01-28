import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSocketGateway } from
  "@src/infrastructure/socket/createSocketGateway.js";

describe("createSocketGateway", () => {
  let socket;
  let logger;
  let getGame;
  let isGM;
  let gateway;

  beforeEach(() => {
    socket = {
      executeAsGM: vi.fn(),
      register: vi.fn(),
    };

    logger = {
      debug: vi.fn(),
    };

    getGame = vi.fn(() => ({
      users: [],
    }));

    isGM = vi.fn();

    gateway = createSocketGateway({
      getGame,
      logger,
      isGM,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Initial state & socket setup                                       */
  /* ------------------------------------------------------------------ */

  it("throws when executeAsGM is called before socket is set", () => {
    expect(() =>
      gateway.executeAsGM("event", {})
    ).toThrow("Socket not ready");
  });

  it("throws when register is called before socket is set", () => {
    expect(() =>
      gateway.register("event", vi.fn())
    ).toThrow("Socket not initialized. Cannot register 'event'");
  });

  it("stores socket via setSocket", () => {
    gateway.setSocket(socket);

    expect(() =>
      gateway.executeAsGM("test", {})
    ).not.toThrow();
  });

  /* ------------------------------------------------------------------ */
  /* canMutateLocally                                                   */
  /* ------------------------------------------------------------------ */

  it("delegates canMutateLocally to isGM", () => {
    isGM.mockReturnValue(true);
    expect(gateway.canMutateLocally()).toBe(true);

    isGM.mockReturnValue(false);
    expect(gateway.canMutateLocally()).toBe(false);
  });

  /* ------------------------------------------------------------------ */
  /* isGMOnline                                                         */
  /* ------------------------------------------------------------------ */

  it("returns true when any active GM is online", () => {
    getGame.mockReturnValue({
      users: [
        { isGM: false, active: true },
        { isGM: true, active: false },
        { isGM: true, active: true },
      ],
    });

    expect(gateway.isGMOnline()).toBe(true);
  });

  it("returns false when no active GM is online", () => {
    getGame.mockReturnValue({
      users: [
        { isGM: false, active: true },
        { isGM: true, active: false },
      ],
    });

    expect(gateway.isGMOnline()).toBe(false);
  });

  /* ------------------------------------------------------------------ */
  /* executeAsGM                                                        */
  /* ------------------------------------------------------------------ */

  it("delegates executeAsGM to socket", () => {
    gateway.setSocket(socket);

    gateway.executeAsGM("someEvent", { foo: "bar" });

    expect(socket.executeAsGM)
      .toHaveBeenCalledWith("someEvent", { foo: "bar" });
  });

  /* ------------------------------------------------------------------ */
  /* register                                                           */
  /* ------------------------------------------------------------------ */

  it("registers socket handler and logs registration", () => {
    gateway.setSocket(socket);

    const handler = vi.fn();

    gateway.register("testEvent", handler);

    expect(socket.register)
      .toHaveBeenCalledWith("testEvent", handler);

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "Socket handler registered",
        "testEvent"
      );
  });
});
