import { MessageDTOValidator } from "../../DTOValidators/MessageDTOValidator.js"


// @ts-check
export class MessageValidationDTO
{
    static validator = MessageDTOValidator
    constructor (messageType = "NA")
    {
        this.messageType = messageType
        this.title = null

        this.count = 0

        this.flavors = {
            values: null,     // string[]
            mode: "includes"  // "includes" | "equal"
        }

        this.contents = {
            values: null,     // string[] or message[]
            mode: "equal"     // "includes" | "equal"
        }
    }
}