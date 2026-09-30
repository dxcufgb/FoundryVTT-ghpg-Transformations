import { createTransformationPillController } from "../../ui/controllers/transformationPillController.js"

function createFakeGame({role, minimumRole = 4})
{
    return {
        user: {id: "user-1", role},
        settings: {
            get(scope, key)
            {
                return key === "changeTransformationAllowedRoles" ? minimumRole : null
            }
        }
    }
}

function bindAddPill({game, editable})
{
    const opened = []
    const controller = createTransformationPillController({
        dialogs: {
            openTransformationConfig(data)
            {
                opened.push(data)
            }
        },
        stageUpApprovalService: {},
        getGame: () => game,
        logger: {debug() {}}
    })

    const pillElement = document.createElement("div")
    controller.bind({
        app: {actor: {id: "actor-1"}},
        pillElement,
        viewModel: {mode: "add", editable},
        transformation: null,
        transformations: []
    })

    pillElement.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true}))

    return opened
}

quench.registerBatch(
    "transformations.ActorSheet.TransformationPill - add mode permissions",
    ({describe, it, expect}) =>
    {
        describe("Add Transformation pill", function()
        {
            it("opens the config for a GM on an editable sheet", function()
            {
                const opened = bindAddPill({game: createFakeGame({role: 4}), editable: true})
                expect(opened).to.have.length(1)
            })

            it("does not open the config when the sheet is not editable", function()
            {
                const opened = bindAddPill({game: createFakeGame({role: 4}), editable: false})
                expect(opened).to.have.length(0)
            })

            it("does not open the config when the role setting excludes the user", function()
            {
                const opened = bindAddPill({
                    game: createFakeGame({role: 1, minimumRole: 4}),
                    editable: true
                })
                expect(opened).to.have.length(0)
            })

            it("opens the config for a player when the role setting allows players", function()
            {
                const opened = bindAddPill({
                    game: createFakeGame({role: 1, minimumRole: 1}),
                    editable: true
                })
                expect(opened).to.have.length(1)
            })
        })
    }
)
