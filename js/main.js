/**
 * TOLEX RESTAURANT - Main JavaScript Controller
 * Navigation, Menu rendering, Search/Filter, Dish Modal, Gallery Lightbox,
 * Testimonial Slider, Scroll Reveal, and Global Toast System.
 */

// Global Toast Notification Helper
window.tolexShowToast = function(message, type = 'info') {
  let toastContainer = document.getElementById('tolexToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'tolexToastContainer';
    toastContainer.className = 'tolex-toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `tolex-toast toast-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'warning' ? '!' : 'ℹ';

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 300);
  });

  toastContainer.appendChild(toast);

  // Auto remove after 4.5s
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Scroll Effect
  const navbar = document.querySelector('.tolex-header');
  const handleScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('header-scrolled');
    } else {
      navbar.classList.remove('header-scrolled');
    }

    // Back to top button
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Back to top click
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 2. Mobile Navigation Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const closeMobileNav = document.getElementById('closeMobileNav');

  const toggleMobileNav = (open) => {
    if (!mobileNavDrawer) return;
    if (open) {
      mobileNavDrawer.classList.add('is-open');
      if (mobileNavBackdrop) mobileNavBackdrop.classList.add('is-open');
      document.body.classList.add('nav-open');
    } else {
      mobileNavDrawer.classList.remove('is-open');
      if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    }
  };

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => toggleMobileNav(true));
  }
  if (closeMobileNav) {
    closeMobileNav.addEventListener('click', () => toggleMobileNav(false));
  }
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', () => toggleMobileNav(false));
  }

  // Close mobile drawer when clicking a navigation link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(false));
  });

  // 3. Menu Grid & Filtering (Home & Services)
  initMenuSection();

  // 4. Testimonials Slider
  initTestimonialsSlider();

  // 5. Gallery Lightbox
  initGalleryLightbox();

  // 6. Scroll Reveal Observer
  initScrollReveal();

  // 7. Footer Newsletter
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]')?.value;
      if (email) {
        window.tolexShowToast(`Welcome to the TOLEX VIP Club! Check ${email} for exclusive culinary invitations.`, 'success');
        newsletterForm.reset();
      }
    });
  }
});

// Menu Section Logic: Rendering, Search, Category Tabs
function initMenuSection() {
  const menuContainer = document.getElementById('menuDishesGrid');
  if (!menuContainer) return;

  const categoryButtons = document.querySelectorAll('.menu-category-btn');
  const searchInput = document.getElementById('menuSearchInput');
  const clearSearchBtn = document.getElementById('clearMenuSearch');
  const emptyState = document.getElementById('menuNoResults');

  let activeCategory = 'all';
  let searchTerm = '';

  const renderDishes = () => {
    const filtered = TOLEX_MENU_DATA.filter(dish => {
      const matchesCat = activeCategory === 'all' || dish.category === activeCategory;
      const matchesSearch = !searchTerm || 
        dish.name.toLowerCase().includes(searchTerm) || 
        dish.shortDescription.toLowerCase().includes(searchTerm) ||
        dish.categoryName.toLowerCase().includes(searchTerm);
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      menuContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    menuContainer.innerHTML = filtered.map(dish => {
      // Generate chili pepper spice icons
      let spiceHtml = '';
      if (dish.spiceLevel > 0) {
        const peppers = '🌶️'.repeat(dish.spiceLevel);
        spiceHtml = `<span class="dish-spice-tag" title="${dish.spiceText}">${peppers} ${dish.spiceText}</span>`;
      }

      // Badges
      const specialBadge = dish.isChefSpecial ? `<span class="dish-badge chef-badge">Chef's Special</span>` : '';
      const popularBadge = dish.isPopular && !dish.isChefSpecial ? `<span class="dish-badge popular-badge">Popular</span>` : '';

      return `
        <article class="tolex-dish-card reveal-up" data-category="${dish.category}">
          <div class="dish-card-media">
            <img class="dish-card-img" src="${dish.image}" alt="${dish.name}" loading="lazy" onerror="this.src='${dish.fallbackImage}'">
            <div class="dish-media-overlay"></div>
            ${specialBadge || popularBadge}
            <div class="dish-quick-view-overlay">
              <button type="button" class="btn-quick-view" onclick="openDishDetailModal('${dish.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                View Details
              </button>
            </div>
          </div>

          <div class="dish-card-body">
            <div class="dish-meta-row">
              <span class="dish-cat-name">${dish.categoryName}</span>
              ${spiceHtml}
            </div>

            <h3 class="dish-name" onclick="openDishDetailModal('${dish.id}')">${dish.name}</h3>
            <p class="dish-desc">${dish.shortDescription}</p>

            <div class="dish-card-footer">
              <div class="dish-price-wrapper">
                <span class="price-currency">${dish.priceFormatted}</span>
                <span class="price-usd-sub">${dish.priceUsd} *est.</span>
              </div>
              <div class="dish-action-group">
                <button type="button" class="btn btn-outline-gold btn-sm" onclick="openDishDetailModal('${dish.id}')">
                  Details
                </button>
                <button type="button" class="btn btn-gold btn-sm btn-add-cart" onclick="window.tolexCart.addItem('${dish.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
                  Add
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  };

  // Filter clicks
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeCategory = btn.getAttribute('data-category') || 'all';
      renderDishes();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
      }
      renderDishes();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchTerm = '';
      clearSearchBtn.style.display = 'none';
      renderDishes();
      searchInput.focus();
    });
  }

  // Initial render
  renderDishes();
}

// Global Dish Details Modal Handler
window.openDishDetailModal = function(dishId) {
  const dish = TOLEX_MENU_DATA.find(d => d.id === dishId);
  if (!dish) return;

  let modal = document.getElementById('dishDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'dishDetailModal';
    modal.className = 'tolex-modal-backdrop';
    document.body.appendChild(modal);
  }

  const tagsHtml = (dish.tags || []).map(t => `<span class="modal-tag">${t}</span>`).join('');
  const allergensHtml = (dish.allergens || []).map(a => `<span class="allergen-pill">${a}</span>`).join('');

  modal.innerHTML = `
    <div class="tolex-modal-dialog dish-modal-dialog">
      <div class="modal-corner-ornament top-left"></div>
      <div class="modal-corner-ornament top-right"></div>
      <button class="modal-close-btn" onclick="closeDishDetailModal()" aria-label="Close dialog">&times;</button>
      
      <div class="dish-modal-grid">
        <div class="dish-modal-image-col">
          <div class="dish-modal-img-wrap">
            <img src="${dish.image}" alt="${dish.name}" onerror="this.src='${dish.fallbackImage}'">
            <div class="dish-modal-img-leaf"></div>
          </div>
          <div class="dish-modal-quick-stats">
            <div class="quick-stat-box">
              <span class="stat-lbl">Spice Level</span>
              <span class="stat-val">${dish.spiceText}</span>
            </div>
            <div class="quick-stat-box">
              <span class="stat-lbl">Est. Prep</span>
              <span class="stat-val">${dish.prepTime}</span>
            </div>
            <div class="quick-stat-box">
              <span class="stat-lbl">Calories</span>
              <span class="stat-val">${dish.calories}</span>
            </div>
          </div>
        </div>

        <div class="dish-modal-content-col">
          <div class="dish-modal-header">
            <span class="modal-cat-title">${dish.categoryName}</span>
            <h2 class="dish-modal-name">${dish.name}</h2>
            <div class="dish-modal-tags-row">${tagsHtml}</div>
            <div class="dish-modal-price-bar">
              <span class="dish-price-huge">${dish.priceFormatted}</span>
              <span class="dish-usd-huge">${dish.priceUsd}</span>
              <span class="placeholder-notice">(Standard Dining Price Placeholder)</span>
            </div>
          </div>

          <div class="dish-modal-body">
            <h4 class="section-label-gold">Culinary Story & Flavor Profile</h4>
            <p class="dish-full-text">${dish.fullDescription}</p>

            <h4 class="section-label-gold" style="margin-top: 1.25rem;">Allergen Information</h4>
            <div class="allergens-list">
              ${allergensHtml}
            </div>

            <p class="chef-note">
              <em>*Pairing Recommendation: Enjoy alongside our Signature Tolex Chapman or chilled Zobo Elixir.</em>
            </p>
          </div>

          <div class="dish-modal-footer">
            <button type="button" class="btn btn-gold btn-lg w-100" onclick="window.tolexCart.addItem('${dish.id}'); closeDishDetailModal();">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/></svg>
              Add to Order Enquiry (${dish.priceFormatted})
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('is-visible');
  document.body.classList.add('modal-open');

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeDishDetailModal();
  });
};

window.closeDishDetailModal = function() {
  const modal = document.getElementById('dishDetailModal');
  if (modal) {
    modal.classList.remove('is-visible');
    document.body.classList.remove('modal-open');
  }
};

// Testimonials Slider
function initTestimonialsSlider() {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.testimonial-card'));
  const prevBtn = slider.querySelector('.testimonial-prev');
  const nextBtn = slider.querySelector('.testimonial-next');
  const dotsContainer = slider.querySelector('.testimonial-dots');

  if (slides.length === 0) return;

  let current = 0;
  let autoTimer = null;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = slides.map((_, i) => `
      <button class="test-dot ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="Go to review ${i + 1}"></button>
    `).join('');

    dotsContainer.querySelectorAll('.test-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        showSlide(idx);
      });
    });
  }

  const showSlide = (idx) => {
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === idx);
    });

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.test-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === idx);
      });
    }

    current = idx;
    resetAuto();
  };

  const nextSlide = () => {
    let next = (current + 1) % slides.length;
    showSlide(next);
  };

  const prevSlide = () => {
    let prev = (current - 1 + slides.length) % slides.length;
    showSlide(prev);
  };

  const resetAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, 7000);
  };

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  showSlide(0);
  resetAuto();
}

// Gallery Lightbox
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('[data-gallery-item]');
  if (galleryItems.length === 0) return;

  let lightbox = document.getElementById('tolexLightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'tolexLightbox';
    lightbox.className = 'tolex-lightbox-backdrop';
    lightbox.innerHTML = `
      <div class="lightbox-wrapper">
        <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
        <button class="lightbox-prev" aria-label="Previous Image">&#10094;</button>
        <button class="lightbox-next" aria-label="Next Image">&#10095;</button>
        <div class="lightbox-content">
          <img class="lightbox-img" src="" alt="Gallery Preview">
          <div class="lightbox-caption">
            <h4 class="lightbox-title"></h4>
            <p class="lightbox-desc"></p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const imgEl = lightbox.querySelector('.lightbox-img');
  const titleEl = lightbox.querySelector('.lightbox-title');
  const descEl = lightbox.querySelector('.lightbox-desc');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let activeIndex = 0;
  const items = Array.from(galleryItems);

  const openLightbox = (index) => {
    activeIndex = index;
    const item = items[activeIndex];
    const src = item.getAttribute('data-img') || item.querySelector('img')?.src;
    const title = item.getAttribute('data-title') || '';
    const desc = item.getAttribute('data-desc') || '';

    imgEl.src = src;
    titleEl.textContent = title;
    descEl.textContent = desc;

    lightbox.classList.add('is-open');
    document.body.classList.add('lightbox-open');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  };

  items.forEach((item, idx) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  prevBtn.addEventListener('click', () => {
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    openLightbox(activeIndex);
  });

  nextBtn.addEventListener('click', () => {
    activeIndex = (activeIndex + 1) % items.length;
    openLightbox(activeIndex);
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
}

// Scroll Reveal with IntersectionObserver
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-scale');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
}
