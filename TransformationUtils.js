export function getCurrentActor(name = null) {
	let actor
	if (!name) {
		actor = game.user.character ?? canvas.tokens.controlled[0]?.actor ?? this.actor;
	} else {
		actor = game.actors.getName(name);
	}
	return actor;
}

export function actorIsBloodied(actor) {
	return actor.statuses.has("bloodied");
}

export async function createActiveEffectOnActor(actor, effectName, description, icon, changes) {
	await actor.createEmbeddedDocuments("ActiveEffect", [{
		label: effectName,
		name: effectName,
		description: description,
		statuses: [effectName.replaceAll(" ", "")],
		img: icon,
		changes: changes,
		origin: actor.uuid,
		flags: {
			[TransformationModule.constants.EFFECT_FLAG_MODULE_NAME]: { removeOnLongRest: true }
		},
	}]);
}

export function getSystemEffectChange(identifier, value, changeType) {
	const overrideType = findOverrideType(identifier)
	const effects = [
		{ key: `system.${overrideType}.${identifier}`, mode: changeType, value: value }
	]
	return effects;
}

export function getDisadvantageEffectChanges(identifier, type = TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK) {
	if (TransformationModule.constants.SKILL.contains(identifier)) {
		return getSkillDisadvantageEffectChanges(identifier)
	} else if (TransformationModule.constants.ABILITY.contains(identifier)) {
		if (type == TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK) {
			return getAbilityCheckDisadvantageEffectChanges(identifier)
		} else if (type == TransformationModule.constants.ROLL_TYPE.SAVING_THROW) {
			return getAbilitySaveDisadvantageEffectChanges(identifier)
		} else {
			TransformationModule.logger.warn(`Unknown roll type "${type}" in getDisadvantageEffectChanges`)
		}
	} else if (TransformationModule.constants.ATTRIBUTE.ROLLABLE.contains(identifier)) {
		return getAttributeDisadvantageEffectChanges(identifier)
	} else {
		TransformationModule.logger.warn(`Unknown identifier "${identifier} in getDisadvantageEffectChanges"`)
	}
}

export function getAdvantageEffectChanges(identifier, type = TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK) {
	if (TransformationModule.constants.SKILL.contains(identifier)) {
		return getSkillAdvantageEffectChanges(identifier)
	} else if (TransformationModule.constants.ABILITY.contains(identifier)) {
		if (type == TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK) {
			return getAbilityCheckAdvantageEffectChanges(identifier)
		} else if (type == TransformationModule.constants.ROLL_TYPE.SAVING_THROW) {
			return getAbilitySaveAdvantageEffectChanges(identifier)
		} else {
			TransformationModule.logger.warn(`Unknown roll type "${type}" in getAdvantageEffectChanges`)
		}
	} else if (TransformationModule.constants.ATTRIBUTE.ROLLABLE.contains(identifier)) {
		return getAttributeAdvantageEffectChanges(identifier)
	} else {
		TransformationModule.logger.warn(`Unknown identifier "${identifier} in getAdvantageEffectChanges"`)
	}
}

export function getSkillDisadvantageEffectChanges(skill) {
	const effects = [
		// { key: `system.skills.${skill}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skill}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function getSkillAdvantageEffectChanges(skill) {
	const effects = [
		// { key: `system.skills.${skill}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skill}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAbilityCheckDisadvantageEffectChanges(ability) {
	const effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function getAbilitySaveDisadvantageEffectChanges(ability) {
	const effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function getAbilityCheckAdvantageEffectChanges(ability) {
	const effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAbilitySaveAdvantageEffectChanges(ability) {
	const effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAttributeAdvantageEffectChanges(attribute) {
	const effects = [
		// { key: `system.attributes.${attribute}.roll.advantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attributes.${attribute}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		// { key: `system.attributes.${attribute}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAttributeDisadvantageEffectChanges(attribute) {
	const effects = [
		// { key: `system.attributes.${attribute}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attributes.${attribute}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 },
		// { key: `system.attributes.${attribute}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function findOverrideType(identifier) {
	if (TransformationModule.constants.MOVEMENT_TYPE.contains(identifier)) {
		return TransformationModule.constants.OVERRIDE_TYPE.MOVEMENT_TYPE;
	} else if (TransformationModule.constants.ATTRIBUTE.contains(identifier) || TransformationModule.constants.ATTRIBUTE.ROLLABLE.contains(identifier)) {
		return TransformationModule.constants.OVERRIDE_TYPE.ATTRIBUTES;
	} else {
		TransformationModule.logger.warn(`Uknown identifier: ${identifier} in findOverrideType!`);
	}
}

export async function renderTransformationTemplate(templateName, data) {
	TransformationModule.logger.debug("renderTemplate: ", templateName, data)
	const html = await foundry.applications.handlebars.renderTemplate(
		`modules/transformations/scripts/templates/${templateName}.hbs`,
		data
	);
	TransformationModule.logger.debug("new template:", html);
	return html;
}

export async function importCompendiumPack(compendiumName) {
	const pack = game.packs.get(compendiumName);
	const index = await pack.getIndex();
	pack.index = index;
	return pack;
}

// const html = await renderTemplate(
//   "modules/your-module/templates/background-card.hbs",
//   {
//     name: "Acolyte",
//     img: "systems/dnd5e/icons/backgrounds/acolyte.webp",
//     abilityScores: "Intelligence, Wisdom, Charisma",
//     feat: "Magic Initiate (Cleric)",
//     skillProficiencies: "Insight, Religion",
//     toolProficiencies: "Calligrapher’s Supplies",
//     equipment: "Calligrapher’s supplies, holy symbol, prayer book, parchment, robe, 8 gp",
//     description: `
//       <p>
//         You devoted yourself to service in a temple, either nestled in a town
//         or secluded in a sacred grove. There you performed rites in honor of a
//         god or pantheon.
//       </p>
//       <p>
//         You served under a priest and studied religion. Thanks to your devotion,
//         you learned to channel divine power in service to your place of worship.
//       </p>
//     `
//   }
// );
