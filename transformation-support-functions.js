function getActorTransformationLevel(actor, transformationType){
	const level = actor.system.scale["aberrant-horror"]["aberrant-transformation-level"].value;
	return level;
}

function getCurrentActor(){
	const actor = game.user.character ?? canvas.tokens.controlled[0]?.actor ?? this.actor;
	return actor;
}

function actorIsBloodied(actor){
	return (actor.system.attributes.hp.value <= (actor.system.attributes.hp.max / 2))
}

function actorIsHidingHideousForm(actor) {
	return (actor.system.concentration.ability == "Hide Hideous Form")
}

Hooks.on("drawTableResult", async (table, result, options) => {
	const speaker = ChatMessage.getSpeaker();
	const actor = ChatMessage.getSpeakerActor(speaker);
	const tableName = table.name
	switch(tableName){
		case tableName.startswith(actor, "Unstable Form") :
			await applyUnstableForm(result.name);
			break;
	}
});

hooks.once("dnd5e.restCompleted", async (actor, result) => {
	if (result.shortRest){
		if (actor.statuses.contains("Abberant Loss of Vitality" && dhd != 0)){
			actor.system.attributes.hp.value-=((dhd*-1)*actor.system.abilities.con.mod)
		}
	} else if (result.longRest){
		const effectsToRemove = actor.effects.filter(effect =>
		  [...effect.statuses].some(status => status.startsWith("aberrant"))
		);
		if (!effectsToRemove.length) return;
		await actor.deleteEmbeddedDocuments(
		  "ActiveEffect",
		  effectsToRemove.map(e => e.id)
		);
	}
})