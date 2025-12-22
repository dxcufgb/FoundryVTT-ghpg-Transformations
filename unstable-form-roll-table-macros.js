async function applyUnstableForm(actor, effectName) {
	let effectDescription = '';
	let iconFilePath = '';
	let effects = [];
	let runEffectsFunction = true;
	let tempEffects
	switch (effectName) {
		case "Aberrant Exhaustion":
			const currentExhaustion = actor.system.attributes.exhaustion ?? 0;
			const newExhaustion = Math.clamp(currentExhaustion + 2, 0, 6);
			actor.update({
				"system.attributes.exhaustion": newExhaustion
			});
			runEffectsFunction = false;
			break;
		case "Aberrant Confusion":
			effectDescription = "After rolling Initiative, you have the Stunned condition until the end of your first turn";
			iconFilePath = "icons/svg/poison.svg";
			break;
		case "Aberrant Slowness":
			effectDescription = "After rolling Initiative, you have the Stunned condition until the end of your first turn";
			iconFilePath = "icons/svg/poison.svg";
			console.log("looping over movement types");
			Object.values(MOVEMENT_TYPE).forEach(movementType => {
				if (actor.system.attributes.movement[movementType] > 0) {
					effects = effects.concat(getSystemEffectChange(movementType, -15, CONST.ACTIVE_EFFECT_MODES.ADD));
				}
			});
			console.log("Aberrant Powerfull Lower Limbs was activated with the following values:");
			console.log(effects);
			break;
		case "Aberrant Slugginess":
			effectDescription = "Your body does not react quickly to mental commands. You cannot take Reactions.";
			iconFilePath = "icons/svg/poison.svg";
			break;
		case "Aberrant Distraction":
			effectDescription = "Imposes disadvantage on dexterity saving throws";
			iconFilePath = "icons/svg/poison.svg";
			effects = effects.concat(getDisadvantageEffectChanges(SKILL.PERCEPTION, ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Defenseless":
			effectDescription = "Imposes disadvantage on constitution saving throws";
			iconFilePath = "icons/svg/poison.svg";
			effects = effects.concat(getDisadvantageEffectChanges(ABILITY.CONSTITUTION, ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Clumsiness":
			effectDescription = "Imposes disadvantage on constitution ability checks and saving throws";
			iconFilePath = "icons/svg/poison.svg";
			effects = effects.concat(getDisadvantageEffectChanges(ABILITY.DEXTERITY, ROLL_TYPE.ABILITY_CHECK));
			effects = effects.concat(getDisadvantageEffectChanges(ABILITY.DEXTERITY, ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Loss of Vitality":
			effectDescription = "Imposes disadvantage on constitution ability checks and saving throws";
			iconFilePath = "icons/svg/poison.svg";
			break;
		case "Aberrant Slow Speech":
			effectDescription = "Speaking is difficult. You can only utter one word during each turn. This does not hamper spellcasting";
			iconFilePath = "icons/svg/poison.svg";
			break;
		case "Aberrant Powerfull Lower Limbs":
			effectDescription = "Your lower limbs become more powerful. Your Speed increases by 5 feet";
			iconFilePath = "icons/svg/poison.svg";
			console.log("looping over movement types");
			Object.values(MOVEMENT_TYPE).forEach(movementType => {
				console.log(movementType);
				console.log(actor.system.attributes.movement[movementType])
				if (actor.system.attributes.movement[movementType] > 0) {
					//TODO: find out whythis does not work.
					effects = effects.concat(getSystemEffectChange(movementType, 5, CONST.ACTIVE_EFFECT_MODES.ADD));
				}
			});
			console.log("Aberrant Powerfull Lower Limbs was activated with the following values:");
			console.log(effects);
			break;
		case "Aberrant Temporary Vitality Boost":
			const currentTempHp = actor.system.attributes.hp.temp ?? 0;
			const newTempHp = currentTempHp + (actor.system.scale["aberrant-horror"]["transformation-level"].value * 4);
			actor.update({
				"system.attributes.hp.temp": newTempHp
			});
			runEffectsFunction = false;
			break;
		case "Aberrant Resilience":
			effectDescription = "Your body’s systems are enhanced. You have Advantage on Death Saving Throws";
			iconFilePath = "icons/svg/poison.svg";
			effects = effects.concat(getAdvantageEffectChanges(ATTRIBUTE.ROLLABLE.DEATH_SAVES, ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Overload":
			effectDescription = "The stress of your Transformation becomes too much. You die. You cannot be restored to life by any spell below level 5";
			actor.update({
				"system.attributes.hp.temp": 0
			});
			actor.update({
				"system.attributes.hp.value": 0
			});
			actor.update({
				"system.attributes.death.failure": 3
			});
			getSimpleDialog(effectName, effectDescription).render(true);
			ChatMessage.create({
				speaker: ChatMessage.getSpeaker({ actor }),
				content: effectDescription
			});
			runEffectsFunction = false
			break;
		case "Aberrant Weakness":
			effectDescription = "Your form becomes fragile. Your Hit Point Maximum is half your normal maximum";
			iconFilePath = "icons/svg/poison.svg";
			const newMaxHp = (actor.system.attributes.hp.max / 2);
			effects = effects.concat(getSystemEffectChange(ATTRIBUTE.HEALT_POINTS_MAX, newMaxHp, CONST.ACTIVE_EFFECT_MODES.OVERRIDE));
			break;
		case "Aberrant Weakness":
			effectDescription = "Your body starts to lose cohesion. You have Disadvantage on all D20 Tests.";
			iconFilePath = "icons/svg/poison.svg";
			Object.values(SKILL).forEach(skill => {
				effects = effects.concat(getSkillDisadvantageEffectChanges(skill));
			});
			Object.values(ABILITY).forEach(ability => {
				effects = effects.concat(getAbilityCheckDisadvantageEffectChanges(ability));
				effects = effects.concat(getAbilitySaveDisadvantageEffectChanges(ability));
			});
			Object.values(ATTRIBUTE.ROLLABLE).forEach(attribute => {
				effects = effects.concat(getAttributeCheckDisadvantageEffectChanges(attribute));
				effects = effects.concat(getAttributeSaveDisadvantageEffectChanges(attribute));
			});
			break;
		default:
			//assumed to be a "no effect" result from roll table
			runEffectsFunction = false;
			break;
	}
	if (runEffectsFunction) {
		await createActiveEffectOnActor(actor, effectName, effectDescription, iconFilePath, effects);
	}
}