const placeholderChoices = Object.freeze([
    { name: "Seraph Stage 1 Choice A", uuid: "" },
    { name: "Seraph Stage 1 Choice B", uuid: "" },
    { name: "Seraph Stage 2 Choice A", uuid: "" },
    { name: "Seraph Stage 2 Choice B", uuid: "" },
    { name: "Seraph Stage 3 Choice A", uuid: "" },
    { name: "Seraph Stage 3 Choice B", uuid: "" },
    { name: "Seraph Stage 4 Choice A", uuid: "" },
    { name: "Seraph Stage 4 Choice B", uuid: "" }
])

export const seraphTestDef = {
    id: "seraph",
    name: "Seraph",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
