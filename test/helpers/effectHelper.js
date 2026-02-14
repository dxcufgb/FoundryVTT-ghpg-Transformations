
export function makeEffect({ id, source } = {}) {
  return {
    id,
    getFlag(scope, key) {
      if (scope === "transformations" && key === "source") {
        return source;
      }
      return undefined;
    }
  };
}
  
export function makeEffectsCollection(effects = []) {
    return {
      _items: effects,
  
      filter(fn) {
        return this._items.filter(fn);
      },
  
      some(fn) {
        return this._items.some(fn);
      },
  
      map(fn) {
        return this._items.map(fn);
      }
    };
  }