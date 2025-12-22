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
	SURVIVAL: "sur",
	contains(value) {
		return Object.values(this).includes(value);
	}
});

const ABILITY = Object.freeze({
	STRENGTH: "str",
	DEXTERITY: "dex",
	CONSTITUTION: "con",
	INTELLIGENCE: "int",
	WISDOM: "wis",
	CHARISMA: "cha",
	contains(value) {
		return Object.values(this).includes(value);
	}
});

const ROLL_TYPE = Object.freeze({
	ABILITY_CHECK: 0,
	SAVING_THROW: 1,
	contains(value) {
		return Object.values(this).includes(value);
	}
});

const MOVEMENT_TYPE = Object.freeze({
	BURROW: "burrow",
	CLIMB: "climb",
	FLY: "fly",
	SWIM: "swim",
	WALK: "walk",
	contains(value) {
		return Object.values(this).includes(value);
	}
});

const OVERRIDE_TYPE = Object.freeze({
	MOVEMENT_TYPE: "attributes.movement",
	ATTRIBUTES: "attributes",
	contains(value) {
		return Object.values(this).includes(value);
	}
});

const ATTRIBUTE = Object.freeze({
	HEALT_POINTS: "hp.value",
	HEALT_POINTS_MAX: "hp.max",
	ROLLABLE: Object.freeze({
		CONCENTRATION: "concentration",
		DEATH_SAVES: "death",
		INITIATIVE: "init",
		contains(value) {
			return Object.values(this).includes(value);
		}
	}),
	contains(value) {
		return Object.values(this).includes(value);
	}
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

Hooks.on("dnd5e.restCompleted", async (actor, result) => {
	if (result.type == "short") {
		if (actor.statuses.has("AberrantLossofVitality") && result.dhd != 0) {
			console.log(result.dhd);
			console.log((result.dhd * -1));
			console.log()
			console.log((result.dhd * -1) * actor.system.abilities.con.mod);
			actor.system.attributes.hp.value -= ((result.dhd * -1) * actor.system.abilities.con.mod);
		}
	} else if (result.longRest) {
		const transformationTableName = findTransformationTableName(actor);
		if (transformationTableName != "") {
			await removeActiveTransformationEffect(actor);
			const drawResult = await drawTableResult(actor, transformationTableName);
			applyRollTableResult(actor, drawResult.results[0].name, transformationTableName);
		}
	}
});

Hooks.on("dnd5e.rollInitiative", (actor, combatant) => {
	console.log(`${actor.name} rolled for initiative!`);
	if (actor.statuses.has("AberrantConfusion")) {
		actor.toggleStatusEffect("stunned", { active: true });
		ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ actor }),
			content: `Due to Aberrant Confusion ${actor.name} is stunned for the first round!`
		});
	}
});

async function createActiveEffectOnActor(actor, effectName, description, icon, changes) {
	console.log(`creating activeEffect with effects:`)
	console.log(changes)
	await actor.createEmbeddedDocuments("ActiveEffect", [{
		label: effectName,
		name: effectName,
		description: description,
		statuses: [effectName.replaceAll(" ", "")],
		img: icon,
		changes,
		origin: actor.uuid,
		flags: {
			["gh-transformation"]: { removeOnLongRest: true }
		},
	}]);
}

function getSystemEffectChange(identifier, value, changeType) {
	const overrideType = findOverrideType(identifier)
	effects = [
		{ key: `system.${overrideType}.${identifier}`, mode: changeType, value: value }
	]
	return effects;
}

function getDisadvantageEffectChanges(identifier, type = ROLL_TYPE.ABILITY_CHECK) {
	console.log(`looking for ${identifier}`);
	if (SKILL.contains(identifier)) {
		console.log(`${identifier} is SKILL`);
		return getSkillDisadvantageEffectChanges(identifier)
	} else if (ABILITY.contains(identifier)) {
		console.log(`${identifier} is ABILITY`);
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			return getAbilityCheckDisadvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			return getAbilitySaveDisadvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getDisadvantageEffectChanges`)
		}
	} else if (ATTRIBUTE.contains(identifier)) {
		console.log(`${identifier} is ATTRIBUTE`);
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			return getAttributeCheckDisadvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			return getAttributeSaveDisadvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getDisadvantageEffectChanges`)
		}
	} else {
		console.log(`Unknown identifier "${identifier} in getDisadvantageEffectChanges"`)
	}
}

function getAdvantageEffectChanges(identifier, type = ROLL_TYPE.ABILITY_CHECK) {
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
	} else if (ATTRIBUTE.contains(identifier)) {
		if (type == ROLL_TYPE.ABILITY_CHECK) {
			return getAttributeCheckAdvantageEffectChanges(identifier)
		} else if (type == ROLL_TYPE.SAVING_THROW) {
			return getAttributeSaveAdvantageEffectChanges(identifier)
		} else {
			console.log(`Unknown roll type "${type}" in getAdvantageEffectChanges`)
		}
	} else {
		console.log(`Unknown identifier "${identifier} in getAdvantageEffectChanges"`)
	}
}

function getSkillDisadvantageEffectChanges(skill) {
	console.log(`using key: system.skills.${skill}.roll.mode`)
	effects = [
		{ key: `system.skills.${skill}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skill}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

function getSkillAdvantageEffectChanges(skill) {
	console.log(`using key: system.skills.${skill}.roll.mode`)
	effects = [
		{ key: `system.skills.${skill}.check.bonuses.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 },
		{ key: `system.skills.${skill}.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAbilityCheckDisadvantageEffectChanges(ability) {
	console.log(`using key: system.skills.${ability}.roll.mode`)
	effects = [
		{ key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

function getAbilitySaveDisadvantageEffectChanges(ability) {
	console.log(`using key: system.skills.${ability}.roll.mode`)
	effects = [
		{ key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

function getAbilityCheckAdvantageEffectChanges(ability) {
	console.log(`using key: system.skills.${ability}.roll.mode`)
	effects = [
		{ key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAbilitySaveAdvantageEffectChanges(ability) {
	console.log(`using key: system.skills.${ability}.roll.mode`)
	effects = [
		{ key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAbilityCheckAdvantageEffectChanges(ability) {
	console.log(`using key: system.skills.${ability}.roll.mode`)
	effects = [
		{ key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAbilitySaveAdvantageEffectChanges(ability) {
	console.log(`using key: system.skills.${ability}.roll.mode`)
	effects = [
		{ key: `system.abilities.${ability}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.abilities.${ability}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAttributeCheckAdvantageEffectChanges(attribute) {
	console.log(`using key: system.skills.${attribute}.roll.mode`)
	effects = [
		{ key: `system.abilities.${attribute}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${attribute}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAttributeSaveAdvantageEffectChanges(attribute) {
	console.log(`using key: system.skills.${attribute}.roll.mode`)
	effects = [
		{ key: `system.abilities.${attribute}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${attribute}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1 }
	]
	return effects;
}

function getAttributeCheckDisadvantageEffectChanges(attribute) {
	console.log(`using key: system.skills.${attribute}.roll.mode`)
	effects = [
		{ key: `system.abilities.${attribute}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${attribute}.check.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

function geAttributeSaveDisadvantageEffectChanges(attribute) {
	console.log(`using key: system.skills.${attribute}.roll.mode`)
	effects = [
		{ key: `system.abilities.${attribute}.roll.disadvantage`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: true },
		{ key: `system.attribute.${attribute}.save.roll.mode`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: -1 }
	]
	return effects;
}

function findOverrideType(identifier) {
	if (MOVEMENT_TYPE[identifier]) {
		return OVERRIDE_TYPE[MOVEMENT_TYPE]
	} else if (ATTRIBUTE[identifier]) {
		return OVERRIDE_TYPE[ATTRIBUTES]
	}

}

function findTransformationTableName(actor) {
	const scale = actor.system.scale
	let tablePrefix = ""
	let transformationLevel = 0
	let tableName
	if (scale["aberrant-horror"]) {
		transformationLevel = scale["aberrant-horror"]["transformation-level"].value;
		tablePrefix = "Unstable Form Stage "
	}
	if (tablePrefix == "") {
		console.log("No table found");
		return "";
	}
	switch (transformationLevel) {
		case 1:
			tableName = tablePrefix + "1";
			break;
		case 2:
			tableName = tablePrefix + "2";
			break;
		case 3:
			tableName = tablePrefix + "3";
			break;
		case 4:
			tableName = tablePrefix + "4";
			break;
	}
	return tableName;
}

async function drawTableResult(actor, tableName) {
	const table = game.tables.getName(tableName);
	if (!table) {
		ui.notifications.error(`Table "${tableName}" not found`);
		return;
	}
	const draw = await table.draw({ speaker: actor, roll: true, displayChat: true });
	return draw;
}

async function applyRollTableResult(actor, resultName, transformationTableName) {
	if (transformationTableName.startsWith("Unstable Form")) {
		await applyUnstableForm(actor, resultName);
	}
}

async function removeActiveTransformationEffect(actor) {
	const effects = actor.effects.filter(e =>
		e.flags["gh-transformation"]?.removeOnLongRest
	);

	if (effects.length) {
		await actor.deleteEmbeddedDocuments(
			"ActiveEffect",
			effects.map(e => e.id)
		);
	}
}