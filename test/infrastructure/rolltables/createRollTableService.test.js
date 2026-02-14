import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRollTableService } from "@src/infrastructure/rolltables/createRollTableService.js";
import { createRollTableResult } from "../../helpers/rollTableHelper.js";

describe("createRollTableService", () => {
  let compendiumRepository;
  let logger;
  let service;

  beforeEach(() => {
    compendiumRepository = {
      getDocumentByUuid: vi.fn(),
    };

    logger = {
      warn: vi.fn(),
      debug: vi.fn(),
    };

    service = createRollTableService({
      compendiumRepository,
      logger,
    });
  });

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function makeRollTable({
    resultText = "Stage 1",
    resultName = "Test Result",
    rollTotal = 7,
    explicitEffectKey = null,
  } = {}) {
    const result = createRollTableResult({
      name: resultName,
      description: resultText,
    });
  
    // Optional: pre-seed an explicit effectKey (for precedence tests)
    if (explicitEffectKey) {
      result.flags.transformations = {
        effectKey: explicitEffectKey,
      };
    }
  
    const rollResult = {
      roll: { total: rollTotal },
      results: [result],
    };
  
    const table = {
      uuid: "Compendium.test.table",
      name: "Test Table",
      documentName: "RollTable",
      draw: vi.fn().mockResolvedValue(rollResult),
    };
  
    return { table, rollResult, result };
  }

  /* ------------------------------------------------------------------ */
  /* Validation                                                          */
  /* ------------------------------------------------------------------ */

  it("returns null and warns if uuid is missing", async () => {
    const outcome = await service.roll({});

    expect(outcome).toBeNull();
    expect(logger.warn)
      .toHaveBeenCalledWith("rollTableService.roll called without uuid");
  });

  it("returns null and warns if uuid is not a RollTable", async () => {
    compendiumRepository.getDocumentByUuid
      .mockResolvedValue({ documentName: "Item" });

    const outcome = await service.roll({ uuid: "Bad.UUID" });

    expect(outcome).toBeNull();
    expect(logger.warn)
      .toHaveBeenCalledWith("Invalid RollTable UUID", "Bad.UUID");
  });

  it("returns null and warns if roll produces no result", async () => {
    const table = {
      documentName: "RollTable",
      draw: vi.fn().mockResolvedValue({ results: [] }),
    };

    compendiumRepository.getDocumentByUuid.mockResolvedValue(table);

    const outcome = await service.roll({ uuid: "Table.UUID" });

    expect(outcome).toBeNull();
    expect(logger.warn)
      .toHaveBeenCalledWith("RollTable produced no result", "Table.UUID");
  });

  /* ------------------------------------------------------------------ */
  /* Happy path                                                          */
  /* ------------------------------------------------------------------ */

  it("returns a normalized outcome for a valid roll", async () => {
    const { table, result } = makeRollTable();
  
    compendiumRepository.getDocumentByUuid.mockResolvedValue(table);
  
    const outcome = await service.roll({
      uuid: table.uuid,
      context: { stage: 1 },
    });
  
    expect(outcome).toEqual({
      table: {
        uuid: table.uuid,
        name: table.name,
      },
      roll: {
        total: 7,
      },
      result: {
        id: result.id,
        text: result.description,
        img: result.img,
        range: result.range,
      },
      // 👇 this is the important correction
      effectKey: "TestResult",
      context: { stage: 1 },
    });
  
    expect(result.setFlag).toHaveBeenCalledWith(
      "transformations",
      "effectKey",
      "TestResult"
    );
  });

  /* ------------------------------------------------------------------ */
  /* effectKey extraction                                                */
  /* ------------------------------------------------------------------ */

  it("prefers explicit effectKey flag over text extraction", async () => {
    const { table } = makeRollTable({
      resultText: "Stage 2",
      explicitEffectKey: "ExplicitKey",
    });

    compendiumRepository.getDocumentByUuid.mockResolvedValue(table);

    const outcome = await service.roll({ uuid: table.uuid });

    expect(outcome.effectKey).toBe("ExplicitKey");
  });

  /* ------------------------------------------------------------------ */
  /* Mode filtering                                                      */
  /* ------------------------------------------------------------------ */

  it("rejects outcome in upgradeOnly mode when rolled stage is lower", async () => {
    const { table } = makeRollTable({ resultText: "Stage 1" });

    compendiumRepository.getDocumentByUuid.mockResolvedValue(table);

    const outcome = await service.roll({
      uuid: table.uuid,
      mode: "upgradeOnly",
      context: { stage: 2 },
    });

    expect(outcome).toBeNull();
    expect(logger.debug)
      .toHaveBeenCalledWith(
        "RollTable result rejected by mode",
        expect.objectContaining({ mode: "upgradeOnly" })
      );
  });

  it("rejects outcome in downgradeOnly mode when rolled stage is higher", async () => {
    const { table } = makeRollTable({ resultText: "Stage 3" });

    compendiumRepository.getDocumentByUuid.mockResolvedValue(table);

    const outcome = await service.roll({
      uuid: table.uuid,
      mode: "downgradeOnly",
      context: { stage: 1 },
    });

    expect(outcome).toBeNull();
  });

  it("allows outcome in normal mode regardless of stage", async () => {
    const { table } = makeRollTable({ resultText: "Stage 99" });

    compendiumRepository.getDocumentByUuid.mockResolvedValue(table);

    const outcome = await service.roll({
      uuid: table.uuid,
      mode: "normal",
      context: { stage: 1 },
    });

    expect(outcome).not.toBeNull();
  });
});
