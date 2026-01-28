export function stringUtils({ logger }) {
    function capitalize(string = "") {
        if (!string) return "";
        return string[0].toUpperCase() + string.slice(1);
    }
    

    function humanizeClassName(name) {
        return name.replaceAll(/([a-z])([A-Z])/g, "$1 $2");
    }
    return {
        capitalize,
        humanizeClassName
    }
}