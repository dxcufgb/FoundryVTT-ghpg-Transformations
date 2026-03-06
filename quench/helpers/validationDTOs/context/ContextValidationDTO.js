// @ts-check

import { ContextDTOValidator } from "../../DTOValidators/ContextDTOValidator.js"

/**
 * @typedef {"equal" | "includes"} RollValidationMode
 */

export class ContextValidationDTO
{
    static validator = ContextDTOValidator
    /**
     * @param {any} context
     */
    constructor (context)
    {
        /** @type {any} */
        this.context = context

        /** @type {boolean | null} */
        this.disadvantage = null

        /** @type {boolean | null} */
        this.advantage = null

        /** 
         * Roll validation configuration
         * @type {{
         *   values: any[] | null,
         *   mode: RollValidationMode
         * }}
         */
        this.rolls = {
            values: null,
            mode: "equal"
        }
    }
}