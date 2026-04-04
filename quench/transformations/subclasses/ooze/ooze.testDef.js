const placeholderChoices = Object.freeze([
    { name: "Ooze Stage 1 Choice A", uuid: "" },
    { name: "Ooze Stage 1 Choice B", uuid: "" },
    { name: "Ooze Stage 2 Choice A", uuid: "" },
    { name: "Ooze Stage 2 Choice B", uuid: "" },
    { name: "Ooze Stage 3 Choice A", uuid: "" },
    { name: "Ooze Stage 3 Choice B", uuid: "" },
    { name: "Ooze Stage 4 Choice A", uuid: "" },
    { name: "Ooze Stage 4 Choice B", uuid: "" }
])

export const oozeTestDef = {
    id: "ooze",
    name: "Ooze",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: []
}
