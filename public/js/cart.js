/**
 * Dulhaniya - Cart & Pricing Engine
 * Features dual-mode transparent pricing: Sealed Dulhaniya Kit vs Bring-Your-Own-Product (BYOP).
 */

const Cart = {
  items: [],
  kitType: "dulhaniya_kit", // 'dulhaniya_kit' or 'byo_product'
  appliedCoupon: null,
  tipAmount: 0,
  hygieneKitFee: 49,

  init() {
    this.loadFromStorage();
    this.renderCartUI();
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem("dulhaniya_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.items = parsed.items || [];
        this.kitType = parsed.kitType || "dulhaniya_kit";
        this.appliedCoupon = parsed.appliedCoupon || null;
        this.tipAmount = parsed.tipAmount || 0;
      }
    } catch (e) {
      this.items = [];
    }
  },

  saveToStorage() {
    localStorage.setItem("dulhaniya_cart", JSON.stringify({
      items: this.items,
      kitType: this.kitType,
      appliedCoupon: this.appliedCoupon,
      tipAmount: this.tipAmount
    }));
  },

  addItem(service) {
    // Check if item already exists
    const existing = this.items.find(i => i.id === service.id);
    if (!existing) {
      this.items.push({
        id: service.id,
        title: service.title,
        subtitle: service.subtitle || "",
        price: service.discounted_price || service.price,
        original_price: service.price,
        duration_mins: service.duration_mins,
        byo_product_discount: service.byo_product_discount || 150,
        image_url: service.image_url,
        category_slug: service.category_slug
      });
      this.saveToStorage();
      this.renderCartUI();
      window.App?.showToast(`Added "${service.title}" to your cart ✨`);
    } else {
      window.App?.showToast(`"${service.title}" is already in your cart`);
    }
  },

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length === 0) {
      this.appliedCoupon = null;
    }
    this.saveToStorage();
    this.renderCartUI();
    window.App?.updateServiceButtons();
  },

  clear() {
    this.items = [];
    this.appliedCoupon = null;
    this.tipAmount = 0;
    this.saveToStorage();
    this.renderCartUI();
    window.App?.updateServiceButtons();
  },

  setKitType(type) {
    if (type === "dulhaniya_kit" || type === "byo_product") {
      this.kitType = type;
      this.saveToStorage();
      this.renderCartUI();
      const msg = type === "byo_product"
        ? "Switched to 'Bring Your Own Product' mode! Service labor discount applied."
        : "Switched to 'Dulhaniya Sealed Deluxe Kits' mode (tamper-proof mono-kits).";
      window.App?.showToast(msg);
    }
  },

  setTip(amount) {
    this.tipAmount = Number(amount) || 0;
    this.saveToStorage();
    this.renderCartUI();
  },

  hasItem(id) {
    return this.items.some(i => i.id === id);
  },

  getCalculations() {
    let rawSubtotal = 0;
    let byoDeduction = 0;
    let totalDuration = 0;

    for (const item of this.items) {
      rawSubtotal += item.price;
      totalDuration += item.duration_mins;
      if (this.kitType === "byo_product") {
        byoDeduction += item.byo_product_discount;
      }
    }

    const subtotal = Math.max(0, rawSubtotal - byoDeduction);

    // Coupon discount
    let couponDiscount = 0;
    if (this.appliedCoupon && subtotal > 0) {
      if (this.appliedCoupon.discount_type === "flat") {
        couponDiscount = Math.min(this.appliedCoupon.discount_value, subtotal);
      } else {
        const percDisc = Math.round((subtotal * this.appliedCoupon.discount_value) / 100);
        couponDiscount = Math.min(percDisc, this.appliedCoupon.max_discount || 1000);
      }
    }

    // Safety and disposable hygiene kit fee (waived if subtotal >= 1999 or cart is empty)
    const hygieneFee = (subtotal === 0 || subtotal >= 1999) ? 0 : this.hygieneKitFee;

    const finalPayable = Math.max(0, subtotal - couponDiscount + hygieneFee + this.tipAmount);

    return {
      rawSubtotal,
      byoDeduction,
      subtotal,
      couponDiscount,
      hygieneFee,
      tipAmount: this.tipAmount,
      finalPayable,
      totalDuration,
      itemCount: this.items.length
    };
  },

  async applyCouponCode(code) {
    const calc = this.getCalculations();
    if (calc.subtotal <= 0) {
      window.App?.showToast("Add services to cart before applying coupon");
      return false;
    }

    const res = await DulhaniyaAPI.applyCoupon(code, calc.subtotal);
    if (res.success) {
      this.appliedCoupon = {
        code: res.code,
        discount: res.discount,
        description: res.description,
        discount_type: "flat",
        discount_value: res.discount
      };
      this.saveToStorage();
      this.renderCartUI();
      window.App?.showToast(`Coupon ${res.code} applied! Saved ₹${res.discount} 🎉`);
      return true;
    } else {
      window.App?.showToast(res.error || "Failed to apply coupon");
      return false;
    }
  },

  removeCoupon() {
    this.appliedCoupon = null;
    this.saveToStorage();
    this.renderCartUI();
    window.App?.showToast("Coupon removed.");
  },

  renderCartUI() {
    const calc = this.getCalculations();

    // 1. Update Navigation Cart Badge and Total
    const badgeEl = document.getElementById("nav-cart-badge");
    const totalEl = document.getElementById("nav-cart-total");
    if (badgeEl) badgeEl.textContent = calc.itemCount;
    if (totalEl) totalEl.textContent = calc.itemCount > 0 ? `₹${calc.finalPayable.toLocaleString('en-IN')}` : "Cart";

    // 2. Render Drawer List
    const itemsListEl = document.getElementById("cart-items-list");
    if (itemsListEl) {
      if (this.items.length === 0) {
        itemsListEl.innerHTML = `
          <div style="text-align:center; padding: 40px 20px; color: var(--slate-400);">
            <div style="font-size: 3rem; margin-bottom: 12px;">🛍️</div>
            <h4 style="color: var(--slate-700); margin-bottom: 6px;">Your bridal cart is empty</h4>
            <p style="font-size: 0.85rem;">Select from our luxury bridal makeovers, facials, waxing, and hair spas.</p>
          </div>
        `;
      } else {
        itemsListEl.innerHTML = this.items.map(item => {
          const itemPrice = this.kitType === "byo_product"
            ? Math.max(199, item.price - item.byo_product_discount)
            : item.price;

          return `
            <div class="cart-item-card">
              <div class="cart-item-info">
                <h5>${item.title}</h5>
                <div style="display:flex; align-items:center; gap: 8px; font-size: 0.78rem; color: var(--slate-500);">
                  <span>⏱️ ${item.duration_mins} mins</span>
                  ${this.kitType === "byo_product" ? `<span style="color:var(--emerald); font-weight:600;">Saved ₹${item.byo_product_discount} (BYOP)</span>` : `<span>📦 Sealed Dulhaniya Kit</span>`}
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <span class="cart-item-price">₹${itemPrice.toLocaleString('en-IN')}</span>
                <button class="cart-item-remove" onclick="Cart.removeItem(${item.id})">Remove</button>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // 3. Render Kit Type Toggle Selection
    const btnSealed = document.getElementById("btn-kit-sealed");
    const btnByo = document.getElementById("btn-kit-byo");
    if (btnSealed && btnByo) {
      btnSealed.classList.toggle("selected", this.kitType === "dulhaniya_kit");
      btnByo.classList.toggle("selected", this.kitType === "byo_product");
    }

    // 4. Update Bill Breakdown
    const subtotalEl = document.getElementById("bill-subtotal");
    const byoRowEl = document.getElementById("bill-byo-row");
    const byoValEl = document.getElementById("bill-byo-val");
    const couponRowEl = document.getElementById("bill-coupon-row");
    const couponValEl = document.getElementById("bill-coupon-val");
    const hygieneEl = document.getElementById("bill-hygiene");
    const tipEl = document.getElementById("bill-tip");
    const finalEl = document.getElementById("bill-final");
    const durationEl = document.getElementById("bill-duration");

    if (subtotalEl) subtotalEl.textContent = `₹${calc.rawSubtotal.toLocaleString('en-IN')}`;

    if (byoRowEl && byoValEl) {
      if (this.kitType === "byo_product" && calc.byoDeduction > 0) {
        byoRowEl.style.display = "flex";
        byoValEl.textContent = `-₹${calc.byoDeduction.toLocaleString('en-IN')}`;
      } else {
        byoRowEl.style.display = "none";
      }
    }

    if (couponRowEl && couponValEl) {
      if (this.appliedCoupon && calc.couponDiscount > 0) {
        couponRowEl.style.display = "flex";
        couponValEl.textContent = `-₹${calc.couponDiscount.toLocaleString('en-IN')} (${this.appliedCoupon.code})`;
      } else {
        couponRowEl.style.display = "none";
      }
    }

    if (hygieneEl) {
      hygieneEl.textContent = calc.hygieneFee === 0 ? "FREE (Orders > ₹1999)" : `₹${calc.hygieneFee}`;
    }

    if (tipEl) tipEl.textContent = `₹${calc.tipAmount}`;
    if (finalEl) finalEl.textContent = `₹${calc.finalPayable.toLocaleString('en-IN')}`;
    if (durationEl) durationEl.textContent = `${calc.totalDuration} mins`;

    // 5. Checkout Button State
    const checkoutBtn = document.getElementById("btn-proceed-checkout");
    if (checkoutBtn) {
      checkoutBtn.disabled = calc.itemCount === 0;
      checkoutBtn.style.opacity = calc.itemCount === 0 ? "0.5" : "1";
    }
  }
};
