export class GiftOfJoyousLife
{
    static stage = 1
    static description = "At the beginning of your turn, if you are Bloodied, you can choose to roll a Hit Point Die (no action required) and regain a number of Hit Points equal to the roll. If you roll a 1 on this die, you regain no Hit points and take 1 point of Force damage instead. You regain this ability when you finish a Short or Long Rest."
    static changes = [
        {
            key: "macro.createItem",
            mode: CONST.ACTIVE_EFFECTS_MODE.CUSTOM,
            value: "Compendium.transformations.gh-transformations.Item.zzXZ3tex07ScSN5L"
        }
    ]
}
