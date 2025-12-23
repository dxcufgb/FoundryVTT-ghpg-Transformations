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
	return (actor.system.attributes.hp.value <= (actor.system.attributes.hp.max / 2));
}

export async function createActiveEffectOnActor(actor, effectName, description, icon, changes) {
	console.log(`creating activeEffect with effects:`)
	console.log(changes)
	await actor.createEmbeddedDocuments("ActiveEffect", [{
		label: effectName,
		name: effectName,
		description: description,
		statuses: [effectName.replaceAll(" ", "")],
		img: icon,
		changes: changes,
		origin: actor.uuid,
		flags: {
			["gh-transformation"]: { removeOnLongRest: true }
		},
	}]);
}

export function getSystemEffectChange(identifier, value, changeType) {
	const overrideType = findOverrideType(identifier)
	effects = [
		{ key: `system.${overrideType}.${identifier}`, mode: changeType, value: value }
	]
	return effects;
}

export function getDisadvantageEffectChanges(identifier, type = ROLL_TYPE.ABILITY_CHECK) {
	if (SKILL.contains(identifier)) {
		return getSkillDisadvantageEffectChanges(identifier)
	} else if (ABILITY.contains(identifier)) {
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			return getAbilityCheckDisadvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			return getAbilitySaveDisadvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getDisadvantageEffectChanges`)
		}
	} else if (ATTRIBUTE.ROLLABLE.contains(identifier)) {
		return getAttributeDisadvantageEffectChanges(identifier)
	} else {
		console.log(`Unknown identifier "${identifier} in getDisadvantageEffectChanges"`)
	}
}

export function getAdvantageEffectChanges(identifier, type = ROLL_TYPE.ABILITY_CHECK) {
	if (SKILL.contains(identifier)) {
		return getSkillAdvantageEffectChanges(identifier)
	} else if (ABILITY.contains(identifier)) {
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			return getAbilityCheckAdvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			return getAbilitySaveAdvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getAdvantageEffectChanges`)
		}
	} else if (ATTRIBUTE.ROLLABLE.contains(identifier)) {
		return getAttributeAdvantageEffectChanges(identifier)
	} else {
		console.log(`Unknown identifier "${identifier} in getAdvantageEffectChanges"`)
	}
}

export function getSkillDisadvantageEffectChanges(skill) {
	effects = [
		// { key: `system.skills.${skill}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skill}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function getSkillAdvantageEffectChanges(skill) {
	effects = [
		// { key: `system.skills.${skill}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skill}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAbilityCheckDisadvantageEffectChanges(ability) {
	effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function getAbilitySaveDisadvantageEffectChanges(ability) {
	effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function getAbilityCheckAdvantageEffectChanges(ability) {
	effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAbilitySaveAdvantageEffectChanges(ability) {
	effects = [
		// { key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAttributeAdvantageEffectChanges(attribute) {
	effects = [
		// { key: `system.attributes.${attribute}.roll.advantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attributes.${attribute}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		// { key: `system.attributes.${attribute}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

export function getAttributeDisadvantageEffectChanges(attribute) {
	effects = [
		// { key: `system.attributes.${attribute}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attributes.${attribute}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 },
		// { key: `system.attributes.${attribute}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

export function findOverrideType(identifier) {
	if (MOVEMENT_TYPE.contains(identifier)) {
		return OVERRIDE_TYPE.MOVEMENT_TYPE;
	} else if (ATTRIBUTE.contains(identifier) || ATTRIBUTE.ROLLABLE.contains(identifier)) {
		return OVERRIDE_TYPE.ATTRIBUTES;
	} else {
		console.log(`Uknown identifier: ${identifier} in findOverrideType!`);
	}

}