import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantLossOfVitality extends AberrantEffect
{
    static meta = {
        name: "Aberrant Loss Of Vitality",
        rollRanges: {
            1: [49, 56],
            2: [57, 64],
            3: [65, 79],
            4: [80, 87]
        }
    }
    constructor (args)
    {
        args?.logger?.debug?.("AberrantLossOfVitality.constructor", { args })
        super(args)
        this.description = "You cannot add your Constitution modifier to any Hit Point Dice spent to regain Hit Points"
    }
}

