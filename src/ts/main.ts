// ===== التشغيل الرئيسي =====
import { initScrollAnimations, initLazyLoading, initContactForm, initCounters } from './ui';
import { initProductsSystem } from './products';
import { initCartSystem } from './cart'; // Initialize cart

document.addEventListener('DOMContentLoaded', function () {
    // initNavbar(); // Handled by Bootstrap now
    initScrollAnimations();
    initLazyLoading();
    initContactForm();
    initCounters();

    // تهيئة نظام المنتجات
    initProductsSystem();
    initCartSystem();
});
