document.addEventListener('DOMContentLoaded', (event) => {
    const isError = JSON.parse(
        document.getElementById('toast-data').dataset.error,
    );
    const message = JSON.parse(
        document.getElementById('toast-data').dataset.message,
    );
    const errors = JSON.parse(
        document.getElementById('toast-data').dataset.errors,
    );
    const errorMessages = errors.map((error) => error.msg).join('<br>');

    showToastEventHandler(isError, message, errorMessages);
    closeToastEventHandler();
});

// Function to show toast
function showToastEventHandler(isError, message, errors) {
    const toast = document.getElementById('com-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastContent = document.getElementById('toast-content');

    toastTitle.innerHTML = message;
    toastContent.innerHTML = errors;

    if (isError) {
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
