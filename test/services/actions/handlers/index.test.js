import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/* Mock action factories                                               */
/* ------------------------------------------------------------------ */

vi.mock("@src/services/actions/handlers/hp.js", () => ({
  createHpAction: vi.fn(),
}));

vi.mock("@src/services/actions/handlers/item.js", () => ({
  createItemAction: vi.fn(),
}));

vi.mock("@src/services/actions/handlers/rollTable.js", () => ({
  createRollTableAction: vi.fn(),
}));

vi.mock("@src/services/actions/handlers/chat.js", () => ({
  createChatAction: vi.fn(),
}));

vi.mock("@src/services/actions/handlers/save.js", () => ({
  createSaveAction: vi.fn(),
}));

vi.mock("@src/services/actions/handlers/effect.js", () => ({
  createEffectAction: vi.fn(),
}));

vi.mock("@src/services/actions/handlers/macroAction.js", () => ({
  createMacroAction: vi.fn(),
}));

/* ------------------------------------------------------------------ */
/* Import module namespaces                                            */
/* ------------------------------------------------------------------ */

import * as hpModule from "@src/services/actions/handlers/hp.js";
import * as itemModule from "@src/services/actions/handlers/item.js";
import * as rollTableModule from "@src/services/actions/handlers/rollTable.js";
import * as chatModule from "@src/services/actions/handlers/chat.js";
import * as saveModule from "@src/services/actions/handlers/save.js";
import * as effectModule from "@src/services/actions/handlers/effect.js";
import * as macroModule from "@src/services/actions/handlers/macroAction.js";

import { createActionHandlers } from
  "@src/services/actions/handlers/index.js";

describe("createActionHandlers", () => {
  let deps;
  let sentinels;

  beforeEach(() => {
    sentinels = {
      rolltable: vi.fn(),
      chat: vi.fn(),
      effect: vi.fn(),
      hp: vi.fn(),
      item: vi.fn(),
      macro: vi.fn(),
      save: vi.fn(),
    };

    hpModule.createHpAction.mockReturnValue(sentinels.hp);
    itemModule.createItemAction.mockReturnValue(sentinels.item);
    rollTableModule.createRollTableAction
      .mockReturnValue(sentinels.rolltable);
    chatModule.createChatAction
      .mockReturnValue(sentinels.chat);
    saveModule.createSaveAction
      .mockReturnValue(sentinels.save);
    effectModule.createEffectAction
      .mockReturnValue(sentinels.effect);
    macroModule.createMacroAction
      .mockReturnValue(sentinels.macro);

    deps = {
      directMacroInvoker: {},
      actorRepository: {},
      itemRepository: {},
      activeEffectRepository: {},
      rollTableService: {},
      rollTableEffectResolver: {},
      logger: {},
    };
  });

  it("creates and returns all action handlers", () => {
    const handlers = createActionHandlers(deps);

    expect(rollTableModule.createRollTableAction)
      .toHaveBeenCalledWith({
        rollTableService: deps.rollTableService,
        rollTableEffectResolver: deps.rollTableEffectResolver,
        logger: deps.logger,
      });

    expect(chatModule.createChatAction)
      .toHaveBeenCalledWith({ logger: deps.logger });

    expect(effectModule.createEffectAction)
      .toHaveBeenCalledWith({
        activeEffectRepository: deps.activeEffectRepository,
        logger: deps.logger,
      });

    expect(hpModule.createHpAction)
      .toHaveBeenCalledWith({
        actorRepository: deps.actorRepository,
        logger: deps.logger,
      });

    expect(itemModule.createItemAction)
      .toHaveBeenCalledWith({
        itemRepository: deps.itemRepository,
        logger: deps.logger,
      });

    expect(macroModule.createMacroAction)
      .toHaveBeenCalledWith({
        directMacroInvoker: deps.directMacroInvoker,
        logger: deps.logger,
      });

    expect(saveModule.createSaveAction)
      .toHaveBeenCalledWith({ logger: deps.logger });

    expect(handlers).toEqual({
      APPLY_ROLLTABLE: sentinels.rolltable,
      CHAT: sentinels.chat,
      EFFECT: sentinels.effect,
      HP: sentinels.hp,
      ITEM: sentinels.item,
      MACRO: sentinels.macro,
      SAVE: sentinels.save,
    });

    expect(Object.isFrozen(handlers)).toBe(true);
  });
});
