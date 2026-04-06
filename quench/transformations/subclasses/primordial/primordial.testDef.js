const placeholderChoices = Object.freeze([
    { name: "Primordial Stage 1 Choice A", uuid: "" },
    { name: "Primordial Stage 1 Choice B", uuid: "" },
    { name: "Primordial Stage 2 Choice A", uuid: "" },
    { name: "Primordial Stage 2 Choice B", uuid: "" },
    { name: "Primordial Stage 3 Choice A", uuid: "" },
    { name: "Primordial Stage 3 Choice B", uuid: "" },
    { name: "Primordial Stage 4 Choice A", uuid: "" },
    { name: "Primordial Stage 4 Choice B", uuid: "" }
])

export const primordialTestDef = {
    id: "primordial",
    name: "Primordial",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
