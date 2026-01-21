// ===== نظام سلة التسوق =====
let cart = JSON.parse(localStorage.getItem('dreamhouse_cart')) || [];

window.addToCart = function (productId) {
    // التأكد من أن القائمة (products defined in products.js) ليست فارغة
    if (typeof products === 'undefined' || products.length === 0) return;

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
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
};

window.closeCart = function () {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
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
    localStorage.setItem('dreamhouse_cart', JSON.stringify(cart));

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);

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
