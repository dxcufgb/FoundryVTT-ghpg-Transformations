const placeholderChoices = Object.freeze([
    { name: "Specter Stage 1 Choice A", uuid: "" },
    { name: "Specter Stage 1 Choice B", uuid: "" },
    { name: "Specter Stage 2 Choice A", uuid: "" },
    { name: "Specter Stage 2 Choice B", uuid: "" },
    { name: "Specter Stage 3 Choice A", uuid: "" },
    { name: "Specter Stage 3 Choice B", uuid: "" },
    { name: "Specter Stage 4 Choice A", uuid: "" },
    { name: "Specter Stage 4 Choice B", uuid: "" }
])

export const specterTestDef = {
    id: "specter",
    name: "Specter",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
