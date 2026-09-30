import { SeraphDefinition } from "../../../../domain/transformation/subclasses/seraph/SeraphDefinition.js"
import { seraphTestDef } from "./seraph.testDef.js"
import "./seraphUnit.test.js"

export const SeraphTests = {
    definition: SeraphDefinition,
    testDefinition: seraphTestDef,
    testIdentifier: "Seraph"
}
