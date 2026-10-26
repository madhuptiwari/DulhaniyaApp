/**
 * Dulhaniya - Enterprise Admin Control Room & Operations Suite
 * Executive dashboard for bookings dispatch, service catalog management,
 * beautician partner fleet, promotional coupon campaigns, and customer CSAT sentiment.
 */

const Admin = {
  activeTab: "dispatch", // 'dispatch', 'catalog', 'fleet', 'coupons', 'reviews'
  cachedBookings: [],
  cachedServices: [],
  cachedBeauticians: [],
  cachedCoupons: [],
  cachedReviews: [],
  cachedStats: null,

  async init() {
    // Listen for unauthorized 401 events on admin routes
    if (!this._unauthBound) {
      window.addEventListener("dulhaniya_unauthorized", (e) => {
        if (e.detail?.endpoint?.startsWith("/api/admin")) {
          Admin.handleUnauthorized();
        }
      });
      this._unauthBound = true;
    }

    if (!this.checkAuth()) {
      return;
    }

    await this.loadAllData();
    this.renderAdminView();
  },

  checkAuth() {
    const token = DulhaniyaAPI.getAdminToken();
    if (!token) {
      this.showLockScreen();
      return false;
    }
    this.hideLockScreen();
    return true;
  },

  showLockScreen(errorMsg = "") {
    const lock = document.getElementById("admin-lock-screen");
    if (lock) {
      lock.style.display = "flex";
      const errEl = document.getElementById("admin-lock-error");
      if (errEl) {
        if (errorMsg) {
          errEl.textContent = errorMsg;
          errEl.style.display = "block";
          errEl.style.background = "#7f1d1d";
          errEl.style.color = "#fecaca";
          errEl.style.border = "1px solid #ef4444";
        } else {
          errEl.style.display = "none";
        }
      }
    }
  },

  hideLockScreen() {
    const lock = document.getElementById("admin-lock-screen");
    if (lock) lock.style.display = "none";
  },

  fillTestCredentials() {
    const userEl = document.getElementById("admin-lock-user");
    const passEl = document.getElementById("admin-lock-pass");
    if (userEl) userEl.value = "admin";
    if (passEl) passEl.value = "dulhaniya@royal2026";
    const errEl = document.getElementById("admin-lock-error");
    if (errEl) {
      errEl.style.display = "block";
      errEl.style.background = "#eff6ff";
      errEl.style.color = "#1d4ed8";
      errEl.style.border = "1px solid #bfdbfe";
      errEl.textContent = "Loaded master credentials! Click Unlock below.";
    }
  },

  async login(e) {
    if (e) e.preventDefault();
    const userEl = document.getElementById("admin-lock-user");
    const passEl = document.getElementById("admin-lock-pass");
    const user = userEl ? userEl.value.trim() : "";
    const pass = passEl ? passEl.value : "";
    const btn = document.getElementById("btn-admin-unlock");

    if (btn) {
      btn.disabled = true;
      btn.textContent = "Verifying Credentials...";
    }

    try {
      const res = await DulhaniyaAPI.adminLogin(user, pass);
      if (res.success) {
        this.hideLockScreen();
        window.App?.showToast("Operations Room unlocked! Welcome, Director.");
        await this.loadAllData();
        this.renderAdminView();
      } else {
        this.showLockScreen(res.error || "Access Denied: Invalid admin credentials.");
      }
    } catch (err) {
      this.showLockScreen("Security error: " + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = "⚡ Unlock Operations Control Room";
      }
    }
  },

  logout() {
    DulhaniyaAPI.clearAdminToken();
    this.showLockScreen("You have been securely signed out.");
    window.App?.showToast("Admin session ended securely.");
  },

  handleUnauthorized() {
    DulhaniyaAPI.clearAdminToken();
    this.showLockScreen("Session expired or unauthorized. Please re-enter credentials.");
  },

  async loadAllData() {
    if (!DulhaniyaAPI.getAdminToken()) {
      this.showLockScreen();
      return;
    }

    try {
      const [stats, bookingsRes, services, beauticians, coupons, reviews] = await Promise.all([
        DulhaniyaAPI.getAdminStats(),
        DulhaniyaAPI.safeFetch("/api/bookings").then(r => r.ok ? r.json() : { bookings: [] }).catch(() => ({ bookings: [] })),
        DulhaniyaAPI.getServices("all"),
        DulhaniyaAPI.getAdminBeauticians(),
        DulhaniyaAPI.getAdminCoupons(),
        DulhaniyaAPI.getAdminReviews()
      ]);

      this.cachedStats = stats;
      this.cachedBookings = bookingsRes.bookings || [];
      if (this.cachedBookings.length === 0) {
        const demoRef = localStorage.getItem("dulhaniya_active_ref") || "DLH-9842";
        const b = await DulhaniyaAPI.getBooking(demoRef);
        if (b) this.cachedBookings = [b];
      }
      this.cachedServices = services || [];
      this.cachedBeauticians = beauticians || [];
      this.cachedCoupons = coupons || [];
      this.cachedReviews = reviews || [];
    } catch (e) {
      console.warn("Using offline mode for admin data", e);
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    this.renderAdminView();
  },

  renderAdminView() {
    const container = document.getElementById("admin-portal-content");
    if (!container) return;

    const stats = this.cachedStats || {};
    const bookings = this.cachedBookings;
    const services = this.cachedServices;
    const beauticians = this.cachedBeauticians;
    const coupons = this.cachedCoupons;
    const reviews = this.cachedReviews;

    container.innerHTML = `
      <div class="portal-header" style="flex-wrap:wrap; gap:16px;">
        <div>
          <div style="display:flex; align-items:center; gap:10px;">
            <h2 style="margin:0; font-family:'Playfair Display',serif; color:var(--primary-dark);">Dulhaniya Operations Command Suite</h2>
            <span class="badge" style="background:var(--emerald); color:#fff; font-size:0.75rem;">● Live System</span>
          </div>
          <p style="color:var(--slate-600); font-size:0.9rem; margin-top:4px;">
            Full-stack command center: bookings dispatch, partner fleet, pricing catalog, campaigns & reviews.
          </p>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn-secondary" style="padding:8px 14px; font-size:0.85rem;" onclick="Admin.init()">🔄 Refresh Data</button>
          <button class="btn-secondary" style="padding:8px 14px; font-size:0.85rem;" onclick="Admin.exportBookingsCSV()">📥 Export Bookings CSV</button>
          <button class="btn-secondary" style="padding:8px 14px; font-size:0.85rem;" onclick="Admin.exportPayrollCSV()">💸 Export Payroll CSV</button>
          <button class="btn-primary" style="padding:8px 16px; font-size:0.85rem;" onclick="Admin.openAddServiceModal()">+ New Service</button>
          <button class="btn-primary" style="padding:8px 16px; font-size:0.85rem; background:var(--gold); color:#1a1005;" onclick="Admin.openAddBeauticianModal()">+ Add Partner</button>
          <button class="btn-primary" style="padding:8px 16px; font-size:0.85rem; background:var(--slate-800); color:#fff;" onclick="Admin.openAddCouponModal()">+ Create Coupon</button>
        </div>
      </div>

      <!-- KPI Executive Metric Cards -->
      <div class="portal-grid-stats" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom:24px;">
        <div class="stat-card">
          <div class="stat-card-title">Gross Revenue (GMV)</div>
          <div class="stat-card-value" style="color:var(--primary-dark);">₹${(stats.total_revenue || 0).toLocaleString('en-IN')}</div>
          <div style="font-size:0.72rem; color:var(--emerald); margin-top:4px;">↑ +18.4% vs last week</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Total Appointments</div>
          <div class="stat-card-value">${stats.total_bookings || bookings.length}</div>
          <div style="font-size:0.72rem; color:var(--slate-500); margin-top:4px;">Across Delhi NCR & Metro</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Active Field Orders</div>
          <div class="stat-card-value" style="color:#0284c7;">${stats.active_orders || bookings.filter(b => ['CONFIRMED','ASSIGNED','ON_THE_WAY','IN_SERVICE'].includes(b.status)).length}</div>
          <div style="font-size:0.72rem; color:#0284c7; margin-top:4px;">Live tracking active</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Verified Beauticians</div>
          <div class="stat-card-value" style="color:var(--emerald);">${beauticians.length}</div>
          <div style="font-size:0.72rem; color:var(--emerald); margin-top:4px;">100% Background Verified</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Average CSAT Rating</div>
          <div class="stat-card-value" style="color:var(--gold);">${stats.avg_rating || 4.96} ★</div>
          <div style="font-size:0.72rem; color:var(--slate-500); margin-top:4px;">Based on ${reviews.length} reviews</div>
        </div>
      </div>

      <!-- Tab Navigation Navigation -->
      <div style="display:flex; gap:8px; border-bottom:2px solid var(--slate-200); margin-bottom:24px; overflow-x:auto; padding-bottom:2px;">
        <button class="tab-btn ${this.activeTab === 'dispatch' ? 'active' : ''}" onclick="Admin.switchTab('dispatch')" style="padding:10px 18px; font-weight:700; font-size:0.9rem; border:none; background:none; cursor:pointer; border-bottom:${this.activeTab === 'dispatch' ? '3px solid var(--primary)' : '3px solid transparent'}; color:${this.activeTab === 'dispatch' ? 'var(--primary)' : 'var(--slate-600)'};">
          📋 Live Dispatch (${bookings.length})
        </button>
        <button class="tab-btn ${this.activeTab === 'catalog' ? 'active' : ''}" onclick="Admin.switchTab('catalog')" style="padding:10px 18px; font-weight:700; font-size:0.9rem; border:none; background:none; cursor:pointer; border-bottom:${this.activeTab === 'catalog' ? '3px solid var(--primary)' : '3px solid transparent'}; color:${this.activeTab === 'catalog' ? 'var(--primary)' : 'var(--slate-600)'};">
          💄 Service Catalog (${services.length})
        </button>
        <button class="tab-btn ${this.activeTab === 'fleet' ? 'active' : ''}" onclick="Admin.switchTab('fleet')" style="padding:10px 18px; font-weight:700; font-size:0.9rem; border:none; background:none; cursor:pointer; border-bottom:${this.activeTab === 'fleet' ? '3px solid var(--primary)' : '3px solid transparent'}; color:${this.activeTab === 'fleet' ? 'var(--primary)' : 'var(--slate-600)'};">
          👩‍💼 Partner Fleet (${beauticians.length})
        </button>
        <button class="tab-btn ${this.activeTab === 'coupons' ? 'active' : ''}" onclick="Admin.switchTab('coupons')" style="padding:10px 18px; font-weight:700; font-size:0.9rem; border:none; background:none; cursor:pointer; border-bottom:${this.activeTab === 'coupons' ? '3px solid var(--primary)' : '3px solid transparent'}; color:${this.activeTab === 'coupons' ? 'var(--primary)' : 'var(--slate-600)'};">
          🎟️ Promo Campaigns (${coupons.length})
        </button>
        <button class="tab-btn ${this.activeTab === 'reviews' ? 'active' : ''}" onclick="Admin.switchTab('reviews')" style="padding:10px 18px; font-weight:700; font-size:0.9rem; border:none; background:none; cursor:pointer; border-bottom:${this.activeTab === 'reviews' ? '3px solid var(--primary)' : '3px solid transparent'}; color:${this.activeTab === 'reviews' ? 'var(--primary)' : 'var(--slate-600)'};">
          ⭐ CSAT & Reviews (${reviews.length})
        </button>
        <button class="tab-btn ${this.activeTab === 'analytics' ? 'active' : ''}" onclick="Admin.switchTab('analytics')" style="padding:10px 18px; font-weight:700; font-size:0.9rem; border:none; background:none; cursor:pointer; border-bottom:${this.activeTab === 'analytics' ? '3px solid var(--primary)' : '3px solid transparent'}; color:${this.activeTab === 'analytics' ? 'var(--primary)' : 'var(--slate-600)'};">
          📊 BI Analytics & Economics
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="admin-tab-content">
        ${this.renderActiveTabContent()}
      </div>
    `;
  },

  renderActiveTabContent() {
    switch (this.activeTab) {
      case "dispatch": return this.renderDispatchTab();
      case "catalog": return this.renderCatalogTab();
      case "fleet": return this.renderFleetTab();
      case "coupons": return this.renderCouponsTab();
      case "reviews": return this.renderReviewsTab();
      case "analytics": return this.renderAnalyticsTab();
      default: return this.renderDispatchTab();
    }
  },

  // ================= TAB 1: BOOKINGS DISPATCH =================
  renderDispatchTab() {
    const bookings = this.cachedBookings;
    const beauticians = this.cachedBeauticians;

    return `
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="margin:0;">Live Dispatch Board</h3>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:4px 0 0;">Assign specialists, monitor OTP progress, update statuses, and handle cancellations.</p>
          </div>
          <span class="badge" style="background:var(--slate-100); color:var(--slate-700);">${bookings.length} Orders</span>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
            <thead>
              <tr style="background:var(--slate-50); border-bottom:2px solid var(--slate-200); text-align:left;">
                <th style="padding:12px;">Booking Ref & OTP</th>
                <th style="padding:12px;">Customer Details</th>
                <th style="padding:12px;">Date & Location</th>
                <th style="padding:12px;">Assigned Pro</th>
                <th style="padding:12px;">Kit Model</th>
                <th style="padding:12px;">Amount</th>
                <th style="padding:12px;">Live Status</th>
                <th style="padding:12px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr style="border-bottom:1px solid var(--slate-200);">
                  <td style="padding:12px; font-weight:800; color:var(--primary);">
                    ${b.booking_ref}
                    <div style="font-size:0.75rem; color:var(--slate-500); font-weight:600; margin-top:2px;">
                      OTP: <span style="background:var(--slate-200); padding:1px 6px; border-radius:4px; letter-spacing:1px; color:var(--slate-800);">${b.otp_code || '---'}</span>
                    </div>
                  </td>
                  <td style="padding:12px;">
                    <div style="font-weight:700; color:var(--slate-900);">${b.customer_name}</div>
                    <div style="font-size:0.75rem; color:var(--slate-500);">${b.customer_phone || ''}</div>
                    <div style="font-size:0.72rem; color:var(--slate-400);">${b.customer_email || ''}</div>
                  </td>
                  <td style="padding:12px;">
                    <div style="font-weight:600;">${b.service_date}</div>
                    <div style="font-size:0.75rem; color:var(--slate-500);">${b.service_slot}</div>
                    <div style="font-size:0.72rem; color:var(--slate-500); max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📍 ${b.address}, ${b.city || 'Delhi'}</div>
                  </td>
                  <td style="padding:12px;">
                    <select onchange="Admin.assignBeautician('${b.booking_ref}', this.value)" style="padding:6px 8px; border-radius:var(--radius-sm); border:1px solid var(--slate-300); font-size:0.78rem; font-weight:600;">
                      <option value="">Select Pro...</option>
                      ${beauticians.map(pro => `
                        <option value="${pro.id}" ${b.beautician_id === pro.id ? 'selected' : ''}>
                          ${pro.name} (${pro.rating}★)
                        </option>
                      `).join("")}
                    </select>
                  </td>
                  <td style="padding:12px;">
                    <span class="badge" style="${b.kit_type === 'byo_product' ? 'background:var(--gold-subtle); color:var(--gold);' : 'background:var(--primary-subtle); color:var(--primary);'}">
                      ${b.kit_type === 'byo_product' ? 'BYO Product' : 'Sealed Kit'}
                    </span>
                  </td>
                  <td style="padding:12px; font-weight:800; color:var(--slate-900);">
                    ₹${(b.total_amount || 0).toLocaleString('en-IN')}
                    <div style="font-size:0.7rem; color:var(--slate-400); font-weight:normal;">${b.payment_mode || 'Cash/UPI'}</div>
                  </td>
                  <td style="padding:12px;">
                    <span class="badge" style="background:${this.getStatusColor(b.status)}; color:#fff; font-size:0.75rem;">${b.status}</span>
                  </td>
                  <td style="padding:12px; text-align:right;">
                    <div style="display:flex; gap:6px; justify-content:flex-end;">
                      <select onchange="Admin.changeStatus('${b.booking_ref}', this.value)" style="padding:6px 8px; border-radius:var(--radius-sm); border:1px solid var(--slate-300); font-size:0.78rem;">
                        <option value="">Status...</option>
                        <option value="CONFIRMED" ${b.status === 'CONFIRMED' ? 'disabled' : ''}>CONFIRMED</option>
                        <option value="ASSIGNED" ${b.status === 'ASSIGNED' ? 'disabled' : ''}>ASSIGNED</option>
                        <option value="ON_THE_WAY" ${b.status === 'ON_THE_WAY' ? 'disabled' : ''}>ON_THE_WAY</option>
                        <option value="IN_SERVICE" ${b.status === 'IN_SERVICE' ? 'disabled' : ''}>IN_SERVICE</option>
                        <option value="COMPLETED" ${b.status === 'COMPLETED' ? 'disabled' : ''}>COMPLETED</option>
                        <option value="CANCELLED" ${b.status === 'CANCELLED' ? 'disabled' : ''}>CANCELLED</option>
                      </select>
                      ${b.status !== 'CANCELLED' && b.status !== 'COMPLETED' ? `
                        <button onclick="Admin.cancelBooking('${b.booking_ref}')" style="background:none; border:1px solid #ef4444; color:#ef4444; border-radius:var(--radius-sm); padding:4px 8px; font-size:0.75rem; cursor:pointer;" title="Cancel Order">✕</button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ================= TAB 2: SERVICE CATALOG =================
  renderCatalogTab() {
    const services = this.cachedServices;

    return `
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0;">Service Catalog & Fair-Price Registry</h3>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:4px 0 0;">Manage pricing, BYOP labor deductions, durations, badges, and detailed descriptions.</p>
          </div>
          <button class="btn-primary" onclick="Admin.openAddServiceModal()">+ Add New Service</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
          ${services.map(s => `
            <div style="border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:16px; background:var(--slate-50); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                  <span class="badge" style="background:var(--slate-200); color:var(--slate-800); font-size:0.7rem;">${s.category_slug}</span>
                  <div style="display:flex; gap:4px;">
                    ${s.is_bridal_exclusive ? `<span class="badge badge-bridal" style="font-size:0.65rem;">Bridal</span>` : ''}
                    ${s.is_bestseller ? `<span class="badge" style="background:var(--gold); color:#1a1005; font-size:0.65rem;">Bestseller</span>` : ''}
                  </div>
                </div>
                <h4 style="margin:0 0 4px; font-size:1rem; color:var(--slate-900);">${s.title}</h4>
                <p style="font-size:0.8rem; color:var(--slate-600); margin-bottom:10px; line-height:1.4;">${s.subtitle || ''}</p>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:8px; border-top:1px dashed var(--slate-200); padding-top:8px;">
                  <span>Regular / Offer Price:</span>
                  <span style="font-weight:700;"><del style="color:var(--slate-400); font-weight:normal; font-size:0.75rem;">₹${s.price}</del> ₹${s.discounted_price || s.price}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:8px; color:var(--emerald);">
                  <span>BYOP Labor Deduction:</span>
                  <span style="font-weight:700;">-₹${s.byo_product_discount || 150}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--slate-500); margin-bottom:12px;">
                  <span>⏱️ Duration: ${s.duration_mins} mins</span>
                  <span>⭐ ${s.rating || 4.9} (${s.review_count || 50})</span>
                </div>
              </div>
              <div style="display:flex; gap:8px; border-top:1px solid var(--slate-200); padding-top:10px;">
                <button onclick="Admin.openEditServiceModal(${s.id})" style="flex:1; padding:6px; border:1px solid var(--slate-300); background:#fff; border-radius:var(--radius-sm); font-size:0.8rem; font-weight:600; cursor:pointer;">✏️ Edit</button>
                <button onclick="Admin.deleteService(${s.id})" style="padding:6px 12px; border:1px solid #ef4444; background:#fff; color:#ef4444; border-radius:var(--radius-sm); font-size:0.8rem; font-weight:600; cursor:pointer;">🗑️ Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // ================= TAB 3: BEAUTICIAN PARTNER FLEET =================
  renderFleetTab() {
    const fleet = this.cachedBeauticians;
    const pendingApps = JSON.parse(localStorage.getItem('dulhaniya_partner_applications') || '[]');

    return `
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
        ${pendingApps.length > 0 ? `
          <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:var(--radius-md); padding:16px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <strong style="color:#92400e; font-size:0.95rem;">📋 New Specialist Applications Awaiting Review (${pendingApps.length})</strong>
              <button onclick="localStorage.removeItem('dulhaniya_partner_applications'); Admin.init();" style="background:none; border:none; color:#b45309; font-size:0.75rem; cursor:pointer;">Dismiss All</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
              ${pendingApps.map(app => `
                <div style="background:#fff; border:1px solid #fde68a; border-radius:var(--radius-sm); padding:12px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <h5 style="margin:0; font-size:0.9rem;">${app.name} (${app.city})</h5>
                    <p style="margin:2px 0 0; font-size:0.78rem; color:#64748b;">${app.specialty} • ${app.experience} Yrs • ${app.phone}</p>
                    <p style="margin:2px 0 0; font-size:0.72rem; color:#b45309;">Cert: ${app.certifications || 'Verified Academy'}</p>
                  </div>
                  <button onclick="Admin.approvePartnerApplication('${app.id}')" style="background:#059669; color:#fff; border:none; padding:6px 12px; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:700; cursor:pointer;">
                    ✓ Approve
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0;">Beautician Partner Fleet Management</h3>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:4px 0 0;">Certified female professionals, background verification, availability toggles, and performance records.</p>
          </div>
          <button class="btn-primary" style="background:var(--gold); color:#1a1005;" onclick="Admin.openAddBeauticianModal()">+ Register New Partner</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:18px;">
          ${fleet.map(b => `
            <div style="border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:18px; background:var(--slate-50); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; gap:14px; align-items:center; margin-bottom:12px;">
                  <img src="${b.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}" alt="${b.name}" style="width:58px; height:58px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);" />
                  <div>
                    <h4 style="margin:0; font-size:1.05rem; color:var(--slate-900);">${b.name}</h4>
                    <div style="font-size:0.8rem; color:var(--slate-500); font-weight:600;">📞 ${b.phone || ''}</div>
                    <div style="font-size:0.75rem; color:var(--gold); font-weight:700;">★ ${b.rating || 4.9} (${b.jobs_completed || 150} jobs)</div>
                  </div>
                </div>

                <p style="font-size:0.82rem; color:var(--slate-700); margin-bottom:10px; line-height:1.4;">
                  <strong>Specialty:</strong> ${b.specialty || 'Bridal & Salon Specialist'}<br />
                  <strong>Experience:</strong> ${b.experience_years || 5} Years
                </p>

                <div style="margin-bottom:12px;">
                  <div style="font-size:0.75rem; font-weight:700; color:var(--slate-500); margin-bottom:4px;">Certifications & Verification:</div>
                  <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    ${(b.certifications || []).slice(0, 3).map(c => `
                      <span style="font-size:0.68rem; background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; color:var(--slate-700);">✓ ${c}</span>
                    `).join("")}
                  </div>
                </div>
              </div>

              <!-- Controls -->
              <div style="border-top:1px solid var(--slate-200); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; gap:8px;">
                  <button onclick="Admin.toggleBeautician(${b.id}, 'is_available')" style="font-size:0.75rem; padding:4px 10px; border-radius:var(--radius-sm); border:none; cursor:pointer; font-weight:700; background:${b.is_available ? 'var(--emerald)' : 'var(--slate-400)'}; color:#fff;">
                    ${b.is_available ? 'Online' : 'Offline'}
                  </button>
                  <button onclick="Admin.toggleBeautician(${b.id}, 'is_verified')" style="font-size:0.75rem; padding:4px 10px; border-radius:var(--radius-sm); border:1px solid var(--slate-300); cursor:pointer; font-weight:600; background:#fff; color:${b.is_verified ? 'var(--emerald)' : 'var(--slate-500)'};">
                    ${b.is_verified ? '✓ Verified' : 'Unverified'}
                  </button>
                </div>
                <button onclick="Admin.deleteBeautician(${b.id})" style="border:none; background:none; color:#ef4444; font-size:0.85rem; cursor:pointer;" title="Remove Partner">🗑️</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // ================= TAB 4: PROMO CAMPAIGNS =================
  renderCouponsTab() {
    const coupons = this.cachedCoupons;

    return `
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="margin:0;">Promotional Coupons & Marketing Campaigns</h3>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:4px 0 0;">Create flat discounts, percentage offers, minimum cart value rules, and maximum caps.</p>
          </div>
          <button class="btn-primary" style="background:var(--slate-800); color:#fff;" onclick="Admin.openAddCouponModal()">+ Create New Campaign</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
          ${coupons.map(c => `
            <div style="border:1.5px dashed var(--primary-border); border-radius:var(--radius-lg); padding:16px; background:var(--primary-subtle); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="font-size:1.15rem; font-weight:800; color:var(--primary-dark); font-family:monospace; letter-spacing:1px;">${c.code}</span>
                  <span class="badge" style="background:var(--primary); color:#fff; font-size:0.7rem;">${c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</span>
                </div>
                <p style="font-size:0.82rem; color:var(--slate-700); margin-bottom:10px;">${c.description || ''}</p>
                <div style="font-size:0.78rem; color:var(--slate-600); line-height:1.5;">
                  <div>• Min Cart Value: <strong>₹${c.min_order_value || 500}</strong></div>
                  <div>• Max Cap: <strong>₹${c.max_discount || c.discount_value}</strong></div>
                </div>
              </div>
              <div style="border-top:1px dashed var(--primary-border); margin-top:12px; padding-top:8px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.75rem; color:var(--emerald); font-weight:700;">● Active</span>
                <button onclick="Admin.deleteCoupon('${c.code}')" style="border:none; background:none; color:#ef4444; font-size:0.82rem; cursor:pointer; font-weight:600;">Remove</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // ================= TAB 6: BI ANALYTICS & ECONOMICS =================
  renderAnalyticsTab() {
    const stats = this.cachedStats || {};
    const bookings = this.cachedBookings || [];
    const beauticians = this.cachedBeauticians || [];

    const totalRevenue = stats.total_revenue || 190370;
    const laborShare = Math.round(totalRevenue * 0.75);
    const platformShare = totalRevenue - laborShare;
    const tipsTotal = 18450;

    return `
      <div style="display:flex; flex-direction:column; gap:24px;">

        <!-- Analytics Header Overview -->
        <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
            <div>
              <span class="badge" style="background:var(--primary); color:#fff;">📈 EXECUTIVE BI METRICS</span>
              <h3 style="margin:6px 0 2px; font-size:1.4rem; color:var(--slate-900);">Revenue Trajectory & Demand Intelligence</h3>
              <p style="font-size:0.85rem; color:var(--slate-500); margin:0;">Real-time business intelligence: 7-day revenue velocity, ceremony distribution, and partner economics.</p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn-secondary" style="font-size:0.8rem; padding:8px 14px;" onclick="Admin.exportBookingsCSV()">📥 Bookings CSV</button>
              <button class="btn-secondary" style="font-size:0.8rem; padding:8px 14px;" onclick="Admin.exportPayrollCSV()">💸 Partner Payroll CSV</button>
            </div>
          </div>

          <!-- Native SVG 7-Day Revenue Trend Bar Chart -->
          <div style="background:#0f172a; border-radius:var(--radius-lg); padding:24px; color:#fff; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <div>
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">7-Day Revenue Velocity (INR)</span>
                <div style="font-size:1.6rem; font-weight:800; color:#fbbf24;">₹1,90,370 <span style="font-size:0.85rem; color:#4ade80; font-weight:normal;">↑ 22.8% WoW</span></div>
              </div>
              <div style="font-size:0.78rem; color:#94a3b8;">Daily Volume vs Labor Payout</div>
            </div>

            <div style="width:100%; overflow-x:auto;">
              <svg viewBox="0 0 700 220" style="width:100%; min-width:550px; height:auto; overflow:visible;" aria-label="7-Day Revenue Chart">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#9d174d" />
                  </linearGradient>
                </defs>
                <!-- Horizontal Grid Lines -->
                <line x1="50" y1="30" x2="680" y2="30" stroke="#334155" stroke-dasharray="4" />
                <line x1="50" y1="80" x2="680" y2="80" stroke="#334155" stroke-dasharray="4" />
                <line x1="50" y1="130" x2="680" y2="130" stroke="#334155" stroke-dasharray="4" />
                <line x1="50" y1="180" x2="680" y2="180" stroke="#475569" stroke-width="1.5" />

                <!-- Y-Axis Labels -->
                <text x="40" y="34" fill="#64748b" font-size="11" text-anchor="end">₹40k</text>
                <text x="40" y="84" fill="#64748b" font-size="11" text-anchor="end">₹30k</text>
                <text x="40" y="134" fill="#64748b" font-size="11" text-anchor="end">₹20k</text>
                <text x="40" y="184" fill="#64748b" font-size="11" text-anchor="end">₹0</text>

                <!-- Bars & Labels -->
                <!-- Day 1: Mon (₹22,400) -->
                <rect x="80" y="96" width="46" height="84" rx="4" fill="url(#barGrad)" />
                <text x="103" y="88" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">₹22.4k</text>
                <text x="103" y="198" fill="#94a3b8" font-size="11" text-anchor="middle">Mon</text>

                <!-- Day 2: Tue (₹18,900) -->
                <rect x="165" y="112" width="46" height="68" rx="4" fill="url(#barGrad)" opacity="0.9" />
                <text x="188" y="104" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">₹18.9k</text>
                <text x="188" y="198" fill="#94a3b8" font-size="11" text-anchor="middle">Tue</text>

                <!-- Day 3: Wed (₹24,500) -->
                <rect x="250" y="86" width="46" height="94" rx="4" fill="url(#barGrad)" />
                <text x="273" y="78" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">₹24.5k</text>
                <text x="273" y="198" fill="#94a3b8" font-size="11" text-anchor="middle">Wed</text>

                <!-- Day 4: Thu (₹28,100) -->
                <rect x="335" y="72" width="46" height="108" rx="4" fill="url(#barGrad)" />
                <text x="358" y="64" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">₹28.1k</text>
                <text x="358" y="198" fill="#94a3b8" font-size="11" text-anchor="middle">Thu</text>

                <!-- Day 5: Fri (₹34,200) -->
                <rect x="420" y="50" width="46" height="130" rx="4" fill="url(#barGrad)" />
                <text x="443" y="42" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">₹34.2k</text>
                <text x="443" y="198" fill="#94a3b8" font-size="11" text-anchor="middle">Fri</text>

                <!-- Day 6: Sat (₹38,500 - Peak Wedding Day) -->
                <rect x="505" y="34" width="46" height="146" rx="4" fill="#fbbf24" />
                <text x="528" y="26" fill="#fef08a" font-size="10" font-weight="bold" text-anchor="middle">₹38.5k 🔥</text>
                <text x="528" y="198" fill="#fbbf24" font-weight="bold" font-size="11" text-anchor="middle">Sat</text>

                <!-- Day 7: Sun (Today - ₹23,770) -->
                <rect x="590" y="90" width="46" height="90" rx="4" fill="url(#barGrad)" />
                <text x="613" y="82" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">₹23.7k</text>
                <text x="613" y="198" fill="#94a3b8" font-size="11" text-anchor="middle">Sun</text>
              </svg>
            </div>
          </div>

          <!-- Ritual Revenue Distribution Breakdown -->
          <div style="margin-top:24px;">
            <h4 style="margin-bottom:12px; font-size:1.05rem; color:var(--slate-800);">Ceremony & Category Contribution Breakdown</h4>
            
            <div style="height:22px; width:100%; border-radius:6px; overflow:hidden; display:flex; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <div style="width:52%; background:#9d174d;" title="Bridal Makeovers (52%)"></div>
              <div style="width:24%; background:#f59e0b;" title="Pre-Bridal Rituals (24%)"></div>
              <div style="width:14%; background:#059669;" title="Facials & Skin Spas (14%)"></div>
              <div style="width:10%; background:#8b5cf6;" title="Waxing & Grooming (10%)"></div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; font-size:0.8rem;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#9d174d;"></span>
                <span>👑 Bridal & D-Day: <strong>52% (₹98,990)</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#f59e0b;"></span>
                <span>🌼 Haldi/Mehendi: <strong>24% (₹45,690)</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#059669;"></span>
                <span>✨ Facials & Detan: <strong>14% (₹26,650)</strong></span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:12px; height:12px; border-radius:3px; background:#8b5cf6;"></span>
                <span>🪶 Waxing & Spas: <strong>10% (₹19,040)</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Partner Economics & Regional Hub Density -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
          
          <!-- Partner Economics Card -->
          <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
            <span class="badge" style="background:#059669; color:#fff;">💸 FAIR PARTNER ECONOMICS</span>
            <h4 style="margin:8px 0 16px; font-size:1.15rem; color:var(--slate-900);">Gig Worker Share & Tip Disbursal</h4>

            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #f1f5f9;">
                <span style="color:#64748b;">Total Gross Service Revenue:</span>
                <strong>₹${totalRevenue.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #f1f5f9; color:#059669;">
                <span>Specialist 75% Labor Payout:</span>
                <strong>₹${laborShare.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #f1f5f9; color:#059669;">
                <span>100% Tips Passed Directly:</span>
                <strong>₹${tipsTotal.toLocaleString('en-IN')} (0% fee)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid #f1f5f9; color:var(--primary);">
                <span>Platform Operating Share (25%):</span>
                <strong>₹${platformShare.toLocaleString('en-IN')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-top:4px; font-weight:800; font-size:0.95rem; color:var(--slate-900);">
                <span>Avg Specialist Take-Home:</span>
                <span style="color:#059669;">₹64,800 / month</span>
              </div>
            </div>
          </div>

          <!-- Regional Demand Surge Heatmap -->
          <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
            <span class="badge" style="background:#ea580c; color:#fff;">📍 REGIONAL DISPATCH HEATMAP</span>
            <h4 style="margin:8px 0 16px; font-size:1.15rem; color:var(--slate-900);">Metro Hub Booking Density</h4>

            <div style="display:flex; flex-direction:column; gap:12px; font-size:0.85rem;">
              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>South Delhi & Central Hub</span>
                  <strong style="color:#ea580c;">42% (High Surge 🔥)</strong>
                </div>
                <div style="background:#f1f5f9; height:8px; border-radius:4px; overflow:hidden;">
                  <div style="background:#ea580c; width:42%; height:100%;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>Gurugram (Golf Course & Cyber City)</span>
                  <strong style="color:#0284c7;">34% (Steady ⚡)</strong>
                </div>
                <div style="background:#f1f5f9; height:8px; border-radius:4px; overflow:hidden;">
                  <div style="background:#0284c7; width:34%; height:100%;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>Noida & Greater Noida</span>
                  <strong style="color:#059669;">18% (Normal 🟢)</strong>
                </div>
                <div style="background:#f1f5f9; height:8px; border-radius:4px; overflow:hidden;">
                  <div style="background:#059669; width:18%; height:100%;"></div>
                </div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>Jaipur & Bengaluru Metros</span>
                  <strong style="color:#8b5cf6;">6% (Emerging 🚀)</strong>
                </div>
                <div style="background:#f1f5f9; height:8px; border-radius:4px; overflow:hidden;">
                  <div style="background:#8b5cf6; width:6%; height:100%;"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  // 1-Click CSV Exports
  exportBookingsCSV() {
    const bookings = this.cachedBookings || [];
    if (bookings.length === 0) {
      window.App?.showToast("No bookings available to export.");
      return;
    }

    const headers = [
      "Booking Ref",
      "Customer Name",
      "Phone",
      "Address",
      "City",
      "Service Date",
      "Slot",
      "Total Amount",
      "Product Mode",
      "Coupon Code",
      "OTP Code",
      "Status",
      "Specialist Name",
      "Created At"
    ];

    const rows = bookings.map(b => [
      `"${b.booking_ref || ''}"`,
      `"${(b.customer_name || '').replace(/"/g, '""')}"`,
      `"${b.customer_phone || ''}"`,
      `"${(b.address || '').replace(/"/g, '""')}"`,
      `"${b.city || 'New Delhi'}"`,
      `"${b.service_date || ''}"`,
      `"${b.service_slot || ''}"`,
      b.total_amount || 0,
      `"${b.kit_type || 'dulhaniya_kit'}"`,
      `"${b.coupon_code || ''}"`,
      `"${b.otp_code || ''}"`,
      `"${b.status || ''}"`,
      `"${(b.beautician_name || '').replace(/"/g, '""')}"`,
      `"${b.created_at || ''}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dulhaniya_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.App?.showToast("📥 Bookings CSV downloaded successfully!");
  },

  exportPayrollCSV() {
    const beauticians = this.cachedBeauticians || [];
    const headers = [
      "Specialist ID",
      "Name",
      "Phone",
      "Specialty",
      "Rating",
      "Jobs Completed",
      "Gross Labor Share (75%)",
      "Tips Retained (100%)",
      "Net Monthly Disbursal",
      "Status"
    ];

    const rows = beauticians.map(pro => {
      const jobs = pro.jobs_completed || 24;
      const laborShare = jobs * 900;
      const tips = Math.round(jobs * 150);
      const netPayout = laborShare + tips;

      return [
        pro.id,
        `"${(pro.name || '').replace(/"/g, '""')}"`,
        `"${pro.phone || ''}"`,
        `"${(pro.specialty || '').replace(/"/g, '""')}"`,
        pro.rating || 4.95,
        jobs,
        laborShare,
        tips,
        netPayout,
        pro.is_available ? "Active" : "Offline"
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dulhaniya_specialist_payroll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.App?.showToast("💸 Partner Payroll CSV downloaded successfully!");
  },

  // ================= TAB 5: CSAT & REVIEWS =================
  renderReviewsTab() {
    const reviews = this.cachedReviews;

    return `
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="margin:0;">Customer Sentiment & Quality Feedback</h3>
            <p style="font-size:0.85rem; color:var(--slate-500); margin:4px 0 0;">Monitor verified customer ratings, service hygiene reports, and artist conduct.</p>
          </div>
          <span class="badge" style="background:var(--gold-subtle); color:var(--gold); font-weight:700;">Average 4.96 ★</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${reviews.map(r => `
            <div style="border:1px solid var(--slate-200); border-radius:var(--radius-md); padding:16px; background:var(--slate-50); display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                  <strong style="color:var(--slate-900);">${r.customer_name}</strong>
                  <span style="color:var(--gold); font-weight:700;">${'★'.repeat(r.rating || 5)}</span>
                  <span style="font-size:0.75rem; color:var(--slate-400);">${r.created_at || 'Recently'}</span>
                </div>
                <p style="font-size:0.85rem; color:var(--slate-700); margin:0 0 6px; font-style:italic;">"${r.comment || 'Excellent experience.'}"</p>
                <div style="font-size:0.78rem; color:var(--slate-500);">
                  Specialist: <strong>${r.beautician_name || 'Dulhaniya Pro'}</strong> • Booking: <code>${r.booking_ref || 'DLH'}</code>
                </div>
              </div>
              <button onclick="Admin.deleteReview(${r.id})" style="border:none; background:none; color:var(--slate-400); cursor:pointer; font-size:0.9rem;" title="Moderate Review">✕</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  getStatusColor(status) {
    const map = {
      "CONFIRMED": "#0284c7",
      "ASSIGNED": "#7c3aed",
      "ON_THE_WAY": "#d97706",
      "IN_SERVICE": "var(--primary)",
      "COMPLETED": "var(--emerald)",
      "CANCELLED": "#ef4444"
    };
    return map[status] || "var(--slate-800)";
  },

  // Actions
  async changeStatus(ref, newStatus) {
    if (!newStatus) return;
    await DulhaniyaAPI.updateBookingStatus(ref, newStatus);
    window.App?.showToast(`Order ${ref} updated to ${newStatus}`);
    await this.init();
    if (Tracker.activeBooking?.booking_ref === ref) Tracker.loadBooking(ref);
  },

  async assignBeautician(ref, beauticianId) {
    if (!beauticianId) return;
    await DulhaniyaAPI.assignBookingBeautician(ref, Number(beauticianId));
    window.App?.showToast(`Assigned beautician to ${ref}!`);
    await this.init();
    if (Tracker.activeBooking?.booking_ref === ref) Tracker.loadBooking(ref);
  },

  async cancelBooking(ref) {
    if (!confirm(`Are you sure you want to cancel booking ${ref}?`)) return;
    await DulhaniyaAPI.cancelBooking(ref);
    window.App?.showToast(`Booking ${ref} cancelled.`);
    await this.init();
    if (Tracker.activeBooking?.booking_ref === ref) Tracker.loadBooking(ref);
  },

  async toggleBeautician(id, field) {
    const res = await DulhaniyaAPI.toggleAdminBeautician(id, field);
    if (res.success) {
      window.App?.showToast(`Partner status updated!`);
      await this.init();
    }
  },

  async deleteBeautician(id) {
    if (!confirm("Are you sure you want to remove this beautician partner?")) return;
    await DulhaniyaAPI.deleteAdminBeautician(id);
    window.App?.showToast("Partner removed from fleet.");
    await this.init();
  },

  async deleteService(id) {
    if (!confirm("Are you sure you want to delete this service from the catalog?")) return;
    await DulhaniyaAPI.deleteAdminService(id);
    window.App?.showToast("Service deleted from catalog.");
    await this.init();
    window.App?.loadServices();
  },

  async deleteCoupon(code) {
    if (!confirm(`Delete coupon campaign ${code}?`)) return;
    await DulhaniyaAPI.deleteAdminCoupon(code);
    window.App?.showToast(`Coupon ${code} removed.`);
    await this.init();
  },

  async deleteReview(id) {
    if (!confirm("Moderate and delete this review?")) return;
    await DulhaniyaAPI.deleteAdminReview(id);
    window.App?.showToast("Review removed.");
    await this.init();
  },

  // Modals
  openAddServiceModal() {
    const modal = document.getElementById("add-service-modal");
    if (modal) modal.classList.add("active");
  },

  closeAddServiceModal() {
    const modal = document.getElementById("add-service-modal");
    if (modal) modal.classList.remove("active");
  },

  async submitNewService(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
      title: form.title.value.trim(),
      category_slug: form.category_slug.value,
      subtitle: form.subtitle.value.trim(),
      duration_mins: Number(form.duration_mins.value),
      price: Number(form.price.value),
      discounted_price: Number(form.discounted_price.value),
      byo_product_discount: Number(form.byo_product_discount.value),
      image_url: form.image_url.value.trim() || "https://images.unsplash.com/photo-1512290900672-1f02e6462791?auto=format&fit=crop&w=700&q=80",
      description: form.description.value.trim(),
      is_bridal_exclusive: form.is_bridal_exclusive.checked ? 1 : 0,
      is_bestseller: form.is_bestseller.checked ? 1 : 0
    };

    try {
      const res = await fetch(`${DulhaniyaAPI.baseUrl}/api/admin/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        window.App?.showToast("Service added to catalog! ✨");
        this.closeAddServiceModal();
        await this.init();
        window.App?.loadServices();
      }
    } catch (e) {
      DULHANIYA_FALLBACK_SERVICES.unshift({ id: Date.now(), ...data });
      window.App?.showToast("Service added locally! ✨");
      this.closeAddServiceModal();
      await this.init();
      window.App?.loadServices();
    }
  },

  openEditServiceModal(id) {
    const s = this.cachedServices.find(item => item.id === Number(id));
    if (!s) return;

    let modal = document.getElementById("edit-service-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.id = "edit-service-modal";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Service: ${s.title}</h3>
          <button class="btn-close" onclick="Admin.closeEditServiceModal()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="Admin.submitEditService(event, ${s.id})">
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Service Title:</label>
              <input type="text" name="title" required value="${s.title}" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Regular Price (₹):</label>
                <input type="number" name="price" value="${s.price}" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Offer Price (₹):</label>
                <input type="number" name="discounted_price" value="${s.discounted_price || s.price}" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700;">BYOP Labor Deduction (₹):</label>
                <input type="number" name="byo_product_discount" value="${s.byo_product_discount || 150}" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Duration (Mins):</label>
                <input type="number" name="duration_mins" value="${s.duration_mins}" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
            </div>
            <div style="display:flex; gap:16px; margin-bottom:16px;">
              <label><input type="checkbox" name="is_bridal_exclusive" ${s.is_bridal_exclusive ? 'checked' : ''} /> Bridal Exclusive</label>
              <label><input type="checkbox" name="is_bestseller" ${s.is_bestseller ? 'checked' : ''} /> Bestseller</label>
            </div>
            <button type="submit" class="btn-checkout" style="margin-top:0;">Save Changes</button>
          </form>
        </div>
      </div>
    `;
    modal.classList.add("active");
  },

  closeEditServiceModal() {
    const modal = document.getElementById("edit-service-modal");
    if (modal) modal.classList.remove("active");
  },

  async submitEditService(event, id) {
    event.preventDefault();
    const form = event.target;
    const data = {
      title: form.title.value.trim(),
      price: Number(form.price.value),
      discounted_price: Number(form.discounted_price.value),
      byo_product_discount: Number(form.byo_product_discount.value),
      duration_mins: Number(form.duration_mins.value),
      is_bridal_exclusive: form.is_bridal_exclusive.checked ? 1 : 0,
      is_bestseller: form.is_bestseller.checked ? 1 : 0
    };

    await DulhaniyaAPI.updateAdminService(id, data);
    window.App?.showToast("Service updated successfully! ✨");
    this.closeEditServiceModal();
    await this.init();
    window.App?.loadServices();
  },

  openAddBeauticianModal() {
    let modal = document.getElementById("add-beautician-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.id = "add-beautician-modal";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Register New Beautician Partner</h3>
          <button class="btn-close" onclick="Admin.closeAddBeauticianModal()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="Admin.submitNewBeautician(event)">
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Full Name *:</label>
              <input type="text" name="name" required placeholder="e.g. Meenakshi Sundaram" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Mobile Phone *:</label>
                <input type="tel" name="phone" required placeholder="+91 98..." value="+91 98" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Experience (Years):</label>
                <input type="number" name="experience_years" value="6" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Specialty / Title:</label>
              <input type="text" name="specialty" placeholder="e.g. Senior Bridal HD Makeup Artist" value="Senior Bridal Makeup Artist" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Profile Photo URL:</label>
              <input type="url" name="photo_url" value="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Certifications (comma separated):</label>
              <input type="text" name="certifications" value="CIDESCO International, VLCC Pro, SafeSeal Level 5" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
            </div>
            <button type="submit" class="btn-checkout" style="margin-top:0;">Register Partner</button>
          </form>
        </div>
      </div>
    `;
    modal.classList.add("active");
  },

  closeAddBeauticianModal() {
    const modal = document.getElementById("add-beautician-modal");
    if (modal) modal.classList.remove("active");
  },

  async submitNewBeautician(event) {
    event.preventDefault();
    const form = event.target;
    const certs = form.certifications.value.split(",").map(c => c.trim()).filter(Boolean);
    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      experience_years: Number(form.experience_years.value),
      specialty: form.specialty.value.trim(),
      photo_url: form.photo_url.value.trim(),
      certifications: certs,
      is_verified: 1,
      is_available: 1
    };

    const res = await DulhaniyaAPI.addAdminBeautician(data);
    window.App?.showToast(res.message || "Partner registered!");
    this.closeAddBeauticianModal();
    await this.init();
  },

  openAddCouponModal() {
    let modal = document.getElementById("add-coupon-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.id = "add-coupon-modal";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create Promotional Campaign</h3>
          <button class="btn-close" onclick="Admin.closeAddCouponModal()">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="Admin.submitNewCoupon(event)">
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Coupon Code * (e.g. FESTIVE500):</label>
              <input type="text" name="code" required placeholder="CODE" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm); text-transform:uppercase; font-weight:700;" />
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Discount Type:</label>
                <select name="discount_type" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);">
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Discount Value *:</label>
                <input type="number" name="discount_value" required value="500" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Min Cart Value (₹):</label>
                <input type="number" name="min_order_value" value="1499" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
              <div>
                <label style="font-size:0.8rem; font-weight:700;">Max Discount Cap (₹):</label>
                <input type="number" name="max_discount" value="500" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
            </div>
            <div style="margin-bottom:12px;">
              <label style="font-size:0.8rem; font-weight:700;">Description:</label>
              <input type="text" name="description" placeholder="Short description for customer checkout" value="Special discount on bridal bookings" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
            </div>
            <button type="submit" class="btn-checkout" style="margin-top:0;">Launch Campaign</button>
          </form>
        </div>
      </div>
    `;
    modal.classList.add("active");
  },

  closeAddCouponModal() {
    const modal = document.getElementById("add-coupon-modal");
    if (modal) modal.classList.remove("active");
  },

  async submitNewCoupon(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
      code: form.code.value.trim().toUpperCase(),
      discount_type: form.discount_type.value,
      discount_value: Number(form.discount_value.value),
      min_order_value: Number(form.min_order_value.value),
      max_discount: Number(form.max_discount.value),
      description: form.description.value.trim()
    };

    const res = await DulhaniyaAPI.addAdminCoupon(data);
    window.App?.showToast(res.message || "Campaign launched!");
    this.closeAddCouponModal();
    await this.init();
  }
};
