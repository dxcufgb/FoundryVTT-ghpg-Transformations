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