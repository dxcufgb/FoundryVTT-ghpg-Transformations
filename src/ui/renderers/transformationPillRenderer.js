export function createTransformationPillRenderer({
    renderTemplate,
    templates,
    logger
}) {
    async function render(viewModel) {
        if (!viewModel) return null;

        return renderTemplate(
            templates.actorTransformationPill,
            viewModel
        );
    }

    return Object.freeze({ render });
}
