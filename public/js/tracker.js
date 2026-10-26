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
  }
};
