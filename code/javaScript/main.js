// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let likes = JSON.parse(localStorage.getItem('likes')) || [];
let allProducts = [];
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Elements
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const likesCount = document.getElementById('likesCount');
const likesItems = document.getElementById('likesItems');
const productsContainer = document.getElementById('productsContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    initNavbarScroll();
    initMobileMenu();
    loadProducts();
    updateCartUI();
    updateLikesUI();
    setupEventListeners();
    setupSearch();
});

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.getElementById('mainNavbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Mobile Menu - Close on link click
function initMobileMenu() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const bsCollapse = navbarCollapse ? bootstrap.Collapse.getInstance(navbarCollapse) : null;
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992 && navbarCollapse && navbarCollapse.classList.contains('show')) {
                const collapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (collapse) {
                    collapse.hide();
                }
            }
        });
    });
}

// Theme Toggle
function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.innerHTML = currentTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

// Event Listeners
function setupEventListeners() {
    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const themeBtn = document.getElementById('themeToggle');
    
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
}

// Load Products
async function loadProducts() {
    try {
        const path = window.location.pathname.includes('/code/html/') ? '../json/products.JSON' : 'code/json/products.JSON';
        const response = await fetch(path);
        const data = await response.json();
        allProducts = data.products;
        renderProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Generate Star Rating HTML
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Format Restock Date
function formatRestockDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Render Products
function renderProducts(products) {
    if (!productsContainer) return;
    
    // Update allProducts if this is the main load
    if (products.length > 0 && products === allProducts) {
        // allProducts is already set
    }
    
    // Determine if we're on a subpage
    const isSubPage = window.location.pathname.includes('/code/html/');
    // Adjust image path based on page location
    const imagePathPrefix = isSubPage ? '../../' : '';
    
    // Debug logging
    console.log('Render Products Debug:', {
        pathname: window.location.pathname,
        isSubPage: isSubPage,
        imagePathPrefix: imagePathPrefix,
        productCount: products.length
    });
    
    productsContainer.innerHTML = products.map((product) => {
        // Find the index in allProducts for cart/like functionality
        const productIndex = allProducts.findIndex(p => p.id === product.id);
        const actualIndex = productIndex !== -1 ? productIndex : 0;
        
        // Generate reviews preview - always show the section for consistent height
        let reviewsHtml = '';
        if (product.reviews.length > 0) {
            reviewsHtml = `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-user">${product.reviews[0].user}</span>
                        <span class="stars">${generateStars(product.reviews[0].rating)}</span>
                    </div>
                    <div class="review-comment">"${product.reviews[0].comment.substring(0, 50)}${product.reviews[0].comment.length > 50 ? '...' : ''}"</div>
                </div>
                ${product.reviews.length > 1 ? `<button class="btn btn-sm btn-outline-secondary w-100 mt-1" onclick="showReviewsById(${product.id})">View all ${product.reviews.length} reviews</button>` : ''}
            `;
        } else {
            reviewsHtml = `
                <div class="review-item" style="opacity: 0.5;">
                    <div class="review-comment" style="font-style: italic;">No reviews yet</div>
                </div>
            `;
        }
        
        return `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card product-card h-100 position-relative hover-lift">
                ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
                
                <!-- Compare Checkbox -->
                <label class="compare-checkbox" title="Add to Compare">
                    <input type="checkbox" data-product-id="${product.id}" onchange="if(window.productComparison) productComparison.toggleCompare(allProducts.find(p => p.id === ${product.id}))">
                    <span>Compare</span>
                </label>
                
                <div class="img-zoom-container">
                    <img src="${imagePathPrefix}${product.image}" class="card-img-top img-zoom" alt="${product.name}" onerror="this.src='${imagePathPrefix}image/placeholder.jpg'">
                </div>
                
                <!-- Quick View Button -->
                <button class="quick-view-btn" onclick="if(window.quickViewModal) quickViewModal.open(allProducts.find(p => p.id === ${product.id}))">
                    <i class="fas fa-eye me-2"></i>Quick View
                </button>
                
                <div class="card-body">
                    <!-- Stock Status -->
                    <div class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                    ${!product.inStock && product.restockDate ? `<div class="restock-date">Restock: ${formatRestockDate(product.restockDate)}</div>` : '<div class="restock-date" style="visibility: hidden;">&nbsp;</div>'}
                    
                    <!-- Rating -->
                    <div class="rating-stars">
                        ${generateStars(product.rating)}
                        <span class="review-count">(${product.reviews.length})</span>
                    </div>
                    
                    <h6 class="card-title">${product.name}</h6>
                    <p class="text-muted small">${product.category}</p>
                    
                    <!-- Price Display -->
                    <div class="price-display">
                        <span class="fw-bold text-danger">${product.price}</span>
                        ${product.oldPrice ? `<span class="text-muted text-decoration-line-through small">${product.oldPrice}</span>` : ''}
                    </div>
                    
                    <!-- Reviews Preview - Always present for uniform height -->
                    <div class="product-reviews">
                        ${reviewsHtml}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCartById(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus me-1"></i> ${product.inStock ? 'Add to Cart' : 'Notify Me'}
                        </button>
                    <button class="btn-like ${likes.some(l => l.id === product.id) ? 'liked' : ''}" onclick="toggleLikeById(${product.id})">
                        <i class="${likes.some(l => l.id === product.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

// Show Reviews Modal by Product ID
function showReviewsById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modalBody = document.getElementById('reviewsModalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = product.reviews.map(review => `
        <div class="review-detail">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <strong>${review.user}</strong>
                <span class="stars">${generateStars(review.rating)}</span>
            </div>
            <p class="mb-0">${review.comment}</p>
        </div>
    `).join('');
    
    const modal = new bootstrap.Modal(document.getElementById('reviewsModal'));
    modal.show();
}

// Add to Cart by Product ID
function addToCartById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    if (!product.inStock) {
        showToast('This product is currently out of stock!', 'warning');
        return;
    }
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

// Toggle Like by Product ID
function toggleLikeById(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingIndex = likes.findIndex(l => l.id === product.id);
    
    if (existingIndex > -1) {
        likes.splice(existingIndex, 1);
    } else {
        likes.push(product);
    }
    
    localStorage.setItem('likes', JSON.stringify(likes));
    updateLikesUI();
    
    // Re-render products to update like button state
    const currentProducts = allProducts;
    if (productsContainer) {
        renderProducts(currentProducts);
    }
    
    showToast(likes.find(l => l.id === product.id) ? `${product.name} added to favorites!` : `${product.name} removed from favorites!`);
}

// Cart Functions
function addToCart(productIndex) {
    const product = allProducts[productIndex];
    
    if (!product.inStock) {
        showToast('This product is currently out of stock!', 'warning');
        return;
    }
    
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    if (!cartCount || !cartItems || !cartTotal) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted py-5">Your cart is empty</p>';
        cartTotal.textContent = '$0';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace('$', '')) * item.quantity), 0);
    cartTotal.textContent = '$' + total.toFixed(2);
    
    // Determine if we're on a subpage and adjust image path
    const isSubPage = window.location.pathname.includes('/code/html/');
    const imagePathPrefix = isSubPage ? '../../' : '';
    const placeholderPath = isSubPage ? '../../image/placeholder.jpg' : 'image/placeholder.jpg';
    
    // Debug logging
    console.log('Cart UI Debug:', {
        pathname: window.location.pathname,
        isSubPage: isSubPage,
        imagePathPrefix: imagePathPrefix,
        cartItems: cart.length
    });
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${imagePathPrefix}${item.image}" alt="${item.name}" onerror="this.src='${placeholderPath}'">
            <div class="cart-item-info">
                <h6>${item.name}</h6>
                <p class="text-muted mb-1">${item.category}</p>
                <span class="text-danger fw-bold">${item.price}</span>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
    }
    showToast('Checkout functionality coming soon!', 'success');
    closeCart();
}

// Legacy Likes Function (kept for backward compatibility)
function toggleLike(productIndex) {
    const product = allProducts[productIndex];
    if (!product) return;
    toggleLikeById(product.id);
}

// Legacy Show Reviews Function (kept for backward compatibility)
function showReviews(productIndex) {
    const product = allProducts[productIndex];
    if (!product) return;
    showReviewsById(product.id);
}

// Legacy Add to Cart Function (kept for backward compatibility)
function addToCart(productIndex) {
    const product = allProducts[productIndex];
    if (!product) return;
    addToCartById(product.id);
}

function updateLikesUI() {
    if (!likesCount || !likesItems) return;
    
    const totalLikes = likes.length;
    likesCount.textContent = totalLikes;
    
    if (likes.length === 0) {
        likesItems.innerHTML = '<p class="text-center text-muted">No favorites yet</p>';
        return;
    }
    
    // Determine if we're on a subpage and adjust image path
    const isSubPage = window.location.pathname.includes('/code/html/');
    const imagePathPrefix = isSubPage ? '../../' : '';
    const placeholderPath = isSubPage ? '../../image/placeholder.jpg' : 'image/placeholder.jpg';
    
    likesItems.innerHTML = likes.map((item) => `
        <div class="d-flex align-items-center gap-3 p-2 border-bottom">
            <img src="${imagePathPrefix}${item.image}" width="60" height="60" style="object-fit: cover; border-radius: 5px;" onerror="this.src='${placeholderPath}'">
            <div class="flex-grow-1">
                <h6 class="mb-0">${item.name}</h6>
                <span class="text-danger">${item.price}</span>
                <div class="rating-stars small">${generateStars(item.rating)}</div>
            </div>
            <div>
                <button class="btn btn-sm" style="background: var(--accent); color: white;" onclick="addLikedToCartById(${item.id})" ${!item.inStock ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="removeLikeById(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addLikedToCartById(productId) {
    const product = likes.find(l => l.id === productId);
    if (!product) return;
    
    if (!product.inStock) {
        showToast('This product is currently out of stock!', 'warning');
        return;
    }
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

// Legacy function
function addLikedToCart(index) {
    const product = likes[index];
    if (!product) return;
    addLikedToCartById(product.id);
}

function removeLikeById(productId) {
    const index = likes.findIndex(l => l.id === productId);
    if (index > -1) {
        likes.splice(index, 1);
        localStorage.setItem('likes', JSON.stringify(likes));
        updateLikesUI();
        if (productsContainer && allProducts.length > 0) {
            renderProducts(allProducts);
        }
        showToast('Removed from favorites');
    }
}

// Legacy function
function removeLike(index) {
    const product = likes[index];
    if (!product) return;
    removeLikeById(product.id);
}

// Search Function
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) || 
                product.category.toLowerCase().includes(searchTerm)
            );
            renderProducts(filtered);
        });
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast show`;
    toast.style.background = 'var(--bg-card)';
    toast.style.color = 'var(--text-main)';
    toast.style.borderLeft = '4px solid var(--btn-secondary)';
    toast.innerHTML = `
        <div class="toast-body d-flex justify-content-between align-items-center">
            <span><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2" style="color: var(--btn-secondary);"></i>${message}</span>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
