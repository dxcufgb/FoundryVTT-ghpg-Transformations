export function objectUtils({ logger }) {
    function getObjectValuesAsList(object) {
      if (!object || typeof object !== "object") {
        return [];
      }
  
      return Object.values(object);
    }
  
    return {
      getObjectValuesAsList
    };
  }
  