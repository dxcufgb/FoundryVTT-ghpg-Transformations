import { describe, it, expect } from "vitest";
import {
  createStageGrantResolver
} from
  "@src/domain/transformation/createStageGrantResolver.js";

describe("createStageGrantResolver", () => {
  const resolver = createStageGrantResolver({ logger: {} });

  it("returns empty result when definition is missing", () => {
    const result = resolver.resolve({ stage: 1 });

    expect(result).toEqual({
      items: [],
      creatureSubType: null
    });
  });

  it("returns empty result when stage is missing", () => {
    const result = resolver.resolve({ definition: {} });

    expect(result).toEqual({
      items: [],
      creatureSubType: null
    });
  });

  it("returns empty result when stage definition does not exist", () => {
    const definition = {
      stages: {}
    };

    const result = resolver.resolve({
      definition,
      stage: 2
    });

    expect(result).toEqual({
      items: [],
      creatureSubType: null
    });
  });

  it("resolves grants from object-based stage definitions", () => {
    const definition = {
      stages: {
        1: {
          grants: {
            items: [
              {
                uuid: "item-1",
                replaces: { uuid: "old-item" },
                isPrerequisite: true
              },
              {
                uuid: "item-2"
              }
            ],
            actor: {
              creatureSubType: "undead"
            }
          }
        }
      }
    };

    const result = resolver.resolve({
      definition,
      stage: 1
    });

    expect(result).toEqual({
      items: [
        {
          uuid: "item-1",
          replacesUuid: "old-item",
          isPrerequisite: true
        },
        {
          uuid: "item-2",
          replacesUuid: null,
          isPrerequisite: false
        }
      ],
      creatureSubType: "undead"
    });
  });

  it("resolves grants from Map-based stage definitions", () => {
    const stages = new Map();
    stages.set(1, {
      grants: {
        items: [
          { uuid: "item-map" }
        ]
      }
    });

    const definition = { stages };

    const result = resolver.resolve({
      definition,
      stage: 1
    });

    expect(result).toEqual({
      items: [
        {
          uuid: "item-map",
          replacesUuid: null,
          isPrerequisite: false
        }
      ],
      creatureSubType: null
    });
  });

  it("returns empty items when grants.items is not an array", () => {
    const definition = {
      stages: {
        1: {
          grants: {
            items: "nope"
          }
        }
      }
    };

    const result = resolver.resolve({
      definition,
      stage: 1
    });

    expect(result).toEqual({
      items: [],
      creatureSubType: null
    });
  });
});
