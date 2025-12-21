const SKILL = Object.freeze({
	ACROBATICS: "acr",
	ANIMAL_HANDLING: "ani",
	ARCANA: "arc",
	ATHLETICS: "ath",
	DECEPTION: "dec",
	HISTORY: "his",
	INSIGHT: "ins",
	INTIMIDATION: "itm",
	INVESTIGATION: "inv",
	MEDICINE: "med",
	NATURE: "nat",
	PERCEPTION: "prc",
	PERFORMANCE: "prf",
	PERSUASION: "per",
	RELIGION: "rel",
	SLEIGHT_OF_HAND: "slh",
	STEALTH: "ste",
	SURVIVAL: "sur"
});

const ABILITY = Object.freeze({
	STRENGTH: "str",
	DEXTERITY: "dex",
	CONSTITUTION: "con",
	INTELLIGENCE: "int",
	WISDOM: "wis",
	CHARISMA: "cha"
});

const ROLL_TYPE = Object.freeze({
	ABILITY_CHECK: 0,
	SAVING_THROW: 1
});

const MOVEMENT_TYPE = Object.freeze({
	BURROW: "burrow",
	CLIMB: "climb",
	FLY: "fly",
	SWIM: "swim",
	WALK: "walk"
});

const OVERRIDE_TYPE = Object.freeze({
	MOVEMENT_TYPE: "attributes.movement",
	ATTRIBUTES: "attributes"
});

const ATTRIBUTES = Object.freeze({
	HEALT_POINTS: "hp.value",
	HEALT_POINTS_MAX: "hp.max",
	ROLLABLE: Object.freeze({
		CONCENTRATION: "concentration",
		DEATH_SAVES: "death",
		INITIATIVE: "init"
	})
});

function getActorTransformationLevel(actor, transformationType) {
	const level = actor.system.scale["aberrant-horror"]["aberrant-transformation-level"].value;
	return level;
}

function getCurrentActor() {
	const actor = game.user.character ?? canvas.tokens.controlled[0]?.actor ?? this.actor;
	return actor;
}

function actorIsBloodied(actor) {
	return (actor.system.attributes.hp.value <= (actor.system.attributes.hp.max / 2))
}

function actorIsHidingHideousForm(actor) {
	return (actor.system.concentration.ability == "Hide Hideous Form")
}

Hooks.on("drawTableResult", async (table, result, options) => {
	const speaker = ChatMessage.getSpeaker();
	const actor = ChatMessage.getSpeakerActor(speaker);
	const tableName = table.name
	console.log(`${actor.name} rolled on table ${tableName}!`)
	switch (tableName) {
		case tableName.startswith(actor, "Unstable Form"):
			console.log("Applying result from unstable form macros!")
			await applyUnstableForm(result.name);
			break;
	}
});

Hooks.once("dnd5e.restCompleted", async (actor, result) => {
	if (result.shortRest) {
		if (actor.statuses.contains("Abberant Loss of Vitality" && dhd != 0)) {
			actor.system.attributes.hp.value -= ((dhd * -1) * actor.system.abilities.con.mod)
		}
	} else if (result.longRest) {
		// const effectsToRemove = actor.effects.filter(effect =>
		// 	[...effect.statuses].some(status => status.startsWith("aberrant"))
		// );
		// if (!effectsToRemove.length) return;
		// await actor.deleteEmbeddedDocuments(
		// 	"ActiveEffect",
		// 	effectsToRemove.map(e => e.id)
		// );
	}
});

Hooks.on("combatantRollInitiative", (combatant, roll) => {
	const actor = combatant.actor
	if (actor.statuses.includes("AberrantConfusion")) {
		actor.toggleStatusEffect("stunned", { active: true });
	}
});

function createActiveEffectOnActor(actor, effectName, description, icon, changes) {
	actor.createEmbeddedDocuments("ActiveEffect", [{
		label: effectName,
		name: effectName,
		description: description,
		statuses: [effectName.replace(" ", "")],
		icon: icon,
		changes: changes,
		origin: actor.uuid
	}]);
}

function getSystemEffectChange(identifier, value, changeType) {
	const overrideType = findOverrideType(identifier)
	effects = [
		{ key: `system.${overrideType}.${skillKey}`, mode: changeType, value: value }
	]
}

function getDisadvantageEffectChanges(identifier, type = ROLL_TYPE.ABILITY_CHECK) {
	if (SKILL.includes(identifier)) {
		getSkillDisadvantageEffectChanges(identifier)
	} else if (ABILITY.includes(identifier)) {
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			getAbilityCheckDisadvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			getAbilitySaveDisadvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getDisadvantageEffectChanges`)
		}
	} else {
		console.log(`Unknown identifier "${identifier} in getDisadvantageEffectChanges"`)
	}
}

function getAdvantageEffectChanges(identifier, type = ROLL_TYPE.ABILITY_CHECK) {
	if (SKILL.includes(identifier)) {
		getSkillAdvantageEffectChanges(identifier)
	} else if (ABILITY.includes(identifier)) {
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			getAbilityCheckAdvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			getAbilitySaveAdvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getAdvantageEffectChanges`)
		}
	} else if (ATTRIBUTES.includes(identifier)) {
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			getAttributeCheckAdvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			getAttributeSaveAdvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getAdvantageEffectChanges`)
		}
	} else {
		console.log(`Unknown identifier "${identifier} in getAdvantageEffectChanges"`)
	}
}

function getSkillDisadvantageEffectChanges(skill) {
	skillKey = SKILLS.skill
	effects = [
		// { key: `system.skills.${skillKey}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skillKey}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
}

function getAbilityCheckDisadvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability

	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${skillKey}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
}

function getAbilitySaveDisadvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability
	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${skillKey}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
}

function getSkillAdvantageEffectChanges(skill) {
	skillKey = SKILLS.skill
	effects = [
		// { key: `system.skills.${skillKey}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skillKey}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
}

function getAbilityCheckAdvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability
	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${skillKey}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
}

function getAbilitySaveAdvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability
	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${skillKey}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
}

function getAttributeCheckAdvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability
	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${skillKey}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
}

function getAttributeSaveAdvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability
	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${skillKey}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
}

function getAttributeCheckDisadvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability

	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${skillKey}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
}

function geAttributeSaveDisadvantageEffectChanges(ability) {
	abilityKey = ABILITIES.ability
	effects = [
		// { key: `system.abilities.${skillKey}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${skillKey}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
}

function findOverrideType(identifier) {
	if (MOVEMENT_TYPE.includes(identifier)) {
		return OVERRIDE_TYPE.MOVEMENT_TYPE
	} else if (ATTRIBUTES.includes(identifier)) {
		return OVERRIDE_TYPE.ATTRIBUTES
	}
		
}