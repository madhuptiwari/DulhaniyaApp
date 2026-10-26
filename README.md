# 👑 Dulhaniya - Luxury Salon & Bridal Studio at Home

**Dulhaniya** is an end-to-end salon-at-home and bridal beauty web application inspired by the convenience of home-salon services (like YesMadam) while incorporating an ethically transparent, customer-first, and patent-safe architecture.

---

## 🛡️ Intellectual Property & Patent-Free Design

Dulhaniya was purposefully engineered to avoid proprietary or patented methods:

1. **No Metered Per-Minute Algorithmic Hardware Billing**:
   - Rather than relying on proprietary per-minute metering or hardware timer tracking, Dulhaniya provides **honest, transparent flat and tiered package pricing** with upfront estimated durations (e.g., ₹2,299 for 75 mins).
2. **Dual-Mode Product Freedom (Fair Choice)**:
   - **Mode A: Dulhaniya Sealed Deluxe Kits** — Tamper-evident, single-client branded kits (O3+, L'Oreal, Cheryl's, Rica) opened directly in front of the customer.
   - **Mode B: Bring Your Own Products (BYOP)** — Customers can provide their own trusted cosmetics and pay only for professional certified labor with automatic deductions (saving up to 40%). This adheres to standard traditional salon practices free of cartridge patents.
3. **Dedicated Bridal Concierge Focus**:
   - Comprehensive wedding countdown timelines (Haldi Sunshine, Sangeet Glam, Shaadi D-Day HD/Airbrush Makeup, 7-Day Pre-Bridal Countdown, Saree Draping).

---

## 🌟 Key Application Features

### 1. Customer Experience
- **Interactive Multi-City Location Selector**: Delhi NCR, Mumbai, Bengaluru, Hyderabad, Jaipur, Chandigarh, Pune.
- **Rich Categorized Catalog**:
  - Bridal & Wedding Glow
  - Facials & Skin Rituals (O3+, Hydra-vacuum, Ayurvedic Kansa)
  - Painless Waxing (Rica Italian Chocolate, Peel-off Brazilian, Honey)
  - Manicure & Pedicure Spas (Crystal Bath, Rose Petals, Nail Art)
  - Hair Care, Spa & Styling (L'Oreal Mythic Oil, Bridal Bun Styling)
  - Bleach, Detan & Polishing Scrubs
  - Full Body Swedish & Ayurvedic Massages
  - Groom & Men's Salon
- **Transparent Bill Breakdown & Cart Drawer**:
  - Itemized services
  - Dual product toggle (Sealed Kit vs BYOP)
  - Add-ons & promo codes (`BRIDALQUEEN`, `DULHANIYA500`, `FIRSTGLOW`, `SHADI2026`)
  - Optional beautician tip (₹50, ₹100, ₹200)
  - Free disposable hygiene kit on orders over ₹1,999.
- **Smart Scheduling & Booking**:
  - Date selector (Today, Tomorrow, Pick Date)
  - 30-minute to 90-minute time slots (Morning, Afternoon, Evening)
  - Pay After Service (Cash/UPI to beautician) or Online UPI.

### 2. Live Booking Tracker & Safety State Machine
- **5-Stage Live Progress**: `CONFIRMED` ➔ `ASSIGNED` ➔ `ON_THE_WAY` ➔ `IN_SERVICE` ➔ `COMPLETED`.
- **4-Digit Secure Service Start OTP**: Displayed prominently to the client, verified by the beautician at the door before tools are unsealed.
- **Simulated Real-Time Route Map**: Animated GPS vehicle tracker showing the beautician approaching the customer's residence with dynamic ETA.
- **SOS 24x7 Safety Alert**: One-tap emergency escalation simulating location broadcast and Women Helpline (1091 / 112) integration.
- **Customer Reviews**: Rating and testimonial submission upon service completion.

### 3. Beautician Partner App View
- Seamlessly accessible via the top navigation toggle.
- Beauticians can view today's earnings, assigned appointments, mark *On The Way*, input customer OTP to start service, and check off mandatory hygiene standards.

### 4. Admin Operations Room
- Executive KPI overview: Gross Merchandise Value (GMV), Total Bookings, Active Field Orders, CSAT rating.
- Live dispatch table with real-time status updates.
- Service Catalog Manager: Add new beauty treatments directly to the database.

---

## 🚀 How to Run the Application

### Option 1: Quick Launcher (Windows)
Double-click `start.bat` in the project root. It will detect Python, start the server on port `8000`, and automatically open your default browser to `http://127.0.0.1:8000`.

### Option 2: Python Command Line
```powershell
python server.py
```
Or with `uv`:
```powershell
uv run python server.py
```
Then visit: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

### Option 3: Direct Browser Launch (Zero-Server Fallback)
Double click `public/index.html` directly in File Explorer. The web application includes built-in localStorage fallback and offline data synchronization!

---

## 📁 Project Structure

```
DulhaniyaApp/
├── server.py              # Multithreaded Python REST API & Static File Server
├── dulhaniya_db.py        # SQLite schema & database seed data
├── dulhaniya.db           # SQLite database
├── start.bat              # One-click Windows launcher
├── README.md              # Project documentation & patent compliance notes
└── public/
    ├── index.html         # Responsive Single Page Application
    ├── css/
    │   └── styles.css     # Luxury Bridal / Salon-at-Home design system
    └── js/
        ├── app.js         # Master controller, routing, and UI events
        ├── cart.js        # Cart state, transparent pricing, and coupon engine
        ├── tracker.js     # Live tracking, simulated map, and 4-digit OTP system
        ├── partner.js     # Beautician / Partner dashboard
        ├── admin.js       # Executive management control room
        └── data.js        # API client and local fallback dataset
```

---

## 📜 Compliance & Trademarks
All brand names (L'Oreal, O3+, Cheryl's, Rica, MAC, Huda Beauty) are trademarks of their respective owners and referenced purely for product authenticity and description.
