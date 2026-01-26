export function stringUtils({ logger }) {
    function capitalize(string) {
        return string[0].toUpperCase() + string.slice(1)
    }

    function humanizeClassName(name) {
        return name.replace(/([a-z])([A-Z])/g, "$1 $2");
    }
    return {
        capitalize,
        humanizeClassName
    }
}