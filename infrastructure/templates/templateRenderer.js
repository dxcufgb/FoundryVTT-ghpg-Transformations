export function createTemplateRenderer({ logger }) {

    async function render(templatePath, data) {
        logger.debug("Rendering template", templatePath, data);

        const html =
            await foundry.applications.handlebars.renderTemplate(
                templatePath,
                data
            );

        logger.debug("Rendered template output", html);
        return html;
    }

    return {
        render
    };
}
