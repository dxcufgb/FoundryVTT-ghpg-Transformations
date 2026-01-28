import { createFoundryDocumentMock } from "./foundryMocks";

export function createRollTableResult({
    name = "Test Result",
    description = "Stage 1",
    ...rest
  } = {}) {
    return createFoundryDocumentMock({
      id: "result-1",
      name,
      description,
      text: description,
      img: "icon.png",
      range: [1, 1],
      ...rest,
    });
  }