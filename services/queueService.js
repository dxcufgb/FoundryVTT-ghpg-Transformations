export function createQueueService({ userRepository, logger }) {

    async function enqueue(userId, payload) {
        const queue =
            (await userRepository.getFlag(userId, "pendingActions")) ?? [];

        queue.push({
            timestamp: Date.now(),
            payload
        });

        await userRepository.setFlag(userId, "pendingActions", queue);
    }

    async function drain(userId, handler) {
        const queue =
            (await userRepository.getFlag(userId, "pendingActions")) ?? [];

        for (const entry of queue) {
            await handler(entry.payload);
        }

        await userRepository.unsetFlag(userId, "pendingActions");
    }

    return {
        enqueue,
        drain
    };
}
