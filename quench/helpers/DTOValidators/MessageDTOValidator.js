import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"



// @ts-check
export class MessageDTOValidator extends BaseDTOValidator
{
    static rules = {
        count: path("messages").count().equals(),
        title: path("messages").pluck("title").equals(),
        flavors: path("messages").pluck("flavor").map(v => v ?? "").indexedStringMatch(),
        contents: path("messages").pluck("content").map(v => v ?? "").indexedStringMatch()
    }

    validate(dto)
    {
        const messages = this.getMessagesByType(dto.messageType)

        super.validate(this.buildValidationDTO(dto), { messages })

        return true
    }

    getMessagesByType(type)
    {
        switch (type) {

            case "RollTable":
                return game.messages.contents.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

            case "base":
                return game.messages.contents.filter(m =>
                    m.type == "base"
                )

            case "NA":
            default:
                return game.messages.contents
        }
    }
}
