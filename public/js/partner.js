/**
 * Dulhaniya - Partner / Beautician Service Portal
 * Manage incoming orders, OTP verification, hygiene checklist and earnings.
 */

const Partner = {
  currentBeautician: {
    name: "Pooja Sharma",
    phone: "+91 98112 34567",
    rating: 4.98,
    todayEarnings: 4250,
    jobsDoneToday: 3
  },

  async init() {
    this.renderPortal();
  },

  async renderPortal() {
    const container = document.getElementById("partner-portal-content");
    if (!container) return;

    // Load active bookings
    let bookings = [];
    try {
      const res = await fetch(`${DulhaniyaAPI.baseUrl}/api/bookings`);
      if (res.ok) {
        const data = await res.json();
        bookings = data.bookings;
      }
    } catch (e) {
      console.warn("Using local partner bookings");
    }

    if (bookings.length === 0) {
      const activeRef = localStorage.getItem("dulhaniya_active_ref") || "DLH-9842";
      const b = await DulhaniyaAPI.getBooking(activeRef);
      if (b) bookings = [b];
    }

    container.innerHTML = `
      <div class="portal-header">
        <div>
          <h2>Partner Portal: ${this.currentBeautician.name}</h2>
          <p style="color:var(--slate-600); font-size:0.9rem;">
            Verified Dulhaniya Bridal Specialist • Phone: ${this.currentBeautician.phone}
          </p>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-bridal" style="font-size:0.85rem;">Online & Active</span>
          <div style="font-weight:700; color:var(--emerald); margin-top:4px;">Rating: 4.98 ★ (1,420 Jobs)</div>
        </div>
      </div>

      <div class="portal-grid-stats">
        <div class="stat-card">
          <div class="stat-card-title">Today's Earnings</div>
          <div class="stat-card-value" style="color:var(--primary-dark);">₹${this.currentBeautician.todayEarnings.toLocaleString('en-IN')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Services Completed Today</div>
          <div class="stat-card-value">${this.currentBeautician.jobsDoneToday}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Hygiene & Safety Rating</div>
          <div class="stat-card-value" style="color:var(--emerald);">100%</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-title">Upcoming Appointments</div>
          <div class="stat-card-value">${bookings.length}</div>
        </div>
      </div>

      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
        <h3 style="margin-bottom:16px;">Assigned Service Appointments</h3>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${bookings.map(b => `
            <div style="border:1px solid var(--slate-200); border-radius:var(--radius-md); padding:18px; background:var(--slate-50);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div>
                  <span style="font-weight:800; color:var(--primary); font-size:1.1rem;">${b.booking_ref}</span>
                  <span class="badge" style="background:var(--slate-800); color:#fff; margin-left:8px;">${b.status}</span>
                  <h4 style="margin-top:6px; color:var(--slate-900);">${b.customer_name} • ${b.customer_phone || ''}</h4>
                  <p style="font-size:0.85rem; color:var(--slate-600); margin-top:2px;">📍 ${b.address}, ${b.city || ''}</p>
                  <p style="font-size:0.82rem; color:var(--slate-500); margin-top:2px;">⏰ Slot: ${b.service_date} (${b.service_slot})</p>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:1.25rem; font-weight:800; color:var(--slate-900);">₹${(b.total_amount || 0).toLocaleString('en-IN')}</div>
                  <div style="font-size:0.75rem; color:var(--slate-500);">${b.payment_mode || 'Pay After Service'}</div>
                </div>
              </div>

              <!-- Partner Workflow Actions -->
              <div style="display:flex; gap:10px; flex-wrap:wrap; border-top:1px dashed var(--slate-300); padding-top:14px; margin-top:8px;">
                ${b.status === "CONFIRMED" || b.status === "ASSIGNED" ? `
                  <button class="btn-primary" style="font-size:0.82rem; padding:8px 16px;" onclick="Partner.updateStatus('${b.booking_ref}', 'ON_THE_WAY')">
                    🚗 Start Journey (On The Way)
                  </button>
                ` : ''}

                ${b.status === "ON_THE_WAY" ? `
                  <div style="display:flex; align-items:center; gap:8px;">
                    <input type="text" id="partner-otp-${b.booking_ref}" placeholder="Customer 4-digit OTP" maxlength="4" style="padding:8px 12px; border:1px solid var(--slate-300); border-radius:var(--radius-sm); font-size:0.85rem; width:160px; font-weight:700; text-align:center;" />
                    <button class="btn-primary" style="font-size:0.82rem; padding:8px 16px;" onclick="Partner.verifyStartOtp('${b.booking_ref}')">
                      ✨ Verify OTP & Start Service
                    </button>
                  </div>
                ` : ''}

                ${b.status === "IN_SERVICE" ? `
                  <button class="btn-primary" style="background:var(--emerald); color:#fff; font-size:0.82rem; padding:8px 16px;" onclick="Partner.updateStatus('${b.booking_ref}', 'COMPLETED')">
                    ✓ Mark Completed & Collect Payment
                  </button>
                ` : ''}

                ${b.status === "COMPLETED" ? `
                  <div style="color:var(--emerald); font-weight:700; font-size:0.88rem; display:flex; align-items:center; gap:6px;">
                    ✓ Service successfully fulfilled! Payment recorded.
                  </div>
                ` : ''}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Partner Hygiene Standards Pledge -->
      <div style="background:var(--slate-100); border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:20px;">
        <h4 style="margin-bottom:8px; color:var(--slate-800);">🛡️ Mandatory Dulhaniya Safety & Hygiene Checklist</h4>
        <ul style="font-size:0.85rem; color:var(--slate-600); display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:10px; list-style:none;">
          <li>✓ Wear sanitized face mask and disposable nitryl gloves</li>
          <li>✓ Open sealed tamper-proof mono-cartridge kit in front of the customer</li>
          <li>✓ Lay down fresh biodegradable disposable bedsheet & customer cape</li>
          <li>✓ Sanitize stainless steel tools in UV/Alcohol sterilizer</li>
        </ul>
      </div>
    `;
  },

  async updateStatus(ref, status) {
    await DulhaniyaAPI.updateBookingStatus(ref, status);
    window.App?.showToast(`Status updated to ${status}`);
    await this.renderPortal();
    // Also notify tracker if active
    if (Tracker.activeBooking?.booking_ref === ref) {
      Tracker.loadBooking(ref);
    }
  },

  async verifyStartOtp(ref) {
    const input = document.getElementById(`partner-otp-${ref}`);
    if (!input || !input.value) {
      window.App?.showToast("Please enter the customer's 4-digit OTP code");
      return;
    }
    const res = await DulhaniyaAPI.verifyOtp(ref, input.value.trim());
    if (res.success) {
      window.App?.showToast("OTP Verified! Safe service timer started.");
      await this.renderPortal();
      if (Tracker.activeBooking?.booking_ref === ref) {
        Tracker.loadBooking(ref);
      }
    } else {
      window.App?.showToast(res.error || "Incorrect OTP");
    }
  }
};
