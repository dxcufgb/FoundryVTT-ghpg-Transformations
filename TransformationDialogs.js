export async function getD20RollDialog(actor, identifier, rollType, dc = null, mode = TransformationModule.constants.ROLL_MODE.NORMAL.int) {
    if (!actor) {
        ui.notifications.warn("Select a token.");
        return;
    }

    let config = {};
    
    if (mode == TransformationModule.constants.ROLL_MODE.ADVANTAGE.int) {
        config.advantage = true
    }
    
    if (mode == TransformationModule.constants.ROLL_MODE.DISADVANTAGE.int) {
        config.disadvantage = true
    }
    
    if (TransformationModule.constants.ABILITY.contains(identifier)) {
        config.ability = identifier;
        if (rollType == TransformationModule.constants.ROLL_TYPE.SAVING_THROW) {
            if (dc != null) {
                config.target = dc
            }
            return actor.rollSavingThrow(config);
        } else if (rollType == TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK) {
            return actor.rollAbilityCheck(config);
        }
    } else if (TransformationModule.constants.SKILL.contains(identifier)) {
        config.skill = identifier;
        return actor.rollSkill(config);
    } else {
        ui.notifications.warn("Uknown roll type");
    }
}

export async function getDropDownChoiceDialog(title, choices) {
    // choices = Array.from(TransformationModule.Transformations.values())
    await new foundry.applications.api.DialogV2({
        window: { title: title },
        content: `
       <div style="display: flex; justify-content: center;"><h4 style="text-align: center;">${title}</h4></div>
        <form>
          <div class="form-group" style="margin-left: 2.5em; margin-right: 2.5em; margin-bottom: 1em;">
            <label style="margin: 0em 0em 0em 1em; flex: 3;">Choose Transformation label</label>
            <select name="choice" style="padding: 0.2em 2.5em 0.2em 0.75em; min-width: 28ch; line-height: 1.4; margin: 0em 1em 0em 2em;">
              ${choices.map(t => `<option value="${t.id}">${t.name}</option>`).join("")}
            </select>
          </div>
        </form>
      `,
      buttons: [
        {
          action: "ok",
          label: "Confirm",
          default: true,
          callback: (event, button, html) => {
            resolve(html.querySelector("[name='choice']").value);
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          callback: () => resolve(null)
        }
      ]
    }).render(true);
}