// ===== التشغيل الرئيسي =====
import { initScrollAnimations, initLazyLoading, initContactForm, initCounters, initNavbar } from './ui';
import { initProductsSystem } from './products';
import { initCartSystem } from './cart'; // Initialize cart

document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initScrollAnimations();
    initLazyLoading();
    initContactForm();
    initCounters();

    // تهيئة نظام المنتجات
    initProductsSystem();
    initCartSystem();
});
