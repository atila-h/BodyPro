/* ============================================
   BodyPro - Enhancements JavaScript
   Advanced Effects: Particles, Counter, Parallax, Lazy Load
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeroParticles();
  initCounterAnimation();
  initParallaxEffect();
  initImageLazyLoad();
  initTiltEffect();
  initSmoothAnchorLinks();
});

// ============================================
// HERO PARTICLES
// ============================================
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const particleCount = 25;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('span');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.width = `${Math.random() * 4 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${Math.random() * 6 + 5}s`;
    particle.style.opacity = `${Math.random() * 0.4 + 0.1}`;

    const colors = ['#dc3545', '#0d6efd', '#ffc107', '#198754'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
  }
}

// ============================================
// COUNTER ANIMATION
// ============================================
function initCounterAnimation() {
  const counters = document.querySelectorAll('.counter-animated');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;

        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
  const duration = 2000;
  const startTime = performance.now();
  const startValue = 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (target - startValue) * easeOut);

    element.textContent = current.toLocaleString() + (target >= 100 ? '+' : '');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ============================================
// PARALLAX EFFECT
// ============================================
function initParallaxEffect() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    hero.style.backgroundPositionY = `${rate}px`;
  }, { passive: true });
}

// ============================================
// IMAGE LAZY LOAD (for actual images)
// ============================================
function initImageLazyLoad() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (!lazyImages.length) return;

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '100px'
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

// ============================================
// TILT EFFECT ON PRODUCT CARDS
// ============================================
function initTiltEffect() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ============================================
// SMOOTH ANCHOR LINKS
// ============================================
function initSmoothAnchorLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navbarHeight = document.getElementById('mainNavbar')?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav
        const navCollapse = document.getElementById('navbarNav');
        if (navCollapse && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });
}

// ============================================
// HERO PARTICLE RANDOM MOVEMENT
// ============================================
function initParticleMovement() {
  const particles = document.querySelectorAll('#heroParticles span');
  particles.forEach(particle => {
    setInterval(() => {
      const newX = Math.random() * 100;
      const newY = Math.random() * 100;
      particle.style.left = `${newX}%`;
      particle.style.top = `${newY}%`;
    }, Math.random() * 5000 + 5000);
  });
}

// Initialize particle movement after initial animation
setTimeout(initParticleMovement, 1000);

// ============================================
// PERFORMANCE: Throttle scroll events
// ============================================
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Apply throttled scroll for performance
window.addEventListener('scroll', throttle(() => {
  // Any additional scroll-based effects can go here
}, 100), { passive: true });

// ============================================
// ACCESSIBILITY: Keyboard navigation for product cards
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close cart sidebar
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar?.classList.contains('open')) {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    }

    // Close mobile filters
    const filterSidebar = document.getElementById('filterSidebar');
    const filterOverlay = document.getElementById('filterOverlay');
    if (filterSidebar?.classList.contains('active')) {
      filterSidebar.classList.remove('active');
      filterOverlay?.classList.remove('active');
    }
  }
});

console.log('%c BodyPro Store Loaded Successfully', 'color: #dc3545; font-size: 16px; font-weight: bold;');
