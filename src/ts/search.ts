// ===== نظام البحث =====
import { showNotification } from './utils';

export function initSearchSystem(): void {
    const searchOverlay = document.getElementById('searchOverlay');
    // Important: Match IDs used in HTML (usually searchInput)
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const searchResults = document.getElementById('searchResults');
    // Some buttons might use different classes or IDs, let's target universally
    const searchToggles = document.querySelectorAll('.js-search-toggle, #searchToggleBtn');
    const closeSearchBtn = document.querySelector('.js-close-search, #searchCloseBtn');
    // Helper to toggle 'active' class on searchExpanded if it exists (desktop navbar)
    const searchExpanded = document.getElementById('searchExpanded');

    console.log('Search Init:', { searchOverlay, searchInput, searchResults, toggles: searchToggles.length });

    if (!searchOverlay || !searchInput || !searchResults) {
        const missing = [];
        if (!searchOverlay) missing.push('searchOverlay');
        if (!searchInput) missing.push('searchInput');
        if (!searchResults) missing.push('searchResults');

        console.error('Search elements missing:', missing);
        // Only show notification in development or if critical for user
        // showNotification('خطأ في نظام البحث: بعض العناصر مفقودة', 'error'); 
        return;
    }

    // --- الوظائف ---

    function openSearch() {
        searchOverlay?.classList.add('active');
        if (searchExpanded) searchExpanded.classList.add('active');
        document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
        document.body.classList.add('search-active');
        setTimeout(() => searchInput?.focus(), 100); // تركيز تلقائي
    }

    function closeSearch() {
        searchOverlay?.classList.remove('active');
        if (searchExpanded) searchExpanded.classList.remove('active');
        document.body.style.overflow = '';
        document.body.classList.remove('search-active');
        if (searchInput) searchInput.value = '';
        if (searchResults) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = `
                <div class="col-12 text-center text-white-50 mt-5">
                    <i class="fas fa-search fa-3x mb-3 opacity-50"></i>
                    <p>ابدأ الكتابة للبحث في منتجاتنا المميزة</p>
                </div>
            `;
        }
    }

    async function performSearch(query: string) {
        let products = window.products;

        // Fallback Fetch if window.products is empty
        if (!products || products.length === 0) {
            try {
                const res = await fetch('/products-api.json?v=' + new Date().getTime());
                if (res.ok) {
                    const data = await res.json();
                    if (data.products) {
                        products = data.products;
                        window.products = products; // Cache it
                    }
                }
            } catch (e) {
                console.error('Search fallback fetch failed', e);
            }
        }

        if (!products || products.length === 0) {
            console.warn('Products not loaded yet');
            searchResults!.innerHTML = `
                <div class="col-12 text-center text-danger mt-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <p class="fw-bold">عذراً، لم يتم تحميل بيانات المنتجات.</p>
                    <p class="small">يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
                </div>
            `;
            return;
        }

        const normalizedQuery = query.toLowerCase().trim();

        if (normalizedQuery.length < 2) {
            searchResults!.classList.remove('active');
            searchResults!.innerHTML = `
                <div class="col-12 text-center text-white-50 mt-5">
                    <p>الرجاء كتابة حرفين على الأقل...</p>
                </div>
            `;
            return;
        }

        const results = products.filter(product => {
            return product.name.toLowerCase().includes(normalizedQuery) ||
                product.description.toLowerCase().includes(normalizedQuery) ||
                product.category.toLowerCase().includes(normalizedQuery);
        });

        renderResults(results);
    }

    function renderResults(products: any[]) {
        if (!searchResults) return;
        searchResults.classList.add('active');

        if (products.length === 0) {
            searchResults.innerHTML = `
                <div class="col-12 text-center text-white-50 mt-5">
                    <i class="far fa-sad-tear fa-3x mb-3 opacity-50"></i>
                    <p>عذراً، لم يتم العثور على نتائج مطابقة.</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = products.map((product, index) => `
            <div class="col-md-4 col-lg-3 search-result-item" style="animation-delay: ${index * 0.05}s">
                <div class="search-result-card h-100">
                    <a href="/product/${product.id}/" class="text-decoration-none text-white d-block position-relative">
                        <div class="ratio ratio-4x3">
                            <img src="${product.image}" class="object-fit-cover w-100 h-100" alt="${product.name}">
                        </div>
                        <div class="p-3">
                            <h5 class="h6 fw-bold mb-1">${product.name}</h5>
                            <span class="badge bg-danger text-white rounded-pill mb-2">${getCategoryName(product.category)}</span>
                            <div class="fw-bold text-danger">${product.price.toLocaleString()} ج.م</div>
                        </div>
                    </a>
                </div>
            </div>
        `).join('');
    }

    function getCategoryName(category: string): string {
        const categories: { [key: string]: string } = {
            'bedrooms': 'غرف نوم',
            'kids-bedrooms': 'أطفال',
            'sofas': 'أنتريهات',
            'corners': 'ركنات',
            'dining': 'سفرة',
            'kitchens': 'مطابخ'
        };
        return categories[category] || category;
    }

    // --- مستمعات الأحداث ---

    searchToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation to prevent immediate closing if bubbled
            openSearch();
        });
    });

    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSearch();
        });
    }

    // إغلاق عند الضغط على الخلفية
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay || (e.target as HTMLElement).classList.contains('search-backdrop')) {
            closeSearch();
        }
    });

    // البحث عند الكتابة
    let searchTimeout: any;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const val = (e.target as HTMLInputElement).value;
        searchTimeout = setTimeout(() => {
            performSearch(val);
        }, 300); // 300ms debounce
    });

    // إغلاق بـ ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });
}
