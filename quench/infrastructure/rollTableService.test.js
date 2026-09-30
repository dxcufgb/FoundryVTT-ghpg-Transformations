import { createRollTableService } from "../../infrastructure/rolltables/createRollTableService.js"

function createLogger()
{
    return {
        debug() {},
        warn() {},
        trace() {},
        error() {}
    }
}

function createTracker()
{
    return {
        async track(promise)
        {
            return await promise
        },
        async whenIdle() {}
    }
}

function createTable({range})
{
    const result = {
        id: "result-1",
        name: "You Die",
        description: "You die",
        img: "",
        range
    }
    const messages = []

    return {
        messages,
        table: {
            uuid: "Compendium.transformations.gh-roll-tables.RollTable.test",
            name: "Test Table",
            documentName: "RollTable",
            results: [result],
            async draw()
            {
                return {roll: {total: range[0]}, results: [result]}
            },
            async toMessage(results, options)
            {
                messages.push({results, options})
            }
        }
    }
}

async function rollWith({range, mode, currentRollTableEffectLowRange})
{
    const {table, messages} = createTable({range})
    const service = createRollTableService({
        tracker: createTracker(),
        debouncedTracker: createTracker(),
        compendiumRepository: {
            async getDocumentByUuid()
            {
                return table
            }
        },
        logger: createLogger()
    })

    // Ignore any roll table override left by the transformation test environment.
    const originalTestFlag = globalThis.__TRANSFORMATIONS_TEST__
    globalThis.__TRANSFORMATIONS_TEST__ = false
    try {
        const outcome = await service.roll({
            uuid: table.uuid,
            mode,
            context: {currentRollTableEffectLowRange}
        })
        return {outcome, messages}
    } finally {
        globalThis.__TRANSFORMATIONS_TEST__ = originalTestFlag
    }
}

quench.registerBatch(
    "transformations.infrastructure.rollTableService",
    ({describe, it, expect}) =>
    {
        describe("createRollTableService.roll", function()
        {
            it("does not post a chat card for a result rejected by downgradeOnly", async function()
            {
                const {outcome, messages} = await rollWith({
                    range: [10, 10],
                    mode: "downgradeOnly",
                    currentRollTableEffectLowRange: 5
                })

                expect(outcome).to.equal(null)
                expect(messages).to.have.length(0)
            })

            it("posts a chat card for an accepted result", async function()
            {
                const {outcome, messages} = await rollWith({
                    range: [3, 3],
                    mode: "downgradeOnly",
                    currentRollTableEffectLowRange: 5
                })

                expect(outcome).to.not.equal(null)
                expect(messages).to.have.length(1)
            })
        })
    }
)
