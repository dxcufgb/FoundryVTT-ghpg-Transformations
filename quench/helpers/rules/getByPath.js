export function getByPath(obj, path)
{
    return path.split(".").reduce((acc, key) =>
    {
        if (Array.isArray(acc))
            return acc.map(v => v?.[key])

        return acc?.[key]
    }, obj)
}