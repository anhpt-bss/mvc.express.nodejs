document.addEventListener('DOMContentLoaded', function () {
    const filesInputs = document.querySelectorAll('.files-input');

    filesInputs.forEach((input) => {
        input.addEventListener('change', function () {
            previewFiles(this);
        });
    });
});

function previewFiles(input) {
    const previewContainer = document.getElementById(
        input.getAttribute('data-preview-target'),
    );
    previewContainer.innerHTML = ''; // Clear existing previews

    const files = input.files;
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        const previewWrapper = document.createElement('div');
        const previewImage = document.createElement('img');
        const removeButton = document.createElement('button');
        const removeIcon =
            '<svg class="icon icon-clear" style="fill: #fff;"><use xlink:href="/assets/icons/icomoon/symbol-defs.svg#icon-clear"></use></svg>';

        removeButton.type = 'button';
        removeButton.classList.add('remove-button');
        removeButton.innerHTML = removeIcon; // Set inner HTML to remove icon

        reader.onload = function (e) {
            previewImage.src = e.target.result;
        };

        reader.readAsDataURL(file);
        previewWrapper.classList.add('file-preview-item');
        previewWrapper.appendChild(previewImage);
        previewWrapper.appendChild(removeButton);
        previewContainer.appendChild(previewWrapper);

        removeButton.addEventListener('click', function () {
            const updatedFiles = Array.from(input.files).filter(
                (_, i) => i !== index,
            );
            const dataTransfer = new DataTransfer();
            updatedFiles.forEach((file) => dataTransfer.items.add(file));
            input.files = dataTransfer.files;
            previewFiles(input); // Re-render previews
        });
    });
}
