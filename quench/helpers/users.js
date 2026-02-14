export async function withGM(isGM, fn)
{
    const user = game.user
    const original = user.isGM

    Object.defineProperty(user, "isGM", {
        configurable: true,
        get: () => isGM
    })

    try {
        await fn()
    } finally {
        Object.defineProperty(user, "isGM", {
            configurable: true,
            get: () => original
        })
    }
}

export async function asUser(user, fn)
{
    const originalUser = game.user
    Object.defineProperty(game, "user", {
        configurable: true,
        get: () => user
    })

    try {
        return await fn()
    } finally {
        Object.defineProperty(game, "user", {
            configurable: true,
            get: () => originalUser
        })
    }
}

export async function asNonGMUser(fn)
{
    const nonGMUser = {
        isGM: false,
        active: true
    }

    return asUser(nonGMUser, fn)
}

export async function asGMUser(fn)
{
    return asUser(
        { isGM: true, active: true },
        fn
    )
}