# 📖 Dulhaniya - Complete Product & Operations Manual

Welcome to **Dulhaniya™**, India's premier luxury salon-at-home and bridal studio platform. This guide provides comprehensive, step-by-step instructions on how the application works, how each role (Customer, Beautician Partner, and Administrator) interacts with the system, and how to verify all features.

---

## 1. Quick Start & Server Launch

Dulhaniya is architected with a zero-dependency dual-runtime engine:

### Option A: One-Click Windows Launch
Double-click [`start.bat`](start.bat) in the project directory.
- Automatically detects Python, `uv`, or Node.js.
- Recovers from port collisions (port 8000 -> 8080 -> 5000 -> 3000).
- Opens the application directly in your default browser at `http://127.0.0.1:8000`.

### Option B: Manual Command Launch
- **Python Runtime:**
  ```powershell
  python server.py
  # or with custom port:
  python server.py 8080
  ```
- **Node.js Runtime:**
  ```powershell
  node server.js
  # or with custom port:
  $env:PORT=8080; node server.js
  ```
- **Offline / Standalone Mode:**
  Simply open [`public/index.html`](public/index.html) or [`public/admin.html`](public/admin.html) directly in any web browser (`file:///` protocol). The built-in LocalStorage resilience engine handles full catalog filtering, cart totals, and booking persistence with zero server required.

---

## 2. Customer Journey: How to Book a Service

### Step 1: Browse & Filter Services
1. Select your city from the header location picker (New Delhi, Gurugram, Noida, Mumbai, Bengaluru, Hyderabad, Jaipur, Chandigarh).
2. Browse by category pill:
   - 👑 **Bridal & Wedding Glow** (D-Day Makeup, Haldi/Mehendi, Sangeet, Engagement, Reception, 7-Day Countdown).
   - ✨ **Facials & Skin Rituals** (O3+ Bridal Glow, 24K Gold Kumkumadi, Hydra Ultrasonic, TanClear).
   - 🪶 **Waxing & Smooth Skin** (Rica Italian Chocolate, Honey, Roll-on).
   - 💅 **Manicure & Pedicure Spas** (Rose Petal Crystal Spa).
   - 💇‍♀️ **Hair Care & Styling** (L'Oreal Mythic Oil Hair Spa, Keratin).
   - ☀️ **Bleach, Detan & Polishing** (Sara Oxy Full Body Detan).
   - 💆‍♀️ **Full Body Spa & Massages** (Swedish Stress-Relief).
   - 🧔 **Groom & Men's Salon** (Charcoal Glow Facial, Head Champi).
3. Use the live search bar to search by treatment name, cosmetic product, or ceremony ritual (e.g., *"Gold"*, *"O3+"*, *"Bridal"*).
4. Tap any service card to view the **Step-by-Step Procedure Modal**, cosmetic brand transparency list, and safety certifications.

### Step 2: Choose Product Supply Model (Fair Pricing)
Inside the Cart Drawer, Dulhaniya offers patent-free transparent dual pricing:
- 📦 **Dulhaniya Sealed Kit:** Sealed, tamper-evident single-use mono-cartridges opened exclusively in front of the customer.
- 🧴 **Bring Your Own Product (BYOP):** If you already own high-end cosmetics or skincare, select BYOP. The retail kit cost (₹150 to ₹1,500) is deducted, and you pay only for the certified beautician's labor.

### Step 3: Apply Promo Codes & Add Beautician Tip
1. Enter coupon code in the cart drawer (e.g., `DULHANIYA500` for flat ₹500 off, `FIRSTGLOW` for 20% off, `BRIDALQUEEN` for ₹1,500 off).
2. Hygiene Kit fee (₹49) is **automatically waived (FREE)** on orders of ₹1,999 or more.
3. Select an optional beautician tip (₹0, ₹50, ₹100, ₹200) — 100% goes directly to the professional.

### Step 4: Checkout & Slot Scheduling
1. Tap **"Select Date & Time Slot"**.
2. Select Service Date (**Today**, **Tomorrow**, or custom date).
3. Select preferred 90-minute time slot (from 08:00 AM Early Morning to 08:30 PM Night Pamper).
4. Enter delivery address, landmark, and optional special notes (e.g., *"Please bring fresh jasmine flowers"*).
5. Choose payment method: **Pay After Service (Cash / UPI / GPay)**, Instant Online QR, or Card.
6. Tap **"Confirm Dulhaniya Booking"**.

### Step 5: Live Tracker, 4-Digit OTP & SOS
1. The **Live Service Tracker Modal** opens immediately with your unique reference (e.g., `DLH-8942`).
2. Your secret **4-digit OTP** is displayed.
3. Track the assigned beautician's live route progression on the interactive Delhi NCR map.
4. When the beautician arrives at your doorstep, verify her photo and ID, then share your 4-digit OTP to start the service.
5. In case of any concern, tap **"Trigger SOS Alert"** for immediate dispatch of the 24x7 Safety Response Team.
6. Once service is completed, leave a 1-5 star review and feedback.

---

## 3. Beautician Partner Journey: How Artists Work

Switch to the **Partner App** using the view mode toggle in the top navigation bar.

1. **Partner Header & Metrics:**
   - Displays daily earnings, completed appointments, hygiene audit score (100%), and active status.
2. **Accepting & Starting Journey:**
   - Review assigned customer appointments with addresses, contact numbers, and booked service items.
   - Tap **"🚗 Start Journey (On The Way)"** to update the customer's tracker in real-time.
3. **Arrival & OTP Verification:**
   - At the client's home, request the customer's secret 4-digit OTP.
   - Enter the code in the Partner Portal and tap **"✨ Verify OTP & Start Service"**.
   - Service timer starts only after successful OTP handshake.
4. **Dulhaniya 5-Point Safety & Hygiene Standard:**
   - Sanitize hands, wear fresh disposable mask and nitryl gloves.
   - Break tamper-evident SafeSeal kit hologram in front of the customer.
   - Lay down biodegradable single-use bedsheet and customer cape.
   - Use autoclave/UV sterilized stainless steel tools.
5. **Marking Service Completion:**
   - Tap **"✓ Mark Completed & Collect Payment"**.
   - Earnings are automatically updated in the partner wallet.

---

## 4. Admin Operations Suite: How to Manage the Business

Access the Admin suite either by selecting **Admin** in the in-app navigation switcher or by opening [`public/admin.html`](public/admin.html) directly for the standalone executive dashboard.

### Tab 1: 📋 Live Dispatch
- Real-time order grid showing reference, 4-digit OTP, customer contact, service date, kit model, and payable amount.
- **Re-assign Beautician:** Select any active specialist from the pro dropdown to immediately re-route orders.
- **Update Status:** Manually advance or audit state (`CONFIRMED` -> `ASSIGNED` -> `ON_THE_WAY` -> `IN_SERVICE` -> `COMPLETED`).
- **Cancel Booking:** One-click emergency cancellation.

### Tab 2: 💄 Service Catalog
- Full catalog view with price comparisons, BYOP labor deductions, duration minutes, and badges (`Bestseller`, `Bridal Exclusive`).
- **+ Add New Service:** Launch modal to specify treatment title, category, regular price, offer price, BYOP deduction, duration, image, and description.
- **✏️ Edit Service:** Modify pricing, discounts, and duration in real-time.
- **🗑️ Delete Service:** Remove discontinued treatments.

### Tab 3: 👩‍💼 Partner Fleet
- Complete roster of verified beauty specialists.
- **Online / Offline Toggle:** Switch beautician availability for on-demand dispatch.
- **Verified / Unverified Badge Toggle:** Enable or restrict partner booking eligibility based on background checks.
- **+ Register New Partner:** Onboard new professionals with photo, experience years, phone number, and certifications (CIDESCO, VLCC, SafeSeal).

### Tab 4: 🎟️ Promo Campaigns
- View all active promotional campaigns with discount logic and thresholds.
- **+ Create New Campaign:** Launch promotional codes with flat (₹) or percentage (%) savings, minimum order value thresholds, and maximum discount caps.
- **Remove:** Delete expired or seasonal campaigns.

### Tab 5: ⭐ CSAT & Reviews
- Live customer sentiment feed with star ratings, verified customer feedback, linked booking reference, and assigned beautician.
- **Moderate:** Remove flagged or inappropriate customer comments.

---

## 5. Verification & Testing Checklist

To verify that the application and its REST APIs operate with 100% fidelity:

1. **Syntax Verification:**
   ```powershell
   python -m py_compile server.py dulhaniya_db.py
   node -c server.js public/js/data.js public/js/cart.js public/js/admin.js
   ```
2. **Automated Backend & Pricing Tests:**
   Run the pre-configured test suites in Python or Node.js:
   - `python server.py` (serves on port 8000)
   - Verify endpoints:
     - `GET http://127.0.0.1:8000/api/categories`
     - `GET http://127.0.0.1:8000/api/services?category=bridal-wedding`
     - `POST http://127.0.0.1:8000/api/coupons/apply` (`{"code":"DULHANIYA500","subtotal":2000}`)
     - `GET http://127.0.0.1:8000/api/admin/stats`
     - `GET http://127.0.0.1:8000/api/admin/beauticians`
3. **End-to-End User Simulation:**
   - Open `http://127.0.0.1:8000`
   - Add **Royal Dulhaniya D-Day Bridal Makeup** to Cart.
   - Switch kit mode to **Bring My Own (BYOP)** -> verify ₹1,500 labor deduction.
   - Apply coupon **BRIDALQUEEN** -> verify ₹1,500 coupon discount.
   - Confirm booking -> verify OTP is issued.
   - Switch to **Partner App** -> verify appointment appears.
   - Enter matching OTP -> verify status transitions to `IN_SERVICE`.
   - Complete booking -> verify review box opens and wallet updates.
