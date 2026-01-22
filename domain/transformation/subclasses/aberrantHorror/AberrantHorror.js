import { Transformation } from "../../Transformation.js";

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class AberrantHorror extends Transformation {

    static type = "aberrantHorror";
    static displayName = "Aberrant Horror"
    static itemId = "aberrant-horror";
    static uuid = "Compendium.transformations.gh-transformations.Item.LYRqg32rV17vq7L2";

    /**
     * Domain-specific trigger hooks (optional).
     * These return *descriptors*, not actions.
     */

    onLongRest() {
        return {
            type: "CHECK_ABERRANT_MUTATION_EFFECTS"
        };
    }

    onDamage() {
        return {
            type: "ABERRANT_MUTATION_ON_DAMAGE"
        };
    }

    onUnconscious() {
        return {
            type: "ABERRANT_MUTATION_ON_UNCONSCIOUS"
        };
    }
}