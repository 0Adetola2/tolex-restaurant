/**
 * TOLEX RESTAURANT - Reservations & Order Enquiry System
 * Handles table reservation workflows, enquiry cart, WhatsApp order formatting,
 * and form validation with explicit confirmation modals.
 */

class TolexReservationManager {
  constructor() {
    this.modal = document.getElementById('reservationModal');
    this.form = document.getElementById('tableReservationForm');
    this.confirmationModal = document.getElementById('reservationSuccessModal');
    this.init();
  }

  init() {
    // Bind triggers to open reservation modal
    document.querySelectorAll('[data-open-reservation]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const preferredService = trigger.getAttribute('data-service') || '';
        this.openModal(preferredService);
      });
    });

    // Close buttons
    if (this.modal) {
      this.modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => this.closeModal());
      });

      // Close when clicking modal backdrop
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }

    // Reservation Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleReservationSubmit(e));
    }

    // Contact page standalone reservation form
    const standaloneResForm = document.getElementById('pageReservationForm');
    if (standaloneResForm) {
      standaloneResForm.addEventListener('submit', (e) => this.handleReservationSubmit(e));
    }

    // Contact form (general enquiry)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }

    // Catering calculator on Services page
    const cateringForm = document.getElementById('cateringCalculatorForm');
    if (cateringForm) {
      this.initCateringCalculator(cateringForm);
    }
  }

  openModal(serviceName = '') {
    if (!this.modal) return;
    this.modal.classList.add('is-visible');
    document.body.classList.add('modal-open');

    // Pre-select service or note if provided
    if (serviceName) {
      const notesField = this.modal.querySelector('#resSpecialRequests');
      if (notesField && !notesField.value) {
        notesField.value = `Enquiring for: ${serviceName}`;
      }
    }

    // Set minimum date to today
    const dateInput = this.modal.querySelector('input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      if (!dateInput.value) dateInput.value = today;
    }
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.remove('is-visible');
    document.body.classList.remove('modal-open');
  }

  handleReservationSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Validate fields
    const name = form.querySelector('[name="name"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const date = form.querySelector('[name="date"]')?.value;
    const time = form.querySelector('[name="time"]')?.value;
    const guests = form.querySelector('[name="guests"]')?.value;
    const seating = form.querySelector('[name="seating"]')?.value || 'Main Dining Room';
    const notes = form.querySelector('[name="special_requests"]')?.value.trim() || 'None';

    if (!name || !phone || !email || !date || !time || !guests) {
      window.tolexShowToast('Please fill in all required reservation fields.', 'warning');
      return;
    }

    // Generate unique reservation booking reference
    const refId = 'TLX-RES-' + Math.floor(100000 + Math.random() * 900000);

    // Prepare reservation summary details
    const resData = {
      refId,
      name,
      phone,
      email,
      date,
      time,
      guests,
      seating,
      notes,
      timestamp: new Date().toLocaleString()
    };

    // Show simulated success modal with transparent note
    this.showReservationConfirmation(resData);

    // Reset form
    form.reset();
    if (this.modal) this.closeModal();
  }

  showReservationConfirmation(data) {
    let confirmModal = document.getElementById('reservationConfirmSummaryModal');
    if (!confirmModal) {
      confirmModal = document.createElement('div');
      confirmModal.id = 'reservationConfirmSummaryModal';
      confirmModal.className = 'tolex-modal-backdrop is-visible';
      document.body.appendChild(confirmModal);
    } else {
      confirmModal.classList.add('is-visible');
    }

    // Format WhatsApp confirmation text
    const waText = encodeURIComponent(
      `Hello TOLEX RESTAURANT,\n\nI would like to request a table reservation.\n\n` +
      `*Reference:* ${data.refId}\n` +
      `*Name:* ${data.name}\n` +
      `*Phone:* ${data.phone}\n` +
      `*Email:* ${data.email}\n` +
      `*Date:* ${data.date} at ${data.time}\n` +
      `*Guests:* ${data.guests} person(s)\n` +
      `*Seating Area:* ${data.seating}\n` +
      `*Special Notes:* ${data.notes}\n\n` +
      `Please let me know if this slot is confirmed. Thank you!`
    );

    const waUrl = `https://wa.me/2348123456789?text=${waText}`;

    confirmModal.innerHTML = `
      <div class="tolex-modal-dialog reservation-summary-card">
        <div class="modal-corner-ornament top-left"></div>
        <div class="modal-corner-ornament top-right"></div>
        <button class="modal-close-btn" onclick="document.getElementById('reservationConfirmSummaryModal').classList.remove('is-visible'); document.body.classList.remove('modal-open');" aria-label="Close modal">&times;</button>
        
        <div class="modal-header-crest">
          <img src="assets/icons/favicon.svg" alt="TOLEX Crest" width="48" height="48">
          <span class="gold-badge">Reservation Request Received</span>
        </div>

        <h3 class="modal-title">Table Reservation Pending Confirmation</h3>
        <p class="modal-subtitle">
          Thank you, <strong>${data.name}</strong>. Your reservation request has been registered in our guest system.
        </p>

        <div class="res-summary-box">
          <div class="res-summary-row">
            <span class="label">Reference ID:</span>
            <span class="value gold-code">${data.refId}</span>
          </div>
          <div class="res-summary-row">
            <span class="label">Date & Time:</span>
            <span class="value">${data.date} | ${data.time}</span>
          </div>
          <div class="res-summary-row">
            <span class="label">Party Size:</span>
            <span class="value">${data.guests} Guest(s)</span>
          </div>
          <div class="res-summary-row">
            <span class="label">Seating:</span>
            <span class="value">${data.seating}</span>
          </div>
        </div>

        <div class="res-notice-box">
          <div class="notice-icon">⚠️</div>
          <div class="notice-text">
            <strong>Important Dining Notice:</strong> This is a booking enquiry. All table reservations are subject to availability and will be confirmed by restaurant management via phone or WhatsApp within 2 hours.
          </div>
        </div>

        <div class="modal-actions-row">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-gold btn-wa-direct">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.761.88 2.791.88 3.181 0 5.768-2.587 5.768-5.766.001-3.181-2.585-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.748 0-3.385-.45-4.819-1.239l-5.181 1.355 1.378-5.034c-.879-1.488-1.378-3.219-1.378-5.082 0-5.514 4.486-10 10-10s10 4.486 10 10z"/></svg>
            Send Fast Confirmation via WhatsApp
          </a>
          <button type="button" class="btn btn-outline" onclick="document.getElementById('reservationConfirmSummaryModal').classList.remove('is-visible'); document.body.classList.remove('modal-open');">
            Close Window
          </button>
        </div>

        <p class="backend-integration-note">
          <em>*Developer Note: In production, this form connects to your backend reservation API (e.g. Node.js/PHP/Python) or restaurant CRM for instant SMS and email calendar notifications.</em>
        </p>
      </div>
    `;

    document.body.classList.add('modal-open');
  }

  handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const subject = form.querySelector('[name="subject"]')?.value.trim();
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !email || !message) {
      window.tolexShowToast('Please complete all required fields.', 'warning');
      return;
    }

    // Success response
    window.tolexShowToast(`Thank you, ${name}! Your enquiry has been received. Our concierge will respond shortly.`, 'success');
    form.reset();
  }

  initCateringCalculator(form) {
    const guestsInput = form.querySelector('#caterGuests');
    const guestsDisplay = form.querySelector('#caterGuestsDisplay');
    const packageSelect = form.querySelector('#caterPackage');
    const estimatedCostDisplay = form.querySelector('#caterEstimatedTotal');

    const packageRates = {
      silver: 12000,   // ₦12,000 per guest
      gold: 18500,     // ₦18,500 per guest
      royal: 28000     // ₦28,000 per guest
    };

    const updateEstimate = () => {
      const guests = parseInt(guestsInput.value, 10) || 50;
      const pkg = packageSelect.value || 'gold';
      const rate = packageRates[pkg] || 18500;
      const total = guests * rate;

      if (guestsDisplay) guestsDisplay.textContent = guests;
      if (estimatedCostDisplay) {
        estimatedCostDisplay.textContent = `₦${total.toLocaleString()}`;
      }
    };

    if (guestsInput) guestsInput.addEventListener('input', updateEstimate);
    if (packageSelect) packageSelect.addEventListener('change', updateEstimate);
    updateEstimate();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const guests = guestsInput.value;
      const pkg = packageSelect.options[packageSelect.selectedIndex].text;
      const total = estimatedCostDisplay.textContent;

      const waMsg = encodeURIComponent(
        `Hello TOLEX RESTAURANT,\n\nI would like to enquire about Event & Catering Services.\n\n` +
        `*Package Tier:* ${pkg}\n` +
        `*Estimated Guests:* ${guests}\n` +
        `*Estimated Guide:* ${total}\n\n` +
        `Please share your customized catering menu and availability. Thank you!`
      );
      window.open(`https://wa.me/2348123456789?text=${waMsg}`, '_blank');
    });
  }
}

// Global Order Enquiry Cart Class
class TolexCartManager {
  constructor() {
    this.cart = [];
    this.drawer = document.getElementById('orderCartDrawer');
    this.backdrop = document.getElementById('cartDrawerBackdrop');
    this.cartCountBadge = document.getElementById('cartCountBadge');
    this.cartFloatingBtn = document.getElementById('floatingCartBtn');
    this.init();
  }

  init() {
    // Load from localStorage if available
    try {
      const saved = localStorage.getItem('tolex_cart');
      if (saved) this.cart = JSON.parse(saved);
    } catch (err) {
      this.cart = [];
    }

    this.updateUI();

    // Toggle drawer triggers
    document.querySelectorAll('[data-open-cart]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCart();
      });
    });

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.closeCart());
    }

    const closeBtn = document.getElementById('closeCartDrawerBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCart());
    }

    // Checkout / WhatsApp submit button
    const checkoutBtn = document.getElementById('cartWhatsAppCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.sendOrderViaWhatsApp());
    }
  }

  addItem(dishId, quantity = 1) {
    const dish = TOLEX_MENU_DATA.find(d => d.id === dishId);
    if (!dish) return;

    const existing = this.cart.find(item => item.id === dishId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        priceFormatted: dish.priceFormatted,
        image: dish.image,
        fallbackImage: dish.fallbackImage,
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateUI();
    window.tolexShowToast(`Added "${dish.name}" to your order enquiry.`, 'success');
  }

  removeItem(dishId) {
    this.cart = this.cart.filter(item => item.id !== dishId);
    this.saveCart();
    this.updateUI();
  }

  updateQuantity(dishId, delta) {
    const item = this.cart.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(dishId);
    } else {
      this.saveCart();
      this.updateUI();
    }
  }

  saveCart() {
    try {
      localStorage.setItem('tolex_cart', JSON.stringify(this.cart));
    } catch (e) {}
  }

  getTotalCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  openCart() {
    if (this.drawer) this.drawer.classList.add('is-open');
    if (this.backdrop) this.backdrop.classList.add('is-open');
    document.body.classList.add('cart-open');
  }

  closeCart() {
    if (this.drawer) this.drawer.classList.remove('is-open');
    if (this.backdrop) this.backdrop.classList.remove('is-open');
    document.body.classList.remove('cart-open');
  }

  updateUI() {
    const totalCount = this.getTotalCount();
    const totalPrice = this.getTotalPrice();

    // Badges
    document.querySelectorAll('.cart-counter-badge').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
    });

    // Floating cart button visibility
    if (this.cartFloatingBtn) {
      if (totalCount > 0) {
        this.cartFloatingBtn.classList.add('is-visible');
      } else {
        this.cartFloatingBtn.classList.remove('is-visible');
      }
    }

    // Drawer list
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSubtotal = document.getElementById('cartSubtotalAmount');
    const emptyState = document.getElementById('cartEmptyState');
    const checkoutContainer = document.getElementById('cartCheckoutContainer');

    if (cartSubtotal) {
      cartSubtotal.textContent = `₦${totalPrice.toLocaleString()}`;
    }

    if (cartItemsList) {
      if (this.cart.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (checkoutContainer) checkoutContainer.style.display = 'none';
        cartItemsList.innerHTML = '';
      } else {
        if (emptyState) emptyState.style.display = 'none';
        if (checkoutContainer) checkoutContainer.style.display = 'block';

        cartItemsList.innerHTML = this.cart.map(item => `
          <div class="cart-dish-item" data-id="${item.id}">
            <img class="cart-dish-thumb" src="${item.image}" alt="${item.name}" onerror="this.src='${item.fallbackImage}'">
            <div class="cart-dish-info">
              <h4 class="cart-dish-name">${item.name}</h4>
              <span class="cart-dish-price">${item.priceFormatted}</span>
              <div class="cart-qty-controls">
                <button type="button" class="qty-btn" onclick="window.tolexCart.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
                <span class="qty-num">${item.quantity}</span>
                <button type="button" class="qty-btn" onclick="window.tolexCart.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button type="button" class="cart-item-remove-btn" onclick="window.tolexCart.removeItem('${item.id}')" aria-label="Remove item">
              &times;
            </button>
          </div>
        `).join('');
      }
    }
  }

  sendOrderViaWhatsApp() {
    if (this.cart.length === 0) {
      window.tolexShowToast('Your order enquiry cart is empty.', 'warning');
      return;
    }

    const customerName = document.getElementById('cartCustomerName')?.value.trim() || 'Valued Patron';
    const orderType = document.getElementById('cartOrderType')?.value || 'Dine-in / Table Service';
    const instructions = document.getElementById('cartSpecialInstructions')?.value.trim() || 'None';

    const orderRef = 'TLX-ORD-' + Math.floor(100000 + Math.random() * 900000);

    let message = `*TOLEX RESTAURANT - FOOD ORDER ENQUIRY*\n`;
    message += `*Reference:* ${orderRef}\n`;
    message += `*Customer:* ${customerName}\n`;
    message += `*Service Type:* ${orderType}\n\n`;
    message += `*Selected Dishes:*\n`;

    this.cart.forEach((item, index) => {
      const itemSubtotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name} x${item.quantity} (₦${itemSubtotal.toLocaleString()})\n`;
    });

    message += `\n*Estimated Total:* ₦${this.getTotalPrice().toLocaleString()}\n`;
    message += `*Special Instructions:* ${instructions}\n\n`;
    message += `Please confirm dish availability, preparation time, and delivery/table details. Thank you!`;

    const waUrl = `https://wa.me/2348123456789?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    window.tolexShowToast(`Enquiry order created (${orderRef}). Connecting to WhatsApp...`, 'success');
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.tolexReservations = new TolexReservationManager();
  window.tolexCart = new TolexCartManager();
});
