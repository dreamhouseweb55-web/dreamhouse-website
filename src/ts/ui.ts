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

            // Get form values
            const nameInput = document.getElementById('name') as HTMLInputElement;
            const messageInput = document.getElementById('message') as HTMLTextAreaElement;
            const whatsappNumber = contactForm.dataset.whatsapp || '201125601241'; // Fallback

            if (!nameInput || !messageInput) return;

            const name = nameInput.value;
            const message = messageInput.value;

            // Format WhatsApp Message
            let text = `مرحباً دريم هاوس\n`;
            text += `لدي استفسار جديد بخصوص:\n\n`;
            text += `*الاسم:* ${name}\n`;
            text += `*الرسالة:*\n${message}`;

            // Show loading state
            btn.innerHTML = '<i class="fab fa-whatsapp"></i> جاري التحويل لواتساب...';
            btn.disabled = true;

            // Redirect to WhatsApp
            const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

            setTimeout(() => {
                const win = window.open(url, '_blank');
                if (!win) {
                    showNotification('تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة للتواصل عبر واتساب.', 'error');
                    window.location.href = url; // Fallback to same window
                }

                btn.innerHTML = originalText;
                btn.disabled = false;
                this.reset();
            }, 1000);
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

export function initNavbar(): void {
    const navbarCollapse = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler');

    if (!navbarCollapse || !toggler) {
        console.warn('UI Navbar elements missing. Collapsible functionality will be disabled.');
        return;
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const isMenuOpen = navbarCollapse.classList.contains('show');
        const isClickInside = navbarCollapse.contains(target) || toggler.contains(target);

        if (isMenuOpen && !isClickInside) {
            // Use Bootstrap's native collapse method if available, or just click toggler
            (toggler as HTMLElement).click();
        }
    });

    // Close on link click
    const navLinks = navbarCollapse.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                (toggler as HTMLElement).click();
            }
        });
    });
}
