// ===== واجهة المستخدم والرسوم المتحركة =====
import { showNotification } from './utils';

export function initScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card, .feature-card, .section-title').forEach(el => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

export function initLazyLoading(): void {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src || '';
                img.removeAttribute('data-src');
                obs.unobserve(img);
            }
        });
    });
    images.forEach(img => observer.observe(img));
}

export function initContactForm(): void {
    const contactForm = document.getElementById('contactForm') as HTMLFormElement;
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]') as HTMLButtonElement;
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

export function initCounters(): void {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target as HTMLElement;
                const target = parseInt(counter.dataset.target || '0', 10);
                const step = target / 50;
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.innerText = target.toString();
                        clearInterval(timer);
                    } else {
                        counter.innerText = Math.ceil(current).toString();
                    }
                }, 20);
                observer.unobserve(counter);
            }
        });
    });
    counters.forEach(c => observer.observe(c));
}
