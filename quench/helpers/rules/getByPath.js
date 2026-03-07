export function getByPath(obj, path)
{
    if (!path) return obj

    const segments = path
        .replace(/\[(.*?)\]/g, ".$1")
        .split(".")
        .filter(Boolean)

    let current = obj
    let resolvedPath = ""

    for (const seg of segments) {
        resolvedPath += (resolvedPath ? "." : "") + seg

        if (current == null || !(seg in current)) {
            return undefined
        }

        current = current[seg]
    }

    return current
}