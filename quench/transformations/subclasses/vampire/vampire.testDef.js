const placeholderChoices = Object.freeze([
    { name: "Vampire Stage 1 Choice A", uuid: "" },
    { name: "Vampire Stage 1 Choice B", uuid: "" },
    { name: "Vampire Stage 2 Choice A", uuid: "" },
    { name: "Vampire Stage 2 Choice B", uuid: "" },
    { name: "Vampire Stage 3 Choice A", uuid: "" },
    { name: "Vampire Stage 3 Choice B", uuid: "" },
    { name: "Vampire Stage 4 Choice A", uuid: "" },
    { name: "Vampire Stage 4 Choice B", uuid: "" }
])

export const vampireTestDef = {
    id: "vampire",
    name: "Vampire",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
