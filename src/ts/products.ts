// ===== نظام المنتجات =====

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
}

declare global {
    interface Window {
        products: Product[];
    }
}

export let products: Product[] = [];

export async function initProductsSystem(): Promise<void> {
    // 1. تحميل البيانات
    await loadProductsData();

    // 2. عرض المنتجات إذا كنا في صفحة المنتجات
    const productsContainer = document.getElementById('products-grid');
    if (productsContainer) {
        
        // تفعيل الفلاتر
        const filterButtons = document.querySelectorAll('.js-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                filterButtons.forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                const filter = target.getAttribute('data-filter');
                if (filter) {
                    renderProducts(filter);
                }
            });
        });
    }
}

async function loadProductsData(): Promise<void> {
    try {
        const response = await fetch('/data/products.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        products = data.products;
        window.products = products; // Make accessible for cart etc
        console.log('Products loaded:', products.length);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts(category: string): void {
    const productItems = document.querySelectorAll('.product-item');

    let visibleCount = 0;

    productItems.forEach(el => {
        const item = el as HTMLElement;
        const itemCategory = item.getAttribute('data-category');

        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            item.style.animation = 'none';
            item.offsetHeight; /* trigger reflow */
            item.style.animation = 'fadeInUp 0.5s ease forwards';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Check for empty results
    const container = document.getElementById('products-grid');
    const noProductsMsg = document.getElementById('no-products-msg');

    if (visibleCount === 0 && category !== 'all') {
        if (!noProductsMsg && container) {
            const msg = document.createElement('div');
            msg.id = 'no-products-msg';
            msg.style.gridColumn = '1/-1';
            msg.style.textAlign = 'center';
            msg.style.padding = '50px';
            msg.innerHTML = `
            <div class="text-muted">
                <i class="fas fa-box-open fa-3x mb-3"></i>
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
