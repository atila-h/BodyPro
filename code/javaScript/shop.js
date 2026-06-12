/* ============================================
   BodyPro - Shop Page JavaScript
   Category-based product browsing
   ============================================ */

'use strict';

// ============================================
// STATE
// ============================================
const Shop = {
  products: [],
  categories: [],
  reviews: [],
  cart: JSON.parse(localStorage.getItem('bodypro_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('bodypro_wishlist')) || [],
  activeCategory: 'supplements',
  search: '',
  sort: 'default',
  displayedCount: 12,
  itemsPerPage: 12,

  saveCart() {
    localStorage.setItem('bodypro_cart', JSON.stringify(this.cart));
  },
  saveWishlist() {
    localStorage.setItem('bodypro_wishlist', JSON.stringify(this.wishlist));
  },
  isInWishlist(id) {
    return this.wishlist.includes(id);
  },
  isInCart(id) {
    return this.cart.some(item => item.id === id);
  },
  getCartItem(id) {
    return this.cart.find(item => item.id === id);
  }
};

// Category mapping: which data categories map to which shop tabs
const CATEGORY_MAP = {
  supplements: { label: 'Supplements', icon: 'fas fa-flask', dataCategories: ['supplements'] },
  sportswear: { label: 'Sportswear', icon: 'fas fa-tshirt', dataCategories: ['sportswear'] },
  vitamins: { label: 'Vitamins & Health', icon: 'fas fa-pills', dataCategories: ['vitamins'] },
  equipment: { label: 'Equipment', icon: 'fas fa-dumbbell', dataCategories: ['thermoses', 'equipment'] }
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initTheme();
  initNavbar();
  initCart();
  initWishlist();
  initSearch();
  initSort();
  renderProducts();
  updateCounts();
  initScrollEffects();
  initScrollReveal();

  // Check URL hash for category
  const hash = window.location.hash.replace('#', '');
  if (hash && CATEGORY_MAP[hash]) {
    Shop.activeCategory = hash;
    updateTabUI();
    renderProducts();
  }
});

async function loadData() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const data = await response.json();
    Shop.products = data.products || [];
    Shop.categories = data.categories || [];
    Shop.reviews = data.reviews || [];
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('productsContainer').innerHTML = `
      <div class="shop-no-products">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Failed to load products</h3>
        <p>Please refresh the page or try again later.</p>
      </div>`;
  }
}

// ============================================
// THEME
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem('bodypro_theme') || 'dark';
  const toggle = document.getElementById('themeToggle');
  const icon = toggle?.querySelector('i');

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (icon) icon.className = 'fas fa-sun';
  }

  toggle?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('bodypro_theme', isLight ? 'light' : 'dark');
  });
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.pageYOffset > 50);
  });
}

// ============================================
// CATEGORY FILTERING
// ============================================
window.filterShopCategory = function(category) {
  Shop.activeCategory = category;
  Shop.displayedCount = Shop.itemsPerPage;
  updateTabUI();
  renderProducts();

  // Update URL hash
  history.replaceState(null, null, '#' + category);
};

function updateTabUI() {
  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.category === Shop.activeCategory);
  });
}

function getShopProducts() {
  const config = CATEGORY_MAP[Shop.activeCategory];
  if (!config) return [];

  let products = Shop.products.filter(p =>
    config.dataCategories.includes(p.category)
  );

  // Search
  if (Shop.search) {
    const q = Shop.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q))
    );
  }

  // Sort
  switch (Shop.sort) {
    case 'price-low':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    case 'name':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'discount':
      products.sort((a, b) => {
        const dA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const dB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return dB - dA;
      });
      break;
  }

  return products;
}

// ============================================
// PRODUCTS RENDERING
// ============================================
function renderProducts() {
  const container = document.getElementById('productsContainer');
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  if (!container) return;

  const products = getShopProducts();
  const toShow = products.slice(0, Shop.displayedCount);

  if (resultsCount) {
    resultsCount.textContent = `Showing ${toShow.length} of ${products.length} products`;
  }

  if (toShow.length === 0) {
    container.innerHTML = `
      <div class="shop-no-products">
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try adjusting your search or browse a different category.</p>
      </div>`;
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }

  container.innerHTML = toShow.map(product => createShopCard(product)).join('');

  if (loadMoreWrap) {
    loadMoreWrap.style.display = products.length > Shop.displayedCount ? 'block' : 'none';
  }

  initScrollReveal();
}

function createShopCard(product) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const stars = generateStars(product.rating);
  const isWished = Shop.isInWishlist(product.id);
  const inCart = Shop.isInCart(product.id);

  return `
    <div class="shop-product-card">
      <div class="product-card-image">
        <div style="width:100%;height:100%;background:var(--dark-surface);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
          <i class="${getCategoryIcon(product.category)}" style="font-size:3rem;color:var(--primary);opacity:0.4;"></i>
          <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">${product.subcategory || product.category}</span>
        </div>
        ${product.badge ? `<span class="product-card-badge badge-${product.badgeColor || 'danger'}">${product.badge}</span>` : ''}
        <div class="shop-quick-view">
          <button class="shop-quick-view-btn" onclick="quickView(${product.id})">
            <i class="fas fa-eye"></i> Quick View
          </button>
        </div>
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${product.category.toUpperCase()}</span>
        <h5 class="product-card-title">
          <a href="code/html/product-detail.html?id=${product.id}">${product.name}</a>
        </h5>
        <div class="product-card-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${product.reviewCount})</span>
        </div>
        <div class="product-card-price">
          <span class="price-current">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
          ${discount > 0 ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
        <button class="product-card-add ${inCart ? 'added' : ''}" onclick="addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
          <i class="fas ${inCart ? 'fa-check' : 'fa-shopping-cart'}"></i>
          ${!product.inStock ? 'Out of Stock' : inCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>`;
}

function getCategoryIcon(category) {
  const icons = {
    sportswear: 'fas fa-tshirt',
    supplements: 'fas fa-flask',
    vitamins: 'fas fa-pills',
    thermoses: 'fas fa-wine-bottle',
    equipment: 'fas fa-dumbbell'
  };
  return icons[category] || 'fas fa-box';
}

function generateStars(rating) {
  let stars = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
  if (half) stars += '<i class="fas fa-star-half-alt"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) stars += '<i class="far fa-star"></i>';
  return stars;
}

// ============================================
// LOAD MORE
// ============================================
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
  Shop.displayedCount += Shop.itemsPerPage;
  renderProducts();
});

// ============================================
// SEARCH
// ============================================
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      Shop.search = e.target.value.trim();
      Shop.displayedCount = Shop.itemsPerPage;
      renderProducts();
    }, 300);
  });
}

// ============================================
// SORT
// ============================================
function initSort() {
  const select = document.getElementById('sortSelect');
  if (!select) return;

  select.addEventListener('change', (e) => {
    Shop.sort = e.target.value;
    renderProducts();
  });
}

// ============================================
// CART
// ============================================
function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const closeCart = document.getElementById('closeCart');
  const overlay = document.getElementById('cartOverlay');
  const sidebar = document.getElementById('cartSidebar');

  cartBtn?.addEventListener('click', () => {
    sidebar?.classList.add('open');
    overlay?.classList.add('open');
  });

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  }

  closeCart?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (Shop.cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    showToast('Checkout initiated! This is a demo store.', 'success');
  });

  renderCart();
}

window.addToCart = function(productId) {
  const product = Shop.products.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  const existing = Shop.getCartItem(productId);
  if (existing) {
    existing.qty += 1;
  } else {
    Shop.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  Shop.saveCart();
  renderCart();
  updateCounts();
  renderProducts();
  showCartNotification(product.name);
};

window.removeFromCart = function(productId) {
  Shop.cart = Shop.cart.filter(item => item.id !== productId);
  Shop.saveCart();
  renderCart();
  updateCounts();
  renderProducts();
};

window.updateCartQty = function(productId, delta) {
  const item = Shop.getCartItem(productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  Shop.saveCart();
  renderCart();
  updateCounts();
};

function renderCart() {
  const container = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  if (Shop.cart.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-shopping-cart"></i>
        <h4>Your cart is empty</h4>
        <p>Add some products to get started!</p>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = Shop.cart.map(item => `
    <div class="cart-item cart-item-enter">
      <div class="cart-item-img">
        <div style="width:100%;height:100%;background:var(--dark-surface);display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-box" style="font-size:1.5rem;color:var(--primary);opacity:0.4;"></i>
        </div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button onclick="updateCartQty(${item.id}, -1)"><i class="fas fa-minus"></i></button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty(${item.id}, 1)"><i class="fas fa-plus"></i></button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join('');

  const subtotal = Shop.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function showCartNotification(productName) {
  const notification = document.getElementById('cartNotification');
  const text = document.getElementById('cartNotificationText');
  if (!notification || !text) return;
  text.textContent = `${productName} added to cart!`;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 2500);
}

// ============================================
// WISHLIST
// ============================================
function initWishlist() {
  renderWishlist();
}

window.toggleWishlist = function(productId) {
  const index = Shop.wishlist.indexOf(productId);
  if (index > -1) {
    Shop.wishlist.splice(index, 1);
    showToast('Removed from wishlist', 'info');
  } else {
    Shop.wishlist.push(productId);
    showToast('Added to wishlist!', 'success');
  }
  Shop.saveWishlist();
  updateCounts();
  renderProducts();
  renderWishlist();
};

function renderWishlist() {
  const container = document.getElementById('likesItems');
  if (!container) return;

  if (Shop.wishlist.length === 0) {
    container.innerHTML = '<p class="text-center text-muted py-4">No favorites yet. Start browsing!</p>';
    return;
  }

  container.innerHTML = Shop.wishlist.map(id => {
    const product = Shop.products.find(p => p.id === id);
    if (!product) return '';
    return `
      <div class="like-item">
        <div class="like-item-img">
          <div style="width:100%;height:100%;background:var(--dark-surface);display:flex;align-items:center;justify-content:center;">
            <i class="${getCategoryIcon(product.category)}" style="font-size:1.2rem;color:var(--primary);opacity:0.4;"></i>
          </div>
        </div>
        <div class="like-item-info">
          <div class="like-item-name">${product.name}</div>
          <div class="like-item-price">$${product.price.toFixed(2)}</div>
          <button class="btn btn-sm btn-outline-danger mt-1" onclick="addToCart(${product.id})">
            <i class="fas fa-cart-plus me-1"></i>Add to Cart
          </button>
        </div>
      </div>`;
  }).join('');
}

// ============================================
// REVIEWS
// ============================================
window.showReviews = function(productId) {
  const modal = new bootstrap.Modal(document.getElementById('reviewsModal'));
  const body = document.getElementById('reviewsModalBody');
  const product = Shop.products.find(p => p.id === productId);
  const reviews = Shop.reviews.filter(r => r.productId === productId);
  if (!body) return;

  let html = product ? `<h6 class="mb-3">${product.name}</h6>` : '';

  if (reviews.length === 0) {
    html += '<p class="text-muted text-center py-3">No reviews yet for this product.</p>';
  } else {
    html += reviews.map(review => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${review.author}</span>
          <span class="review-date">${review.date}</span>
        </div>
        <div class="stars mb-2">${generateStars(review.rating)}</div>
        <div class="review-title">${review.title}</div>
        <div class="review-comment">${review.comment}</div>
        ${review.verified ? '<span class="review-verified"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
      </div>
    `).join('');
  }

  body.innerHTML = html;
  modal.show();
};

// ============================================
// QUICK VIEW
// ============================================
window.quickView = function(productId) {
  const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
  const body = document.getElementById('quickViewBody');
  const title = document.getElementById('quickViewTitle');
  const product = Shop.products.find(p => p.id === productId);
  if (!product || !body) return;

  title.textContent = product.name;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  body.innerHTML = `
    <div class="row">
      <div class="col-md-5">
        <div style="width:100%;aspect-ratio:1;background:var(--dark-surface);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;">
          <i class="${getCategoryIcon(product.category)}" style="font-size:4rem;color:var(--primary);opacity:0.3;"></i>
          <span style="color:var(--text-muted);font-size:0.8rem;">${product.subcategory || product.category}</span>
        </div>
      </div>
      <div class="col-md-7">
        <span class="product-card-category">${product.category.toUpperCase()}</span>
        <h4 class="fw-bold mt-2">${product.name}</h4>
        <div class="product-card-rating mb-3">
          <span class="stars">${generateStars(product.rating)}</span>
          <span class="rating-count">(${product.reviewCount} reviews)</span>
        </div>
        <div class="product-card-price mb-3" style="border:none;padding:0;">
          <span class="price-current" style="font-size:1.5rem;">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
          ${discount > 0 ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
        <p style="color:var(--text-secondary);line-height:1.7;">${product.description}</p>
        ${product.features ? `
          <ul style="list-style:none;padding:0;margin:16px 0;">
            ${product.features.map(f => `
              <li style="padding:4px 0;color:var(--text-secondary);font-size:0.9rem;">
                <i class="fas fa-check-circle me-2" style="color:var(--success);"></i>${f}
              </li>
            `).join('')}
          </ul>
        ` : ''}
        ${product.sizes ? `
          <div class="mb-3">
            <strong style="font-size:0.85rem;">Sizes:</strong>
            <div class="d-flex gap-2 mt-2">
              ${product.sizes.map(s => `
                <span style="padding:4px 12px;border:1px solid var(--dark-border);border-radius:var(--radius-sm);font-size:0.8rem;cursor:pointer;">${s}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-danger btn-lg flex-grow-1 ripple" onclick="addToCart(${product.id});bootstrap.Modal.getInstance(document.getElementById('quickViewModal')).hide();">
            <i class="fas fa-shopping-cart me-2"></i>Add to Cart
          </button>
          <button class="btn btn-outline-light btn-lg" onclick="toggleWishlist(${product.id})">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>`;

  modal.show();
};

// ============================================
// UTILITIES
// ============================================
function updateCounts() {
  const cartCount = document.getElementById('cartCount');
  const likesCount = document.getElementById('likesCount');
  const totalItems = Shop.cart.reduce((sum, item) => sum + item.qty, 0);

  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.classList.remove('badge-animate');
    void cartCount.offsetWidth;
    cartCount.classList.add('badge-animate');
  }
  if (likesCount) {
    likesCount.textContent = Shop.wishlist.length;
    likesCount.classList.remove('badge-animate');
    void likesCount.offsetWidth;
    likesCount.classList.add('badge-animate');
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollEffects() {
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.pageYOffset > 400);
  });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}
