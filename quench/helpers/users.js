export async function withGM(isGM, fn)
{
    return asUser(
        createUserFacade(game.user, {
            isGM,
            role: roleForGMState(isGM)
        }),
        fn
    )
}

function roleForGMState(isGM)
{
    const roles = globalThis.CONST?.USER_ROLES ?? {}

    return isGM
        ? roles.GAMEMASTER ?? 4
        : roles.PLAYER ?? 1
}

export async function asUser(user, fn)
{
    const originalDescriptor = Object.getOwnPropertyDescriptor(game, "user")
    const originalUser = game.user

    Object.defineProperty(game, "user", {
        configurable: true,
        get: () => user
    })

    try {
        return await fn()
    } finally {
        if (originalDescriptor) {
            Object.defineProperty(game, "user", originalDescriptor)
            return
        }

        Object.defineProperty(game, "user", {
            configurable: true,
            get: () => originalUser
        })
    }
}

export async function asNonGMUser(fn)
{
    const nonGMUser = createUserFacade(game.user, {
        isGM: false,
        role: roleForGMState(false),
        active: true
    })

    return asUser(nonGMUser, fn)
}

export async function asGMUser(fn)
{
    return asUser(
        createUserFacade(game.user, {
            isGM: true,
            role: roleForGMState(true),
            active: true
        }),
        fn
    )
}

function createUserFacade(sourceUser, overrides = {})
{
    const user = Object.create(sourceUser ?? null)

    for (const [property, value] of Object.entries(overrides)) {
        Object.defineProperty(user, property, {
            configurable: true,
            enumerable: true,
            get: () => value
        })
    }

    return user
}
