// ===== واجهة المستخدم والرسوم المتحركة =====

function initNavbar() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function () {
            navbarMenu.classList.toggle('active');
        });
    }

    // تفعيل الرابط النشط
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-menu a');

    navLinks.forEach(link => {
        // Basic check, can be improved
        if (link.getAttribute('href').endsWith(currentPage) && currentPage.length > 1) {
            link.classList.add('active');
        } else if (window.location.pathname === '/' && link.getAttribute('href') === '/') {
            link.classList.add('active');
        }
    });

    // إخفاء القائمة عند الضغط خارجها
    document.addEventListener('click', function (event) {
        if (navbarMenu && !event.target.closest('.navbar') && navbarMenu.classList.contains('active')) {
            navbarMenu.classList.remove('active');
        }
    });

    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 100) {
            navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card, .feature-card, .section-title').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                obs.unobserve(img);
            }
        });
    });
    images.forEach(img => observer.observe(img));
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            btn.disabled = true;

            setTimeout(() => {
                showNotification('تم استلام رسالتك بنجاح! سنتواصل معك قريباً.', 'success');
                this.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1500);
        });
    }
}

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.dataset.target;
                const step = target / 50;
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.innerText = target;
                        clearInterval(timer);
                    } else {
                        counter.innerText = Math.ceil(current);
                    }
                }, 20);
                observer.unobserve(counter);
            }
        });
    });
    counters.forEach(c => observer.observe(c));
}
