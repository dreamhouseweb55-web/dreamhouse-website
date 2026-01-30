// ===== التشغيل الرئيسي =====
import { initScrollAnimations, initLazyLoading, initContactForm, initCounters, initNavbar } from './ui';
import { initProductsSystem } from './products';
import { initCartSystem } from './cart'; // Initialize cart
import { initNavbarEnhancements } from './navbar'; // Navbar enhancements
import { initSearchSystem } from './search'; // Initialize search
import { showNotification } from './utils';

// Global Error Handling
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global Error:', { message, source, lineno, colno, error });
    showNotification(`حدث خطأ غير متوقع: ${message}`, 'error');
    return false;
};

window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Rejection:', event.reason);
    showNotification(`حدث خطأ في العملية: ${event.reason}`, 'error');
});

function initApp() {
    console.log('App Initializing...');


    try {
        initNavbar();
        initNavbarEnhancements(); // From navbar.ts
        initScrollAnimations();
        initLazyLoading();
        initContactForm();
        initCounters();

        // تهيئة نظام المنتجات
        initProductsSystem();
        initCartSystem();
        initSearchSystem();
    } catch (e) {
        console.error('Initialization Error:', e);
        showNotification('حدث خطأ أثناء تحميل الموقع', 'error');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
