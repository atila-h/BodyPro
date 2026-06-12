/* ============================================
   BodyPro - Main JavaScript
   Core Store Logic: Cart, Filters, Search, Sort, Rendering
   ============================================ */

'use strict';

// ============================================
// STATE MANAGEMENT
// ============================================
const Store = {
  products: [],
  categories: [],
  reviews: [],
  storeInfo: {},
  cart: JSON.parse(localStorage.getItem('bodypro_cart')) || [],
  wishlist: JSON.parse(localStorage.getItem('bodypro_wishlist')) || [],
  filters: {
    category: '',
    subcategory: '',
    priceRange: { min: 0, max: Infinity },
    rating: 0,
    search: '',
    sort: 'default'
  },
  displayedCount: 12,
  itemsPerPage: 12,

  saveCart() {
    localStorage.setItem('bodypro_cart', JSON.stringify(this.cart));
  },
  saveWishlist() {
    localStorage.setItem('bodypro_wishlist', JSON.stringify(this.wishlist));
  },
  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  },
  isInCart(productId) {
    return this.cart.some(item => item.id === productId);
  },
  getCartItem(productId) {
    return this.cart.find(item => item.id === productId);
  }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initNavbar();
  initTheme();
  renderCategories();
  renderBestsellers();
  initCart();
  initWishlist();
  updateCounts();
  initScrollEffects();
});

async function loadData() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Failed to load products');
    const data = await response.json();
    Store.products = data.products || [];
    Store.categories = data.categories || [];
    Store.reviews = data.reviews || [];
    Store.storeInfo = data.store || {};
  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('productsContainer').innerHTML = `
      <div class="col-12 no-products">
        <i class="fas fa-exclamation-triangle"></i>
        <h4>Failed to load products</h4>
        <p>Please refresh the page or try again later.</p>
      </div>`;
  }
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

// ============================================
// THEME TOGGLE
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem('bodypro_theme') || 'dark';
  const toggle = document.getElementById('themeToggle');
  const icon = toggle.querySelector('i');

  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    icon.className = 'fas fa-sun';
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('bodypro_theme', isLight ? 'light' : 'dark');
  });
}

// ============================================
// CATEGORIES RENDERING
// ============================================
function renderCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  const categoryColors = [
    'linear-gradient(135deg, rgba(220,53,69,0.08), transparent)',
    'linear-gradient(135deg, rgba(13,110,253,0.08), transparent)',
    'linear-gradient(135deg, rgba(25,135,84,0.08), transparent)',
    'linear-gradient(135deg, rgba(255,193,7,0.08), transparent)',
    'linear-gradient(135deg, rgba(13,202,240,0.08), transparent)'
  ];

  container.innerHTML = Store.categories.map((cat, i) => `
    <a href="shop.html#${cat.id}" class="category-card-full reveal" style="background:${categoryColors[i] || categoryColors[0]};">
      <div class="category-card-content">
        <h3><i class="${cat.icon} me-2" style="color:var(--primary);"></i>${cat.name}</h3>
        <p>${cat.description}</p>
        <span class="btn btn-danger"><i class="fas fa-arrow-left ms-2"></i> Shop Now</span>
      </div>
      <div class="category-card-image">
        <div style="width:100%;height:280px;background:var(--dark-surface);display:flex;align-items:center;justify-content:center;">
          <i class="${cat.icon}" style="font-size:4rem;color:var(--primary);opacity:0.3;"></i>
        </div>
      </div>
    </a>
  `).join('');
}

// ============================================
// BESTSELLERS RENDERING (Homepage)
// ============================================
function renderBestsellers() {
  const container = document.getElementById('bestsellersContainer');
  if (!container) return;

  const bestsellers = Store.products.filter(p => p.badge === 'Best Seller').slice(0, 6);

  if (bestsellers.length === 0) {
    container.innerHTML = `
      <div class="col-12 no-products">
        <i class="fas fa-trophy"></i>
        <h4>No bestsellers found</h4>
      </div>`;
    return;
  }

  container.innerHTML = bestsellers.map(product => createProductCard(product)).join('');
  requestAnimationFrame(() => container.classList.add('revealed'));
  initScrollReveal();
}

// ============================================
// FILTERS
// ============================================
function renderFilters() {
  const container = document.getElementById('filterContent');
  if (!container) return;

  // Get unique subcategories per category
  const subcategories = {};
  Store.categories.forEach(cat => {
    subcategories[cat.id] = cat.subcategories || [];
  });

  // Price ranges
  const maxPrice = Math.max(...Store.products.map(p => p.originalPrice || p.price));

  container.innerHTML = `
    <!-- Category Filter -->
    <div class="filter-group">
      <h6><i class="fas fa-layer-group me-2"></i>Category</h6>
      ${Store.categories.map(cat => `
        <div class="filter-option">
          <input type="radio" name="categoryFilter" id="cat_${cat.id}" value="${cat.id}" onchange="applyCategoryFilter('${cat.id}')">
          <label for="cat_${cat.id}">${cat.name} (${Store.products.filter(p => p.category === cat.id).length})</label>
        </div>
      `).join('')}
      <div class="filter-option">
        <input type="radio" name="categoryFilter" id="cat_all" value="" checked onchange="applyCategoryFilter('')">
        <label for="cat_all">All Categories</label>
      </div>
    </div>

    <!-- Subcategory Filter -->
    <div class="filter-group" id="subcategoryFilter" style="display:none;">
      <h6><i class="fas fa-tags me-2"></i>Subcategory</h6>
      <div id="subcategoryOptions"></div>
    </div>

    <!-- Price Filter -->
    <div class="filter-group">
      <h6><i class="fas fa-dollar-sign me-2"></i>Price Range</h6>
      <div class="price-range">
        <input type="number" id="priceMin" placeholder="Min" min="0" value="0">
        <span>-</span>
        <input type="number" id="priceMax" placeholder="Max" min="0" value="${Math.ceil(maxPrice)}">
      </div>
      <button class="btn btn-sm btn-outline-danger mt-2 w-100" onclick="applyPriceFilter()">Apply Price</button>
    </div>

    <!-- Rating Filter -->
    <div class="filter-group">
      <h6><i class="fas fa-star me-2"></i>Minimum Rating</h6>
      ${[4, 3, 2, 1].map(r => `
        <div class="filter-option">
          <input type="radio" name="ratingFilter" id="rating_${r}" value="${r}" onchange="applyRatingFilter(${r})">
          <label for="rating_${r}">
            ${'<i class="fas fa-star" style="color:var(--accent);font-size:0.8rem;"></i>'.repeat(r)}
            ${'<i class="far fa-star" style="color:var(--text-muted);font-size:0.8rem;"></i>'.repeat(5 - r)}
            & Up
          </label>
        </div>
      `).join('')}
      <div class="filter-option">
        <input type="radio" name="ratingFilter" id="rating_0" value="0" checked onchange="applyRatingFilter(0)">
        <label for="rating_0">All Ratings</label>
      </div>
    </div>

    <!-- Badge Filter -->
    <div class="filter-group">
      <h6><i class="fas fa-tag me-2"></i>Special Offers</h6>
      <div class="filter-option">
        <input type="checkbox" id="filterOnSale" onchange="toggleOnSaleFilter()">
        <label for="filterOnSale">On Sale</label>
      </div>
      <div class="filter-option">
        <input type="checkbox" id="filterInStock" onchange="toggleInStockFilter()">
        <label for="filterInStock">In Stock Only</label>
      </div>
    </div>
  `;
}

function applyCategoryFilter(categoryId) {
  Store.filters.category = categoryId;
  Store.filters.subcategory = '';
  Store.displayedCount = Store.itemsPerPage;

  // Show/hide subcategory filter
  const subFilter = document.getElementById('subcategoryFilter');
  if (categoryId) {
    const cat = Store.categories.find(c => c.id === categoryId);
    if (cat && cat.subcategories && cat.subcategories.length) {
      subFilter.style.display = 'block';
      const subOptions = document.getElementById('subcategoryOptions');
      subOptions.innerHTML = cat.subcategories.map(sub => `
        <div class="filter-option">
          <input type="radio" name="subFilter" id="sub_${sub.replace(/\s/g, '')}" value="${sub}" onchange="applySubcategoryFilter('${sub}')">
          <label for="sub_${sub.replace(/\s/g, '')}">${sub}</label>
        </div>
      `).join('');
    } else {
      subFilter.style.display = 'none';
    }
  } else {
    subFilter.style.display = 'none';
  }

  renderProducts();
  updateActiveFilters();
}

function applySubcategoryFilter(subcategory) {
  Store.filters.subcategory = subcategory;
  Store.displayedCount = Store.itemsPerPage;
  renderProducts();
  updateActiveFilters();
}

function applyPriceFilter() {
  const min = parseFloat(document.getElementById('priceMin').value) || 0;
  const max = parseFloat(document.getElementById('priceMax').value) || Infinity;
  Store.filters.priceRange = { min, max };
  Store.displayedCount = Store.itemsPerPage;
  renderProducts();
  updateActiveFilters();
}

function applyRatingFilter(rating) {
  Store.filters.rating = rating;
  Store.displayedCount = Store.itemsPerPage;
  renderProducts();
  updateActiveFilters();
}

let onSaleFilterActive = false;
let inStockFilterActive = false;

function toggleOnSaleFilter() {
  onSaleFilterActive = document.getElementById('filterOnSale').checked;
  Store.displayedCount = Store.itemsPerPage;
  renderProducts();
  updateActiveFilters();
}

function toggleInStockFilter() {
  inStockFilterActive = document.getElementById('filterInStock').checked;
  Store.displayedCount = Store.itemsPerPage;
  renderProducts();
  updateActiveFilters();
}

// Global function for category filtering from links - redirects to shop page
window.filterByCategory = function(categoryId) {
  window.location.href = 'shop.html#' + categoryId;
};

function updateActiveFilters() {
  const container = document.getElementById('activeFilters');
  if (!container) return;

  const tags = [];

  if (Store.filters.category) {
    const cat = Store.categories.find(c => c.id === Store.filters.category);
    tags.push({ label: cat ? cat.name : Store.filters.category, type: 'category' });
  }
  if (Store.filters.subcategory) {
    tags.push({ label: Store.filters.subcategory, type: 'subcategory' });
  }
  if (Store.filters.rating > 0) {
    tags.push({ label: `${Store.filters.rating}+ Stars`, type: 'rating' });
  }
  if (onSaleFilterActive) {
    tags.push({ label: 'On Sale', type: 'onSale' });
  }
  if (inStockFilterActive) {
    tags.push({ label: 'In Stock', type: 'inStock' });
  }
  if (Store.filters.search) {
    tags.push({ label: `"${Store.filters.search}"`, type: 'search' });
  }

  container.innerHTML = tags.map(tag => `
    <span class="active-filter-tag">
      ${tag.label}
      <button onclick="removeFilter('${tag.type}')">&times;</button>
    </span>
  `).join('');
}

window.removeFilter = function(type) {
  switch (type) {
    case 'category':
      Store.filters.category = '';
      document.getElementById('cat_all').checked = true;
      document.getElementById('subcategoryFilter').style.display = 'none';
      break;
    case 'subcategory':
      Store.filters.subcategory = '';
      break;
    case 'rating':
      Store.filters.rating = 0;
      document.getElementById('rating_0').checked = true;
      break;
    case 'onSale':
      onSaleFilterActive = false;
      document.getElementById('filterOnSale').checked = false;
      break;
    case 'inStock':
      inStockFilterActive = false;
      document.getElementById('filterInStock').checked = false;
      break;
    case 'search':
      Store.filters.search = '';
      document.getElementById('searchInput').value = '';
      break;
  }
  Store.displayedCount = Store.itemsPerPage;
  renderProducts();
  updateActiveFilters();
};

document.getElementById('clearFilters')?.addEventListener('click', () => {
  Store.filters = {
    category: '',
    subcategory: '',
    priceRange: { min: 0, max: Infinity },
    rating: 0,
    search: '',
    sort: 'default'
  };
  onSaleFilterActive = false;
  inStockFilterActive = false;
  Store.displayedCount = Store.itemsPerPage;

  document.getElementById('cat_all').checked = true;
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value = 'default';
  document.getElementById('subcategoryFilter').style.display = 'none';
  document.getElementById('filterOnSale').checked = false;
  document.getElementById('filterInStock').checked = false;
  document.getElementById('priceMin').value = '0';
  document.getElementById('priceMax').value = '';
  document.getElementById('rating_0').checked = true;

  renderProducts();
  updateActiveFilters();
});

// ============================================
// FILTER TOGGLE (Mobile)
// ============================================
function initFilterToggle() {
  const toggleBtn = document.getElementById('filterToggleBtn');
  const sidebar = document.getElementById('filterSidebar');
  const overlay = document.getElementById('filterOverlay');
  const closeBtn = document.getElementById('closeFilters');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
    });
  }

  function closeFilters() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }

  if (overlay) overlay.addEventListener('click', closeFilters);
  if (closeBtn) closeBtn.addEventListener('click', closeFilters);
}

// ============================================
// PRODUCTS RENDERING
// ============================================
function getFilteredProducts() {
  let products = [...Store.products];

  // Category
  if (Store.filters.category) {
    products = products.filter(p => p.category === Store.filters.category);
  }

  // Subcategory
  if (Store.filters.subcategory) {
    products = products.filter(p => p.subcategory === Store.filters.subcategory);
  }

  // Price
  products = products.filter(p =>
    p.price >= Store.filters.priceRange.min && p.price <= Store.filters.priceRange.max
  );

  // Rating
  if (Store.filters.rating > 0) {
    products = products.filter(p => p.rating >= Store.filters.rating);
  }

  // Search
  if (Store.filters.search) {
    const query = Store.filters.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query))) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(query))
    );
  }

  // On Sale
  if (onSaleFilterActive) {
    products = products.filter(p => p.originalPrice && p.originalPrice > p.price);
  }

  // In Stock
  if (inStockFilterActive) {
    products = products.filter(p => p.inStock);
  }

  // Sort
  switch (Store.filters.sort) {
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
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
      break;
  }

  return products;
}

function renderProducts() {
  const container = document.getElementById('productsContainer');
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  if (!container) return;

  const filtered = getFilteredProducts();
  const toShow = filtered.slice(0, Store.displayedCount);

  if (resultsCount) {
    resultsCount.textContent = `Showing ${toShow.length} of ${filtered.length} products`;
  }

  if (toShow.length === 0) {
    container.innerHTML = `
      <div class="col-12 no-products">
        <i class="fas fa-search"></i>
        <h4>No products found</h4>
        <p>Try adjusting your filters or search terms.</p>
        <button class="btn btn-danger mt-3" onclick="document.getElementById('clearFilters').click()">Clear Filters</button>
      </div>`;
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }

  container.innerHTML = toShow.map(product => createProductCard(product)).join('');

  if (loadMoreWrap) {
    if (filtered.length > Store.displayedCount) {
      loadMoreWrap.style.display = 'block';
    } else {
      loadMoreWrap.style.display = 'none';
    }
  }

  // Trigger stagger animation
  requestAnimationFrame(() => {
    container.classList.add('revealed');
  });

  // Re-observe for scroll reveals
  initScrollReveal();
}

function createProductCard(product) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stars = generateStars(product.rating);
  const isWished = Store.isInWishlist(product.id);
  const inCart = Store.isInCart(product.id);
  const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return `
    <div class="col-sm-6 col-lg-4 product-card-wrapper">
      <div class="product-card tilt-card">
        <div class="product-card-image">
          <div style="width:100%;height:100%;background:var(--dark-surface);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;">
            <i class="${getCategoryIcon(product.category)}" style="font-size:3rem;color:var(--primary);opacity:0.4;"></i>
            <span style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">${product.subcategory || product.category}</span>
          </div>
          ${product.badge ? `<span class="product-card-badge badge-${product.badgeColor || 'danger'}">${product.badge}</span>` : ''}
          <div class="product-card-actions">
            <button class="product-action-btn ${isWished ? 'liked' : ''}" onclick="toggleWishlist(${product.id})" title="Add to Wishlist">
              <i class="fas fa-heart"></i>
            </button>
            <button class="product-action-btn" onclick="quickView(${product.id})" title="Quick View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="product-action-btn" onclick="showReviews(${product.id})" title="Reviews">
              <i class="fas fa-comment"></i>
            </button>
          </div>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${categoryLabel}</span>
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
function initLoadMore() {
  document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    Store.displayedCount += Store.itemsPerPage;
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
    sidebar.classList.add('open');
    overlay.classList.add('open');
  });

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }

  closeCart?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (Store.cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    showToast('Checkout initiated! This is a demo store.', 'success');
  });

  renderCart();
}

window.addToCart = function(productId) {
  const product = Store.products.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  const existing = Store.getCartItem(productId);
  if (existing) {
    existing.qty += 1;
  } else {
    Store.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  Store.saveCart();
  renderCart();
  updateCounts();
  renderProducts();
  showCartNotification(product.name);
};

window.removeFromCart = function(productId) {
  Store.cart = Store.cart.filter(item => item.id !== productId);
  Store.saveCart();
  renderCart();
  updateCounts();
  renderProducts();
};

window.updateCartQty = function(productId, delta) {
  const item = Store.getCartItem(productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }

  Store.saveCart();
  renderCart();
  updateCounts();
};

function renderCart() {
  const container = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');

  if (!container) return;

  if (Store.cart.length === 0) {
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

  container.innerHTML = Store.cart.map(item => `
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

  const subtotal = Store.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function showCartNotification(productName) {
  const notification = document.getElementById('cartNotification');
  const text = document.getElementById('cartNotificationText');
  if (!notification || !text) return;

  text.textContent = `${productName} added to cart!`;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

// ============================================
// WISHLIST
// ============================================
function initWishlist() {
  renderWishlist();
}

window.toggleWishlist = function(productId) {
  const index = Store.wishlist.indexOf(productId);
  if (index > -1) {
    Store.wishlist.splice(index, 1);
    showToast('Removed from wishlist', 'info');
  } else {
    Store.wishlist.push(productId);
    showToast('Added to wishlist!', 'success');
  }

  Store.saveWishlist();
  updateCounts();
  renderProducts();
  renderWishlist();
};

function renderWishlist() {
  const container = document.getElementById('likesItems');
  if (!container) return;

  if (Store.wishlist.length === 0) {
    container.innerHTML = '<p class="text-center text-muted py-4">No favorites yet. Start browsing!</p>';
    return;
  }

  container.innerHTML = Store.wishlist.map(id => {
    const product = Store.products.find(p => p.id === id);
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
// SEARCH
// ============================================
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      Store.filters.search = e.target.value.trim();
      Store.displayedCount = Store.itemsPerPage;
      renderProducts();
      updateActiveFilters();
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
    Store.filters.sort = e.target.value;
    renderProducts();
  });
}

// ============================================
// REVIEWS
// ============================================
window.showReviews = function(productId) {
  const modal = new bootstrap.Modal(document.getElementById('reviewsModal'));
  const body = document.getElementById('reviewsModalBody');
  const product = Store.products.find(p => p.id === productId);
  const reviews = Store.reviews.filter(r => r.productId === productId);

  if (!body) return;

  let html = '';
  if (product) {
    html += `<h6 class="mb-3">${product.name}</h6>`;
  }

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
  const product = Store.products.find(p => p.id === productId);

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
// UTILITY FUNCTIONS
// ============================================
function updateCounts() {
  const cartCount = document.getElementById('cartCount');
  const likesCount = document.getElementById('likesCount');

  const totalItems = Store.cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.classList.remove('badge-animate');
    void cartCount.offsetWidth;
    cartCount.classList.add('badge-animate');
  }
  if (likesCount) {
    likesCount.textContent = Store.wishlist.length;
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
  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// Initialize scroll reveal after DOM load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initScrollReveal, 100);
});
