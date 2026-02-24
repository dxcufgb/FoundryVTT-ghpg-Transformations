export function enumUtils({ logger }) {

    function enumContains(enumContainer, identifier) {
        return Object.values(enumContainer).includes(identifier);
    }
    return {
        enumContains
    }
}