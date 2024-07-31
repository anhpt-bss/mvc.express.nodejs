const swiper5 = new Swiper('.swiper-single-slide', {
    loop: true,
    centeredSlides: true,
    autoplay: {
        delay: 6000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.slide-swiper-pagination',
        clickable: true,
    },
});
