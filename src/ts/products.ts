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

// State variables for filtering
let currentCategory: string = 'all';
let currentMaxPrice: number = 60000;

export async function initProductsSystem(): Promise<void> {
    // 1. تفعيل الفلاتر (مستقلة عن البيانات)
    initFilters();

    // 2. تحميل البيانات (للسلة وغيرها)
    await loadProductsData();
}

async function loadProductsData(): Promise<void> {
    try {
        console.log('Fetching products from /products-api.json...');
        // Use the generated API JSON which is reliable
        const response = await fetch('/products-api.json?v=' + new Date().getTime());

        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.products || !Array.isArray(data.products)) {
            throw new Error('Invalid products data structure');
        }

        products = data.products;
        window.products = products;

        console.log('Products successfully loaded:', products.length);

        // Debug notification (optional, can be removed later)
        // showNotification(`Loaded ${products.length} products`, 'success');

    } catch (error) {
        console.error('CRITICAL ERROR loading products:', error);
        // Show visible error to user
        const errDiv = document.createElement('div');
        errDiv.style.position = 'fixed';
        errDiv.style.top = '0';
        errDiv.style.left = '0';
        errDiv.style.width = '100%';
        errDiv.style.padding = '10px';
        errDiv.style.background = 'red';
        errDiv.style.color = 'white';
        errDiv.style.zIndex = '10000';
        errDiv.style.textAlign = 'center';
        errDiv.textContent = 'خطأ في تحميل المنتجات: ' + (error as Error).message;
        document.body.prepend(errDiv);
    }
}

function initFilters(): void {
    // Category Buttons
    const filterButtons = document.querySelectorAll('.js-filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;

                // Update active class
                filterButtons.forEach(b => b.classList.remove('active'));
                target.classList.add('active');

                // Update state and apply
                const filter = target.getAttribute('data-filter');
                if (filter) {
                    currentCategory = filter;
                    applyFilters();
                }
            });
        });
    }

    // Price Range Slider
    const priceRange = document.getElementById('priceRange') as HTMLInputElement;
    const priceValue = document.getElementById('priceValue');

    if (priceRange && priceValue) {
        // Initial set
        currentMaxPrice = parseInt(priceRange.value);
        priceValue.textContent = formatPrice(currentMaxPrice);

        // Event listener
        priceRange.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            currentMaxPrice = parseInt(target.value);
            priceValue.textContent = formatPrice(currentMaxPrice);
            applyFilters();
        });
    }
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
}

function applyFilters(): void {
    const productItems = document.querySelectorAll('.product-item');
    let visibleCount = 0;

    productItems.forEach(el => {
        const item = el as HTMLElement;
        const itemCategory = item.getAttribute('data-category');
        const itemPriceStr = item.getAttribute('data-price');
        const itemPrice = itemPriceStr ? parseFloat(itemPriceStr) : 0;

        // Check conditions
        const matchCategory = (currentCategory === 'all' || itemCategory === currentCategory);
        const matchPrice = (itemPrice <= currentMaxPrice);

        if (matchCategory && matchPrice) {
            item.style.display = 'block';
            // Simple animation reset
            if (item.style.animationName !== 'fadeInUp') {
                item.style.animation = 'none';
                item.offsetHeight; /* trigger reflow */
                item.style.animation = 'fadeInUp 0.5s ease forwards';
            }
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Check for empty results
    updateNoResultsMessage(visibleCount);
}

function updateNoResultsMessage(visibleCount: number): void {
    const container = document.querySelector('.product-section') || document.querySelector('.container-fluid'); // Fallback container
    let msg = document.getElementById('no-products-msg');

    if (visibleCount === 0) {
        if (!msg && container) {
            msg = document.createElement('div');
            msg.id = 'no-products-msg';
            msg.className = 'col-12 text-center py-5';
            msg.innerHTML = `
            <div class="text-muted">
                <i class="fas fa-search fa-3x mb-3 text-warning"></i>
                <h4 class="fw-bold">لا توجد منتجات مطابقة</h4>
                <p>حاول تغيير خيارات التصفية أو نطاق السعر.</p>
            </div>
         `;
            // Try to find a good place to insert it. Ideally after the filters.
            const bedroomsSection = document.getElementById('bedrooms');
            if (bedroomsSection && bedroomsSection.parentNode) {
                bedroomsSection.parentNode.insertBefore(msg, bedroomsSection.nextSibling);
            } else {
                container.appendChild(msg);
            }
        } else if (msg) {
            msg.style.display = 'block';
        }
    } else if (msg) {
        msg.style.display = 'none';
    }
}
