document.addEventListener('DOMContentLoaded', function () {
    const asideToggle = document.getElementById('aside-toggle');
    const navToggle = document.getElementById('nav-toggle');
    const collapseToggle = document.getElementById('collapse-toggle');
    const adminAside = document.getElementById('admin-aside');
    const menuItems = document.querySelectorAll('.menu-item');

    asideToggle.addEventListener('click', function () {
        adminAside.classList.toggle('active');
    });

    navToggle.addEventListener('click', function () {
        adminAside.classList.toggle('active');
    });

    collapseToggle.addEventListener('click', function () {
        adminAside.classList.toggle('collapsed');
        localStorage.setItem('mvc_admin_aside', adminAside.classList[1] || '');
    });

    // Set menu collapsed
    if (localStorage.getItem('mvc_admin_aside') === 'collapsed') {
        adminAside.classList.toggle('collapsed');
    }

    // Set menu active
    const currentPath = window.location.pathname;
    menuItems.forEach(function (item) {
        if (
            (item.getAttribute('data-link') === '/admin' &&
                item.getAttribute('data-link') === currentPath) ||
            (item.getAttribute('data-link') !== '/admin' &&
                (item.getAttribute('data-link') === currentPath ||
                    currentPath.includes(item.getAttribute('data-link'))))
        ) {
            item.classList.add('active');
        }
    });
});
