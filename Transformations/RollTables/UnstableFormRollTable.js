export async function applyRollTableResult(actor, effectName, iconBaseFilePath) {
	let effectDescription = '';
	let iconFilePath = iconBaseFilePath;
	let effects = [];
	let runEffectsFunction = true;
	TransformationModule.logger.debug(iconBaseFilePath);
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
			iconFilePath = "Poisonous_Mutations.png";
			break;
		case "Aberrant Slowness":
			effectDescription = "After rolling Initiative, you have the Stunned condition until the end of your first turn";
			iconFilePath = "Poisonous_Mutations.png";
			Object.values(TransformationModule.constants.MOVEMENT_TYPE).forEach(movementType => {
				if (actor.system.attributes.movement[movementType] > 0) {
					effects = effects.concat(TransformationModule.utils.getSystemEffectChange(movementType, -15, CONST.ACTIVE_EFFECT_MODES.ADD));
				}
			});
			break;
		case "Aberrant Slugginess":
			effectDescription = "Your body does not react quickly to mental commands. You cannot take Reactions.";
			iconFilePath = "Poisonous_Mutations.png";
			break;
		case "Aberrant Distraction":
			effectDescription = "Imposes disadvantage on dexterity saving throws";
			iconFilePath = "Poisonous_Mutations.png";
			effects = effects.concat(TransformationModule.utils.getDisadvantageEffectChanges(TransformationModule.constants.SKILL.PERCEPTION, TransformationModule.constants.ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Defenseless":
			effectDescription = "Imposes disadvantage on constitution saving throws";
			iconFilePath = "Poisonous_Mutations.png";
			effects = effects.concat(TransformationModule.utils.getDisadvantageEffectChanges(TransformationModule.constants.ABILITY.CONSTITUTION, TransformationModule.constants.ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Clumsiness":
			effectDescription = "Imposes disadvantage on constitution ability checks and saving throws";
			iconFilePath = "Poisonous_Mutations.png";
			effects = effects.concat(TransformationModule.utils.getDisadvantageEffectChanges(TransformationModule.constants.ABILITY.DEXTERITY, TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK));
			effects = effects.concat(TransformationModule.utils.getDisadvantageEffectChanges(TransformationModule.constants.ABILITY.DEXTERITY, TransformationModule.constants.ROLL_TYPE.SAVING_THROW));
			break;
		case "Aberrant Loss of Vitality":
			effectDescription = "Imposes disadvantage on constitution ability checks and saving throws";
			iconFilePath = "Poisonous_Mutations.png";
			break;
		case "Aberrant Slow Speech":
			effectDescription = "Speaking is difficult. You can only utter one word during each turn. This does not hamper spellcasting";
			iconFilePath = "Poisonous_Mutations.png";
			break;
		case "Aberrant Powerfull Lower Limbs":
			effectDescription = "Your lower limbs become more powerful. Your Speed increases by 5 feet";
			iconFilePath = "Poisonous_Mutations.png";
			Object.values(TransformationModule.constants.MOVEMENT_TYPE).forEach(movementType => {
				if (actor.system.attributes.movement[movementType] > 0) {
					effects = effects.concat(TransformationModule.utils.getSystemEffectChange(movementType, 5, CONST.ACTIVE_EFFECT_MODES.ADD));
				}
			});
			break;
		case "Aberrant Temporary Vitality Boost":
			const currentTempHp = actor.system.attributes.hp.temp ?? 0;
			const newTempHp = currentTempHp + (actor.system.scale["aberrant-horror"]["aberrant-transformation-level"].value * 4);
			actor.update({
				"system.attributes.hp.temp": newTempHp
			});
			runEffectsFunction = false;
			break;
		case "Aberrant Resilience":
			effectDescription = "Your body’s systems are enhanced. You have Advantage on Death Saving Throws";
			iconFilePath = "Poisonous_Mutations.png";
			effects = effects.concat([{
				key: "flags.midi-qol.advantage.deathSave",
				mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
				value: true
			}]);
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
			TransformationModule.dialogs.getSimpleDialog(effectName, effectDescription).render(true);
			ChatMessage.create({
				speaker: ChatMessage.getSpeaker({ actor }),
				content: effectDescription
			});
			runEffectsFunction = false
			break;
		case "Aberrant Weakness":
			effectDescription = "Your form becomes fragile. Your Hit Point Maximum is half your normal maximum";
			iconFilePath = "Poisonous_Mutations.png";
			const newMaxHp = (actor.system.attributes.hp.max / 2);
			effects = effects.concat(TransformationModule.utils.getSystemEffectChange(TransformationModule.constants.ATTRIBUTE.HEALT_POINTS_MAX, newMaxHp, CONST.ACTIVE_EFFECT_MODES.OVERRIDE));
			break;
		case "Aberrant Weakness":
			effectDescription = "Your body starts to lose cohesion. You have Disadvantage on all D20 Tests.";
			iconFilePath = "Poisonous_Mutations.png";
			Object.values(TransformationModule.constants.SKILL).forEach(skill => {
				effects = effects.concat(TransformationModule.utils.getSkillDisadvantageEffectChanges(skill));
			});
			Object.values(TransformationModule.constants.ABILITY).forEach(ability => {
				effects = effects.concat(TransformationModule.utils.getAbilityCheckDisadvantageEffectChanges(ability));
				effects = effects.concat(TransformationModule.utils.getAbilitySaveDisadvantageEffectChanges(ability));
			});
			Object.values(TransformationModule.constants.ATTRIBUTE.ROLLABLE).forEach(attribute => {
				effects = effects.concat(TransformationModule.utils.getAttributeCheckDisadvantageEffectChanges(attribute));
				effects = effects.concat(TransformationModule.utils.getAttributeSaveDisadvantageEffectChanges(attribute));
			});
			break;
		default:
			//assumed to be a "no effect" result from roll table
			runEffectsFunction = false;
			break;
	}
	if (runEffectsFunction) {
		await TransformationModule.utils.createActiveEffectOnActor(actor, effectName, effectDescription, iconFilePath, effects);
	}
}