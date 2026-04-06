const placeholderChoices = Object.freeze([
    { name: "Lycanthrope Stage 1 Choice A", uuid: "" },
    { name: "Lycanthrope Stage 1 Choice B", uuid: "" },
    { name: "Lycanthrope Stage 2 Choice A", uuid: "" },
    { name: "Lycanthrope Stage 2 Choice B", uuid: "" },
    { name: "Lycanthrope Stage 3 Choice A", uuid: "" },
    { name: "Lycanthrope Stage 3 Choice B", uuid: "" },
    { name: "Lycanthrope Stage 4 Choice A", uuid: "" },
    { name: "Lycanthrope Stage 4 Choice B", uuid: "" }
])

export const lycanthropeTestDef = {
    id: "lycanthrope",
    name: "Lycanthrope",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
