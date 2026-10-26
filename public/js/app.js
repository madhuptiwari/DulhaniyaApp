/**
 * Dulhaniya - Master Application Controller
 * Handles routing, view modes, catalog display, modals, checkout workflow, and toasts.
 */

const App = {
  currentCategory: "all",
  searchQuery: "",
  activeFilter: "all", // 'all', 'bestseller', 'bridal', 'under60'
  viewMode: "customer", // 'customer', 'partner', 'admin'
  servicesCache: [],
  selectedDate: "Tomorrow",
  selectedSlot: "10:00 AM - 11:30 AM",
  selectedCity: "New Delhi",

  // Authentication & Portal State
  currentUser: null,
  authToken: null,
  adminToken: null,
  activeAuthTab: "customer", // 'customer', 'partner', 'admin'
  activeAuthMode: "signin",  // 'signin', 'register'
  userBookingsCache: [],
  userAddressesCache: [],
  userBookingsFilter: "all", // 'all', 'active', 'completed'

  async init() {
    window.App = this;
    Cart.init();
    Tracker.init();

    this.checkAuthStatus();
    await this.loadCategories();
    await this.loadServices();
    this.setupEventListeners();

    // Check URL parameters for view routing
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    if (viewParam === "partner") {
      this.setViewMode("partner");
    } else if (viewParam === "login") {
      this.openLoginModal(params.get("role") || "customer");
    }
  },

  setupEventListeners() {
    // Search listener
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.loadServices();
        }, 300);
      });
    }

    // City Selector
    const citySelector = document.getElementById("city-selector");
    if (citySelector) {
      citySelector.addEventListener("change", (e) => {
        this.selectedCity = e.target.value;
        this.showToast(`Location set to ${this.selectedCity} 📍`);
      });
    }

    // Close user profile dropdown on outside click
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("user-dropdown-menu");
      const wrapper = document.getElementById("nav-user-menu");
      if (menu && wrapper && !wrapper.contains(e.target)) {
        menu.style.display = "none";
      }
    });

    // Listen for user changes from DulhaniyaAPI or other tabs
    window.addEventListener("dulhaniya_user_changed", (e) => {
      this.currentUser = e.detail;
      this.renderNavAuthState();
    });
  },

  setViewMode(mode) {
    this.viewMode = mode;

    const btnCustomer = document.getElementById("btn-mode-customer");
    const btnPartner = document.getElementById("btn-mode-partner");
    const btnAdmin = document.getElementById("btn-mode-admin");

    if (btnCustomer) btnCustomer.classList.toggle("active", mode === "customer");
    if (btnPartner) btnPartner.classList.toggle("active", mode === "partner");
    if (btnAdmin) btnAdmin.classList.toggle("active", mode === "admin");

    const customerView = document.getElementById("customer-view-container");
    const partnerView = document.getElementById("partner-view-container");
    const adminView = document.getElementById("admin-view-container");

    if (customerView) customerView.style.display = mode === "customer" ? "block" : "none";
    if (partnerView) {
      partnerView.style.display = mode === "partner" ? "block" : "none";
      if (mode === "partner") Partner.init();
    }
    if (adminView) {
      adminView.style.display = mode === "admin" ? "block" : "none";
      if (mode === "admin") Admin.init();
    }

    // Sync mobile bottom navigation
    document.querySelectorAll(".bottom-nav-item").forEach(item => item.classList.remove("active"));
    if (mode === "customer") {
      const mobHome = document.getElementById("mob-nav-home");
      if (mobHome) mobHome.classList.add("active");
    } else if (mode === "partner") {
      const mobPartner = document.getElementById("mob-nav-partner");
      if (mobPartner) mobPartner.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  async loadCategories() {
    const categories = await DulhaniyaAPI.getCategories();
    const container = document.getElementById("categories-container");
    if (!container) return;

    container.innerHTML = `
      <button class="category-pill ${this.currentCategory === 'all' ? 'active' : ''}" onclick="App.selectCategory('all')">
        <span class="category-pill-icon">✨</span>
        <span>All Services</span>
      </button>
      ${categories.map(c => `
        <button class="category-pill ${this.currentCategory === c.slug ? 'active' : ''}" onclick="App.selectCategory('${c.slug}')">
          <span class="category-pill-icon">${this.getCategoryEmoji(c.slug)}</span>
          <span>${c.name}</span>
          ${c.badge ? `<span style="font-size:0.7rem; background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:10px;">${c.badge}</span>` : ''}
        </button>
      `).join("")}
    `;
  },

  getCategoryEmoji(slug) {
    const map = {
      "bridal-wedding": "👑",
      "facials-cleanups": "✨",
      "waxing": "🪶",
      "mani-pedi": "💅",
      "hair-care": "💇‍♀️",
      "bleach-detan": "☀️",
      "body-spa": "💆‍♀️",
      "groom-men": "🧔"
    };
    return map[slug] || "🌸";
  },

  selectCategory(slug) {
    this.currentCategory = slug;
    this.loadCategories();
    this.loadServices();

    // Scroll to services
    const sEl = document.getElementById("services-section-wrapper");
    if (sEl) sEl.scrollIntoView({ behavior: "smooth" });
  },

  setFilter(filterName) {
    this.activeFilter = filterName;

    // Update filter tags
    document.querySelectorAll(".filter-tag").forEach(tag => {
      tag.classList.toggle("active", tag.dataset.filter === filterName);
    });

    this.renderServicesGrid();
  },

  async loadServices() {
    const services = await DulhaniyaAPI.getServices(this.currentCategory, this.searchQuery);
    this.servicesCache = services;
    this.renderServicesGrid();
  },

  renderServicesGrid() {
    const grid = document.getElementById("services-grid");
    if (!grid) return;

    let filtered = this.servicesCache;

    if (this.activeFilter === "bestseller") {
      filtered = filtered.filter(s => s.is_bestseller);
    } else if (this.activeFilter === "bridal") {
      filtered = filtered.filter(s => s.is_bridal_exclusive);
    } else if (this.activeFilter === "under60") {
      filtered = filtered.filter(s => s.duration_mins <= 60);
    } else if (this.activeFilter === "under1500") {
      filtered = filtered.filter(s => (s.discounted_price || s.price) <= 1500);
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 60px 20px; background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200);">
          <div style="font-size:3.5rem; margin-bottom:12px;">🔍</div>
          <h3 style="color:var(--slate-800); margin-bottom:6px;">No services found matching your criteria</h3>
          <p style="color:var(--slate-500); font-size:0.9rem;">Try selecting a different category or clearing your search keywords.</p>
          <button class="btn-primary" style="margin-top:16px;" onclick="App.selectCategory('all')">View All Services</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(service => {
      const inCart = Cart.hasItem(service.id);
      const isByo = Cart.kitType === "byo_product";
      const currentPrice = isByo
        ? Math.max(199, (service.discounted_price || service.price) - (service.byo_product_discount || 150))
        : (service.discounted_price || service.price);

      const stepsPreview = (service.included_steps || []).slice(0, 3);

      return `
        <div class="service-card" id="service-card-${service.id}">
          <div class="service-image-wrapper">
            <img class="service-image" src="${service.image_url}" alt="${service.title}" loading="lazy" decoding="async" width="360" height="200" />
            <div class="service-badges">
              ${service.is_bridal_exclusive ? `<span class="badge badge-bridal">👑 Bridal Exclusive</span>` : ''}
              ${service.is_bestseller ? `<span class="badge badge-bestseller">⭐ Bestseller</span>` : ''}
            </div>
            <div class="duration-pill">
              <span>⏱️ ${service.duration_mins} mins</span>
            </div>
          </div>

          <div class="service-body">
            <div class="rating-line">
              <div class="star-box">★ ${service.rating || 4.9}</div>
              <span>(${service.review_count || 150}+ verified brides)</span>
            </div>

            <h3 class="service-title">${service.title}</h3>
            <p class="service-subtitle">${service.subtitle || ''}</p>

            ${stepsPreview.length > 0 ? `
              <div class="service-steps-preview">
                ${stepsPreview.map(step => `
                  <div class="step-preview-item">
                    <span class="step-dot"></span>
                    <span>${step}</span>
                  </div>
                `).join("")}
              </div>
            ` : ''}

            <div class="price-choice-box">
              <div class="price-row">
                <span class="current-price">₹${currentPrice.toLocaleString('en-IN')}</span>
                ${service.price > currentPrice ? `<span class="original-price">₹${service.price.toLocaleString('en-IN')}</span>` : ''}
                <span class="save-pill">
                  ${isByo ? `Save ₹${service.byo_product_discount || 150} (BYOP)` : `Save ₹${service.price - (service.discounted_price || service.price)}`}
                </span>
              </div>
              <div class="byo-option-note">
                <span>🛡️ ${isByo ? 'Using your products • Expert labor' : 'Sealed branded monodose kit included'}</span>
              </div>
            </div>

            <div class="service-action-row">
              <button class="btn-details" onclick="App.openServiceDetail(${service.id})">
                Inspect Steps
              </button>
              <button class="btn-add-cart ${inCart ? 'in-cart' : ''}" onclick="App.toggleCart(${service.id})">
                ${inCart ? '✓ Added' : '+ Add Service'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  updateServiceButtons() {
    this.renderServicesGrid();
  },

  toggleCart(serviceId) {
    const service = this.servicesCache.find(s => s.id === serviceId);
    if (!service) return;

    if (Cart.hasItem(serviceId)) {
      Cart.removeItem(serviceId);
    } else {
      Cart.addItem(service);
    }
  },

  // Modal: Service Details Procedure Inspection
  async openServiceDetail(serviceId) {
    const service = await DulhaniyaAPI.getServiceById(serviceId);
    if (!service) return;

    const modal = document.getElementById("service-detail-modal");
    const titleEl = document.getElementById("detail-modal-title");
    const bodyEl = document.getElementById("detail-modal-body");

    if (titleEl) titleEl.textContent = service.title;
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="margin-bottom: 20px;">
          <img src="${service.image_url}" alt="${service.title}" loading="lazy" decoding="async" width="600" height="240" style="width:100%; height:240px; object-fit:cover; border-radius:var(--radius-lg); margin-bottom:14px;" />
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div>
              <span class="star-box" style="display:inline-flex;">★ ${service.rating || 4.9}</span>
              <span style="font-size:0.85rem; color:var(--slate-500); margin-left:6px;">${service.review_count || 120} Reviews</span>
            </div>
            <div style="font-weight:700; color:var(--slate-700);">⏱️ Duration: ${service.duration_mins} Minutes</div>
          </div>
          <p style="color:var(--slate-700); font-size:0.95rem; line-height:1.6;">${service.description}</p>
        </div>

        <div style="background:var(--slate-50); border:1px solid var(--slate-200); border-radius:var(--radius-md); padding:16px; margin-bottom:20px;">
          <h4 style="margin-bottom:12px; color:var(--primary-dark);">📋 Step-by-Step Procedure Routine</h4>
          <ol style="padding-left:20px; font-size:0.9rem; color:var(--slate-700); display:flex; flex-direction:column; gap:8px;">
            ${(service.included_steps || []).map(step => `<li>${step}</li>`).join("")}
          </ol>
        </div>

        <div style="background:var(--gold-subtle); border:1px solid var(--gold-border); border-radius:var(--radius-md); padding:16px; margin-bottom:20px;">
          <h4 style="margin-bottom:8px; color:var(--gold);">🏷️ Cosmetics & Products Formulation</h4>
          <p style="font-size:0.85rem; color:var(--slate-700); margin-bottom:10px;">
            We guarantee 100% genuine, unadulterated salon cosmetics opened fresh in front of your eyes:
          </p>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${(service.products_used || []).map(p => `
              <span style="background:var(--white); border:1px solid var(--gold-border); padding:4px 10px; border-radius:var(--radius-full); font-size:0.8rem; font-weight:600; color:var(--slate-800);">
                ✓ ${p}
              </span>
            `).join("")}
          </div>
        </div>

        <div style="background:var(--emerald-subtle); border:1px solid var(--emerald); border-radius:var(--radius-md); padding:14px; margin-bottom:20px;">
          <h5 style="color:var(--emerald); font-weight:700; margin-bottom:4px;">🛡️ Safe at Home Assurance</h5>
          <p style="font-size:0.82rem; color:var(--slate-700);">
            Female background-verified beautician, autoclaved stainless tools, single-use bedsheets, disposable cape, and 4-digit start OTP security.
          </p>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--slate-200); padding-top:16px;">
          <div>
            <div style="font-size:1.4rem; font-weight:800; color:var(--primary-dark);">₹${(service.discounted_price || service.price).toLocaleString('en-IN')}</div>
            <div style="font-size:0.75rem; color:var(--gold); font-weight:600;">Or ₹${Math.max(199, (service.discounted_price || service.price) - (service.byo_product_discount || 150))} with Bring-Your-Own-Product</div>
          </div>
          <button class="btn-primary" onclick="Cart.addItem(App.servicesCache.find(s => s.id === ${service.id})); App.closeModal('service-detail-modal');">
            + Add To Bridal Cart
          </button>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  },

  openCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("drawer-overlay");
    if (drawer) drawer.classList.add("active");
    if (overlay) overlay.classList.add("active");
    Cart.renderCartUI();
  },

  closeCartDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("drawer-overlay");
    if (drawer) drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
  },

  // Checkout Workflow
  async proceedToCheckout() {
    if (Cart.items.length === 0) {
      this.showToast("Your cart is empty!");
      return;
    }
    this.closeCartDrawer();
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.classList.add("active");
      this.renderCheckoutSummary();
      await this.initCheckoutUserData();
    }
  },

  async initCheckoutUserData() {
    const user = this.currentUser;
    const guestPrompt = document.getElementById("checkout-guest-auth-prompt");
    const addrContainer = document.getElementById("checkout-saved-address-container");
    const addrSelect = document.getElementById("checkout-saved-address-select");

    if (user) {
      if (guestPrompt) guestPrompt.style.display = "none";
      const nameEl = document.getElementById("checkout-name");
      const phoneEl = document.getElementById("checkout-phone");
      const emailEl = document.getElementById("checkout-email");

      if (nameEl && user.name) nameEl.value = user.name;
      if (phoneEl && user.phone) phoneEl.value = user.phone;
      if (emailEl && user.email) emailEl.value = user.email;

      try {
        const addrs = await DulhaniyaAPI.getUserAddresses();
        this.userAddressesCache = addrs;
        if (addrs && addrs.length > 0 && addrSelect) {
          addrSelect.innerHTML = `<option value="">📍 Choose from saved (${addrs.length})...</option>` +
            addrs.map(a => `<option value="${a.id}" ${a.is_default ? 'selected' : ''}>${a.label} (${a.city})</option>`).join('');
          if (addrContainer) addrContainer.style.display = "block";

          const def = addrs.find(a => a.is_default) || addrs[0];
          if (def) this.populateCheckoutAddress(def);
        } else {
          if (addrContainer) addrContainer.style.display = "none";
        }
      } catch (e) {
        if (addrContainer) addrContainer.style.display = "none";
      }
    } else {
      if (guestPrompt) guestPrompt.style.display = "flex";
      if (addrContainer) addrContainer.style.display = "none";
    }
  },

  populateCheckoutAddress(addr) {
    const addrEl = document.getElementById("checkout-address");
    const landmarkEl = document.getElementById("checkout-landmark");
    const pincodeEl = document.getElementById("checkout-pincode");
    if (addrEl && addr.address) addrEl.value = addr.address;
    if (landmarkEl && addr.landmark) landmarkEl.value = addr.landmark;
    if (pincodeEl && addr.pincode) pincodeEl.value = addr.pincode;
    if (addr.city) {
      this.selectedCity = addr.city;
      const citySelector = document.getElementById("city-selector");
      if (citySelector) citySelector.value = addr.city;
    }
  },

  onSavedAddressChosen(addrId) {
    if (!addrId) return;
    const addr = (this.userAddressesCache || []).find(a => a.id === addrId);
    if (addr) {
      this.populateCheckoutAddress(addr);
      this.showToast(`Selected: ${addr.label} 📍`);
    }
  },

  selectDate(dateLabel) {
    const customPicker = document.getElementById("custom-date-picker");
    if (dateLabel === "Pick Date") {
      if (customPicker) {
        customPicker.style.display = "block";
        customPicker.focus();
        if (!customPicker.value) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 2);
          customPicker.value = tomorrow.toISOString().split("T")[0];
        }
        this.selectedDate = customPicker.value;
      }
    } else {
      if (customPicker) customPicker.style.display = "none";
      this.selectedDate = dateLabel;
    }
    document.querySelectorAll(".date-pill-btn").forEach(btn => {
      btn.classList.toggle("selected", btn.dataset.date === dateLabel);
    });
  },

  onCustomDatePicked(val) {
    if (val) {
      this.selectedDate = val;
    }
  },

  selectSlot(slotText) {
    this.selectedSlot = slotText;
    document.querySelectorAll(".slot-pill-btn").forEach(btn => {
      btn.classList.toggle("selected", btn.dataset.slot === slotText);
    });
  },

  renderCheckoutSummary() {
    const calc = Cart.getCalculations();
    const sumEl = document.getElementById("checkout-calc-summary");
    if (sumEl) {
      sumEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Services (${calc.itemCount} items • ${calc.totalDuration} mins):</span>
          <span>₹${calc.subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${calc.couponDiscount > 0 ? `
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:var(--emerald);">
            <span>Coupon Discount:</span>
            <span>-₹${calc.couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Hygiene & Sanitized Disposable Kit:</span>
          <span>${calc.hygieneFee === 0 ? 'FREE' : '₹' + calc.hygieneFee}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.15rem; color:var(--slate-900); border-top:1px solid var(--slate-200); padding-top:8px; margin-top:8px;">
          <span>Grand Total Payable:</span>
          <span>₹${calc.finalPayable.toLocaleString('en-IN')}</span>
        </div>
      `;
    }
  },

  async submitBooking(event) {
    event.preventDefault();
    const form = event.target;
    const calc = Cart.getCalculations();

    const bookingData = {
      customer_name: form.customer_name.value.trim(),
      customer_phone: form.customer_phone.value.trim(),
      customer_email: form.customer_email.value.trim(),
      address: form.address.value.trim(),
      city: this.selectedCity,
      pincode: form.pincode.value.trim(),
      service_date: this.selectedDate,
      service_slot: this.selectedSlot,
      kit_type: Cart.kitType,
      coupon_code: Cart.appliedCoupon?.code || "",
      payment_mode: form.payment_mode.value,
      special_notes: form.special_notes.value.trim(),
      total_amount: calc.finalPayable,
      discount_amount: calc.couponDiscount,
      items: Cart.items
    };

    const submitBtn = document.getElementById("btn-confirm-booking");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Confirming Appointment...";
    }

    const result = await DulhaniyaAPI.createBooking(bookingData);

    if (result.success) {
      this.closeModal("checkout-modal");
      Cart.clear();
      this.showToast("🎉 Booking Confirmed! Beautician Assigned.");
      Tracker.loadBooking(result.booking_ref);
      Tracker.openTracker();
    } else {
      this.showToast(result.error || "Unable to confirm booking. Please try again.");
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Dulhaniya Booking";
    }
  },

  showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 200;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.95);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 0.9rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      animation: toast-in 0.3s ease-out;
      pointer-events: auto;
      text-align: center;
      max-width: 90vw;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  updateSplitSlider(val) {
    const beforeLayer = document.getElementById("split-before-layer");
    const dividerLine = document.getElementById("split-divider-line");
    if (beforeLayer) {
      beforeLayer.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
    }
    if (dividerLine) {
      dividerLine.style.left = `${val}%`;
    }
  },

  toggleTrousseau(cardEl) {
    cardEl.classList.toggle("selected");
    const checkbox = cardEl.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.checked = cardEl.classList.contains("selected");
    }
    this.calculateTrousseau();
  },

  calculateTrousseau() {
    const selectedCards = document.querySelectorAll('.trousseau-card.selected');
    let originalTotal = 0;
    selectedCards.forEach(card => {
      originalTotal += Number(card.getAttribute('data-price') || 0);
    });

    const discountRate = selectedCards.length >= 2 ? 0.20 : 0.05;
    const finalPrice = Math.round(originalTotal * (1 - discountRate));
    const savings = originalTotal - finalPrice;

    const totalEl = document.getElementById('trousseau-total-price');
    const origEl = document.getElementById('trousseau-original-price');
    const badgeEl = document.getElementById('trousseau-savings-badge');

    if (totalEl) totalEl.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
    if (origEl) origEl.textContent = `₹${originalTotal.toLocaleString('en-IN')}`;
    if (badgeEl) {
      badgeEl.textContent = selectedCards.length >= 2
        ? `20% Bundle Savings (Save ₹${savings.toLocaleString('en-IN')})`
        : `Save ₹${savings.toLocaleString('en-IN')}`;
    }
  },

  async addTrousseauToCart() {
    const selectedCards = document.querySelectorAll('.trousseau-card.selected');
    if (selectedCards.length === 0) {
      this.showToast("Please select at least one ceremony ritual.");
      return;
    }

    const services = await DulhaniyaAPI.getServices("bridal-wedding");
    selectedCards.forEach(card => {
      const ceremony = card.getAttribute('data-ceremony');
      let serviceToAdd;
      if (ceremony === 'haldi') serviceToAdd = services.find(s => s.id === 2);
      else if (ceremony === 'mehendi') serviceToAdd = services.find(s => s.id === 3);
      else if (ceremony === 'wedding') serviceToAdd = services.find(s => s.id === 1);
      else if (ceremony === 'prebridal') serviceToAdd = services.find(s => s.id === 4);

      if (serviceToAdd) {
        Cart.addItem(serviceToAdd, Cart.kitType);
      }
    });

    Cart.applyCoupon("BRIDALQUEEN");
    this.openCartDrawer();
    this.showToast(`✨ Added ${selectedCards.length} rituals to cart with VIP privilege savings!`);
  },

  // ================= BRIDAL ADVISOR ENGINE =================
  advisorState: {
    complexion: 'wheatish',
    ceremony: 'wedding',
    finish: 'dewy',
    recommendedServices: []
  },

  openAdvisorModal() {
    const modal = document.getElementById('consultation-advisor-modal');
    if (modal) {
      modal.classList.add('active');
      this.goToAdvisorStep(1);
    }
  },

  closeAdvisorModal() {
    const modal = document.getElementById('consultation-advisor-modal');
    if (modal) modal.classList.remove('active');
  },

  goToAdvisorStep(stepNum) {
    for (let i = 1; i <= 4; i++) {
      const view = document.getElementById(`adv-step-view-${i}`);
      const pill = document.getElementById(`adv-step-pill-${i}`);
      if (view) view.style.display = (i === stepNum) ? 'block' : 'none';
      if (pill) {
        pill.classList.remove('active', 'completed');
        if (i === stepNum) pill.classList.add('active');
        else if (i < stepNum) pill.classList.add('completed');
      }
    }
  },

  selectAdvisorCard(cardEl) {
    const step = cardEl.getAttribute('data-step');
    const value = cardEl.getAttribute('data-value');
    const container = cardEl.parentElement;

    container.querySelectorAll('.advisor-card').forEach(c => c.classList.remove('selected'));
    cardEl.classList.add('selected');

    if (step === '1') this.advisorState.complexion = value;
    else if (step === '2') this.advisorState.ceremony = value;
    else if (step === '3') this.advisorState.finish = value;
  },

  async generateAdvisorResult() {
    this.goToAdvisorStep(4);
    const container = document.getElementById('advisor-result-container');
    if (!container) return;

    const complexionData = {
      wheatish: {
        title: "Wheatish / Warm Golden Indian Undertone",
        desc: "Ideal matches for radiant gold lehengas and classic red bridal silk sarees.",
        matches: ["MAC Studio Fix (NC30-NC38)", "Charlotte Tilbury Flawless Filter (Shade 4.5)", "Estée Lauder Double Wear (3W1 Tawny)", "Huda Beauty Rose Quartz Palette"]
      },
      fair: {
        title: "Fair / Rosy Porcelain Complexion",
        desc: "Formulated for pastel, ivory, blush pink, and lavender wedding couture.",
        matches: ["MAC Studio Fix (NC15-NC25)", "Charlotte Tilbury Light Wonder (Shade 2)", "NARS Radiant Creamy Concealer (Custard)", "Dior Backstage Rosy Glow"]
      },
      dusky: {
        title: "Dusky / Rich Olive Undertone",
        desc: "Enhances natural honey warmth, perfect for emerald green, mustard, and deep maroons.",
        matches: ["MAC Studio Fix (NC40-NC44)", "Fenty Beauty Pro Filt'r (Shade 330)", "Huda Beauty Faux Filter (Butterscotch)", "Anastasia Beverly Hills Soft Glam"]
      },
      deep: {
        title: "Deep / Royal Bronze Complexion",
        desc: "Rich dimensional contouring tailored for royal jewel tones and sunset metallics.",
        matches: ["MAC Studio Fix (NC45-NC50)", "Fenty Beauty Pro Filt'r (Shade 385)", "Estée Lauder Double Wear (5W1 Bronze)", "Pat McGrath Mothership Palette"]
      }
    }[this.advisorState.complexion] || {};

    const allServices = await DulhaniyaAPI.getServices("all");

    // Match primary & prep services
    let primaryId = 1, prepId = 6;
    if (this.advisorState.ceremony === 'haldi') { primaryId = 2; prepId = 18; }
    else if (this.advisorState.ceremony === 'sangeet') { primaryId = 3; prepId = 16; }
    else if (this.advisorState.ceremony === 'prebridal') { primaryId = 4; prepId = 13; }

    const primaryService = allServices.find(s => s.id === primaryId) || allServices[0];
    const prepService = allServices.find(s => s.id === prepId) || allServices[5];
    this.advisorState.recommendedServices = [primaryService, prepService];

    const originalSum = primaryService.discounted_price + prepService.discounted_price;
    const bundleDiscount = Math.round(originalSum * 0.15);
    const finalAmount = originalSum - bundleDiscount;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid #fbcfe8; padding-bottom:14px; flex-wrap:wrap; gap:10px;">
        <div>
          <span class="badge badge-gold" style="font-size:0.75rem;">AI CURATED PROFILE</span>
          <h4 style="margin:6px 0 2px; color:var(--primary-dark); font-size:1.25rem;">${complexionData.title}</h4>
          <p style="font-size:0.82rem; color:var(--slate-600); margin:0;">${complexionData.desc}</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; text-transform:uppercase; color:var(--slate-500); font-weight:700;">Finish Technique:</span>
          <div style="font-weight:800; color:var(--primary); font-size:0.95rem;">${this.advisorState.finish.toUpperCase()} GLOW</div>
        </div>
      </div>

      <div style="margin-bottom:18px;">
        <strong style="font-size:0.82rem; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Tailored Cosmetics Palette Match:</strong>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
          ${(complexionData.matches || []).map(m => `
            <span style="background:var(--white); border:1px solid #cbd5e1; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:600; color:#334155;">💄 ${m}</span>
          `).join('')}
        </div>
      </div>

      <div style="margin-bottom:18px;">
        <strong style="font-size:0.82rem; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Curated 2-Step Ceremony Routine:</strong>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
          <div style="background:var(--white); border:1px solid var(--primary-border); border-radius:var(--radius-md); padding:14px;">
            <span style="font-size:0.7rem; font-weight:800; color:var(--primary);">STEP 1: PRE-CEREMONY PREP</span>
            <h5 style="margin:4px 0 2px; font-size:0.92rem;">${prepService.title}</h5>
            <p style="font-size:0.75rem; color:var(--slate-600); margin:0;">${prepService.duration_mins} mins • ${prepService.subtitle || ''}</p>
            <div style="font-weight:800; color:var(--slate-900); margin-top:6px;">₹${prepService.discounted_price.toLocaleString('en-IN')}</div>
          </div>

          <div style="background:var(--white); border:1.5px solid var(--primary); border-radius:var(--radius-md); padding:14px; box-shadow:0 2px 8px rgba(157,23,77,0.1);">
            <span style="font-size:0.7rem; font-weight:800; color:var(--emerald);">STEP 2: SIGNATURE MAKEOVER</span>
            <h5 style="margin:4px 0 2px; font-size:0.92rem;">${primaryService.title}</h5>
            <p style="font-size:0.75rem; color:var(--slate-600); margin:0;">${primaryService.duration_mins} mins • Sealed International Kit</p>
            <div style="font-weight:800; color:var(--primary-dark); margin-top:6px;">₹${primaryService.discounted_price.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      <div style="background:var(--white); border:1px dashed var(--slate-300); border-radius:var(--radius-sm); padding:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:0.78rem; color:var(--slate-500);">Combined Value: <del>₹${originalSum.toLocaleString('en-IN')}</del></div>
          <div style="font-size:1.4rem; font-weight:900; color:var(--primary-dark);">Bundle Price: ₹${finalAmount.toLocaleString('en-IN')}</div>
        </div>
        <span style="background:var(--emerald-subtle); color:var(--emerald); font-weight:700; font-size:0.8rem; padding:4px 10px; border-radius:12px;">
          Save ₹${bundleDiscount.toLocaleString('en-IN')} (15% Privilege Off)
        </span>
      </div>
    `;
  },

  addAdvisorRoutineToCart() {
    if (!this.advisorState.recommendedServices || this.advisorState.recommendedServices.length === 0) {
      return;
    }

    this.advisorState.recommendedServices.forEach(srv => {
      Cart.addItem(srv, Cart.kitType);
    });

    Cart.applyCoupon("BRIDALQUEEN");
    this.closeAdvisorModal();
    this.openCartDrawer();
    this.showToast("✨ Curated routine added to your cart with VIP privilege savings!");
  },

  // ================= AUTHENTICATION & CUSTOMER PORTAL =================
  checkAuthStatus() {
    this.currentUser = DulhaniyaAPI.getCurrentUser();
    this.authToken = DulhaniyaAPI.getAuthToken();
    this.adminToken = DulhaniyaAPI.getAdminToken();
    this.renderNavAuthState();
  },

  renderNavAuthState() {
    const container = document.getElementById("nav-auth-container");
    if (!container) return;

    if (!this.currentUser) {
      container.innerHTML = `
        <button class="btn-primary btn-nav-signin" id="btn-nav-signin" onclick="App.openLoginModal()">
          <span class="icon">👤</span> Sign In / Join
        </button>
      `;
      return;
    }

    const u = this.currentUser;
    const initial = (u.name || "U").trim().charAt(0).toUpperCase();
    const roleBadge = u.role_badge || (u.role === "partner" ? "Partner Pro" : "Gold Bride");

    container.innerHTML = `
      <div class="user-profile-menu-wrapper" id="nav-user-menu">
        <button class="nav-avatar-pill" onclick="App.toggleUserDropdown(event)" aria-haspopup="true" aria-expanded="false" title="Account Menu">
          <span class="avatar-circle">${initial}</span>
          <div class="user-pill-info">
            <span class="user-pill-name">${u.name.split(" ")[0]}</span>
            <span class="user-pill-badge">${roleBadge}</span>
          </div>
          <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div class="user-dropdown-menu" id="user-dropdown-menu" style="display:none;">
          <div class="user-dropdown-header">
            <div style="font-weight:800; color:var(--slate-900); font-size:0.95rem;">${u.name}</div>
            <div style="font-size:0.75rem; color:var(--slate-500);">${u.email || u.phone || ''}</div>
            <span class="badge badge-bridal" style="font-size:0.7rem; margin-top:4px;">${roleBadge}</span>
          </div>
          <div class="user-dropdown-items">
            <button class="user-dropdown-item" onclick="App.openMyBookings()">
              <span>📋</span>
              <span style="flex:1; text-align:left;">My Bookings</span>
              <span class="user-booking-count-badge" id="dropdown-active-booking-count">Active</span>
            </button>
            <button class="user-dropdown-item" onclick="App.openSavedAddresses()">
              <span>📍</span>
              <span style="flex:1; text-align:left;">Saved Addresses</span>
            </button>
            ${u.role === 'partner' ? `
              <button class="user-dropdown-item" onclick="App.setViewMode('partner'); App.closeUserDropdown();">
                <span>👩‍💼</span>
                <span style="flex:1; text-align:left;">Partner Duty Dashboard</span>
              </button>
            ` : `
              <button class="user-dropdown-item" onclick="App.setViewMode('partner'); App.closeUserDropdown();">
                <span>👩‍💼</span>
                <span style="flex:1; text-align:left;">Switch to Partner View</span>
              </button>
            `}
            ${DulhaniyaAPI.getAdminToken() ? `
              <a href="admin.html" class="user-dropdown-item" style="text-decoration:none; color:inherit;">
                <span>🛡️</span>
                <span style="flex:1; text-align:left;">Admin Control Room</span>
              </a>
            ` : ''}
            <div class="dropdown-divider"></div>
            <button class="user-dropdown-item item-danger" onclick="App.logout()">
              <span>🚪</span>
              <span style="flex:1; text-align:left;">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleUserDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById("user-dropdown-menu");
    if (!menu) return;
    const isVisible = menu.style.display === "block";
    menu.style.display = isVisible ? "none" : "block";
  },

  closeUserDropdown() {
    const menu = document.getElementById("user-dropdown-menu");
    if (menu) menu.style.display = "none";
  },

  logout() {
    DulhaniyaAPI.clearAuthToken();
    this.currentUser = null;
    this.authToken = null;
    this.closeUserDropdown();
    this.renderNavAuthState();
    this.showToast("Signed out. Browse as guest or sign in anytime.");
  },

  // ================= UNIVERSAL AUTH MODAL =================
  openLoginModal(tab = "customer", mode = "signin") {
    this.closeAllModals();
    const modal = document.getElementById("auth-modal");
    if (modal) {
      modal.classList.add("active");
      this.switchAuthTab(tab);
      this.toggleAuthMode(mode);
    }
  },

  closeLoginModal() {
    this.closeModal("auth-modal");
  },

  switchAuthTab(tab) {
    this.activeAuthTab = tab;
    ['customer', 'partner', 'admin'].forEach(t => {
      const btn = document.getElementById(`modal-tab-${t}`);
      if (btn) btn.classList.toggle("active", t === tab);
    });

    const modeBar = document.getElementById("modal-mode-toggle-bar");
    const subTitle = document.getElementById("auth-modal-subtitle");
    if (tab === "admin") {
      if (modeBar) modeBar.style.display = "none";
      if (subTitle) subTitle.textContent = "Operations Command Suite - Master Security Access";
      this.activeAuthMode = "signin";
    } else if (tab === "partner") {
      if (modeBar) modeBar.style.display = "flex";
      if (subTitle) subTitle.textContent = "Specialist Partner Portal - Duty Check-in & Dispatches";
    } else {
      if (modeBar) modeBar.style.display = "flex";
      if (subTitle) subTitle.textContent = "Sign in or join to book luxury bridal rituals & salon at home";
    }
    this.updateModalForms();
    this.clearModalFeedback();
  },

  toggleAuthMode(mode) {
    this.activeAuthMode = mode;
    const btnSignin = document.getElementById("modal-mode-signin");
    const btnReg = document.getElementById("modal-mode-register");
    if (btnSignin) btnSignin.classList.toggle("active", mode === "signin");
    if (btnReg) btnReg.classList.toggle("active", mode === "register");
    this.updateModalForms();
    this.clearModalFeedback();
  },

  updateModalForms() {
    const isCustomer = this.activeAuthTab === "customer";
    const isPartner = this.activeAuthTab === "partner";
    const isAdmin = this.activeAuthTab === "admin";
    const isSignin = this.activeAuthMode === "signin";

    const fCustIn = document.getElementById("modal-form-customer-signin");
    const fCustUp = document.getElementById("modal-form-customer-register");
    const fPartIn = document.getElementById("modal-form-partner-signin");
    const fPartUp = document.getElementById("modal-form-partner-register");
    const fAdmin = document.getElementById("modal-form-admin-signin");

    if (fCustIn) fCustIn.style.display = (isCustomer && isSignin) ? "block" : "none";
    if (fCustUp) fCustUp.style.display = (isCustomer && !isSignin) ? "block" : "none";
    if (fPartIn) fPartIn.style.display = (isPartner && isSignin) ? "block" : "none";
    if (fPartUp) fPartUp.style.display = (isPartner && !isSignin) ? "block" : "none";
    if (fAdmin) fAdmin.style.display = isAdmin ? "block" : "none";
  },

  fillDemoCredentials(role) {
    this.switchAuthTab(role);
    this.toggleAuthMode("signin");

    if (role === "customer") {
      const email = document.getElementById("modal-cust-email");
      const pass = document.getElementById("modal-cust-password");
      if (email) email.value = "customer@dulhaniya.com";
      if (pass) pass.value = "customer123";
      this.showModalFeedback("Loaded demo customer! Click Sign In.", "info");
    } else if (role === "partner") {
      const email = document.getElementById("modal-partner-email");
      const pass = document.getElementById("modal-partner-password");
      if (email) email.value = "partner@dulhaniya.com";
      if (pass) pass.value = "partner123";
      this.showModalFeedback("Loaded demo partner! Click Access Partner Dashboard.", "info");
    } else if (role === "admin") {
      const user = document.getElementById("modal-admin-user");
      const pass = document.getElementById("modal-admin-pass");
      if (user) user.value = "admin";
      if (pass) pass.value = "dulhaniya@royal2026";
      this.showModalFeedback("Loaded master admin credentials! Click Unlock.", "info");
    }
  },

  showModalFeedback(msg, type = "error") {
    const box = document.getElementById("modal-auth-feedback");
    if (!box) return;
    box.style.display = "block";
    if (type === "error") {
      box.style.background = "#fef2f2";
      box.style.color = "#b91c1c";
      box.style.border = "1px solid #fecaca";
    } else if (type === "success") {
      box.style.background = "#ecfdf5";
      box.style.color = "#047857";
      box.style.border = "1px solid #a7f3d0";
    } else {
      box.style.background = "#eff6ff";
      box.style.color = "#1d4ed8";
      box.style.border = "1px solid #bfdbfe";
    }
    box.textContent = msg;
  },

  clearModalFeedback() {
    const box = document.getElementById("modal-auth-feedback");
    if (box) box.style.display = "none";
  },

  async submitLogin(event, role) {
    event.preventDefault();
    const email = role === "customer" 
      ? document.getElementById("modal-cust-email")?.value.trim() 
      : document.getElementById("modal-partner-email")?.value.trim();
    const pass = role === "customer" 
      ? document.getElementById("modal-cust-password")?.value 
      : document.getElementById("modal-partner-password")?.value;
    const btn = role === "customer" 
      ? document.getElementById("btn-modal-cust-login") 
      : document.getElementById("btn-modal-partner-login");

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Verifying...";
    }

    try {
      const res = await DulhaniyaAPI.login(email, pass, role);
      if (res.success) {
        this.showModalFeedback("🎉 Welcome back! Authentication verified.", "success");
        setTimeout(() => {
          this.closeLoginModal();
          this.checkAuthStatus();
          this.showToast(`Welcome back, ${res.user.name}! 👑`);
          if (role === "partner") {
            this.setViewMode("partner");
          }
        }, 500);
      } else {
        this.showModalFeedback(res.error || "Invalid credentials.", "error");
      }
    } catch (e) {
      this.showModalFeedback("Authentication error: " + e.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = role === "customer" ? "✨ Sign In to Dulhaniya" : "👩‍💼 Access Partner Dashboard";
      }
    }
  },

  async submitRegister(event, role) {
    event.preventDefault();
    let payload = {};
    if (role === "customer") {
      payload = {
        name: document.getElementById("modal-cust-reg-name")?.value.trim(),
        phone: document.getElementById("modal-cust-reg-phone")?.value.trim(),
        city: document.getElementById("modal-cust-reg-city")?.value,
        email: document.getElementById("modal-cust-reg-email")?.value.trim(),
        password: document.getElementById("modal-cust-reg-password")?.value,
        role: "customer"
      };
    } else {
      payload = {
        name: document.getElementById("modal-partner-reg-name")?.value.trim(),
        phone: document.getElementById("modal-partner-reg-phone")?.value.trim(),
        experience_years: document.getElementById("modal-partner-reg-exp")?.value,
        email: document.getElementById("modal-partner-reg-email")?.value.trim(),
        password: document.getElementById("modal-partner-reg-password")?.value,
        role: "partner"
      };
    }

    try {
      const res = await DulhaniyaAPI.register(payload);
      if (res.success) {
        this.showModalFeedback("🎉 Account created successfully!", "success");
        setTimeout(() => {
          this.closeLoginModal();
          this.checkAuthStatus();
          this.showToast(`Account created! Welcome, ${res.user.name}.`);
          if (role === "partner") this.setViewMode("partner");
        }, 500);
      } else {
        this.showModalFeedback(res.error || "Registration failed.", "error");
      }
    } catch (e) {
      this.showModalFeedback("Error: " + e.message, "error");
    }
  },

  async submitAdminModalLogin(event) {
    event.preventDefault();
    const user = document.getElementById("modal-admin-user")?.value.trim();
    const pass = document.getElementById("modal-admin-pass")?.value;
    const btn = document.getElementById("btn-modal-admin-login");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Verifying...";
    }

    try {
      const res = await DulhaniyaAPI.adminLogin(user, pass);
      if (res.success) {
        this.showModalFeedback("🛡️ Master security credentials accepted. Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 500);
      } else {
        this.showModalFeedback(res.error || "Access Denied: Invalid passcode.", "error");
      }
    } catch (e) {
      this.showModalFeedback("Admin error: " + e.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "⚡ Unlock Operations Control Room";
      }
    }
  },

  // ================= CUSTOMER: MY BOOKINGS =================
  async openMyBookings() {
    this.closeUserDropdown();
    this.closeAllModals();
    const modal = document.getElementById("user-bookings-modal");
    if (modal) {
      modal.classList.add("active");
      await this.renderMyBookings();
    }
  },

  closeMyBookings() {
    this.closeModal("user-bookings-modal");
  },

  filterUserBookings(filter) {
    this.userBookingsFilter = filter;
    ['all', 'active', 'completed'].forEach(f => {
      const btn = document.getElementById(`tab-cust-bookings-${f}`);
      if (btn) {
        btn.style.background = f === filter ? "var(--primary-subtle)" : "var(--slate-100)";
        btn.style.color = f === filter ? "var(--primary-dark)" : "var(--slate-600)";
      }
    });
    this.renderMyBookingsList();
  },

  async renderMyBookings() {
    try {
      this.userBookingsCache = await DulhaniyaAPI.getUserBookings();
    } catch (e) {
      this.userBookingsCache = [];
    }
    this.renderMyBookingsList();
  },

  renderMyBookingsList() {
    const container = document.getElementById("user-bookings-list-container");
    if (!container) return;

    let list = this.userBookingsCache || [];
    if (this.userBookingsFilter === "active") {
      list = list.filter(b => ['CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_SERVICE'].includes(b.status));
    } else if (this.userBookingsFilter === "completed") {
      list = list.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--slate-500);">
          <div style="font-size:2.4rem; margin-bottom:8px;">💅</div>
          <h4 style="color:var(--slate-800);">No Bookings Found</h4>
          <p style="font-size:0.85rem; margin-top:4px;">Ready to glow? Explore our bridal makeup packages & facials to book your first appointment!</p>
          <button class="btn-primary" style="margin-top:16px; font-size:0.85rem; padding:8px 18px;" onclick="App.closeMyBookings()">Browse Catalog</button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(b => {
      const isActive = ['CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_SERVICE'].includes(b.status);
      let statusBadgeColor = "var(--slate-700)";
      if (b.status === "COMPLETED") statusBadgeColor = "var(--emerald)";
      else if (b.status === "ON_THE_WAY") statusBadgeColor = "#0284c7";
      else if (b.status === "IN_SERVICE") statusBadgeColor = "var(--primary)";
      else if (b.status === "CANCELLED") statusBadgeColor = "#ef4444";

      return `
        <div class="user-booking-card" style="border:1.5px solid var(--slate-200); border-radius:var(--radius-lg); padding:20px; background:var(--white); box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <strong style="color:var(--primary); font-size:1.15rem; font-weight:800;">${b.booking_ref}</strong>
                <span class="badge" style="background:${statusBadgeColor}; color:#fff; font-size:0.75rem;">${b.status}</span>
                ${b.status === 'ON_THE_WAY' ? '<span class="pulse-dot" style="margin-left:-4px;"></span>' : ''}
              </div>
              <div style="font-size:0.82rem; color:var(--slate-500); margin-top:3px;">
                Booked on ${b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Recent'}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.35rem; font-weight:800; color:var(--slate-900);">₹${(b.total_amount || 0).toLocaleString('en-IN')}</div>
              <div style="font-size:0.75rem; color:var(--slate-500);">${b.payment_mode || 'Pay After Service'}</div>
            </div>
          </div>

          <!-- Schedule & Address -->
          <div style="background:var(--slate-50); border-radius:var(--radius-md); padding:12px 14px; margin-bottom:14px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; font-size:0.85rem;">
            <div>
              <strong style="color:var(--slate-700);">⏰ Scheduled Slot:</strong>
              <div style="color:var(--slate-900); font-weight:600; margin-top:2px;">${b.service_date} (${b.service_slot})</div>
            </div>
            <div>
              <strong style="color:var(--slate-700);">📍 Delivery Address:</strong>
              <div style="color:var(--slate-900); margin-top:2px;">${b.address}, ${b.city || 'New Delhi'}</div>
            </div>
          </div>

          <!-- Doorstep OTP Box for Active Orders -->
          ${isActive && b.otp_code ? `
            <div style="background:linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border:1.5px solid var(--gold-border); border-radius:var(--radius-md); padding:12px 16px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div>
                <span style="font-size:0.75rem; text-transform:uppercase; font-weight:800; color:var(--gold); letter-spacing:0.05em;">
                  🔐 SafeSeal™ Doorstep Security OTP
                </span>
                <p style="font-size:0.8rem; color:var(--slate-700); margin:2px 0 0;">
                  Share this 4-digit code ONLY with your beautician upon arrival:
                </p>
              </div>
              <div style="font-size:1.75rem; font-weight:900; color:var(--gold); letter-spacing:4px; background:#fff; padding:4px 16px; border-radius:8px; border:1px solid var(--gold); box-shadow:0 2px 6px rgba(180,83,9,0.15);">
                ${b.otp_code}
              </div>
            </div>
          ` : ''}

          <!-- Assigned Specialist Info -->
          ${b.beautician_name ? `
            <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--slate-100); padding-top:12px; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:36px; height:36px; border-radius:50%; background:var(--primary-subtle); color:var(--primary); font-weight:800; display:flex; align-items:center; justify-content:center; border:1px solid var(--primary-border);">
                  ${(b.beautician_name || "P")[0]}
                </div>
                <div>
                  <div style="font-size:0.88rem; font-weight:700; color:var(--slate-900);">Specialist: ${b.beautician_name}</div>
                  <div style="font-size:0.75rem; color:var(--emerald); font-weight:600;">★ ${b.beautician_rating || 4.98} Verified Dulhaniya Pro</div>
                </div>
              </div>
              ${b.beautician_phone ? `
                <a href="tel:${b.beautician_phone}" class="btn-secondary" style="font-size:0.78rem; padding:4px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                  📞 Call Specialist
                </a>
              ` : ''}
            </div>
          ` : ''}

          <!-- Action Buttons Bar -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--slate-100); padding-top:14px; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${isActive ? `
                <button class="btn-primary" style="font-size:0.82rem; padding:6px 14px; display:inline-flex; align-items:center; gap:4px;" onclick="App.trackBooking('${b.booking_ref}')">
                  📍 Track Live
                </button>
                <button class="btn-secondary" style="font-size:0.82rem; padding:6px 14px; color:#ef4444; border-color:#fecaca;" onclick="App.cancelBooking('${b.booking_ref}')">
                  ✕ Cancel
                </button>
              ` : `
                <button class="btn-secondary" style="font-size:0.82rem; padding:6px 14px; display:inline-flex; align-items:center; gap:4px;" onclick="App.reorderBooking('${b.booking_ref}')">
                  🔄 Reorder Services
                </button>
              `}
            </div>
            <button class="btn-secondary" style="font-size:0.82rem; padding:6px 14px; display:inline-flex; align-items:center; gap:4px;" onclick="App.openLuxuryInvoice('${b.booking_ref}')">
              📄 Luxury Invoice
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  trackBooking(ref) {
    this.closeMyBookings();
    if (window.Tracker) {
      Tracker.loadBooking(ref);
      Tracker.openTracker();
    }
  },

  async cancelBooking(ref) {
    if (!confirm(`Are you sure you want to cancel appointment ${ref}?`)) return;
    try {
      await DulhaniyaAPI.cancelUserBooking(ref);
      this.showToast(`Booking ${ref} cancelled successfully.`);
      await this.renderMyBookings();
    } catch (e) {
      this.showToast("Cancellation error: " + e.message);
    }
  },

  async reorderBooking(ref) {
    const booking = (this.userBookingsCache || []).find(b => b.booking_ref === ref);
    if (!booking || !booking.items) {
      this.showToast("Unable to reload items.");
      return;
    }
    booking.items.forEach(item => {
      Cart.addItem(item);
    });
    this.closeMyBookings();
    this.openCartDrawer();
    this.showToast("✨ Items reloaded into your cart!");
  },

  // ================= CUSTOMER: SAVED ADDRESSES =================
  async openSavedAddresses() {
    this.closeUserDropdown();
    this.closeAllModals();
    const modal = document.getElementById("user-addresses-modal");
    if (modal) {
      modal.classList.add("active");
      await this.renderSavedAddresses();
    }
  },

  closeSavedAddresses() {
    this.closeModal("user-addresses-modal");
  },

  async renderSavedAddresses() {
    const container = document.getElementById("saved-addresses-list");
    if (!container) return;

    const list = await DulhaniyaAPI.getUserAddresses();
    this.userAddressesCache = list;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:20px; color:var(--slate-500); font-size:0.88rem;">
          No saved addresses found. Add your home, bridal suite, or wedding venue below.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(a => `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border:1px solid var(--slate-200); border-radius:var(--radius-md); padding:14px 18px; background:var(--white); box-shadow:var(--shadow-sm);">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="color:var(--slate-900); font-size:0.95rem;">📍 ${a.label}</strong>
            ${a.is_default ? '<span class="badge badge-bridal" style="font-size:0.7rem;">Default Address</span>' : ''}
          </div>
          <p style="font-size:0.85rem; color:var(--slate-700); margin:4px 0 2px;">
            ${a.address}
          </p>
          <p style="font-size:0.78rem; color:var(--slate-500); margin:0;">
            ${a.landmark ? `Landmark: ${a.landmark} • ` : ''}${a.city || 'New Delhi'} ${a.pincode ? `(${a.pincode})` : ''}
          </p>
        </div>
        <button class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; color:#ef4444; border-color:#fecaca;" onclick="App.deleteSavedAddress('${a.id}')">
          🗑️ Remove
        </button>
      </div>
    `).join('');
  },

  async addSavedAddress(e) {
    e.preventDefault();
    const form = e.target;
    const newAddr = {
      label: form.label.value.trim(),
      city: form.city.value,
      address: form.address.value.trim(),
      landmark: form.landmark.value.trim(),
      pincode: form.pincode.value.trim(),
      is_default: form.is_default.checked
    };

    await DulhaniyaAPI.addUserAddress(newAddr);
    form.reset();
    this.showToast("Address saved to profile! 📍");
    await this.renderSavedAddresses();
  },

  async deleteSavedAddress(id) {
    if (!confirm("Remove this address?")) return;
    await DulhaniyaAPI.deleteUserAddress(id);
    this.showToast("Address removed.");
    await this.renderSavedAddresses();
  },

  // ================= LUXURY TAX INVOICE =================
  async openLuxuryInvoice(ref) {
    const b = (this.userBookingsCache || []).find(x => x.booking_ref === ref) || await DulhaniyaAPI.getBooking(ref);
    if (!b) {
      this.showToast("Booking invoice not found.");
      return;
    }

    const modal = document.getElementById("luxury-invoice-modal");
    const body = document.getElementById("luxury-invoice-body");
    if (!modal || !body) return;

    const subtotal = (b.items || []).reduce((acc, i) => acc + (i.price || 0), 0);
    const invoiceNo = "DLH-INV-" + (b.booking_ref.replace("DLH-", "") || "9842");

    body.innerHTML = `
      <div id="printable-invoice-content" style="background:#fff; color:#0f172a; font-family:'Plus Jakarta Sans',sans-serif;">
        <!-- Invoice Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--gold-border); padding-bottom:18px; margin-bottom:20px;">
          <div>
            <div style="font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:800; color:var(--primary-dark);">
              Dulhaniya™ Luxury Salon & Bridal
            </div>
            <div style="font-size:0.75rem; color:var(--slate-500); margin-top:2px;">
              Regal Beauty At Home Private Limited • GSTIN: 07AAACD1234F1Z5
            </div>
            <div style="font-size:0.75rem; color:var(--slate-500);">
              Plot 42, Connaught Circus, New Delhi - 110001
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:var(--gold);">TAX INVOICE</div>
            <div style="font-size:1.1rem; font-weight:800; color:var(--slate-900);">${invoiceNo}</div>
            <div style="font-size:0.78rem; color:var(--slate-500);">Date: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
          </div>
        </div>

        <!-- Bill To / Service To -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; font-size:0.85rem;">
          <div style="background:var(--slate-50); padding:12px; border-radius:8px;">
            <strong style="color:var(--slate-800); display:block; margin-bottom:4px;">Billed To:</strong>
            <div style="font-weight:700;">${b.customer_name}</div>
            <div>${b.customer_phone || ''}</div>
            <div>${b.customer_email || ''}</div>
            <div style="margin-top:2px; color:var(--slate-600);">${b.address}, ${b.city || 'New Delhi'}</div>
          </div>
          <div style="background:var(--slate-50); padding:12px; border-radius:8px;">
            <strong style="color:var(--slate-800); display:block; margin-bottom:4px;">Fulfillment Details:</strong>
            <div>Booking Ref: <strong>${b.booking_ref}</strong></div>
            <div>Slot: ${b.service_date} (${b.service_slot})</div>
            <div>Specialist: ${b.beautician_name || 'Assigned Lead'}</div>
            <div>Payment: <strong>${b.payment_mode || 'Pay After Service'}</strong></div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:0.85rem;">
          <thead>
            <tr style="background:var(--slate-100); border-bottom:1.5px solid var(--slate-300);">
              <th style="padding:10px; text-align:left;">Service Description</th>
              <th style="padding:10px; text-align:center;">Duration</th>
              <th style="padding:10px; text-align:right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(b.items || []).map(i => `
              <tr style="border-bottom:1px solid var(--slate-200);">
                <td style="padding:10px;">
                  <strong style="color:var(--slate-900);">${i.title}</strong>
                  <div style="font-size:0.72rem; color:var(--emerald);">✓ Single-Use SafeSeal™ Monodose Kit Included</div>
                </td>
                <td style="padding:10px; text-align:center;">${i.duration_mins || 60} mins</td>
                <td style="padding:10px; text-align:right; font-weight:700;">₹${(i.price || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals & Taxes -->
        <div style="display:flex; justify-content:flex-end; margin-bottom:20px;">
          <div style="width:260px; font-size:0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span>Subtotal:</span>
              <span>₹${subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:var(--slate-600);">
              <span>Integrated GST (18%):</span>
              <span>Included</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:var(--slate-600);">
              <span>Disposable Hygiene Kit:</span>
              <span>FREE</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:900; font-size:1.15rem; color:var(--primary-dark); border-top:2px solid var(--gold-border); padding-top:6px; margin-top:6px;">
              <span>Total Payable:</span>
              <span>₹${(b.total_amount || subtotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- SafeSeal Certification Block -->
        <div style="border:1px dashed var(--slate-300); border-radius:8px; padding:12px; margin-bottom:24px; font-size:0.75rem; color:var(--slate-600); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>🛡️ Dulhaniya SafeSeal™ Escrow Protection</strong><br>
            All products are 100% manufacturer sealed. Doorstep OTP verified.
          </div>
          <div style="font-size:1.4rem;">👑</div>
        </div>

        <!-- Print Action -->
        <div style="display:flex; justify-content:flex-end; gap:10px;" class="no-print">
          <button class="btn-secondary" onclick="App.closeModal('luxury-invoice-modal')">Close</button>
          <button class="btn-primary" onclick="window.print()" style="padding:8px 20px;">🖨️ Print Luxury Invoice</button>
        </div>
      </div>
    `;

    modal.classList.add("active");
  },

  closeAllModals() {
    ['checkout-modal', 'tracker-modal', 'consultation-advisor-modal', 'service-detail-modal', 'add-service-modal', 'auth-modal', 'user-bookings-modal', 'user-addresses-modal', 'luxury-invoice-modal'].forEach(id => {
      this.closeModal(id);
    });
    this.closeCartDrawer();
  }
};

// Global Keyboard Accessibility (WCAG 2.1 AA)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    App.closeAllModals();
  }
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
