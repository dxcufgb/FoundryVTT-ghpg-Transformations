// @ts-check

export class RuleRegistry
{
    /** @type {Map<string, Function>} */
    static rules = new Map()

    /**
     * Register a rule
     * @param {string} name
     * @param {(args: {expected:any, actual:any, path:string, assert:any}) => void} fn
     */
    static register(name, fn)
    {
        if (this.rules.has(name)) {
            throw new Error(`Rule "${name}" is already registered`)
        }

        this.rules.set(name, fn)
    }

    /**
     * Get a rule
     */
    /**
     * Retrieves a rule by name from the registry.
     * @param {string} name - The name of the rule to retrieve.
     * @returns {*} The rule object associated with the given name.
     * @throws {Error} Throws an error if the rule with the specified name is not found.
     */
    static get(name)
    {
        const rule = this.rules.get(name)

        if (!rule) {
            throw new Error(`Unknown rule "${name}"`)
        }

        return rule
    }

    /**
     * Check if rule exists
     */
    /**
     * Checks if a rule with the specified name exists in the registry.
     * @param {string} name - The name of the rule to check
     * @returns {boolean} True if a rule with the given name exists, false otherwise
     */
    static has(name)
    {
        return this.rules.has(name)
    }

    /**
     * Return all rule names (used by DSL proxy)
     */
    static names()
    {
        return [...this.rules.keys()]
    }

    /**
     * Register namespaced rule
     */
    /**
     * Registers a rule function with a namespaced key.
     * @param {string} namespace - The namespace prefix for the rule
     * @param {string} name - The name of the rule
     * @param {any} fn - The rule function to register
     */
    static registerNS(namespace, name, fn)
    {
        const key = `${namespace}.${name}`
        this.register(key, fn)
    }

    /**
     * Retrieve namespaced rule
     */
    /**
     * Retrieves a rule from the registry using a namespaced key.
     * @param {string} namespace - The namespace identifier for the rule
     * @param {string} name - The name of the rule within the namespace
     * @returns {*} The rule value associated with the namespaced key
     */
    static getNS(namespace, name)
    {
        return this.get(`${namespace}.${name}`)
    }

    /**
     * Debug helper
     */
    static list()
    {
        return [...this.rules.keys()]
    }
}