const cartMenu = document.querySelector('.cartMenu');
const bagAdd = document.querySelector('.bagAdd');
let drawer = document.querySelector('.drawer');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    if (!bagAdd) return;
    const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    bagAdd.textContent = count > 0 ? `(${count})` : '';
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function showCartMenu() {
    if (!cartMenu) return;
    if (cart.length === 0) {
        cartMenu.innerHTML = '<li class="list-group-item text-center">Cart is Empty</li>';
        return;
    }

    // Determine if we're on a subpage and adjust image path
    const isSubPage = window.location.pathname.includes('/code/html/');
    const imagePathPrefix = isSubPage ? '../../' : '';

    let cartList = '';
    cart.forEach((val, index) => {
        cartList += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <img src="${imagePathPrefix}${val.image}" width="50" height="50" alt="${val.name}" class="me-2" style="object-fit: cover;">
                <div>
                    <strong>${val.name}</strong><br>
                    <small class="text-muted">${val.caption}</small><br>
                    <span>${val.price}</span>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm" onclick="increase(${index})">+</button>
                <span class="mx-2 fw-bold">${val.quantity}</span>
                <button class="btn btn-outline-secondary btn-sm me-2" onclick="decrease(${index})">-</button>
                <button class="btn btn-danger btn-sm" onclick="removeCart(${index})">×</button>
            </div>
        </li>`;
    });
    
    cartList += `
        <li class="list-group-item text-center bg-light">
            <strong>Total: </strong>
            <span id="cartTotal">$0</span>
        </li>`;
    
    cartMenu.innerHTML = cartList;
    calculateTotal();
}

function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('$', '')) || 0;
        total += price * item.quantity;
    });
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

function addToCart(product) {
    if (!product) return;
    const existing = cart.find(item => 
        item.name === product.name && 
        item.caption === product.caption && 
        item.price === product.price
    );
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    showCartMenu();
}

function addToCartByIndex(category, index) {
    if (!window.products || !window.products.data || !window.products.data[category]) return;
    const list = window.products.data[category];
    if (typeof index !== 'number' || index < 0 || index >= list.length) return;
    addToCart(list[index]);
}

function increase(index) {
    if (cart[index]) {
        cart[index].quantity += 1;
        saveCart();
        showCartMenu();
    }
}

function decrease(index) {
    if (cart[index] && cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        saveCart();
        showCartMenu();
    } else if (cart[index]) {
        cart.splice(index, 1);
        saveCart();
        showCartMenu();
    }
}

function removeCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
        showCartMenu();
    }
}

function openDrawer() {
    drawer = drawer || document.querySelector('.drawer');
    if (!drawer) return;
    if (drawer.classList.contains('d-none')) {
        drawer.classList.remove('d-none');
    } else {
        drawer.classList.add('d-none');
    }
}

function closeDrawer() {
    drawer = drawer || document.querySelector('.drawer');
    if (drawer) {
        drawer.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    showCartMenu();
});

window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.addToCart = addToCart;
window.addToCartByIndex = addToCartByIndex;
window.increase = increase;
window.decrease = decrease;
window.removeCart = removeCart;
window.showCartMenu = showCartMenu;
window.cart = cart;
