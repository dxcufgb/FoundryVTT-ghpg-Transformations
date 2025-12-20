Hooks.once("init", function(){
	CONFIG.DND5E.featureTypes.transformation = {
		label: "Transformation Feature",
		subtypes: {
			aberrantHorror: "Aberrant Horror",
			fey: "Fey",
			fiend: "Fiend",
			hag: "Hag",
			lich: "Lich",
			lycanthrope: "Lycanthrope",
			ooze: "Ooze",
			primordial: "Primordial",
			seraph: "Seraph",
			shadowsteelGhoul: "Shadowsteel Ghoul",
			specter: "Specter",
			vampire: "Vampire"
		}
	}
	CONFIG.DND5E.statusEffects.aberrantConfusion = {
		img: "systems/dnd5e/icons/svg/statuses/cover-three-quarters.svg"
		name: "Aberrant Confusion"
	}
	CONFIG.DND5E.statusEffects.aberrantDistraction = {
		img: "systems/dnd5e/icons/svg/statuses/cover-three-quarters.svg"
		name: "Aberrant Distraction"
	}
	CONFIG.DND5E.statusEffects.aberrantDefenseless = {
		img: "systems/dnd5e/icons/svg/statuses/cover-three-quarters.svg"
		name: "Aberrant Defenseless"
	}
	CONFIG.DND5E.statusEffects.aberrantClumsiness = {
		img: "systems/dnd5e/icons/svg/statuses/cover-three-quarters.svg"
		name: "Aberrant Clumsiness"
	}
});
