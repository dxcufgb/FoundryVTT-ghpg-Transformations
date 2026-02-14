import {
    createTransformationDefinitionFactory
  } from "@src/domain/transformation/createTransformationDefinitionFactory.js";
  
  export function makeFactory(options = {}) {
    const hasRegistryEntry =
      Object.prototype.hasOwnProperty.call(options, "registryEntry");
  
    const registryEntry = hasRegistryEntry
      ? options.registryEntry
      : undefined;
  
    const transformationRegistry = {
      getEntryByItemId: vi.fn(() => registryEntry)
    };
  
    const logger = {
      warn: vi.fn()
    };
  
    const factory = createTransformationDefinitionFactory({
      transformationRegistry,
      logger
    });
  
    return { factory, transformationRegistry, logger };
  }
  