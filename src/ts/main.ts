// ===== التشغيل الرئيسي =====
import { initScrollAnimations, initLazyLoading, initContactForm, initCounters } from './ui';
import { initProductsSystem } from './products';
import './cart'; // Initialize cart

document.addEventListener('DOMContentLoaded', function () {
    // initNavbar(); // Handled by Bootstrap now
    initScrollAnimations();
    initLazyLoading();
    initContactForm();
    initCounters();

    // تهيئة نظام المنتجات
    initProductsSystem();
});
