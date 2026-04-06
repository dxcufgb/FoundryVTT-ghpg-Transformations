const placeholderChoices = Object.freeze([
    { name: "Shadowsteel Ghoul Stage 1 Choice A", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 1 Choice B", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 2 Choice A", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 2 Choice B", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 3 Choice A", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 3 Choice B", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 4 Choice A", uuid: "" },
    { name: "Shadowsteel Ghoul Stage 4 Choice B", uuid: "" }
])

export const shadowsteelGhoulTestDef = {
    id: "shadowsteelGhoul",
    name: "Shadowsteel Ghoul",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
