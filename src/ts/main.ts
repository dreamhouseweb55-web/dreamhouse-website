// ===== التشغيل الرئيسي =====
document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initScrollAnimations();
    initLazyLoading();
    initContactForm();
    initCounters();

    // تهيئة نظام المنتجات والسلة
    initProductsSystem();
    updateCartDisplay();
});
