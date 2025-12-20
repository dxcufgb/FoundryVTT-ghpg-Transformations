function applyUnstableForm(actor, resultName) {
  return new Promise((resolve) => {
    switch(resultName){
	  case "Aberrant Exhaustion":
		const current = actor.system.attributes.exhaustion ?? 0;
		const newValue = Math.clamp(current + 2, 0, 6);

		await actor.update({
		  "system.attributes.exhaustion": newValue
		});
		resolve(true);
		break;
	  case "Aberrant Distraction":
		await actor.createEmbeddedDocuments("ActiveEffect", [{
		  label: resultName,
		  icon: "icons/svg/poison.svg",
		  statuses: ["aberrantDistraction"],
		  changes: [{
			key: "system.skills.prc.check.bonuses.disadvantage",
			mode: CONST.ACTIVE_EFFECT_MODES.ADD,
			value: 1
		  }],
		  origin: actor.uuid
		}]);
	    resolve(true);
	    break;
	  case "Aberrant Defenseless":
		await actor.createEmbeddedDocuments("ActiveEffect", [{
		  label: resultName,
		  icon: "icons/svg/poison.svg",
		  statuses: ["aberrantDefenseless"],
		  changes: [{
			key: "system.abilities.con.check.bonuses.disadvantage"",
			mode: CONST.ACTIVE_EFFECT_MODES.ADD,
			value: 1
		  }],
		  origin: actor.uuid
		}]);
	    resolve(true);
	    break;
	case "Aberrant Clumsiness":
		actor.system.abilities.dex.save.roll.modeCounts.disadvantage.count++;
		actor.system.abilities.dex.check.roll.modeCounts.disadvantage.count++;
		actor.createEmbeddedDocuments("ActiveEffect", [{
			label: resultName,
			icon: "icons/svg/poison.svg",
			statuses: ["aberrantClumsiness"],
			changes: [{
				key: "system.abilities.con.check.bonuses.disadvantage"",
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: 1
			  },
			  {
				key: "system.abilities.con.check.bonuses.disadvantage"",
				mode: CONST.ACTIVE_EFFECT_MODES.ADD,
				value: 1
			  }],
			origin: actor.uuid
		}]);
	    resolve(true);
	    break;
	}
  });
}