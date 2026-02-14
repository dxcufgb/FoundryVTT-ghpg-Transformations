import { describe, it, expect, vi, beforeEach } from "vitest";

/* ───────────────────────────────────────────────────────────── */
/* Mock Transformation */
/* ───────────────────────────────────────────────────────────── */

vi.mock(
  "@src/domain/transformation/Transformation.js",
  () => ({
    Transformation: vi.fn(function (args) {
      this.args = args;
    })
  })
);

import { Transformation } from
  "@src/domain/transformation/Transformation.js";

import {
  createTransformationInstanceFactory
} from
  "@src/domain/transformation/createTransformationInstanceFactory.js";

/* ───────────────────────────────────────────────────────────── */

describe("createTransformationInstanceFactory", () => {
  let factory;

  beforeEach(() => {
    vi.clearAllMocks();
    factory = createTransformationInstanceFactory();
  });

  /* ─────────────── Guards ─────────────── */

  it("throws if actor is missing", () => {
    expect(() =>
      factory.create({
        definition: {}
      })
    ).toThrow("requires actor");
  });

  it("throws if actor has no id and no fallback flag", () => {
    const actor = {
      getFlag: vi.fn(() => null)
    };

    expect(() =>
      factory.create({
        actor,
        definition: {}
      })
    ).toThrow("requires actor to have an id");
  });

  it("throws if definition is missing", () => {
    const actor = { id: "actor-id" };

    expect(() =>
      factory.create({
        actor
      })
    ).toThrow("requires definition");
  });

  /* ─────────────── Happy paths ─────────────── */

  it("creates a Transformation using the default class", () => {
    const actor = { id: "actor-id" };
    const definition = { id: "def" };

    const result = factory.create({
      actor,
      definition,
      stage: 2
    });

    expect(Transformation).toHaveBeenCalledTimes(1);
    expect(Transformation).toHaveBeenCalledWith({
      actorId: "actor-id",
      definition,
      stage: 2
    });

    expect(result).toBeInstanceOf(Transformation);
  });

  it("uses fallback actor id when actor.id is missing", () => {
    const actor = {
      getFlag: vi.fn(() => "fallback-id")
    };
    const definition = {};

    factory.create({
      actor,
      definition
    });

    expect(Transformation).toHaveBeenCalledWith({
      actorId: "fallback-id",
      definition,
      stage: 1
    });
  });

  it("uses provided TransformationClass instead of default", () => {
    const CustomTransformation = vi.fn(function (args) {
      this.args = args;
    });

    const actor = { id: "actor-id" };
    const definition = {};

    const result = factory.create({
      actor,
      definition,
      TransformationClass: CustomTransformation
    });

    expect(CustomTransformation).toHaveBeenCalledTimes(1);
    expect(CustomTransformation).toHaveBeenCalledWith({
      actorId: "actor-id",
      definition,
      stage: 1
    });

    expect(Transformation).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(CustomTransformation);
  });
});
