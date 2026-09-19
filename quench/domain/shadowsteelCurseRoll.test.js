import {
    ShadowsteelCurseRoll,
    SHADOWSTEEL_CURSE_ACTIVITY_ID,
    SHADOWSTEEL_CURSES_TABLE_UUID
} from "../../domain/transformation/subclasses/shadowsteelGhoul/activities/ShadowsteelCurseRoll.js"

function createHtml()
{
    const root = document.createElement("div")
    root.innerHTML = `<div class="midi-buttons"><button data-action="rollSave">Roll Saving Throw</button></div>`
    return root
}

function createMessage(activityId = SHADOWSTEEL_CURSE_ACTIVITY_ID)
{
    return {flags: {dnd5e: {activity: {id: activityId, uuid: `Actor.a.Item.b.Activity.${activityId}`}}}}
}

quench.registerBatch(
    "transformations.domain.shadowsteelCurseRoll",
    ({describe, it, expect}) =>
    {
        describe("ShadowsteelCurseRoll", function ()
        {
            it("injects the roll button above the existing buttons only once", async function ()
            {
                const html = createHtml()
                const args = {message: createMessage(), html, actor: {isOwner: true}}

                await ShadowsteelCurseRoll.onRenderChatMessage(args)
                await ShadowsteelCurseRoll.onRenderChatMessage(args)

                const container = html.querySelector(".midi-buttons")
                expect(container.firstElementChild.textContent).to.contain("Roll Shadowsteel Curse")
                expect(container.querySelectorAll("[data-transformations-shadowsteel-curse-roll]")).to.have.length(1)
                expect(container.lastElementChild.textContent).to.equal("Roll Saving Throw")
            })

            it("ignores other activities and non-owners", async function ()
            {
                const otherActivity = createHtml()
                await ShadowsteelCurseRoll.onRenderChatMessage({
                    message: createMessage("someOtherActivity"),
                    html: otherActivity,
                    actor: {isOwner: true}
                })

                const notOwner = createHtml()
                await ShadowsteelCurseRoll.onRenderChatMessage({
                    message: createMessage(),
                    html: notOwner,
                    actor: {isOwner: false}
                })

                expect(otherActivity.querySelector("[data-transformations-shadowsteel-curse-roll]")).to.equal(null)
                expect(notOwner.querySelector("[data-transformations-shadowsteel-curse-roll]")).to.equal(null)
            })

            it("draws from the Shadowsteel Curses roll table when clicked", async function ()
            {
                const originalFromUuid = globalThis.fromUuid
                const requestedUuids = []
                let draws = 0
                globalThis.fromUuid = async uuid =>
                {
                    requestedUuids.push(uuid)
                    return {
                        documentName: "RollTable",
                        async draw()
                        {
                            draws++
                        }
                    }
                }

                try {
                    const html = createHtml()
                    await ShadowsteelCurseRoll.onRenderChatMessage({
                        message: createMessage(),
                        html,
                        actor: {isOwner: true}
                    })

                    html.querySelector("[data-transformations-shadowsteel-curse-roll] button").click()
                    await new Promise(resolve => setTimeout(resolve, 0))

                    expect(requestedUuids).to.deep.equal([SHADOWSTEEL_CURSES_TABLE_UUID])
                    expect(draws).to.equal(1)
                } finally {
                    globalThis.fromUuid = originalFromUuid
                }
            })
        })
    }
)
