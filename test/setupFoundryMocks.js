global.game = {
    i18n: { localize: (s) => s },
    user: { isGM: true },
    actors: new Map(),
    items: new Map(),
    tables: new Map(),
  };
  
  global.foundry = {
    utils: {
      deepClone: structuredClone
    }
  };
  
  global.CONFIG = {
    Actor: {},
    Item: {},
};
  
global.Roll = class {
    constructor(formula) {
      this.formula = formula;
      this.total = 10;
    }
    async evaluate() {
      return this;
    }
};