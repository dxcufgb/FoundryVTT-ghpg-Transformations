import { createLogger, resolveLogLevel } from "../../infrastructure/logging/logger.js"

quench.registerBatch(
    "transformations.Logger",
    ({ describe, it, expect }) =>
    {
        describe("resolveLogLevel", () =>
        {
            it("maps the loggerLevel setting names to numeric levels", () =>
            {
                expect(resolveLogLevel("none")).to.equal(0)
                expect(resolveLogLevel("error")).to.equal(1)
                expect(resolveLogLevel("warn")).to.equal(2)
                expect(resolveLogLevel("Warning")).to.equal(2)
                expect(resolveLogLevel("info")).to.equal(4)
                expect(resolveLogLevel("debug")).to.equal(5)
            })

            it("passes numbers through and falls back for unknown values", () =>
            {
                expect(resolveLogLevel(3)).to.equal(3)
                expect(resolveLogLevel("4")).to.equal(4)
                expect(resolveLogLevel("bogus", 2)).to.equal(2)
                expect(resolveLogLevel(undefined, 1)).to.equal(1)
            })
        })

        describe("createLogger.setLogLevel", () =>
        {
            it("honours a setting name so warnings still log at warn level", () =>
            {
                const logger = createLogger({ level: 5, prefix: "LoggerTest" })
                const originalDebug = console.debug
                const originalWarn = console.warn
                const calls = []
                console.debug = () => calls.push("debug")
                console.warn = () => calls.push("warn")

                try {
                    logger.setLogLevel("warn")
                    logger.debug("hidden")
                    logger.warn("shown")
                } finally {
                    console.debug = originalDebug
                    console.warn = originalWarn
                }

                expect(calls).to.deep.equal(["warn"])
            })
        })
    }
)
