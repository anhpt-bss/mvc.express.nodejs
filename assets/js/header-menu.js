document.addEventListener('DOMContentLoaded', function () {
    // Side panel
    const openMenuButton = document.querySelectorAll('.open-side-panel-btn');
    const closeMenuButton = document.querySelector('.close-side-panel-btn');
    const menuToggle = document.querySelector('#sidepanel');

    openMenuButton.forEach((button) => {
        button.addEventListener('click', function () {
            menuToggle.style.width = '90vw';
        });
    });

    closeMenuButton.addEventListener('click', function () {
        menuToggle.style.width = '0';
    });

    // Menu collapse
    const toggleButtons = document.querySelectorAll('.toggle-submenu-btn');

    toggleButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            // Prevent the event from bubbling up to parent elements
            event.stopPropagation();

            const listItem = button.closest('li');
            const submenu = listItem.querySelector('.submenu');

            if (submenu) {
                const isExpanded = submenu.classList.contains('open');

                if (isExpanded) {
                    submenu.classList.remove('open');
                    button.classList.remove('active');
                } else {
                    submenu.classList.add('open');
                    button.classList.add('active');
                }
            }
        });
    });

    // Set menu active
    const menuItem = document.querySelectorAll('#menu_item');
    const urlHref = `${this.location.origin}${this.location.pathname}`;

    menuItem.forEach((menu) => {
        if (urlHref === menu.href) {
            menu.classList.add('active');
        }
    });
});
