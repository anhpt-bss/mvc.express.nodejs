document.addEventListener('DOMContentLoaded', (event) => {
    const toastData = document.getElementById('toast-data');
    if (toastData) {
        const type = JSON.parse(toastData.dataset.type);
        const title = JSON.parse(toastData.dataset.title);
        const content = JSON.parse(toastData.dataset.content);
        const errors = JSON.parse(toastData.dataset.errors);
        const errorMessages = errors.map((error) => error.msg).join('<br>');

        showToastEventHandler(type, title, content, errorMessages);
        closeToastEventHandler();
    }
});

// Function to show toast
function showToastEventHandler(type, title, content, errorMessages) {
    const toast = document.getElementById('com-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastContent = document.getElementById('toast-content');

    toastTitle.innerHTML = title;
    toastContent.innerHTML =
        content !== '' && errorMessages !== ''
            ? content + '<br>' + errorMessages
            : content + errorMessages;

    if (type === 'success') {
        toast.classList.add('bg-success');
    } else if (type === 'error') {
        toast.classList.add('bg-error');
    } else if (type === 'warning') {
        toast.classList.add('bg-warning');
    } else {
        toast.classList.add('bg-info');
    }
    toast.classList.add('show');

    // Hide toast after 5 seconds
    setTimeout(function () {
        toast.classList.remove('show');
    }, 5000);
}

// Function to close toast
function closeToastEventHandler() {
    const closeButton = document.getElementById('toast-btn-close');

    if (closeButton) {
        closeButton.addEventListener('click', closeToast);
    }

    function closeToast() {
        var toastElement = document.getElementById('com-toast');
        if (toastElement) {
            toastElement.classList.remove('show');
        }
    }
}
