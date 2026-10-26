/**
 * Dulhaniya - Admin Operations & Service Catalog Manager
 * Control room for revenue stats, bookings dispatch, and catalog updates.
 */

const Admin = {
  async init() {
    this.renderAdminView();
  },

  async renderAdminView() {
    const container = document.getElementById("admin-portal-content");
    if (!container) return;

    const stats = await DulhaniyaAPI.getAdminStats();

    // Fetch all bookings
    let bookings = [];
    try {
      const res = await fetch(`${DulhaniyaAPI.baseUrl}/api/bookings`);
      if (res.ok) {
        const data = await res.json();
        bookings = data.bookings;
      }
    } catch (e) {
      console.warn("Using local bookings for admin");
    }

    if (bookings.length === 0) {
      const demoRef = localStorage.getItem("dulhaniya_active_ref") || "DLH-9842";
      const b = await DulhaniyaAPI.getBooking(demoRef);
      if (b) bookings = [b];
    }

    container.innerHTML = `
      <div class="portal-header">
        <div>
          <h2>Dulhaniya Executive Operations Room</h2>
          <p style="color:var(--slate-600); font-size:0.9rem;">
            Real-time control center for salon-at-home and bridal bookings across all cities.
          </p>
        </div>
        <div>
          <button class="btn-primary" onclick="Admin.openAddServiceModal()">+ Add New Service</button>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="portal-grid-stats">
        <div class="stat-card">
          <div class="stat-card-title">Gross Revenue (GMV)</div>
          <div class="stat-card-value" style="color:var(--primary-dark);">₹${(stats.total_revenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Total Bookings</div>
          <div class="stat-card-value">${stats.total_bookings || bookings.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Active Field Orders</div>
          <div class="stat-card-value" style="color:#0284c7;">${stats.active_orders || 1}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Average CSAT Rating</div>
          <div class="stat-card-value" style="color:var(--gold);">${stats.avg_rating || 4.96} ★</div>
        </div>
      </div>

      <!-- Bookings Dispatch Table -->
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3>Bookings Dispatch & Customer Orders</h3>
          <span style="font-size:0.85rem; color:var(--slate-500);">${bookings.length} Total Appointments</span>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
            <thead>
              <tr style="background:var(--slate-50); border-bottom:2px solid var(--slate-200); text-align:left;">
                <th style="padding:12px;">Booking Ref</th>
                <th style="padding:12px;">Customer</th>
                <th style="padding:12px;">Slot & City</th>
                <th style="padding:12px;">Assigned Pro</th>
                <th style="padding:12px;">Kit Model</th>
                <th style="padding:12px;">Amount</th>
                <th style="padding:12px;">Status</th>
                <th style="padding:12px;">Change Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr style="border-bottom:1px solid var(--slate-200);">
                  <td style="padding:12px; font-weight:800; color:var(--primary);">
                    ${b.booking_ref}
                    <div style="font-size:0.72rem; color:var(--slate-400);">OTP: ${b.otp_code || '---'}</div>
                  </td>
                  <td style="padding:12px;">
                    <div style="font-weight:600;">${b.customer_name}</div>
                    <div style="font-size:0.75rem; color:var(--slate-500);">${b.customer_phone || ''}</div>
                  </td>
                  <td style="padding:12px;">
                    <div>${b.service_date}</div>
                    <div style="font-size:0.75rem; color:var(--slate-500);">${b.service_slot} (${b.city || 'Delhi'})</div>
                  </td>
                  <td style="padding:12px; font-weight:500;">
                    ${b.beautician_name || 'Pooja Sharma'}
                  </td>
                  <td style="padding:12px;">
                    <span class="badge" style="${b.kit_type === 'byo_product' ? 'background:var(--gold-subtle); color:var(--gold);' : 'background:var(--primary-subtle); color:var(--primary);'}">
                      ${b.kit_type === 'byo_product' ? 'BYO Product' : 'Sealed Kit'}
                    </span>
                  </td>
                  <td style="padding:12px; font-weight:700;">
                    ₹${(b.total_amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style="padding:12px;">
                    <span class="badge" style="background:var(--slate-800); color:#fff;">${b.status}</span>
                  </td>
                  <td style="padding:12px;">
                    <select onchange="Admin.changeStatus('${b.booking_ref}', this.value)" style="padding:6px 10px; border-radius:var(--radius-sm); border:1px solid var(--slate-300); font-size:0.8rem;">
                      <option value="">Update...</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="ON_THE_WAY">ON_THE_WAY</option>
                      <option value="IN_SERVICE">IN_SERVICE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async changeStatus(ref, newStatus) {
    if (!newStatus) return;
    await DulhaniyaAPI.updateBookingStatus(ref, newStatus);
    window.App?.showToast(`Order ${ref} updated to ${newStatus}`);
    await this.renderAdminView();
    if (Tracker.activeBooking?.booking_ref === ref) {
      Tracker.loadBooking(ref);
    }
  },

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
        window.App?.loadServices();
      }
    } catch (e) {
      // Local fallback
      DULHANIYA_FALLBACK_SERVICES.unshift({ id: Date.now(), ...data });
      window.App?.showToast("Service added to local catalog! ✨");
      this.closeAddServiceModal();
      window.App?.loadServices();
    }
  }
};
