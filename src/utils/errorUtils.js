export function ErrorUtils({ }) {
    function throwIfErrors(errors) {
        if (!errors.length) return;

        if (errors.some(e => e.throwError === true)) {
            throw new Error(
                "Validation failed:\n" +
                errors.map(e => `• ${e.objectType}:${e.reason}`).join("\n")
            );
        }
    }

    return {
        throwIfErrors
    }

}