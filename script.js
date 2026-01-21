// ===================================
// دريم هاوس - DREAM HOUSE
// ملف JavaScript الرئيسي
// ===================================

// متغيرات عامة للسلة
let cart = JSON.parse(localStorage.getItem('dreamhouse_cart')) || [];

// تهيئة التطبيق عند تحميل الصفحة
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

// ===== شريط التنقل =====
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
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // إخفاء القائمة عند الضغط خارجها
  document.addEventListener('click', function (event) {
    if (navbarMenu && !event.target.closest('.navbar') && navbarMenu.classList.contains('active')) {
      navbarMenu.classList.remove('active');
    }
  });

  // تغيير شفافية الشريط عند التمرير
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 100) {
      navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    }
  });
}

// ===== الرسوم المتحركة =====
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

// ===== Lazy Loading =====
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

// ===== نموذج الاتصال =====
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // محاكاة الإرسال
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

// ===== العدادات =====
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

// ==========================================
// ===== نظام المنتجات وسلة التسوق الجديد =====
// ==========================================
// ===== نظام المنتجات وسلة التسوق المحدث =====
// ==========================================

let products = []; // سيتم ملؤها من ملف JSON

async function initProductsSystem() {
  // 1. تهيئة أزرار السلة
  const cartFloatingBtn = document.getElementById('cartFloatingBtn');
  const closeCartBtn = document.getElementById('closeCart');
  const cartOverlay = document.getElementById('cartOverlay');

  if (cartFloatingBtn) cartFloatingBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // 2. تحميل البيانات
  await loadProductsData();

  // 3. عرض المنتجات إذا كنا في صفحة المنتجات
  const productsContainer = document.getElementById('products-container');
  if (productsContainer) {
    renderProducts('all');

    // تفعيل الفلاتر
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProducts(btn.getAttribute('data-filter'));
      });
    });
  }
}

async function loadProductsData() {
  try {
    // إضافة cache busting لتجنب مشاكل الكاش عند التحديث
    const response = await fetch('/data/products.json?v=' + new Date().getTime());
    if (!response.ok) throw new Error('Failed to load products');

    const data = await response.json();
    products = data.products; // تحديث القائمة العامة

    console.log('Products loaded:', products.length);
  } catch (error) {
    console.error('Error loading products:', error);
    const container = document.getElementById('products-container');
    if (container) {
      container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>عذراً، حدث خطأ في تحميل البيانات. يرجى المحاولة لاحقاً.</p>
                </div>
            `;
    }
  }
}

function renderProducts(category) {
  // تم التعديل: بدلاً من إعادة بناء العناصر (الذي يحذف الروابط)، نقوم فقط بإخفاء/إظهار العناصر الموجودة
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');

    if (category === 'all' || cardCategory === category) {
      card.style.display = 'block';
      // إعادة تفعيل الأنيميشن
      card.style.animation = 'none';
      card.offsetHeight; /* trigger reflow */
      card.style.animation = 'fadeInUp 0.5s ease forwards';
    } else {
      card.style.display = 'none';
    }
  });

  // التحقق من وجود منتجات
  const visibleCards = document.querySelectorAll('.product-card[style*="block"]');
  const container = document.getElementById('products-container');
  const noProductsMsg = document.getElementById('no-products-msg');

  if (visibleCards.length === 0 && category !== 'all') { // check category to avoid showing empty msg on initial load race condition
    if (!noProductsMsg && container) {
      const msg = document.createElement('div');
      msg.id = 'no-products-msg';
      msg.style.gridColumn = '1/-1';
      msg.style.textAlign = 'center';
      msg.style.padding = '50px';
      msg.innerHTML = `
            <div style="color: #777;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>عذراً، لا توجد منتجات في هذا القسم حالياً.</p>
            </div>
         `;
      container.appendChild(msg);
    } else if (noProductsMsg) {
      noProductsMsg.style.display = 'block';
    }
  } else if (noProductsMsg) {
    noProductsMsg.style.display = 'none';
  }
}

// دوال السلة (تم جعلها Global لتستدعى من HTML)
window.addToCart = function (productId) {
  // التأكد من أن القائمة ليست فارغة
  if (products.length === 0) return;

  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    showNotification(`تم زيادة كمية ${product.name}`, 'success');
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    showNotification(`تم إضافة ${product.name} للسلة`, 'success');
  }

  updateCartDisplay();
  openCart();
};

window.removeFromCart = function (productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartDisplay();
};

window.updateQuantity = function (productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartDisplay();
    }
  }
};

window.openCart = function () {
  document.getElementById('cartSidebar').classList.add('active');
  document.getElementById('cartOverlay').classList.add('active');
};

window.closeCart = function () {
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
};

window.checkoutWhatsApp = function () {
  if (cart.length === 0) return;

  let message = `مرحباً دريم هاوس، أود طلب المنتجات التالية:%0a%0a`;
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `- ${item.name} (${item.quantity} x ${item.price} ج.م) = ${itemTotal} ج.م%0a`;
  });

  message += `%0a*الإجمالي الكلي: ${total.toLocaleString()} ج.م*`;
  message += `%0a%0aيرجى التواصل معي لإتمام الطلب وتحديد موعد التسليم.`;

  const phoneNumber = "201000000000";
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
};

function updateCartDisplay() {
  // 1. حفظ
  localStorage.setItem('dreamhouse_cart', JSON.stringify(cart));

  // 2. تحديث العداد
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);

  // 3. تحديث القائمة
  const cartItemsContainer = document.getElementById('cartItems');
  const totalPriceElement = document.querySelector('.total-price');

  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fas fa-shopping-basket"></i>
                    <p>السلة فارغة حالياً</p>
                    <button class="btn btn-primary" onclick="closeCart()">تصفح المنتجات</button>
                </div>
            `;
      if (totalPriceElement) totalPriceElement.textContent = '0 ج.م';
    } else {
      let total = 0;
      cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
                    <div style="flex:1;">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price.toLocaleString()} ج.م</div>
                        <div class="cart-item-controls">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
        cartItemsContainer.appendChild(cartItem);
      });

      if (totalPriceElement) totalPriceElement.textContent = total.toLocaleString() + ' ج.م';
    }
  }
}

// دالة الإشعارات (محسنة)
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${type === 'success' ? '#4CAF50' : '#3E2723'};
        color: white;
        padding: 12px 25px;
        border-radius: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        opacity: 0;
        bottom: -50px;
    `;
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.bottom = '30px';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.bottom = '-50px';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
