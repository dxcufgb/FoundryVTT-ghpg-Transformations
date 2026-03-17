export class RollService {

    static async simpleRoll(formula)
    {
        const roll = await new Roll(formula).roll();

        if (game.dice3d) {
            await game.dice3d.showForRoll(roll, game.user, true);
        }

        return roll
    }
}