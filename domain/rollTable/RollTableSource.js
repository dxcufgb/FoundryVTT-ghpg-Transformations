import { RollSource } from "./RollSource.js";

export class RollTableSource extends RollSource {
	constructor({ compendiumRepository, compendiumKey, tableName, actor }) {
		super();
		this.repository = compendiumRepository;
		this.compendiumKey = compendiumKey;
		this.tableName = tableName;
		this.actor = actor;
	}

	async roll() {
		const table = await this.repository.getRollTable(
			this.compendiumKey,
			this.tableName
		);

		if (!table) return null;

		return table.draw({
			speaker: this.actor,
			roll: true,
			displayChat: true
		});
	}
}
