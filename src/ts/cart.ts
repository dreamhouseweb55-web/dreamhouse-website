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

// Extend Window interface
declare global {
    interface Window {
        addToCart: (productId: string) => void;
        removeFromCart: (productId: string) => void;
        updateQuantity: (productId: string, change: number) => void;
        checkoutWhatsApp: () => void;
        products: Product[]; // Assuming this is set globally
        bootstrap: any; // For Bootstrap API
    }
}

let cart: CartItem[] = JSON.parse(localStorage.getItem('dreamhouse_cart') || '[]');

window.addToCart = function (productId: string): void {
    if (typeof window.products === 'undefined' || window.products.length === 0) return;

    const product = window.products.find(p => p.id === productId);
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
    // Use Bootstrap Offcanvas
    const cartEl = document.getElementById('cartSidebar');
    if (cartEl && window.bootstrap) {
        let bsOffcanvas = window.bootstrap.Offcanvas.getInstance(cartEl);
        if (!bsOffcanvas) {
            bsOffcanvas = new window.bootstrap.Offcanvas(cartEl);
        }
        bsOffcanvas.show();
    }
};

window.removeFromCart = function (productId: string): void {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
};

window.updateQuantity = function (productId: string, change: number): void {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            window.removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
};

window.checkoutWhatsApp = function (): void {
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
                cartItem.innerHTML = `
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-dark fw-bold">${item.name}</h6>
                        <div class="text-warning fw-bold small">${item.price.toLocaleString()} ج.م</div>
                        <div class="d-flex align-items-center mt-2 gap-2">
                            <button class="btn btn-sm btn-light border px-2" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-sm btn-light border px-2" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="btn btn-link text-danger p-0" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });

            if (totalPriceElement) totalPriceElement.textContent = total.toLocaleString() + ' ج.م';
        }
    }
}
// Initial display update
updateCartDisplay();
