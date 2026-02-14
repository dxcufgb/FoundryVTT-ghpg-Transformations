let _dependencies = null
let _services = null
let _infrastructure = null
let _macros = null
let _logger = null
let _initialized = false
function assertCanMutate({ allowOnce = false } = {})
{
    if (globalThis.__TRANSFORMATIONS_TEST__) return

    if (allowOnce && !_initialized) return

    throw new Error(
        "Registry mutation is only allowed during initial bootstrap or tests"
    )
}

export function finalizeRegistry()
{
    _initialized = true
}

export const Registry = Object.seal({
    get dependencies()
    {
        return _dependencies
    },
    get services()
    {
        return _services
    },
    get infrastructure()
    {
        return _infrastructure
    },
    get macros()
    {
        return _macros
    },
    get logger()
    {
        return _logger
    }
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Explicit setters (tests only)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function setRegistryDependencies(dependencies, options)
{
    assertCanMutate(options)
    _dependencies = dependencies
}

export function setRegistryServices(services, options)
{
    assertCanMutate(options)
    _services = services
}

export function setRegistryInfrastructure(infrastructure, options)
{
    assertCanMutate(options)
    _infrastructure = infrastructure
}

export function setRegistryMacros(macros, options)
{
    assertCanMutate(options)
    _macros = macros
}

export function setRegistryLogger(logger, options)
{
    assertCanMutate(options)
    _logger = logger
}
