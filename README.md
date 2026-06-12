# BodyPro - Premium Bodybuilding Store

A modern, full-featured e-commerce website for a bodybuilding store that sells sportswear, supplements, vitamins & medicine, thermoses, and personal gym equipment.

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3
- **Data**: JSON-driven architecture (`data/products.json`)
- **Storage**: localStorage for cart, wishlist, and theme preferences
- **Fonts**: Google Fonts (Inter)
- **Icons**: Font Awesome 6.4

## Project Structure

```
BodyPro-main/
├── index.html                          # Main store page
├── data/
│   └── products.json                   # All product data, categories, reviews, store info
├── code/
│   ├── css/
│   │   ├── style.css                   # Core styles, dark/light themes, responsive layout
│   │   └── enhancements.css            # Animations, micro-interactions, advanced effects
│   ├── javaScript/
│   │   ├── main.js                     # Core store logic (cart, filters, search, sort, rendering)
│   │   └── enhancements.js             # Hero particles, counters, parallax, tilt effects
│   └── html/
│       └── product-detail.html         # Individual product detail page
├── supplement/                          # Product images (supplements)
├── image/                               # Placeholder for sportswear/equipment images
└── logo/                                # Placeholder for logo files
```

## Features

### Core E-Commerce
- **30 products** across 5 categories with full details (price, description, features, nutrition facts, sizes, colors)
- **Shopping cart** with add, remove, quantity controls, and localStorage persistence
- **Wishlist/favorites** system saved to localStorage
- **Product detail page** with reviews, nutrition facts, related products, and stock indicator
- **Quick View modal** for fast product inspection without leaving the page

### Filtering & Search
- **Category filtering** (Sportswear, Supplements, Vitamins, Thermoses, Equipment)
- **Subcategory filtering** (Whey Protein, Creatine, BCAAs, T-Shirts, Dumbbells, etc.)
- **Price range filter** with min/max inputs
- **Rating filter** (1-4+ stars)
- **On Sale** and **In Stock Only** toggle filters
- **Active filter tags** with one-click removal
- **Text search** with debounced input across name, description, tags, and subcategory
- **Sorting** by price, rating, name, and biggest discount
- **Load More** pagination

### UI/UX
- **Dark/Light mode** toggle with localStorage persistence
- **Responsive design** for mobile, tablet, and desktop
- **Scroll reveal animations** using Intersection Observer
- **Hero section** with animated particle effects and stat counters
- **Ticker banner** with scrolling announcements
- **3D tilt effect** on product cards on hover
- **Toast notifications** for cart and wishlist actions
- **Cart sidebar** with slide-in animation
- **Back-to-top button** with scroll visibility
- **Loading skeletons** for product detail page
- **Smooth anchor scrolling** with navbar offset

### Product Detail Page
- Breadcrumb navigation
- Image gallery with thumbnail selector
- Size and color selectors
- Stock level indicator with progress bar
- Quantity selector
- Product features and nutrition facts
- Customer reviews section
- Related products carousel
- Guarantee/trust badges

### Data Architecture
- All products, categories, reviews, and store info stored in `data/products.json`
- State management through a centralized `Store` object
- localStorage for persistent user data (cart, wishlist, theme)
- Modular JavaScript with separated concerns (main.js + enhancements.js)

## How to Use

1. Open `index.html` in a web browser
2. Browse products by category or use the search/filter system
3. Add products to cart or wishlist
4. Click any product to view its detail page
5. Toggle dark/light mode with the moon/sun icon in the navbar

## Adding Real Products

Replace the placeholder icon `div`s in product cards by updating the `image` field in `data/products.json` with actual image paths. For example:

```json
{
  "image": "supplement/isolate.jpg",
  "images": ["supplement/isolate.jpg", "supplement/isoWhey1.jpg"]
}
```

Place product images in the appropriate directories (`supplement/`, `image/`, etc.).
