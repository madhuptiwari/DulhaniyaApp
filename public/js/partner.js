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
      const res = await DulhaniyaAPI.safeFetch('/api/bookings');
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
          <h4 style="margin-bottom:16px; font-size:1.1rem; color:var(--slate-800);">💰 Calculate Your Monthly Income</h4>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; align-items:center;">
            <div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <label style="font-size:0.85rem; font-weight:700;">Appointments per day:</label>
                <strong style="color:var(--primary);" id="calc-jobs-label">3 appointments</strong>
              </div>
              <input type="range" min="1" max="6" value="3" id="calc-jobs-input" style="width:100%; accent-color:var(--primary);" oninput="Partner.updateEarningsCalc()" />

              <div style="display:flex; justify-content:space-between; margin:16px 0 6px;">
                <label style="font-size:0.85rem; font-weight:700;">Working days per month:</label>
                <strong style="color:var(--primary);" id="calc-days-label">24 days</strong>
              </div>
              <input type="range" min="15" max="28" value="24" id="calc-days-input" style="width:100%; accent-color:var(--primary);" oninput="Partner.updateEarningsCalc()" />
            </div>

            <div style="background:var(--primary-subtle); border:1.5px solid var(--primary-border); border-radius:var(--radius-md); padding:20px; text-align:center;">
              <span style="font-size:0.8rem; font-weight:700; color:var(--primary); text-transform:uppercase;">Estimated Monthly Payout</span>
              <div style="font-size:2.4rem; font-weight:900; color:var(--primary-dark); margin:6px 0;" id="calc-monthly-payout">₹64,800</div>
              <p style="font-size:0.75rem; color:var(--slate-600); margin:0;">
                Includes ~₹12,000 in customer tips (100% kept by you) + 75% service labor share. Zero equipment deductions.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  updateEarningsCalc() {
    const jobsInput = document.getElementById('calc-jobs-input');
    const daysInput = document.getElementById('calc-days-input');
    if (!jobsInput || !daysInput) return;

    const jobs = Number(jobsInput.value);
    const days = Number(daysInput.value);

    document.getElementById('calc-jobs-label').textContent = `${jobs} appointment${jobs > 1 ? 's' : ''}`;
    document.getElementById('calc-days-label').textContent = `${days} days`;

    // Average order: ₹1,200. Partner gets 75% = ₹900/job + ₹150 tip = ₹1,050/job
    const monthlyPayout = jobs * days * 1050;
    const payoutEl = document.getElementById('calc-monthly-payout');
    if (payoutEl) {
      payoutEl.textContent = `₹${monthlyPayout.toLocaleString('en-IN')}`;
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
                  <label style="font-size:0.8rem; font-weight:700;">City / Region:</label>
                  <select name="city" style="width:100%; padding:8px; border:1px solid var(--slate-300); border-radius:var(--radius-sm);">
                    <option value="New Delhi">New Delhi</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Noida">Noida</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Jaipur">Jaipur</option>
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
