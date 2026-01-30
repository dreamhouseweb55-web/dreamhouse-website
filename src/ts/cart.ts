// ===== نظام سلة التسوق =====
import { showNotification } from './utils';

// Define types
interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

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
        bootstrap: any;
    }
}

let cart: CartItem[] = [];
try {
    cart = JSON.parse(localStorage.getItem('dreamhouse_cart') || '[]');
    if (!Array.isArray(cart)) cart = [];
} catch (e) {
    console.error('Error parsing cart from localStorage:', e);
    cart = [];
}

// === Public Functions ===

export function addToCart(productId: string): void {
    if (typeof window.products === 'undefined' || window.products.length === 0) {
        console.warn('Attempted to add to cart but products are not loaded.');
        showNotification('جاري تحميل بيانات المنتجات، يرجى المحاولة بعد قليل...', 'info');
        return;
    }

    const product = window.products.find(p => p.id === productId);
    if (!product) {
        showNotification('عذراً، هذا المنتج غير متوفر حالياً', 'error');
        return;
    }

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
    // Use Bootstrap Offcanvas
    const cartEl = document.getElementById('cartSidebar');
    if (cartEl && window.bootstrap) {
        let bsOffcanvas = window.bootstrap.Offcanvas.getInstance(cartEl);
        if (!bsOffcanvas) {
            bsOffcanvas = new window.bootstrap.Offcanvas(cartEl);
        }
        bsOffcanvas.show();
    }
}

function removeFromCart(productId: string): void {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateQuantity(productId: string, change: number): void {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

function checkoutWhatsApp(): void {
    if (cart.length === 0) return;

    let message = `مرحباً دريم هاوس، أود طلب المنتجات التالية:\n`;
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `\n--------------------\n*المنتج:* ${item.name}\n*الكمية:* ${item.quantity}\n*السعر:* ${itemTotal.toLocaleString()} ج.م`;
    });

    message += `\n\n--------------------\n*الإجمالي الكلي: ${total.toLocaleString()} ج.م*`;
    message += `\n\nيرجى التواصل معي لإتمام الطلب وتحديد موعد التسليم.`;

    const phoneNumber = "201125601241"; // رقم دريم هاوس الفعلي
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

function updateCartDisplay(): void {
    localStorage.setItem('dreamhouse_cart', JSON.stringify(cart));

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count.toString());

    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElement = document.querySelector('.total-price');

    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="fas fa-shopping-basket fa-3x mb-3"></i>
                    <p>السلة فارغة حالياً</p>
                    <button class="btn btn-outline-primary" data-bs-dismiss="offcanvas">تصفح المنتجات</button>
                </div>
            `;
            if (totalPriceElement) totalPriceElement.textContent = '0 ج.م';
        } else {
            let total = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const cartItem = document.createElement('div');
                cartItem.className = 'd-flex align-items-center mb-3 pb-3 border-bottom';
                // Note: Using data attributes and classes for event listeners
                cartItem.innerHTML = `
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-dark fw-bold">${item.name}</h6>
                        <div class="text-warning fw-bold small">${item.price.toLocaleString()} ج.م</div>
                        <div class="d-flex align-items-center mt-2 gap-2">
                            <button class="btn btn-sm btn-light border px-2 js-update-qty" data-id="${item.id}" data-change="-1">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-sm btn-light border px-2 js-update-qty" data-id="${item.id}" data-change="1">+</button>
                        </div>
                    </div>
                    <button class="btn btn-link text-danger p-0 js-remove-item" data-id="${item.id}">
                        <i class="fas fa-trash-alt pe-none"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });

            if (totalPriceElement) totalPriceElement.textContent = total.toLocaleString() + ' ج.م';
        }
    }
}

// === Initialization ===

export function initCartSystem(): void {
    updateCartDisplay();

    // Event Delegation for Cart Items
    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            // Handle Update Quantity
            const updateBtn = target.closest('.js-update-qty');
            if (updateBtn) {
                const id = updateBtn.getAttribute('data-id');
                const change = parseInt(updateBtn.getAttribute('data-change') || '0');
                if (id) updateQuantity(id, change);
                return;
            }

            // Handle Remove Item
            const removeBtn = target.closest('.js-remove-item');
            if (removeBtn) {
                const id = removeBtn.getAttribute('data-id');
                if (id) removeFromCart(id);
                return;
            }
        });
    }

    // Checkout Button Listener
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkoutWhatsApp);
    }

    // Global Add to Cart Delegation (for static buttons)
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const addToCartBtn = target.closest('.js-add-to-cart');
        if (addToCartBtn) {
            e.preventDefault(); // Prevent default if it's a link (though usually button)
            e.stopPropagation();
            const id = addToCartBtn.getAttribute('data-id');
            if (id) addToCart(id);
        }
    });
}
