document.addEventListener('DOMContentLoaded', function () {
    const dropdownBtn = document.getElementById('click-dropdown');

    // When the user clicks on the button, toggle between hiding and showing the dropdown content
    function toggleDropdownContent() {
        document.getElementById('dropdown-content').classList.toggle('show');
    }

    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', toggleDropdownContent);
    }

    // Close the dropdown if the user clicks outside of it
    window.onclick = function (event) {
        if (!event.target.matches('#click-dropdown')) {
            const dropdowns = document.getElementById('dropdown-content');
            if (dropdowns) {
                if (dropdowns.classList.contains('show')) {
                    dropdowns.classList.remove('show');
                }
            }
        }
    };
});
