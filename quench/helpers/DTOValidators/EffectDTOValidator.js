import { resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class EffectDTOValidator extends BaseDTOValidator
{
    static rules = {
        name: resolve(ctx => resolveEffectDocument(ctx)?.name ?? null).equals(),
        description: resolve(ctx =>
            resolveEffectDescription(resolveEffectDocument(ctx))
        ).normalizedTextEquals(),
        transfer: resolve(ctx => resolveEffectDocument(ctx)?.transfer ?? null).equals(),
        type: resolve(ctx => resolveEffectDocument(ctx)?.type ?? null).equals(),
        collisionTypes: resolve(ctx =>
            Array.from(resolveEffectDocument(ctx)?.system?.collisionTypes ?? [])
        ).equalsArray(),
        distanceFormula: resolve(ctx =>
            resolveEffectDocument(ctx)?.system?.distanceFormula ?? null
        ).equals(),
        statuses: resolve(ctx =>
            Array.from(resolveEffectStatuses(ctx) ?? [])
        ).equalsArray(),
        match: resolve((ctx, expected) =>
            resolveEffectMatchCount(resolveEffectCollection(ctx), expected)
        ).equals(),
        count: resolve(ctx => resolveEffectCollection(ctx)).count().equals(),
        has: resolve(ctx => resolveEffectCollection(ctx)).pluck("name").includesAll(),
        notHas: resolve(ctx => resolveEffectCollection(ctx)).pluck("name").notIncludesAny(),
        withOrigin: resolve(ctx => resolveEffectCollection(ctx)).whereOrigin().count().equals()
    }

    validate(effectOrDto, dtoOrContext = null)
    {
        const { dto, context } =
                  normalizeEffectValidationArgs(effectOrDto, dtoOrContext)

        const validationDto = this.buildValidationDTO(dto)

        this.validateDescription(validationDto.description, context)
        delete validationDto.description

        super.validate(validationDto, context)

        return true
    }

    validateDescription(expectedDescription, context)
    {
        if (expectedDescription === null || expectedDescription === undefined) {
            return
        }

        const normalizedExpected = normalizeComparableText(expectedDescription)
        const normalizedActual = normalizeComparableText(
            resolveEffectDescription(resolveEffectDocument(context))
        )

        this.assert.equal(
            normalizedActual,
            normalizedExpected,
            `[${this.path}.description] Expected ${normalizedExpected} but got ${normalizedActual}`
        )
    }
}

function normalizeEffectValidationArgs(effectOrDto, dtoOrContext)
{
    if (isEffectValidationDTO(effectOrDto)) {
        return {
            dto: effectOrDto,
            context: buildEffectValidationContext(effectOrDto, dtoOrContext)
        }
    }

    return {
        dto: dtoOrContext,
        context: buildEffectValidationContext(dtoOrContext, {
            effect: effectOrDto
        })
    }
}

function isEffectValidationDTO(value)
{
    return value?.constructor?.validator === EffectDTOValidator
}

function buildEffectValidationContext(dto, context = {})
{
    const effects = resolveEffectCollectionSource(context)

    return {
        ...context,
        effect: context?.effect ?? resolveExpectedEffectDocument(dto, effects),
        effects
    }
}

function resolveEffectDocument(ctx)
{
    const effectContext = ctx?.effect ?? null

    if (effectContext?.effectType) {
        return effectContext.effectObject?.effect ??
            effectContext.effectObject ??
            null
    }

    return effectContext
}

function resolveEffectDescription(effectDocument)
{
    if (!effectDocument) {
        return null
    }

    const description =
              effectDocument.description ??
              effectDocument.system?.description?.value ??
              effectDocument.system?.description ??
              null

    if (
        description &&
        typeof description === "object" &&
        typeof description.value === "string"
    ) {
        return normalizeComparableText(description.value)
    }

    return normalizeComparableText(description)
}

function resolveEffectStatuses(ctx)
{
    return resolveEffectDocument(ctx)?.statuses ?? []
}

function resolveEffectCollectionSource(context = {})
{
    return context?.effects ??
        context?.actor?.effects ??
        []
}

function resolveEffectCollection(ctx)
{
    const effects = ctx?.effects ?? []

    if (Array.isArray(effects)) {
        return effects
    }

    if (Array.isArray(effects?.contents)) {
        return effects.contents
    }

    if (typeof effects?.values === "function") {
        return Array.from(effects.values())
    }

    if (typeof effects?.[Symbol.iterator] === "function") {
        return Array.from(effects)
    }

    return Object.values(effects).filter(Boolean)
}

function resolveExpectedEffectDocument(dto, effectsSource)
{
    const effects = resolveEffectCollection({ effects: effectsSource })

    if (!effects.length) {
        return null
    }

    if (dto?.name) {
        const matchingEffect =
            effects.find(effect => effect?.name === dto.name) ?? null

        if (matchingEffect) {
            return matchingEffect
        }
    }

    if (dto?.description) {
        const expectedDescription = normalizeComparableText(dto.description)

        const matchingEffect = effects.find(effect =>
            normalizeComparableText(resolveEffectDescription(effect)) === expectedDescription
        ) ?? null

        if (matchingEffect) {
            return matchingEffect
        }
    }

    if (dto?.type) {
        const matchingEffect =
            effects.find(effect => effect?.type === dto.type) ?? null

        if (matchingEffect) {
            return matchingEffect
        }
    }

    if (dto?.transfer !== null && dto?.transfer !== undefined) {
        const matchingEffect =
            effects.find(effect => effect?.transfer === dto.transfer) ?? null

        if (matchingEffect) {
            return matchingEffect
        }
    }

    if (Array.isArray(dto?.statuses) && dto.statuses.length > 0) {
        const expectedStatuses = [...dto.statuses]

        const matchingEffect = effects.find(effect =>
        {
            const actualStatuses = Array.from(effect?.statuses ?? [])

            if (actualStatuses.length !== expectedStatuses.length) {
                return false
            }

            return expectedStatuses.every(status => actualStatuses.includes(status))
        }) ?? null

        if (matchingEffect) {
            return matchingEffect
        }
    }

    if (effects.length === 1) {
        return effects[0]
    }

    return null
}

function resolveEffectMatchCount(effects, matchConfig)
{
    if (!matchConfig) {
        return 0
    }

    const { matchMode = "or", filters = [] } = matchConfig
    const effectCollection = Array.isArray(effects) ? effects : []

    return effectCollection.filter(effect =>
    {
        if (matchMode === "and") {
            return filters.every(filter => effect?.[filter.key] === filter.value)
        }

        return filters.some(filter => effect?.[filter.key] === filter.value)
    }).length
}

function normalizeComparableText(value)
{
    if (value === null || value === undefined) {
        return value
    }

    if (typeof value === "string") {
        return stripHtmlToComparableText(value)
            .replace(/\s+/gu, " ")
            .trim()
    }

    if (Array.isArray(value)) {
        return normalizeComparableText(value.join(" "))
    }

    if (typeof value === "object") {
        if (typeof value.value === "string") {
            return normalizeComparableText(value.value)
        }

        if (typeof value.text === "string") {
            return normalizeComparableText(value.text)
        }

        const stringValue = value.toString?.()

        if (
            typeof stringValue === "string" &&
            stringValue !== "[object Object]"
        ) {
            return normalizeComparableText(stringValue)
        }
    }

    return String(value)
        .replace(/<br\s*\/?>/giu, " ")
        .replace(/<\/?(?:p|div|li|ul|ol|section|article|header|footer|table|thead|tbody|tr|td|th|h[1-6])\b[^>]*>/giu, " ")
        .replace(/<[^>]+>/gu, " ")
        .replace(/\s+/gu, " ")
        .trim()
}

function stripHtmlToComparableText(value)
{
    const html = String(value ?? "")

    if (typeof DOMParser === "function") {
        const parser = new DOMParser()
        const preparedHtml = html
        .replace(/<br\s*\/?>/giu, " ")
        .replace(
            /<\/?(?:p|div|li|ul|ol|section|article|header|footer|table|thead|tbody|tr|td|th|h[1-6])\b[^>]*>/giu,
            " "
        )

        const document = parser.parseFromString(preparedHtml, "text/html")
        return document.body?.textContent ?? ""
    }

    return html
        .replace(/<br\s*\/?>/giu, " ")
        .replace(/<\/?(?:p|div|li|ul|ol|section|article|header|footer|table|thead|tbody|tr|td|th|h[1-6])\b[^>]*>/giu, " ")
        .replace(/<[^>]+>/gu, " ")
}
