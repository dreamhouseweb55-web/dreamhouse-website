// ===== نظام المنتجات =====
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
        // Initial render is essentially just "showing all" but since html is static, 
        // we use renderProducts to handle any logic if needed, but mainly for filters.
        // Actually, with the new "no-rewrite" logic, we just ensure everything is visible or filtered.
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
        const response = await fetch('/data/products.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        products = data.products;
        console.log('Products loaded:', products.length);
    } catch (error) {
        console.error('Error loading products:', error);
        // Only show error if container is empty (meaning static render failed or not present)
        // But since we have static HTML, we might not want to overwrite it with error message unless critical.
    }
}

function renderProducts(category) {
    // تم التعديل: بدلاً من إعادة بناء العناصر، نقوم فقط بإخفاء/إظهار العناصر الموجودة
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

    if (visibleCards.length === 0 && category !== 'all') {
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
