export class ActionResult {
    static applied(data = {}) {
        return { applied: true, ...data };
    }

    static skipped(reason) {
        return { applied: false, skipped: true, reason };
    }

    static failed(error) {
        return { applied: false, error };
    }

    static blocked(reason) {
        return { applied: false, block: true, reason };
    }
}