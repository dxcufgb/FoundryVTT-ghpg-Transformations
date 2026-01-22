export function objectUtils({ logger }) {

    function getObjectValuesAsList(object) {
        return Object.values({
            object
        });
    }

    return {
        getObjectValuesAsList
    }
}