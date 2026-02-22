// Enhancements JavaScript - Priority 2 & 3 Features

// ==================== PRODUCT FILTERING SYSTEM ====================

class ProductFilter {
    constructor(products, containerId) {
        this.products = products;
        this.filteredProducts = [...products];
        this.container = document.getElementById(containerId);
        this.activeFilters = {
            categories: [],
            priceRange: { min: 0, max: 1000 },
            rating: 0
        };
        this.sortBy = 'default';
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupSorting();
        this.renderFilters();
        this.applyFilters();
    }

    setupFilters() {
        // Get unique categories
        const categories = [...new Set(this.products.map(p => p.category))];
        
        // Calculate price range
        const prices = this.products.map(p => parseFloat(p.price.replace('$', '')));
        this.maxPrice = Math.ceil(Math.max(...prices));
        this.activeFilters.priceRange.max = this.maxPrice;
        
        this.categories = categories;
    }

    renderFilters() {
        const filterHTML = `
            <div class="filter-section">
                <h6 class="filter-title"><i class="fas fa-tags me-2"></i>Categories</h6>
                ${this.categories.map(cat => `
                    <label class="filter-checkbox">
                        <input type="checkbox" value="${cat}" onchange="filterSystem.toggleCategory('${cat}')">
                        <span class="filter-label">${cat}</span>
                        <span class="filter-count">${this.products.filter(p => p.category === cat).length}</span>
                    </label>
                `).join('')}
            </div>
            
            <div class="filter-section">
                <h6 class="filter-title"><i class="fas fa-dollar-sign me-2"></i>Price Range</h6>
                <div class="price-range-container">
                    <input type="range" class="price-range-slider" 
                           min="0" max="${this.maxPrice}" value="${this.maxPrice}"
                           oninput="filterSystem.updatePriceRange(this.value)">
                    <div class="price-display">
                        <span>$0</span>
                        <span id="maxPriceDisplay">$${this.maxPrice}</span>
                    </div>
                </div>
            </div>
            
            <div class="filter-section">
                <h6 class="filter-title"><i class="fas fa-star me-2"></i>Rating</h6>
                ${[4, 3, 2, 1].map(rating => `
                    <label class="rating-filter-option">
                        <input type="radio" name="rating" value="${rating}" 
                               onchange="filterSystem.setRating(${rating})"
                               ${this.activeFilters.rating === rating ? 'checked' : ''}>
                        <span class="rating-stars-filter">
                            ${Array(5).fill(0).map((_, i) => 
                                `<i class="${i < rating ? 'fas' : 'far'} fa-star"></i>`
                            ).join('')}
                        </span>
                        <span class="rating-text">& Up</span>
                    </label>
                `).join('')}
                <label class="rating-filter-option">
                    <input type="radio" name="rating" value="0" 
                           onchange="filterSystem.setRating(0)"
                           ${this.activeFilters.rating === 0 ? 'checked' : ''}>
                    <span class="rating-text">All Ratings</span>
                </label>
            </div>
        `;

        const filterContainer = document.querySelector('.product-filters');
        if (filterContainer) {
            filterContainer.innerHTML = filterHTML;
        }
    }

    setupSorting() {
        const sortContainer = document.querySelector('.sort-dropdown-container');
        if (sortContainer) {
            sortContainer.innerHTML = `
                <label><i class="fas fa-sort me-2"></i>Sort by:</label>
                <select class="sort-select" onchange="filterSystem.sortProducts(this.value)">
                    <option value="default">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A-Z</option>
                </select>
            `;
        }
    }

    toggleCategory(category) {
        const index = this.activeFilters.categories.indexOf(category);
        if (index > -1) {
            this.activeFilters.categories.splice(index, 1);
        } else {
            this.activeFilters.categories.push(category);
        }
        this.applyFilters();
    }

    updatePriceRange(value) {
        this.activeFilters.priceRange.max = parseFloat(value);
        document.getElementById('maxPriceDisplay').textContent = `$${value}`;
        this.applyFilters();
    }

    setRating(rating) {
        this.activeFilters.rating = rating;
        this.applyFilters();
    }

    sortProducts(sortType) {
        this.sortBy = sortType;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Category filter
            if (this.activeFilters.categories.length > 0 && 
                !this.activeFilters.categories.includes(product.category)) {
                return false;
            }
            
            // Price filter
            const price = parseFloat(product.price.replace('$', ''));
            if (price > this.activeFilters.priceRange.max) {
                return false;
            }
            
            // Rating filter
            if (this.activeFilters.rating > 0 && product.rating < this.activeFilters.rating) {
                return false;
            }
            
            return true;
        });

        // Apply sorting
        this.sortFilteredProducts();
        
        // Update display
        this.updateResultsCount();
        this.renderActiveFilters();
        
        // Re-render products
        if (typeof renderProducts === 'function') {
            renderProducts(this.filteredProducts);
        }
    }

    sortFilteredProducts() {
        switch (this.sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => 
                    parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''))
                );
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => 
                    parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''))
                );
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Keep original order
                break;
        }
    }

    updateResultsCount() {
        const countElement = document.querySelector('.results-count');
        if (countElement) {
            countElement.innerHTML = `Showing <strong>${this.filteredProducts.length}</strong> of ${this.products.length} products`;
        }
    }

    renderActiveFilters() {
        const container = document.querySelector('.active-filters');
        if (!container) return;

        let tags = [];
        
        // Category tags
        this.activeFilters.categories.forEach(cat => {
            tags.push(`
                <span class="filter-tag" onclick="filterSystem.toggleCategory('${cat}')">
                    ${cat} <i class="fas fa-times"></i>
                </span>
            `);
        });
        
        // Price tag
        if (this.activeFilters.priceRange.max < this.maxPrice) {
            tags.push(`
                <span class="filter-tag" onclick="filterSystem.clearPriceFilter()">
                    Under $${this.activeFilters.priceRange.max} <i class="fas fa-times"></i>
                </span>
            `);
        }
        
        // Rating tag
        if (this.activeFilters.rating > 0) {
            tags.push(`
                <span class="filter-tag" onclick="filterSystem.setRating(0)">
                    ${this.activeFilters.rating}+ Stars <i class="fas fa-times"></i>
                </span>
            `);
        }

        container.innerHTML = tags.join('') + 
            (tags.length > 0 ? `<span class="clear-all-filters" onclick="filterSystem.clearAllFilters()">Clear All</span>` : '');
    }

    clearPriceFilter() {
        this.activeFilters.priceRange.max = this.maxPrice;
        const slider = document.querySelector('.price-range-slider');
        if (slider) slider.value = this.maxPrice;
        document.getElementById('maxPriceDisplay').textContent = `$${this.maxPrice}`;
        this.applyFilters();
    }

    clearAllFilters() {
        this.activeFilters = {
            categories: [],
            priceRange: { min: 0, max: this.maxPrice },
            rating: 0
        };
        
        // Reset UI
        document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
        document.querySelectorAll('.rating-filter-option input').forEach(rb => rb.checked = false);
        document.querySelector('.price-range-slider').value = this.maxPrice;
        document.getElementById('maxPriceDisplay').textContent = `$${this.maxPrice}`;
        
        this.applyFilters();
    }
}

// ==================== NEWSLETTER SYSTEM ====================

class NewsletterSystem {
    constructor() {
        this.subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers')) || [];
    }

    subscribe(email) {
        if (!this.validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }

        if (this.subscribers.includes(email)) {
            showToast('You are already subscribed!', 'warning');
            return false;
        }

        this.subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(this.subscribers));
        
        showToast('Successfully subscribed! Check your email for a welcome message.', 'success');
        
        // Simulate sending welcome email
        this.sendWelcomeEmail(email);
        
        return true;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    sendWelcomeEmail(email) {
        // In a real app, this would call an API
        console.log(`Welcome email sent to ${email}`);
    }

    renderNewsletterSection() {
        return `
            <section class="newsletter-section animate-on-scroll">
                <div class="container">
                    <div class="newsletter-content">
                        <h2 class="newsletter-title">Stay Updated with Exclusive Offers!</h2>
                        <p class="newsletter-subtitle">Subscribe to our newsletter and get 10% off your first order</p>
                        
                        <form class="newsletter-form" onsubmit="event.preventDefault(); newsletterSystem.subscribe(this.querySelector('input').value); this.reset();">
                            <input type="email" class="newsletter-input" placeholder="Enter your email address" required>
                            <button type="submit" class="newsletter-btn">Subscribe</button>
                        </form>
                        
                        <div class="newsletter-benefits">
                            <div class="newsletter-benefit">
                                <i class="fas fa-percent"></i>
                                <span>Exclusive Discounts</span>
                            </div>
                            <div class="newsletter-benefit">
                                <i class="fas fa-bolt"></i>
                                <span>New Arrivals First</span>
                            </div>
                            <div class="newsletter-benefit">
                                <i class="fas fa-gift"></i>
                                <span>Special Promotions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
}

// ==================== QUICK VIEW MODAL ====================

class QuickViewModal {
    constructor() {
        this.createModal();
    }

    createModal() {
        const modalHTML = `
            <div class="modal fade quick-view-modal" id="quickViewModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-body">
                            <button type="button" class="btn-close position-absolute end-0 m-3" data-bs-dismiss="modal"></button>
                            <div class="quick-view-container" id="quickViewContent">
                                <!-- Content loaded dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body if not exists
        if (!document.getElementById('quickViewModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    open(product) {
        const content = document.getElementById('quickViewContent');
        if (!content) return;

        const isSubPage = window.location.pathname.includes('/code/html/');
        const imagePathPrefix = isSubPage ? '../../' : '';

        content.innerHTML = `
            <div class="quick-view-image-section">
                <img src="${imagePathPrefix}${product.image}" alt="${product.name}" class="quick-view-image">
                ${product.discount ? `<span class="badge bg-danger position-absolute top-0 start-0 m-3">-${product.discount}%</span>` : ''}
                
                <div class="quick-view-gallery">
                    <img src="${imagePathPrefix}${product.image}" class="gallery-thumb active" onclick="quickViewModal.changeImage(this)">
                    <img src="${imagePathPrefix}${product.image}" class="gallery-thumb" onclick="quickViewModal.changeImage(this)">
                    <img src="${imagePathPrefix}${product.image}" class="gallery-thumb" onclick="quickViewModal.changeImage(this)">
                </div>
            </div>
            
            <div class="quick-view-details">
                <span class="quick-view-category">${product.category}</span>
                <h2 class="quick-view-title">${product.name}</h2>
                
                <div class="quick-view-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.reviews.length} reviews)</span>
                </div>
                
                <div class="quick-view-price">
                    ${product.price}
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice}</span>` : ''}
                </div>
                
                <div class="quick-view-description">
                    <p>${this.getProductDescription(product)}</p>
                </div>
                
                <div class="quick-view-stock">
                    ${product.inStock 
                        ? '<span class="text-success"><i class="fas fa-check-circle"></i> In Stock</span>'
                        : `<span class="text-danger"><i class="fas fa-times-circle"></i> Out of Stock</span>
                           ${product.restockDate ? `<div class="text-muted small">Restock: ${formatRestockDate(product.restockDate)}</div>` : ''}`
                    }
                </div>
                
                <div class="quick-view-actions">
                    <button class="btn btn-danger btn-ripple ${!product.inStock ? 'disabled' : ''}" 
                            onclick="addToCartById(${product.id}); quickViewModal.close();"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus me-2"></i> ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn btn-outline-danger" onclick="toggleLikeById(${product.id})">
                        <i class="far fa-heart"></i>
                    </button>
                    <a href="${isSubPage ? 'product-detail.html' : 'code/html/product-detail.html'}?id=${product.id}" class="btn btn-outline-secondary">
                        View Details
                    </a>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        modal.show();
    }

    close() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
        if (modal) modal.hide();
    }

    changeImage(thumb) {
        const mainImage = document.querySelector('.quick-view-image');
        if (mainImage && thumb) {
            mainImage.src = thumb.src;
            document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        }
    }

    getProductDescription(product) {
        const descriptions = {
            'Supplements': 'Premium quality supplement designed to support your fitness goals. Made with high-grade ingredients for maximum effectiveness.',
            'Sportswear': 'High-performance athletic wear designed for comfort and durability. Perfect for intense workouts or casual wear.',
            'Equipment': 'Professional-grade gym equipment built to last. Essential for any home gym or professional facility.',
            'Medicine': 'Health and wellness products to support your active lifestyle. Quality tested for safety and effectiveness.'
        };
        return descriptions[product.category] || 'Quality product for your fitness needs.';
    }
}

// ==================== PRODUCT COMPARISON ====================

class ProductComparison {
    constructor() {
        this.compareList = JSON.parse(localStorage.getItem('compare_list')) || [];
        this.maxCompare = 4;
        this.init();
    }

    init() {
        this.createComparisonBar();
    }

    createComparisonBar() {
        const barHTML = `
            <div class="comparison-bar" id="comparisonBar">
                <div class="comparison-products" id="comparisonProducts"></div>
                <div class="comparison-actions">
                    <button class="btn btn-primary" onclick="productComparison.showComparisonModal()">
                        <i class="fas fa-balance-scale me-2"></i>Compare (${this.compareList.length})
                    </button>
                    <button class="btn btn-outline-secondary" onclick="productComparison.clearAll()">
                        <i class="fas fa-times"></i> Clear
                    </button>
                </div>
            </div>
            
            <div class="modal fade" id="comparisonModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Product Comparison</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div id="comparisonTableContainer"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('comparisonBar')) {
            document.body.insertAdjacentHTML('beforeend', barHTML);
        }
        
        this.updateComparisonBar();
    }

    toggleCompare(product) {
        const index = this.compareList.findIndex(p => p.id === product.id);
        
        if (index > -1) {
            this.compareList.splice(index, 1);
            showToast(`${product.name} removed from comparison`, 'info');
        } else {
            if (this.compareList.length >= this.maxCompare) {
                showToast(`You can compare up to ${this.maxCompare} products`, 'warning');
                return;
            }
            this.compareList.push(product);
            showToast(`${product.name} added to comparison`, 'success');
        }
        
        localStorage.setItem('compare_list', JSON.stringify(this.compareList));
        this.updateComparisonBar();
        this.updateCompareCheckboxes();
    }

    updateComparisonBar() {
        const bar = document.getElementById('comparisonBar');
        const container = document.getElementById('comparisonProducts');
        const isSubPage = window.location.pathname.includes('/code/html/');
        const imagePathPrefix = isSubPage ? '../../' : '';
        
        if (this.compareList.length === 0) {
            bar.classList.remove('active');
        } else {
            bar.classList.add('active');
            if (container) {
                container.innerHTML = this.compareList.map(p => `
                    <img src="${imagePathPrefix}${p.image}" alt="${p.name}" class="comparison-product-thumb" title="${p.name}">
                `).join('');
            }
            
            // Update compare button text
            const btn = bar.querySelector('.btn-primary');
            if (btn) btn.innerHTML = `<i class="fas fa-balance-scale me-2"></i>Compare (${this.compareList.length})`;
        }
    }

    updateCompareCheckboxes() {
        document.querySelectorAll('.compare-checkbox input').forEach(cb => {
            const productId = parseInt(cb.dataset.productId);
            cb.checked = this.compareList.some(p => p.id === productId);
        });
    }

    showComparisonModal() {
        if (this.compareList.length < 2) {
            showToast('Please select at least 2 products to compare', 'warning');
            return;
        }

        const isSubPage = window.location.pathname.includes('/code/html/');
        const imagePathPrefix = isSubPage ? '../../' : '';
        const container = document.getElementById('comparisonTableContainer');
        
        const features = [
            { key: 'price', label: 'Price', format: v => v },
            { key: 'rating', label: 'Rating', format: v => `${v}/5` },
            { key: 'category', label: 'Category', format: v => v },
            { key: 'inStock', label: 'Availability', format: v => v ? 'In Stock' : 'Out of Stock' }
        ];

        container.innerHTML = `
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Feature</th>
                        ${this.compareList.map(p => `
                            <th>
                                <div class="comparison-product-header">
                                    <img src="${imagePathPrefix}${p.image}" alt="${p.name}">
                                    <h6>${p.name}</h6>
                                    <button class="btn btn-sm btn-outline-danger" onclick="productComparison.toggleCompare(productComparison.compareList.find(x => x.id === ${p.id}))">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${features.map(f => `
                        <tr>
                            <td class="feature-name">${f.label}</td>
                            ${this.compareList.map(p => {
                                const value = f.format(p[f.key]);
                                const isLowestPrice = f.key === 'price' && this.isLowestPrice(p.price);
                                return `<td class="feature-value ${isLowestPrice ? 'price-winner' : ''}">${value}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                    <tr>
                        <td class="feature-name">Reviews</td>
                        ${this.compareList.map(p => `
                            <td class="feature-value">${p.reviews.length} reviews</td>
                        `).join('')}
                    </tr>
                    <tr>
                        <td class="feature-name">Action</td>
                        ${this.compareList.map(p => `
                            <td>
                                <button class="btn btn-danger btn-sm ${!p.inStock ? 'disabled' : ''}" 
                                        onclick="addToCartById(${p.id})"
                                        ${!p.inStock ? 'disabled' : ''}>
                                    <i class="fas fa-cart-plus"></i> Add
                                </button>
                            </td>
                        `).join('')}
                    </tr>
                </tbody>
            </table>
        `;

        const modal = new bootstrap.Modal(document.getElementById('comparisonModal'));
        modal.show();
    }

    isLowestPrice(price) {
        const prices = this.compareList.map(p => parseFloat(p.price.replace('$', '')));
        return parseFloat(price.replace('$', '')) === Math.min(...prices);
    }

    clearAll() {
        this.compareList = [];
        localStorage.removeItem('compare_list');
        this.updateComparisonBar();
        this.updateCompareCheckboxes();
        showToast('Comparison list cleared', 'info');
    }
}

// ==================== SCROLL ANIMATIONS ====================

class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        // Add animation classes to elements
        this.setupAnimations();
        
        // Intersection Observer for scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe all animate-on-scroll elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
    }

    setupAnimations() {
        // Add stagger classes to product cards
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.classList.add('animate-on-scroll', `stagger-${(index % 5) + 1}`);
        });

        // Add animation to sections
        document.querySelectorAll('section h2').forEach(heading => {
            heading.parentElement.classList.add('animate-on-scroll');
        });

        // Add animation to special offers
        document.querySelectorAll('.special-offer').forEach(offer => {
            offer.classList.add('animate-on-scroll', 'hover-lift');
        });

        // Add animation to guide cards
        document.querySelectorAll('.guide-card').forEach(card => {
            card.classList.add('animate-on-scroll', 'hover-lift');
        });
    }
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'success', duration = 3000) {
    // Create container if not exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Toast icons
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };

    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// Override the original showToast function if it exists
if (typeof window.showToast === 'function') {
    window.showToast = showToast;
}

// ==================== FILTER BY CATEGORY FUNCTION ====================

function filterByCategory(category) {
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    
    // Wait for filter system to be ready
    const checkFilterSystem = setInterval(() => {
        if (window.filterSystem && typeof window.filterSystem.toggleCategory === 'function') {
            clearInterval(checkFilterSystem);
            
            // Clear all filters first
            window.filterSystem.clearAllFilters();
            
            // Then apply the category filter
            setTimeout(() => {
                window.filterSystem.toggleCategory(category);
            }, 100);
        }
    }, 100);
}

// ==================== INITIALIZATION ====================

let filterSystem;
let newsletterSystem;
let quickViewModal;
let productComparison;
let scrollAnimations;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize systems
    newsletterSystem = new NewsletterSystem();
    quickViewModal = new QuickViewModal();
    productComparison = new ProductComparison();
    scrollAnimations = new ScrollAnimations();

    // Make functions globally available AFTER initialization
    window.filterSystem = filterSystem;
    window.newsletterSystem = newsletterSystem;
    window.quickViewModal = quickViewModal;
    window.productComparison = productComparison;
    window.showToast = showToast;
    window.filterByCategory = filterByCategory;

    // Add newsletter section before footer if on home page
    const footer = document.querySelector('footer');
    if (footer && !window.location.pathname.includes('/code/html/')) {
        footer.insertAdjacentHTML('beforebegin', newsletterSystem.renderNewsletterSection());
    }

    // Initialize filter system when products are loaded
    const checkProductsLoaded = setInterval(() => {
        if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
            clearInterval(checkProductsLoaded);
            
            // Only initialize filters on category pages or if explicitly needed
            const productsContainer = document.getElementById('productsContainer');
            if (productsContainer && productsContainer.closest('.container')) {
                // Check if we have a filter sidebar
                if (document.querySelector('.product-filters') || document.querySelector('.col-lg-3')) {
                    filterSystem = new ProductFilter(allProducts, 'productsContainer');
                    // Update global reference
                    window.filterSystem = filterSystem;
                }
            }
        }
    }, 100);
});
