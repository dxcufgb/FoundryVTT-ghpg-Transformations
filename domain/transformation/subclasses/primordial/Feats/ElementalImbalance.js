const TEMPLATE_PATH =
          "modules/midi-qol/templates/activity-card.hbs"

const ELEMENTAL_IMBALANCE_UUID =
          "Compendium.transformations.gh-transformations.Item.3QhO2SkFHqms1sIl"
const ELEMENTAL_IMBALANCE_ITEM_NAME = "Elemental Imbalance"
const ELEMENTAL_IMBALANCE_DAMAGE_TYPES = new Set([
    "acid",
    "cold",
    "fire",
    "lightning",
    "thunder"
])
const ELEMENTAL_IMBALANCE_SAVE_ABILITY = "con"
const ELEMENTAL_IMBALANCE_SAVE_DC = 15
const DAMAGE_TYPE_LABELS = Object.freeze({
    acid: "Acid",
    cold: "Cold",
    fire: "Fire",
    lightning: "Lightning",
    thunder: "Thunder"
})

export class ElementalImbalance
{
    static id = "elementalImbalance"
    static itemSourceUuid = ELEMENTAL_IMBALANCE_UUID
    static rollFormula = "1d6"
    static saveAbility = ELEMENTAL_IMBALANCE_SAVE_ABILITY
    static saveDc = ELEMENTAL_IMBALANCE_SAVE_DC

    static actorHasFeat(actor)
    {
        return this.resolveFeat(actor) != null
    }

    static async onPreCalculateDamage({
        actor,
        damage,
        details,
        logger
    } = {})
    {
        if (!actor) return

        const feat = this.resolveFeat(actor)
        if (!feat) return

        const triggerDamage = this.resolveTriggerDamage({
            actor,
            damage,
            details
        })
        if (!triggerDamage) return

        logger?.debug?.("ElementalImbalance.onPreCalculateDamage", {
            actor,
            triggerDamage
        })

        await this.createChatMessage({
            actor,
            feat,
            triggerDamage
        })
    }

    static bind({
        actor,
        message,
        html,
        activeEffectRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    } = {})
    {
        const root = resolveHtmlRoot(html)
        if (!root) return

        const card = root.matches?.(CARD_SELECTOR)
            ? root
            : root.querySelector?.(CARD_SELECTOR)
        if (!card) return

        if (card.dataset.primordialActivity !== this.id) return

        if (card.dataset.bound === "true") return
        card.dataset.bound = "true"

        card.addEventListener("click", async event =>
        {
            const rollButton =
                      event.target.closest("[data-primordial-action='roll']") ??
                      event.target.closest("[data-transformations-action='roll']")
            if (rollButton) {
                event.preventDefault()
                event.stopPropagation()

                if (!this.canRollVolatileReaction(actor)) {
                    ui?.notifications?.warn?.(
                        "Only the affected actor's owner or the GM can roll Elemental Imbalance."
                    )
                    return
                }

                logger?.debug?.("ElementalImbalance.bind.roll", {
                    actor,
                    message
                })

                await this.roll({
                    actor,
                    message,
                    activeEffectRepository,
                    ChatMessagePartInjector,
                    RollService
                })
                return
            }

            const saveButton =
                      event.target.closest("[data-primordial-action='roll-save']") ??
                      event.target.closest("[data-action='rollSave']")
            if (!saveButton) return

            event.preventDefault()
            event.stopPropagation()

            logger?.debug?.("ElementalImbalance.bind.rollSave", {
                message,
                user: game.user
            })

            await this.rollSave({
                event,
                button: saveButton
            })
        })
    }

    static async roll({
        actor,
        message,
        activeEffectRepository,
        ChatMessagePartInjector,
        RollService
    } = {})
    {
        if (
            !actor ||
            !message ||
            !activeEffectRepository ||
            !RollService
        )
        {
            return
        }

        const damageType = this.normalizeDamageType(
            message?.flags?.transformations?.damageType
        )
        if (!damageType) return

        const damageTypeLabel =
                  message?.flags?.transformations?.damageTypeLabel ??
                  this.getDamageTypeLabel(damageType)
        const originalDamage =
                  Number(message?.flags?.transformations?.originalDamage ?? 0)
        const roll = await RollService.simpleRoll(this.rollFormula)
        const isTriggered = roll.total === 1
        const feat = this.resolveFeat(actor)

        if (isTriggered) {
            await this.applyDamageVulnerability({
                actor,
                feat,
                damageType,
                damageTypeLabel,
                activeEffectRepository
            })
        }

        const state = isTriggered
            ? "rolled-triggered"
            : "rolled-safe"

        await message.update({
            "flags.transformations.state": state,
            "flags.transformations.presentedRoll": {
                total: roll.total
            },
            "flags.transformations.vulnerabilityApplied": isTriggered
        })

        await this.replaceMessageCard({
            message,
            content: await this.renderCard({
                actor,
                feat,
                damageTypeLabel,
                originalDamage,
                state,
                roll,
                vulnerabilityApplied: isTriggered
            })
        })
    }

    static resolveFeat(actor)
    {
        return actor?.items?.find(item =>
            this.resolveSourceUuid(item) === ELEMENTAL_IMBALANCE_UUID ||
            item?.name === ELEMENTAL_IMBALANCE_ITEM_NAME
        ) ?? null
    }

    static resolveTriggerDamage({
        actor,
        damage,
        details
    } = {})
    {
        const map = actor.getFlag("transformations", "damageTypePerMidiId") ?? {};
        const midiSourceUuid = details?.midi?.sourceActorUuid ?? null
        const damageType =
                  this.normalizeDamageType(
                      midiSourceUuid
                          ? map[midiSourceUuid]
                          : null
                  ) ??
                  this.resolveDamageType(details)
        const amount = this.resolveDamageAmount(damage)

        if (!damageType || !Number.isFinite(amount) || amount <= 0) {
            return null
        }

        return {
            type: damageType,
            label: this.getDamageTypeLabel(damageType),
            amount
        }
    }

    static resolveDamageType(node)
    {
        const directCandidates = [
            node?.damageType,
            node?.type,
            node?.kind,
            node?.damage?.type
        ]

        for (const candidate of directCandidates) {
            const normalized = this.normalizeDamageType(candidate)
            if (normalized) return normalized
        }

        const typeCollections = [
            node?.types,
            node?.damageTypes,
            node?.options?.types,
            node?.damage?.types
        ]

        for (const collection of typeCollections) {
            const normalized = this.resolveFirstDamageType(collection)
            if (normalized) return normalized
        }

        return null
    }

    static resolveFirstDamageType(collection)
    {
        if (!collection) return null

        if (typeof collection === "string") {
            return this.normalizeDamageType(collection)
        }

        if (collection instanceof Set) {
            for (const entry of collection) {
                const normalized = this.normalizeDamageType(entry)
                if (normalized) return normalized
            }

            return null
        }

        if (Array.isArray(collection)) {
            for (const entry of collection) {
                const normalized = this.normalizeDamageType(entry)
                if (normalized) return normalized
            }

            return null
        }

        return null
    }

    static resolveDamageAmount(node)
    {
        if (typeof node === "number") {
            return Number.isFinite(node)
                ? node
                : null
        }

        const candidates = [
            node?.value,
            node?.amount,
            node?.total,
            node?.damage,
            node?.appliedDamage,
            node?.hpDamage,
            node?.points,
            node?.raw,
            node?.damage?.value,
            node?.damage?.amount,
            node?.damage?.total
        ]

        for (const candidate of candidates) {
            const amount = Number(candidate)
            if (Number.isFinite(amount)) return amount
        }

        return null
    }

    static normalizeDamageType(value)
    {
        if (typeof value !== "string") return null

        const normalized = value.trim().toLowerCase()
        return ELEMENTAL_IMBALANCE_DAMAGE_TYPES.has(normalized)
            ? normalized
            : null
    }

    static getDamageTypeLabel(damageType)
    {
        return DAMAGE_TYPE_LABELS[damageType] ?? damageType
    }

    static async createChatMessage({
        actor,
        feat,
        triggerDamage
    } = {})
    {
        if (!actor || !triggerDamage) return null

        const content = await this.renderCard({
            actor,
            feat,
            damageTypeLabel: triggerDamage.label,
            originalDamage: triggerDamage.amount,
            state: "initial"
        })

        return ChatMessage.create({
            speaker: ChatMessage.getSpeaker({actor}),
            content,
            flags: {
                transformations: {
                    primordialActivity: this.id,
                    state: "initial",
                    damageType: triggerDamage.type,
                    damageTypeLabel: triggerDamage.label,
                    originalDamage: triggerDamage.amount,
                    itemUuid: feat?.uuid ?? null,
                    rollFormula: this.rollFormula,
                    vulnerabilityApplied: false
                }
            }
        })
    }

    static async renderCard({
        actor,
        feat,
        damageTypeLabel,
        originalDamage,
        state,
        roll = null,
        vulnerabilityApplied = false
    } = {})
    {
        const templateData = {
            actor: {
                id: actor?.id ?? "",
                uuid: actor?.uuid ?? ""
            },
            item: {
                id: feat?.id ?? "elemental-imbalance",
                uuid: feat?.uuid ?? actor?.uuid ?? "",
                img: feat?.img ?? "icons/magic/air/wind-swirl-orange.webp",
                name: feat?.name ?? ELEMENTAL_IMBALANCE_ITEM_NAME,
                system: {
                    level: 0
                }
            },
            activity: {
                name: "Volatile Reaction",
                midiProperties: {
                    displayActivityName: true
                }
            },
            description: {
                concealed: false,
                chat: this.buildDescriptionHtml({
                    damageTypeLabel,
                    originalDamage
                })
            },
            subtitle: `Trigger: ${damageTypeLabel} (${originalDamage})`,
            hasButtons: true,
            hasAttack: false,
            hasDamage: false,
            hasEffects: false,
            hasAttackRoll: false,
            confirmAttackDamage: false,
            condensed: false,
            mergeCardMulti: false,
            hideItemDetails: false,
            displayProperties: false,
            properties: [],
            supplements: this.buildSupplements({
                state,
                damageTypeLabel,
                originalDamage,
                vulnerabilityApplied
            }),
            buttons: this.buildButtons({state})
        }

        const rendered =
                  await foundry.applications.handlebars.renderTemplate(
                      TEMPLATE_PATH,
                      templateData
                  )

        const wrapper = document.createElement("div")
        wrapper.innerHTML = rendered.trim()

        const card = wrapper.firstElementChild
        if (!card) return rendered

        card.dataset.transformationsCard = "true"
        card.dataset.primordialActivity = this.id
        card.dataset.state = state
        card.classList.add("primordial-elemental-imbalance-card")

        if (this.shouldDisplaySaveDc(state)) {
            card.dataset.displayChallenge = ""
        }

        if (roll) {
            const utilityRollContainer = card.querySelector(".end-midi-qol-utility-roll")
            if (utilityRollContainer) {
                utilityRollContainer.innerHTML = await roll.render()
            }
        }

        return card.outerHTML
    }

    static buildButtons({
        state
    } = {})
    {
        if (state === "initial") {
            return [{
                icon: "",
                label: "Roll",
                isDisabled: "",
                dataset: {
                    primordialAction: "roll"
                }
            }]
        }

        if (state === "rolled-triggered") {
            return [this.buildSaveButton()]
        }

        return []
    }

    static buildSaveButton()
    {
        return {
            icon: '<i class="fa-solid fa-shield-heart" inert></i>',
            label: this.buildSaveButtonLabel(),
            isDisabled: "",
            dataset: {
                primordialAction: "roll-save",
                action: "rollSave",
                ability: this.saveAbility,
                dc: this.saveDc,
                visibility: "all"
            }
        }
    }

    static buildSaveButtonLabel()
    {
        const ability = this.getSaveAbilityLabel()
        return [
            `<span class="visible-dc">${game.i18n.format("DND5E.SavingThrowDC", {dc: this.saveDc, ability})}</span>`,
            `<span class="hidden-dc">${game.i18n.format("DND5E.SavePromptTitle", {ability})}</span>`
        ].join("")
    }

    static shouldDisplaySaveDc(state)
    {
        return state === "rolled-triggered"
    }

    static buildDescriptionHtml({
        damageTypeLabel,
        originalDamage
    } = {})
    {
        return [
            "<p>Your body reacts in strange ways to the application of severe elemental damage. When you take Acid, Cold, Fire, Lightning, or Thunder damage, roll 1d6. On a 1, your Primordial form reacts in a volatile manner, and the following effects occur:</p>",
            "<p>You gain Vulnerability to the instance of damage you just took, even if you had Resistance or Immunity to that damage.</p>",
            "<p>Creatures within 5 feet of you take the original amount of damage that you took. A DC 15 Constitution saving throw halves this damage.</p>",
            `<p><strong>Triggering damage:</strong> ${damageTypeLabel} (${originalDamage})</p>`
        ].join("")
    }

    static buildSupplements({
        state,
        damageTypeLabel,
        originalDamage,
        vulnerabilityApplied
    } = {})
    {
        const supplements = [
            `Original damage taken: <strong>${originalDamage}</strong> ${damageTypeLabel}.`
        ]

        if (state === "rolled-triggered") {
            supplements.push(
                vulnerabilityApplied
                    ? `Volatile reaction triggered. Vulnerability to ${damageTypeLabel} damage was applied.`
                    : `Volatile reaction triggered.`
            )
            supplements.push(
                `Affected creatures within 5 feet can click the DC ${this.saveDc} ${this.getSaveAbilityLabel()} saving throw button to halve this damage.`
            )
        } else if (state === "rolled-safe") {
            supplements.push("No volatile reaction occurs.")
        } else {
            supplements.push("Roll 1d6 to determine whether the volatile reaction occurs.")
        }

        return supplements
    }

    static async replaceMessageCard({
        message,
        content
    } = {})
    {
        if (!message || !content) return

        const wrapper = document.createElement("div")
        wrapper.innerHTML = message.content

        const target = wrapper.querySelector(CARD_SELECTOR)
        if (!target) {
            await message.update({content})
            return
        }

        target.outerHTML = content

        await message.update({
            content: wrapper.innerHTML
        })
    }

    static async applyDamageVulnerability({
        actor,
        feat,
        damageType,
        damageTypeLabel,
        activeEffectRepository
    } = {})
    {
        if (!actor || !damageType || !activeEffectRepository) return null

        const effectName = this.buildVulnerabilityEffectName(damageTypeLabel)
        if (activeEffectRepository.hasByName(actor, effectName)) {
            return activeEffectRepository.findByName(actor, effectName)
        }

        return activeEffectRepository.create({
            actor,
            name: effectName,
            description:
                `Gain vulnerability to ${damageTypeLabel.toLowerCase()} damage from Elemental Imbalance.`,
            source: "transformation",
            icon: feat?.img ?? null,
            origin: feat?.uuid ?? actor?.uuid ?? "",
            changes: [{
                key: "system.traits.dv.value",
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.ADD ?? 2,
                value: damageType
            }],
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    elementalImbalance: true,
                    damageType
                },
                dae: {
                    specialDuration: ["longRest"]
                }
            }
        })
    }

    static buildVulnerabilityEffectName(damageTypeLabel)
    {
        return `Elemental Imbalance Vulnerability: ${damageTypeLabel}`
    }

    static canRollVolatileReaction(actor)
    {
        return Boolean(game.user?.isGM || actor?.isOwner)
    }

    static async rollSave({
        event,
        button
    } = {})
    {
        if (!button) return

        const ability = button.dataset.ability ?? this.saveAbility
        const dc = Number(button.dataset.dc ?? this.saveDc)
        const targets = this.resolveSaveTargets()

        if (!targets.length) {
            ui?.notifications?.warn?.("DND5E.ActionWarningNoToken", {
                localize: true
            })
            return
        }

        for (const token of targets) {
            const actor = token?.actor ?? null
            if (!actor?.rollSavingThrow) continue

            const speaker = ChatMessage.getSpeaker({
                actor,
                scene: canvas.scene,
                token: token.document
            })

            await actor.rollSavingThrow({
                event,
                ability,
                target: Number.isFinite(dc)
                    ? dc
                    : this.saveDc
            }, {}, {
                data: {
                    speaker
                }
            })
        }
    }

    static resolveSaveTargets()
    {
        let targets =
                canvas?.tokens?.controlled?.filter(token => token?.actor) ?? []

        if (!targets.length && game.user.character) {
            targets = game.user.character.getActiveTokens()
        }

        return targets
    }

    static getSaveAbilityLabel()
    {
        return CONFIG?.DND5E?.abilities?.[this.saveAbility]?.label ?? "Constitution"
    }

    static resolveSourceUuid(document)
    {
        return (
            document?.flags?.transformations?.sourceUuid ??
            document?.flags?.core?.sourceId ??
            document?._stats?.compendiumSource ??
            document?.uuid ??
            null
        )
    }
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}

const CARD_SELECTOR =
          "[data-transformations-card][data-primordial-activity='elementalImbalance']"
