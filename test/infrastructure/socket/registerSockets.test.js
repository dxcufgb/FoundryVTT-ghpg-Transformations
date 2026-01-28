import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerSockets } from "@src/infrastructure/socket/registerSockets.js";

describe("registerSockets", () => {
  let socketGateway;
  let transformationMutationGateway;
  let logger;
  let createGMTransformationHandlers;
  let handlers;

  beforeEach(() => {
    socketGateway = {
      register: vi.fn(),
    };

    transformationMutationGateway = {};

    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    handlers = {
      applyTransformation: vi.fn(),
      initializeTransformation: vi.fn(),
      advanceStage: vi.fn(),
      clearTransformation: vi.fn(),
      applyTriggerActions: vi.fn(),
    };

    createGMTransformationHandlers = vi.fn()
      .mockReturnValue(handlers);
  });

  it("registers all GM transformation socket handlers", () => {
    registerSockets({
      socketGateway,
      transformationMutationGateway,
      createGMTransformationHandlers,
      logger,
    });

    expect(createGMTransformationHandlers)
      .toHaveBeenCalledWith({
        gateway: transformationMutationGateway,
        logger,
      });

    expect(socketGateway.register).toHaveBeenCalledTimes(5);

    expect(socketGateway.register)
      .toHaveBeenCalledWith(
        "applyTransformation",
        handlers.applyTransformation
      );

    expect(socketGateway.register)
      .toHaveBeenCalledWith(
        "initializeTransformation",
        handlers.initializeTransformation
      );

    expect(socketGateway.register)
      .toHaveBeenCalledWith(
        "advanceStage",
        handlers.advanceStage
      );

    expect(socketGateway.register)
      .toHaveBeenCalledWith(
        "clearTransformation",
        handlers.clearTransformation
      );

    expect(socketGateway.register)
      .toHaveBeenCalledWith(
        "applyTriggerActions",
        handlers.applyTriggerActions
      );
  });
});
