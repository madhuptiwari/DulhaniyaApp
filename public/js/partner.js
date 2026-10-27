/**
 * Dulhaniya - Partner / Beautician Service Portal
 * Manage incoming orders, OTP verification, hygiene checklist and earnings.
 */

const Partner = {
  activeJobsTab: "active", // 'active', 'completed'
  currentBeautician: {
    name: "Pooja Sharma",
    phone: "+91 98112 34567",
    rating: 4.98,
    todayEarnings: 4250,
    jobsDoneToday: 3,
    weeklyEarnings: 28400,
    isOnline: true
  },

  async init() {
    // Check if user is logged in as partner
    const currentUser = DulhaniyaAPI.getCurrentUser();
    if (currentUser && currentUser.role === "partner") {
      this.currentBeautician.name = currentUser.name;
      this.currentBeautician.phone = currentUser.phone || this.currentBeautician.phone;
      if (currentUser.specialty) this.currentBeautician.specialty = currentUser.specialty;
    }

    // Subscribe to partner duty changes
    if (!this._dutyBound) {
      window.addEventListener("dulhaniya_partner_duty_changed", (e) => {
        this.currentBeautician.isOnline = e.detail.is_online;
        this.renderPortal();
      });
      window.addEventListener("dulhaniya_status_changed", () => {
        this.renderPortal();
      });
      this._dutyBound = true;
    }

    await this.loadPartnerData();
    await this.renderPortal();
  },

  async loadPartnerData() {
    try {
      const data = await DulhaniyaAPI.getPartnerDashboard();
      if (data && data.partner) {
        this.currentBeautician.name = data.partner.name || this.currentBeautician.name;
        this.currentBeautician.phone = data.partner.phone || this.currentBeautician.phone;
        this.currentBeautician.rating = data.partner.rating || 4.98;
        this.currentBeautician.todayEarnings = data.partner.today_earnings || 4250;
        this.currentBeautician.todayGmv = data.partner.today_gmv || 5666;
        this.currentBeautician.jobsDoneToday = data.partner.today_jobs_completed || 3;
        this.currentBeautician.weeklyEarnings = data.partner.weekly_earnings || 28400;
        this.currentBeautician.isOnline = data.partner.is_online !== false;
      }
    } catch (e) {
      console.warn("Using offline partner stats", e);
    }
  },

  async toggleDuty(checked) {
    const res = await DulhaniyaAPI.togglePartnerDuty();
    this.currentBeautician.isOnline = res.is_online;
    window.App?.showToast(res.is_online ? "🟢 You are now ONLINE & ready for dispatches!" : "⚪ You are now OFFLINE (Resting)");
    await this.renderPortal();
  },

  switchJobsTab(tab) {
    this.activeJobsTab = tab;
    this.renderPortal();
  },

  async renderPortal() {
    const container = document.getElementById("partner-portal-content");
    if (!container) return;

    // Load jobs
    let bookings = [];
    try {
      bookings = await DulhaniyaAPI.getPartnerJobs();
    } catch (e) {
      console.warn("Using local partner bookings");
    }

    if (!bookings || bookings.length === 0) {
      const activeRef = localStorage.getItem("dulhaniya_active_ref") || "DLH-9842";
      const b = await DulhaniyaAPI.getBooking(activeRef);
      if (b) bookings = [b];
    }

    const activeBookings = bookings.filter(b => ['CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_SERVICE'].includes(b.status));
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
    const isOnline = this.currentBeautician.isOnline;

    container.innerHTML = `
      <!-- Partner Profile & Real-Time Duty Switch Bar -->
      <div class="partner-top-dashboard-card" style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:800; border:3px solid var(--gold-border); box-shadow:var(--shadow-sm);">
              ${(this.currentBeautician.name || "P")[0]}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h2 style="margin:0; font-family:'Playfair Display',serif; color:var(--slate-900);">${this.currentBeautician.name}</h2>
                <span class="badge badge-bridal" style="font-size:0.75rem;">Verified Pro Specialist</span>
                <span class="badge" style="background:#059669; color:#fff; font-size:0.75rem;">🛡️ Police Background Verified 2026</span>
              </div>
              <p style="color:var(--slate-600); font-size:0.85rem; margin-top:3px;">
                📞 ${this.currentBeautician.phone} • ${this.currentBeautician.specialty || 'Senior Bridal & Ayurvedic Specialist'}
              </p>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:4px;">
                <span style="font-weight:700; color:var(--gold); font-size:0.85rem;">
                  ★ ${this.currentBeautician.rating} Rating (1,420 5-Star Reviews) • 100% Hygiene Score
                </span>
                <span style="font-size:0.75rem; background:var(--primary-subtle); color:var(--primary-dark); padding:2px 8px; border-radius:12px; font-weight:700;">
                  📍 ${this.currentBeautician.hub || 'Regional Hub: South Delhi / Bengaluru Hub'}
                </span>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
                <span style="font-size:0.7rem; background:#f1f5f9; color:#334155; padding:2px 7px; border-radius:4px; border:1px solid #cbd5e1;">🎓 CIDESCO International Diploma</span>
                <span style="font-size:0.7rem; background:#f1f5f9; color:#334155; padding:2px 7px; border-radius:4px; border:1px solid #cbd5e1;">🌿 Kottakkal Ayurvedic & VLCC Master Certified</span>
                <span style="font-size:0.7rem; background:#ecfdf5; color:#047857; padding:2px 7px; border-radius:4px; border:1px solid #a7f3d0;">✨ SafeSeal™ Single-Use Sterile Kit Master</span>
              </div>
            </div>
          </div>

          <!-- Real-Time Duty Toggle Control -->
          <div style="background:var(--slate-50); border:1.5px solid ${isOnline ? 'var(--emerald)' : 'var(--slate-300)'}; border-radius:var(--radius-lg); padding:12px 18px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm);">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="${isOnline ? 'pulse-dot' : ''}" style="width:12px; height:12px; border-radius:50%; background:${isOnline ? 'var(--emerald)' : 'var(--slate-400)'}; display:inline-block;"></span>
              <div>
                <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:${isOnline ? 'var(--emerald)' : 'var(--slate-600)'};">
                  ${isOnline ? 'ONLINE & DISPATCHING' : 'OFFLINE (RESTING)'}
                </div>
                <div style="font-size:0.72rem; color:var(--slate-500);">
                  ${isOnline ? 'Receiving bridal requests' : 'Tap switch to go online'}
                </div>
              </div>
            </div>

            <!-- Custom Toggle Switch -->
            <label style="position:relative; display:inline-block; width:52px; height:28px; cursor:pointer;">
              <input type="checkbox" id="partner-duty-toggle" ${isOnline ? 'checked' : ''} onchange="Partner.toggleDuty(this.checked)" style="opacity:0; width:0; height:0;" />
              <span style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background:${isOnline ? 'var(--emerald)' : '#cbd5e1'}; transition:0.3s; border-radius:28px;">
                <span style="position:absolute; content:''; height:22px; width:22px; left:${isOnline ? '26px' : '4px'}; bottom:3px; background:#fff; transition:0.3s; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Live Earnings Ledger Cards -->
      <div class="portal-grid-stats" style="margin-bottom:24px;">
        <div class="stat-card" style="border-left:4px solid var(--primary);">
          <div class="stat-card-title">Today's Specialist Payout (75%)</div>
          <div class="stat-card-value" style="color:var(--primary-dark);">₹${this.currentBeautician.todayEarnings.toLocaleString('en-IN')}</div>
          <div style="font-size:0.72rem; color:var(--slate-500); margin-top:4px;">From gross booking sales of ₹${(this.currentBeautician.todayGmv || 5666).toLocaleString('en-IN')}</div>
        </div>

        <div class="stat-card" style="border-left:4px solid var(--emerald);">
          <div class="stat-card-title">Services Completed Today</div>
          <div class="stat-card-value" style="color:var(--emerald);">${this.currentBeautician.jobsDoneToday} Jobs</div>
          <div style="font-size:0.72rem; color:var(--emerald); margin-top:4px;">+ ₹450 Customer Tips (100% Retained)</div>
        </div>

        <div class="stat-card" style="border-left:4px solid var(--gold);">
          <div class="stat-card-title">Weekly Payout Ledger</div>
          <div class="stat-card-value" style="color:var(--gold);">₹${this.currentBeautician.weeklyEarnings.toLocaleString('en-IN')}</div>
          <div style="font-size:0.72rem; color:var(--slate-500); margin-top:4px;">Auto-credited every Monday to bank</div>
        </div>

        <div class="stat-card" style="border-left:4px solid #0284c7;">
          <div class="stat-card-title">Active Dispatched Jobs</div>
          <div class="stat-card-value" style="color:#0284c7;">${activeBookings.length} Active</div>
          <div style="font-size:0.72rem; color:#0284c7; margin-top:4px;">Live tracking ready</div>
        </div>
      </div>

      <!-- Appointments Tab Bar -->
      <div style="background:var(--white); border-radius:var(--radius-xl); border:1px solid var(--slate-200); padding:24px; box-shadow:var(--shadow-sm); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--slate-100); padding-bottom:14px; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:10px;">
            <button class="tab-btn ${this.activeJobsTab === 'active' ? 'active' : ''}" onclick="Partner.switchJobsTab('active')" style="padding:8px 18px; font-weight:700; font-size:0.9rem; border:none; background:${this.activeJobsTab === 'active' ? 'var(--primary-subtle)' : 'transparent'}; color:${this.activeJobsTab === 'active' ? 'var(--primary-dark)' : 'var(--slate-600)'}; border-radius:var(--radius-sm); cursor:pointer;">
              🚨 Active Assigned Jobs (${activeBookings.length})
            </button>
            <button class="tab-btn ${this.activeJobsTab === 'completed' ? 'active' : ''}" onclick="Partner.switchJobsTab('completed')" style="padding:8px 18px; font-weight:700; font-size:0.9rem; border:none; background:${this.activeJobsTab === 'completed' ? 'var(--primary-subtle)' : 'transparent'}; color:${this.activeJobsTab === 'completed' ? 'var(--primary-dark)' : 'var(--slate-600)'}; border-radius:var(--radius-sm); cursor:pointer;">
              ✓ Completed History (${completedBookings.length})
            </button>
          </div>
          <button class="btn-secondary" style="font-size:0.8rem; padding:6px 12px;" onclick="Partner.renderPortal()">
            🔄 Refresh Dispatches
          </button>
        </div>

        <!-- TAB 1: ACTIVE JOBS -->
        ${this.activeJobsTab === 'active' ? `
          ${activeBookings.length === 0 ? `
            <div style="text-align:center; padding:40px 20px; color:var(--slate-500);">
              <div style="font-size:2.4rem; margin-bottom:8px;">☕</div>
              <h4 style="color:var(--slate-800);">No Active Jobs At This Moment</h4>
              <p style="font-size:0.85rem; margin-top:4px;">Stay online! When brides book rituals in your territory, orders will appear here automatically.</p>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:18px;">
              ${activeBookings.map(b => `
                <div style="border:1.5px solid var(--slate-200); border-radius:var(--radius-lg); padding:20px; background:var(--white); box-shadow:var(--shadow-sm);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
                    <div>
                      <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:800; color:var(--primary); font-size:1.15rem;">${b.booking_ref}</span>
                        <span class="badge" style="background:${b.status === 'IN_SERVICE' ? 'var(--emerald)' : (b.status === 'ON_THE_WAY' ? '#0284c7' : 'var(--slate-800)')}; color:#fff; font-size:0.75rem;">
                          ${b.status}
                        </span>
                      </div>
                      <h4 style="margin-top:6px; color:var(--slate-900); font-size:1.05rem;">
                        👰 Client: ${b.customer_name}
                      </h4>
                      <p style="font-size:0.88rem; color:var(--slate-600); margin-top:2px;">
                        📍 <strong>Address:</strong> ${b.address}, ${b.city || ''} ${b.pincode ? `(${b.pincode})` : ''}
                      </p>
                      <p style="font-size:0.82rem; color:var(--slate-500); margin-top:2px;">
                        ⏰ <strong>Scheduled:</strong> ${b.service_date} (${b.service_slot})
                      </p>
                    </div>

                    <div style="text-align:right;">
                      <div style="font-size:1.35rem; font-weight:800; color:var(--slate-900);">₹${(b.total_amount || 0).toLocaleString('en-IN')}</div>
                      <div style="font-size:0.75rem; color:var(--emerald); font-weight:700;">Specialist Share: ₹${Math.round((b.total_amount || 0) * 0.75).toLocaleString('en-IN')} (75%)</div>
                      <div style="font-size:0.75rem; color:var(--slate-500); margin-top:2px;">Mode: ${b.payment_mode || 'Pay After Service'}</div>
                      <div style="margin-top:8px; display:flex; gap:8px; justify-content:flex-end;">
                        ${b.customer_phone ? `
                          <a href="tel:${b.customer_phone}" class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                            📞 Call Client
                          </a>
                        ` : ''}
                        <a href="https://maps.google.com/?q=${encodeURIComponent(b.address + ' ' + (b.city || ''))}" target="_blank" class="btn-secondary" style="font-size:0.75rem; padding:4px 10px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                          🗺️ Navigate
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Booked Services List -->
                  <div style="background:var(--slate-50); border-radius:var(--radius-sm); padding:10px 14px; margin-bottom:14px; font-size:0.82rem;">
                    <strong style="color:var(--slate-700);">Services Requested:</strong>
                    <ul style="margin:4px 0 0 16px; color:var(--slate-600);">
                      ${(b.items || []).map(i => `<li>${i.title} (${i.duration_mins || 60}m) - ₹${i.price}</li>`).join('')}
                    </ul>
                  </div>

                  <!-- Doorstep Security & Action Controls -->
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-top:1px dashed var(--slate-200); padding-top:14px;">
                    <div>
                      ${b.status === "ON_THE_WAY" ? `
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                          <div style="font-size:0.82rem; font-weight:700; color:var(--gold);">
                            🔐 Enter Customer 4-Digit OTP to Begin Service:
                          </div>
                          <input type="text" id="partner-otp-${b.booking_ref}" placeholder="4-digit OTP" maxlength="4" style="padding:8px 12px; border:2px solid var(--gold); border-radius:var(--radius-sm); font-size:0.95rem; width:120px; font-weight:800; text-align:center; letter-spacing:3px; background:#fff;" />
                          <button class="btn-primary" style="font-size:0.85rem; padding:8px 18px;" onclick="Partner.verifyStartOtp('${b.booking_ref}')">
                            ✨ Verify OTP & Commence Service
                          </button>
                        </div>
                      ` : ''}

                      ${b.status === "CONFIRMED" || b.status === "ASSIGNED" ? `
                        <button class="btn-primary" style="font-size:0.85rem; padding:8px 18px;" onclick="Partner.updateStatus('${b.booking_ref}', 'ON_THE_WAY')">
                          🚗 Start Journey (Mark On The Way)
                        </button>
                      ` : ''}

                      ${b.status === "IN_SERVICE" ? `
                        <div style="display:flex; align-items:center; gap:12px;">
                          <span style="font-size:0.82rem; font-weight:700; color:var(--emerald);">
                            ⏱️ Service in progress under SafeSeal™ protocol
                          </span>
                          <button class="btn-primary" style="background:var(--emerald); color:#fff; font-size:0.85rem; padding:8px 18px;" onclick="Partner.updateStatus('${b.booking_ref}', 'COMPLETED')">
                            ✓ Mark Completed & Collect Payment
                          </button>
                        </div>
                      ` : ''}
                    </div>

                    <div style="font-size:0.75rem; color:var(--slate-400);">
                      Ref: ${b.booking_ref}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        ` : `
          <!-- TAB 2: COMPLETED HISTORY -->
          ${completedBookings.length === 0 ? `
            <div style="text-align:center; padding:30px; color:var(--slate-500);">
              No past fulfilled orders in local storage.
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${completedBookings.map(b => `
                <div style="display:flex; justify-content:space-between; align-items:center; border:1px solid var(--slate-200); border-radius:var(--radius-md); padding:14px 18px; background:var(--slate-50); flex-wrap:wrap; gap:10px;">
                  <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <strong style="color:var(--slate-900); font-size:0.95rem;">${b.booking_ref}</strong>
                      <span class="badge" style="background:${b.status === 'COMPLETED' ? 'var(--emerald)' : 'var(--slate-400)'}; color:#fff; font-size:0.72rem;">
                        ${b.status}
                      </span>
                      <span style="font-size:0.82rem; color:var(--slate-600);">${b.customer_name}</span>
                    </div>
                    <div style="font-size:0.78rem; color:var(--slate-500); margin-top:2px;">
                      ${b.service_date} • ${b.city || 'New Delhi'} • ${(b.items || []).map(i => i.title).join(', ')}
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:800; color:var(--slate-900);">₹${(b.total_amount || 0).toLocaleString('en-IN')}</div>
                    <div style="font-size:0.72rem; color:var(--emerald); font-weight:700;">Payout: ₹${Math.round((b.total_amount || 0) * 0.75).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        `}
      </div>

      <!-- Partner Hygiene Standards Pledge -->
      <div style="background:var(--slate-100); border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:20px; margin-bottom:24px;">
        <h4 style="margin-bottom:8px; color:var(--slate-800);">🛡️ Mandatory Dulhaniya Safety & Hygiene Checklist</h4>
        <ul style="font-size:0.85rem; color:var(--slate-600); display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:10px; list-style:none;">
          <li>✓ Wear sanitized face mask and disposable nitryl gloves</li>
          <li>✓ Open sealed tamper-proof mono-cartridge kit in front of the customer</li>
          <li>✓ Lay down fresh biodegradable disposable bedsheet & customer cape</li>
          <li>✓ Sanitize stainless steel tools in UV/Alcohol sterilizer</li>
        </ul>
      </div>

      ${this.renderOnboardingSection()}
    `;
  },

  async updateStatus(ref, status) {
    await DulhaniyaAPI.partnerUpdateStatus(ref, status);
    window.App?.showToast(`Status updated to ${status}`);
    await this.renderPortal();
    if (window.Tracker?.activeBooking?.booking_ref === ref) {
      Tracker.loadBooking(ref);
    }
  },

  async verifyStartOtp(ref) {
    const input = document.getElementById(`partner-otp-${ref}`);
    if (!input || !input.value) {
      window.App?.showToast("Please enter the customer's 4-digit OTP code");
      return;
    }
    const res = await DulhaniyaAPI.partnerVerifyOtp(ref, input.value.trim());
    if (res.success) {
      window.App?.showToast("OTP Verified! Safe service timer started.");
      await this.renderPortal();
      if (window.Tracker?.activeBooking?.booking_ref === ref) {
        Tracker.loadBooking(ref);
      }
    } else {
      window.App?.showToast(res.error || "Incorrect OTP");
    }
  },

  renderOnboardingSection() {
    return `
      <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fff 100%); border: 2px solid var(--primary-border); border-radius: var(--radius-xl); padding: 30px; margin-top: 30px; box-shadow: var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
          <div>
            <span class="badge badge-bridal">👩‍💼 JOIN OUR FLEET</span>
            <h3 style="font-size:1.6rem; color:var(--primary-dark); margin-top:6px;">Become an Elite Dulhaniya Beauty Partner</h3>
            <p style="color:var(--slate-600); font-size:0.9rem;">Enjoy 75%+ take-home share, 0% commission on tips, and complete work flexibility.</p>
          </div>
          <button class="btn-primary" onclick="Partner.openOnboardingModal()">Apply to Join Fleet ✍️</button>
        </div>

        <div style="background:var(--white); border:1px solid var(--slate-200); border-radius:var(--radius-lg); padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
            <h4 style="margin:0; font-size:1.15rem; color:var(--slate-800);">💰 Transparent Partner Income Simulator (75% Labor Payout + 100% Tips)</h4>
            <div style="display:flex; gap:8px;">
              <button type="button" id="calc-tier-luxury" onclick="Partner.setEarningsTier('luxury')" class="btn-secondary" style="font-size:0.78rem; padding:5px 12px; font-weight:700; background:var(--primary); color:#fff; border-color:var(--primary);">
                👑 Luxury Bridal & Ayurvedic
              </button>
              <button type="button" id="calc-tier-standard" onclick="Partner.setEarningsTier('standard')" class="btn-secondary" style="font-size:0.78rem; padding:5px 12px; font-weight:700;">
                💆 Standard Salon & Spa
              </button>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; align-items:center;">
            <div>
              <div style="margin-bottom:14px; background:#f8fafc; padding:10px 14px; border-radius:8px; border:1px solid #e2e8f0; font-size:0.82rem;">
                <span id="calc-tier-desc"><strong>Luxury Tier:</strong> Avg ticket ₹2,200. Guaranteed 75% labor payout = <strong>₹1,650/ritual</strong> + 100% customer tips.</span>
              </div>

              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <label style="font-size:0.85rem; font-weight:700;">Rituals / Appointments per day:</label>
                <strong style="color:var(--primary);" id="calc-jobs-label">4 rituals</strong>
              </div>
              <input type="range" min="1" max="6" value="4" id="calc-jobs-input" style="width:100%; accent-color:var(--primary);" oninput="Partner.updateEarningsCalc()" />

              <div style="display:flex; justify-content:space-between; margin:16px 0 6px;">
                <label style="font-size:0.85rem; font-weight:700;">Working days per month:</label>
                <strong style="color:var(--primary);" id="calc-days-label">26 days</strong>
              </div>
              <input type="range" min="15" max="28" value="26" id="calc-days-input" style="width:100%; accent-color:var(--primary);" oninput="Partner.updateEarningsCalc()" />
            </div>

            <div style="background:linear-gradient(135deg, #fdf2f8 0%, #fff 100%); border:2px solid var(--primary-border); border-radius:var(--radius-lg); padding:22px; text-align:center; box-shadow:var(--shadow-sm);">
              <span style="font-size:0.78rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:0.05em;">Estimated Monthly Take-Home</span>
              <div style="font-size:2.5rem; font-weight:900; color:var(--primary-dark); margin:6px 0;" id="calc-monthly-payout">₹171,600</div>
              <div style="font-size:0.78rem; color:var(--slate-700); font-weight:600; margin-bottom:8px;" id="calc-payout-breakdown">
                75% Service Labor: ₹171,600 • 100% Tips Retained: ~₹20,800
              </div>
              <p style="font-size:0.72rem; color:var(--slate-500); margin:0; line-height:1.4;">
                🛡️ 0% commission on tips. 100% direct bank transfer every Monday. Zero product kit deductions or hidden franchise fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  earningsTier: 'luxury', // 'luxury' or 'standard'

  setEarningsTier(tier) {
    this.earningsTier = tier;
    const luxBtn = document.getElementById('calc-tier-luxury');
    const stdBtn = document.getElementById('calc-tier-standard');
    const descEl = document.getElementById('calc-tier-desc');
    const jobsInput = document.getElementById('calc-jobs-input');
    const daysInput = document.getElementById('calc-days-input');

    if (tier === 'luxury') {
      if (luxBtn) { luxBtn.style.background = 'var(--primary)'; luxBtn.style.color = '#fff'; luxBtn.style.borderColor = 'var(--primary)'; }
      if (stdBtn) { stdBtn.style.background = 'transparent'; stdBtn.style.color = 'var(--slate-700)'; stdBtn.style.borderColor = 'var(--slate-300)'; }
      if (descEl) descEl.innerHTML = '<strong>Luxury Bridal & Ayurvedic:</strong> Avg ticket ₹2,200. Guaranteed 75% labor payout = <strong>₹1,650/ritual</strong> + 100% customer tips.';
      if (jobsInput && daysInput) { jobsInput.value = 4; daysInput.value = 26; }
    } else {
      if (stdBtn) { stdBtn.style.background = 'var(--primary)'; stdBtn.style.color = '#fff'; stdBtn.style.borderColor = 'var(--primary)'; }
      if (luxBtn) { luxBtn.style.background = 'transparent'; luxBtn.style.color = 'var(--slate-700)'; luxBtn.style.borderColor = 'var(--slate-300)'; }
      if (descEl) descEl.innerHTML = '<strong>Standard Salon & Spa:</strong> Avg ticket ₹1,200. Guaranteed 75% labor payout = <strong>₹900/ritual</strong> + 100% customer tips.';
      if (jobsInput && daysInput) { jobsInput.value = 3; daysInput.value = 24; }
    }
    this.updateEarningsCalc();
  },

  updateEarningsCalc() {
    const jobsInput = document.getElementById('calc-jobs-input');
    const daysInput = document.getElementById('calc-days-input');
    if (!jobsInput || !daysInput) return;

    const jobs = Number(jobsInput.value);
    const days = Number(daysInput.value);

    document.getElementById('calc-jobs-label').textContent = `${jobs} ritual${jobs > 1 ? 's' : ''}`;
    document.getElementById('calc-days-label').textContent = `${days} days`;

    const isLuxury = this.earningsTier !== 'standard';
    const ratePerJob = isLuxury ? 1650 : 900; // 75% of ₹2,200 or ₹1,200
    const tipPerJob = isLuxury ? 200 : 150;

    const laborPayout = jobs * days * ratePerJob;
    const estTips = jobs * days * tipPerJob;

    const payoutEl = document.getElementById('calc-monthly-payout');
    const breakdownEl = document.getElementById('calc-payout-breakdown');

    if (payoutEl) {
      payoutEl.textContent = `₹${laborPayout.toLocaleString('en-IN')}`;
    }
    if (breakdownEl) {
      breakdownEl.textContent = `75% Service Labor: ₹${laborPayout.toLocaleString('en-IN')} • 100% Tips Retained: ~₹${estTips.toLocaleString('en-IN')}`;
    }
  },

  openOnboardingModal() {
    let modal = document.getElementById('partner-onboarding-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'partner-onboarding-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3>Join the Dulhaniya Specialist Fleet</h3>
            <button class="btn-close" onclick="document.getElementById('partner-onboarding-modal').classList.remove('active')">✕</button>
          </div>
          <div class="modal-body">
            <form onsubmit="Partner.submitOnboarding(event)">
              <div style="margin-bottom:12px;">
                <label style="font-size:0.8rem; font-weight:700;">Full Legal Name:</label>
                <input type="text" name="name" required placeholder="e.g. Shalini Rajput" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700;">Mobile Phone:</label>
                  <input type="tel" name="phone" required placeholder="+91 98xxx xxxxx" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700;">Regional Fulfillment Hub:</label>
                  <select name="hub" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);">
                    <option value="South Delhi Regional Hub (Saket / GK)">South Delhi Regional Hub (Saket / GK)</option>
                    <option value="Gurugram Cyber Hub (DLF Phase 1-5)">Gurugram Cyber Hub (DLF Phase 1-5)</option>
                    <option value="Noida Sector 62 Expressway Hub">Noida Sector 62 Expressway Hub</option>
                    <option value="Bengaluru Indiranagar & Koramangala Hub">Bengaluru Indiranagar & Koramangala Hub</option>
                    <option value="Mumbai Bandra & Juhu Hub">Mumbai Bandra & Juhu Hub</option>
                    <option value="Jaipur C-Scheme Hub">Jaipur C-Scheme Hub</option>
                  </select>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700;">Govt ID / Aadhaar KYC (Masked):</label>
                  <input type="text" name="kyc_id" placeholder="XXXX-XXXX-4921" required style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700;">Police Clearance Certificate:</label>
                  <select name="police_cleared" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);">
                    <option value="Verified / In Hand">Verified / In Hand (Valid 2026)</option>
                    <option value="Applied / Under Processing">Applied / Under Processing</option>
                    <option value="Request Dulhaniya Verification">Request Dulhaniya Verification Support</option>
                  </select>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label style="font-size:0.8rem; font-weight:700;">Primary Specialty:</label>
                  <select name="specialty" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);">
                    <option value="Bridal Makeup & Hair Styling">Bridal Makeup & Hair Styling</option>
                    <option value="Advanced Facials & Skin Therapy">Advanced Facials & Skin Therapy</option>
                    <option value="Rica Waxing & Body Spas">Rica Waxing & Body Spas</option>
                    <option value="Gel Nails & Pedicure Spas">Gel Nails & Pedicure Spas</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:0.8rem; font-weight:700;">Years of Experience:</label>
                  <input type="number" name="experience" min="1" max="30" value="5" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
                </div>
              </div>
              <div style="margin-bottom:12px;">
                <label style="font-size:0.8rem; font-weight:700;">Certifications (VLCC, CIDESCO, Orane, etc.):</label>
                <input type="text" name="certifications" placeholder="e.g. CIDESCO Certified, VLCC Diploma" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);" />
              </div>
              <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:var(--radius-sm); padding:12px; margin-bottom:16px;">
                <label style="font-size:0.8rem; font-weight:700; color:#334155;">Digital Hygiene & Ethics Pledge:</label>
                <p style="font-size:0.75rem; color:#64748b; margin:4px 0 8px;">I pledge to use single-dose disposable capes, sanitize stainless tools before each client, and maintain 100% professional conduct.</p>
                <label style="font-size:0.8rem; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" required style="accent-color:var(--primary);" />
                  <strong>I agree to the Dulhaniya Zero-Adulteration Standard</strong>
                </label>
              </div>
              <button type="submit" class="btn-primary" style="width:100%; padding:12px;">Submit Verification Application 🚀</button>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
  },

  submitOnboarding(event) {
    event.preventDefault();
    const form = event.target;
    const application = {
      id: Date.now(),
      name: form.name.value,
      phone: form.phone.value,
      city: form.city.value,
      specialty: form.specialty.value,
      experience: form.experience.value,
      certifications: form.certifications.value,
      submittedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('dulhaniya_partner_applications') || '[]');
    existing.unshift(application);
    localStorage.setItem('dulhaniya_partner_applications', JSON.stringify(existing));

    document.getElementById('partner-onboarding-modal').classList.remove('active');
    window.App?.showToast('🎉 Application received! Our Fleet Manager will contact you within 24 hours for police background clearance.');
  }
};
