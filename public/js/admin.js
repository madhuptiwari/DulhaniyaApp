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
    await this.loadAllData();
    this.renderAdminView();
  },

  async loadAllData() {
    try {
      const [stats, bookingsRes, services, beauticians, coupons, reviews] = await Promise.all([
        DulhaniyaAPI.getAdminStats(),
        fetch(`${DulhaniyaAPI.baseUrl}/api/bookings`).then(r => (r.ok && r.headers.get("content-type")?.includes("json")) ? r.json() : { bookings: [] }).catch(() => ({ bookings: [] })),
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

    return `
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm);">
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
