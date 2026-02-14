import { describe, it, expect, vi, beforeEach } from "vitest";
import { createActorQueryService } from
  "@src/services/actor/createActorQueryService.js";

describe("createActorQueryService", () => {
  let actorRepository;
  let service;

  beforeEach(() => {
    actorRepository = {
      getById: vi.fn(),
    };

    service = createActorQueryService({
      actorRepository,
    });
  });

  it("delegates getById to actorRepository", () => {
    const actor = { id: "actor-1" };

    actorRepository.getById
      .mockReturnValue(actor);

    const result = service.getById("actor-1");

    expect(actorRepository.getById)
      .toHaveBeenCalledWith("actor-1");

    expect(result).toBe(actor);
  });

  it("returns a frozen service object", () => {
    expect(Object.isFrozen(service)).toBe(true);
  });
});
