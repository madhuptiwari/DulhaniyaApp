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

  async init() {
    window.App = this;
    Cart.init();
    Tracker.init();

    await this.loadCategories();
    await this.loadServices();
    this.setupEventListeners();
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
  proceedToCheckout() {
    if (Cart.items.length === 0) {
      this.showToast("Your cart is empty!");
      return;
    }
    this.closeCartDrawer();
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.classList.add("active");
      this.renderCheckoutSummary();
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

  closeAllModals() {
    ['checkout-modal', 'tracker-modal', 'consultation-advisor-modal', 'service-detail-modal', 'add-service-modal'].forEach(id => {
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
