document.addEventListener('DOMContentLoaded', function() {
    var asideToggle = document.getElementById('aside-toggle');
    var navToggle = document.getElementById('nav-toggle');
    var collapseToggle = document.getElementById('collapse-toggle');
    var adminAside = document.getElementById('admin-aside');
    var menuItems = document.querySelectorAll('.menu-item');

    asideToggle.addEventListener('click', function() {
        adminAside.classList.toggle('active');
    });

    navToggle.addEventListener('click', function() {
        adminAside.classList.toggle('active');
    });

    collapseToggle.addEventListener('click', function() {
        adminAside.classList.toggle('collapsed');
    });

    var currentPath = window.location.pathname;
    menuItems.forEach(function(item) {
        if (item.getAttribute('data-link') === currentPath) {
            item.classList.add('active');
        }
    });
});
