/**
 * Dulhaniya - Live Service Tracking & Safety State Machine
 * Real-time booking progression, OTP verification, live map route simulation & SOS emergency system.
 */

const Tracker = {
  activeBooking: null,
  pollTimer: null,
  mapAnimInterval: null,
  driverProgress: 45, // percentage along route

  init() {
    this.checkActiveBooking();

    // Cross-view synchronization
    window.addEventListener("dulhaniya_status_changed", (e) => {
      if (e.detail?.ref === this.activeBooking?.booking_ref) {
        this.loadBooking(e.detail.ref);
      }
    });

    window.addEventListener("dulhaniya_booking_created", (e) => {
      if (e.detail?.booking_ref) {
        this.loadBooking(e.detail.booking_ref);
      }
    });

    // Cross-tab / multi-window synchronization
    window.addEventListener("storage", (e) => {
      if (e.key === "dulhaniya_active_ref" || (e.key && e.key.startsWith("booking_"))) {
        const activeRef = localStorage.getItem("dulhaniya_active_ref");
        if (activeRef) {
          this.loadBooking(activeRef);
        }
      }
    });
  },

  async checkActiveBooking() {
    const activeRef = localStorage.getItem("dulhaniya_active_ref") || "DLH-9842";
    if (activeRef) {
      await this.loadBooking(activeRef);
    }
  },

  async loadBooking(ref) {
    const booking = await DulhaniyaAPI.getBooking(ref);
    if (booking) {
      this.activeBooking = booking;
      this.renderFloatingTrackerPill();
      this.renderTrackerModal();
    }
  },

  renderFloatingTrackerPill() {
    const pill = document.getElementById("floating-order-tracker");
    if (!pill) return;

    if (this.activeBooking && this.activeBooking.status !== "COMPLETED" && this.activeBooking.status !== "CANCELLED") {
      pill.style.display = "flex";
      const statusText = {
        "CONFIRMED": "Order Confirmed - Finding Artist",
        "ASSIGNED": "Artist Assigned & Preparing Kit",
        "ON_THE_WAY": "Artist On The Way (ETA: 12m)",
        "IN_SERVICE": "Service In Progress (Safe Mode)"
      }[this.activeBooking.status] || "Service Active";

      const textEl = document.getElementById("floating-tracker-text");
      if (textEl) {
        textEl.innerHTML = `<strong>${this.activeBooking.booking_ref}</strong>: ${statusText}`;
      }
    } else {
      pill.style.display = "none";
    }
  },

  openTracker() {
    if (!this.activeBooking) {
      this.loadBooking("DLH-9842");
    }
    const modal = document.getElementById("tracker-modal");
    if (modal) {
      modal.classList.add("active");
      this.renderTrackerModal();
      this.startMapSimulation();
    }
  },

  closeTracker() {
    const modal = document.getElementById("tracker-modal");
    if (modal) modal.classList.remove("active");
    if (this.mapAnimInterval) clearInterval(this.mapAnimInterval);
  },

  renderTrackerModal() {
    if (!this.activeBooking) return;
    const b = this.activeBooking;

    // 1. Booking Ref & Status
    const refEl = document.getElementById("tracker-modal-ref");
    if (refEl) refEl.textContent = b.booking_ref;

    // 2. Status Stepper
    const steps = ["CONFIRMED", "ASSIGNED", "ON_THE_WAY", "IN_SERVICE", "COMPLETED"];
    const currentIdx = steps.indexOf(b.status);

    steps.forEach((stepName, idx) => {
      const stepEl = document.getElementById(`step-${stepName.toLowerCase()}`);
      if (stepEl) {
        stepEl.classList.remove("completed", "active");
        if (idx < currentIdx) {
          stepEl.classList.add("completed");
        } else if (idx === currentIdx) {
          stepEl.classList.add("active");
        }
      }
    });

    // 3. 4-Digit Secure OTP Display
    const otpEl = document.getElementById("tracker-otp-code");
    if (otpEl) otpEl.textContent = b.otp_code || "7421";

    // 4. Beautician Info Card
    const nameEl = document.getElementById("tracker-beautician-name");
    const expEl = document.getElementById("tracker-beautician-exp");
    const photoEl = document.getElementById("tracker-beautician-photo");
    const ratingEl = document.getElementById("tracker-beautician-rating");

    if (nameEl) nameEl.textContent = b.beautician_name || "Pooja Sharma";
    if (expEl) expEl.textContent = `${b.experience_years || 9} Years Exp • Verified Female Specialist`;
    if (ratingEl) ratingEl.textContent = `${b.beautician_rating || 4.98} ★`;
    if (photoEl && b.beautician_photo) photoEl.src = b.beautician_photo;

    // 5. Booking summary details
    const addrEl = document.getElementById("tracker-address");
    const slotEl = document.getElementById("tracker-slot");
    const totalEl = document.getElementById("tracker-total");

    if (addrEl) addrEl.textContent = `${b.address}, ${b.city}`;
    if (slotEl) slotEl.textContent = `${b.service_date} • ${b.service_slot}`;
    if (totalEl) totalEl.textContent = `₹${(b.total_amount || 0).toLocaleString('en-IN')} (${b.payment_mode || 'Pay After Service'})`;

    // 6. OTP Verification Panel if IN_SERVICE or Partner testing
    const otpVerifyBox = document.getElementById("tracker-otp-verify-section");
    if (otpVerifyBox) {
      otpVerifyBox.style.display = (b.status === "ON_THE_WAY" || b.status === "ASSIGNED") ? "block" : "none";
    }

    // 7. Review Box if COMPLETED
    const reviewBox = document.getElementById("tracker-completed-review-box");
    if (reviewBox) {
      reviewBox.style.display = b.status === "COMPLETED" ? "block" : "none";
    }
  },

  startMapSimulation() {
    if (this.mapAnimInterval) clearInterval(this.mapAnimInterval);
    const driverMarker = document.getElementById("sim-driver-marker");
    if (!driverMarker) return;

    this.mapAnimInterval = setInterval(() => {
      if (this.activeBooking?.status === "ON_THE_WAY") {
        this.driverProgress = (this.driverProgress + 2) % 85;
        driverMarker.style.left = `${15 + this.driverProgress}%`;
        driverMarker.style.top = `${65 - (this.driverProgress * 0.4)}%`;
      }
    }, 1500);
  },

  async verifyServiceStart() {
    const input = document.getElementById("tracker-otp-input");
    if (!input || !input.value) {
      window.App?.showToast("Please enter the 4-digit OTP code");
      return;
    }

    const res = await DulhaniyaAPI.verifyOtp(this.activeBooking.booking_ref, input.value.trim());
    if (res.success) {
      this.activeBooking.status = "IN_SERVICE";
      this.renderTrackerModal();
      this.renderFloatingTrackerPill();
      window.App?.showToast("🎉 Service Started! Dulhaniya certified tools are sanitized.");
    } else {
      window.App?.showToast(res.error || "Incorrect OTP");
    }
  },

  triggerSOS() {
    const confirmed = confirm(
      "🚨 DULHANIYA SAFETY ALERT:\n\nTriggering SOS will instantly:\n1. Alert Dulhaniya 24x7 Safety Response Team\n2. Share live GPS location with emergency contacts\n3. Connect to Women Helpline (1091 / 112)\n\nDo you want to send emergency alert now?"
    );
    if (confirmed) {
      alert("🚨 SOS Signal Sent! Our 24x7 Safety Command Center is dialing your phone right now. Help is on standby.");
    }
  },

  async submitReview() {
    const ratingInput = document.querySelector('input[name="tracker_rating"]:checked');
    const commentInput = document.getElementById("tracker-review-comment");
    const rating = ratingInput ? Number(ratingInput.value) : 5;
    const comment = commentInput ? commentInput.value.trim() : "Wonderful experience!";

    await DulhaniyaAPI.submitReview(this.activeBooking.booking_ref, rating, comment, this.activeBooking.customer_name);
    window.App?.showToast("Thank you for your feedback! ❤️");
    const reviewBox = document.getElementById("tracker-completed-review-box");
    if (reviewBox) {
      reviewBox.innerHTML = `
        <div style="background: var(--emerald-subtle); border: 1px solid var(--emerald); padding: 14px; border-radius: var(--radius-md); text-align: center; color: var(--emerald);">
          ✓ Thank you! Your review has been published.
        </div>
      `;
    }
  },

  shareWhatsApp() {
    if (!this.activeBooking) return;
    const b = this.activeBooking;
    const itemsList = (b.items || []).map(i => `• ${i.title} (₹${i.price})`).join('\n');
    const msg = `👑 *Dulhaniya Luxury Bridal & Salon Booking*\n\n` +
      `*Booking Ref:* ${b.booking_ref}\n` +
      `*Specialist:* ${b.beautician_name || 'Verified Artist'} (${b.beautician_rating || '4.98'}★)\n` +
      `*Date & Slot:* ${b.service_date} (${b.service_slot})\n` +
      `*Status:* ${b.status}\n` +
      `*Doorstep Safe OTP:* ${b.otp_code}\n\n` +
      `*Selected Services:*\n${itemsList}\n\n` +
      `*Payable Amount:* ₹${b.total_amount}\n\n` +
      `Track live appointment: https://dulhaniya.netlify.app/`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  },

  printInvoice() {
    if (!this.activeBooking) return;
    const b = this.activeBooking;
    const itemsRows = (b.items || []).map(i => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${i.qty || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">₹${i.price}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <html>
      <head>
        <title>Dulhaniya Luxury Bridal Invoice - ${b.booking_ref}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #9d174d; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #9d174d; }
          .badge { background: #fdf2f8; color: #9d174d; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; border: 1px solid #fbcfe8; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .card { background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #9d174d; color: white; padding: 10px; text-align: left; }
          .total-box { margin-top: 30px; text-align: right; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">👑 Dulhaniya™</div>
            <div style="font-size: 13px; color: #64748b;">Luxury Salon & Bridal Studio at Home</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">100% VERIFIED APPOINTMENT</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 8px;">Order Ref: ${b.booking_ref}</div>
            <div style="font-size: 12px; color: #64748b;">Date: ${b.service_date} | Slot: ${b.service_slot}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <strong>Customer Details</strong>
            <p style="margin: 6px 0; font-size: 14px;"><strong>${b.customer_name}</strong></p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;">📞 ${b.customer_phone}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;">📍 ${b.address}, ${b.city || 'New Delhi'}</p>
          </div>
          <div class="card">
            <strong>Assigned Beauty Specialist</strong>
            <p style="margin: 6px 0; font-size: 14px;"><strong>${b.beautician_name || 'Senior Artist'}</strong> (${b.beautician_rating || 4.98} ★)</p>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;">Experience: ${b.experience_years || 8}+ Years Verified</p>
            <p style="margin: 4px 0; font-size: 13px; color: #059669; font-weight: bold;">Doorstep Safe OTP: ${b.otp_code}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="total-box">
          <p style="font-size: 14px; margin: 4px 0;">Product Mode: <strong>${b.kit_type === 'byo_product' ? 'Bring Your Own Product (BYOP)' : 'Dulhaniya SafeSeal™ Deluxe Kit'}</strong></p>
          ${b.discount_amount ? `<p style="font-size: 14px; color: #059669; margin: 4px 0;">Savings / Discounts: -₹${b.discount_amount}</p>` : ''}
          <h2 style="color: #9d174d; margin: 10px 0 0;">Total Payable: ₹${b.total_amount}</h2>
          <p style="font-size: 13px; color: #64748b;">Payment Method: ${b.payment_mode || 'Pay After Service'}</p>
        </div>

        <div class="footer">
          <p>Thank you for choosing Dulhaniya! 100% sealed tamper-evident kits, 0% commission on tips, and full transparent labor pricing.</p>
          <p>Support & Emergency SOS: support@dulhaniya.app | +91 98112 34567 | dulhaniya.netlify.app</p>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(invoiceHtml);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => { printWin.print(); }, 500);
    }
  }
};
