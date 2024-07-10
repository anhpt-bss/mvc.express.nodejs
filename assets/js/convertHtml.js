// public/assets/js/convertHtml.js
document.addEventListener('DOMContentLoaded', function () {
    const detectLinksButton = document.getElementById('detectLinksButton');
    const replaceLinksButton = document.getElementById('replaceLinksButton');
    const htmlTextarea = document.getElementById('htmlTextarea');
    const urlsTextarea = document.getElementById('urlsTextarea');
    const changeUrlsTextarea = document.getElementById('changeUrlsTextarea');
    const responseHtmlTextarea = document.getElementById(
        'responseHtmlTextarea',
    );

    detectLinksButton.addEventListener('click', () => {
        const htmlContent = htmlTextarea.value;
        const regex = /https:\/\/ckbox.cloud\/[^\s"']+/g;
        const urls = htmlContent.match(regex);
        urlsTextarea.value = JSON.stringify(urls, null, 4);
    });

    replaceLinksButton.addEventListener('click', () => {
        const htmlContent = htmlTextarea.value;
        const mappings = JSON.parse(changeUrlsTextarea.value);

        let updatedHtmlContent = htmlContent;
        mappings.forEach((mapping) => {
            const regex = new RegExp(mapping.old_path, 'g');
            updatedHtmlContent = updatedHtmlContent.replace(
                regex,
                mapping.new_path,
            );
        });

        responseHtmlTextarea.value = updatedHtmlContent;
    });
});
