# Google Play Store Listing & Metadata Package
**Application Name:** Dulhaniya™ - Luxury Salon & Bridal at Home  
**Package Identifier:** `com.dulhaniya.app`  
**Target Platform:** Android 5.0+ (API Level 21 to 34)  
**Live Production Web Engine:** [https://dulhaniya.netlify.app/](https://dulhaniya.netlify.app/)  
**Privacy Policy URL:** [https://dulhaniya.netlify.app/privacy.html](https://dulhaniya.netlify.app/privacy.html)  

---

## 1. Store Metadata

### App Title (Max 30 characters)
`Dulhaniya: Salon & Bridal Home`

### Short Description (Max 80 characters)
`Doorstep salon & bridal luxury. Sealed SafeSeal kits & transparent pricing.`

### Full Description (Markdown for Google Play Console, < 4000 characters)
```text
Dulhaniya™ brings India's most opulent doorstep bridal beauty and certified salon rituals directly to your sanctuary. Designed with uncompromising standards of hygiene, safety, and transparent pricing, Dulhaniya is the premier home salon service for weddings, festive celebrations, and everyday pampering.

👑 WHY CHOOSE DULHANIYA?

• 100% TRANSPARENT PRICING — NO SURPRISES
Say goodbye to hidden surge fees or confusing meter clocks. Dulhaniya offers clear flat rates for every ritual, plus our exclusive Bring-Your-Own-Product (BYOP) option: deduct up to ₹1,500 by using your favorite salon products!

• SINGLE-USE SAFESEAL™ LUXURY KITS
Never worry about refilled bottles or unhygienic tools. Every Dulhaniya Deluxe treatment includes a factory-sealed, single-use SafeSeal™ kit unsealed right before your eyes. 

• AADHAAR-VERIFIED FEMALE BEAUTY SPECIALISTS
Your comfort and security are paramount. Every Dulhaniya partner undergoes comprehensive background screening, Aadhaar KYC verification, and rigorous salon artistry training.

• SECURE 4-DIGIT DOORSTEP OTP
Your treatment only commences when you verify and share your secret 4-digit code upon your specialist's arrival, guaranteeing complete control.

• 24x7 SOS EMERGENCY DISPATCH
Equipped with an instant SOS safety protocol connecting both client and specialist directly to our emergency dispatch response team.

✨ SIGNATURE SERVICES & LUXURY RITUALS

💍 Bridal & Wedding Troussseau:
- 24K Royal Gold & Diamond Radiance Facials
- Bridal HD & Airbrush Makeover consultations
- Organic Rajasthani Henna / Mehndi with dark clove finish
- Full-body polishing, aromatherapy scrubs, and glow packs

🌸 Everyday Luxury Salon:
- Gentle Peel Liposoluble waxing & Threading
- Ayurvedic Hair Spas & Deep Conditioning
- Botanical Manicures & Petal Pedicures with sterile single-use kits
- Ultrasonic skin rejuvenation & anti-aging hydration

🤖 AI BRIDAL CONSULTATION ADVISOR
Unsure which bridal ritual complements your ceremony? Use our 3-step AI Bridal Advisor to match your skin tone, undertone, and wedding outfit (Lehenga, Saree, Fusion) with bespoke treatment recommendations.

📍 REAL-TIME SPECIALIST TRACKING
Watch your beauty specialist arrive with live 5-stage status tracking, estimated arrival times, direct phone connect, and 1-click WhatsApp itinerary sharing.

---
Download Dulhaniya™ today and experience royal salon indulgence in the comfort and privacy of your home!
```

---

## 2. Store Categorization & Tags

- **Application Category:** Beauty (Alternative: Lifestyle)
- **Content Rating:** Everyone (PEGI 3 / USK 0)
- **Tags / Keywords:** `salon at home`, `bridal makeup`, `doorstep salon`, `facial`, `waxing`, `home beauty parlour`, `wedding beauty`, `mehndi artist`

---

## 3. Google Play Data Safety Disclosures

Google Play Console requires developers to complete the **Data Safety** questionnaire before publishing. Fill in the questionnaire as follows:

| Data Category | Data Type | Collected? | Shared? | Purpose | Ephemeral? |
|---|---|---|---|---|---|
| **Location** | Approximate & Precise Location | Yes (Only during booking) | No | App Functionality (Specialist doorstep dispatch) | No |
| **Personal Info** | Name, Phone Number | Yes | No | Account management, Doorstep OTP, Booking confirmations | No |
| **Device & App Activity** | Crash logs, App diagnostics | Yes | No | Performance diagnostics & quality assurance | Yes |

### Security Practices
- **Data Encrypted in Transit:** YES (TLS 1.3 / HTTPS encryption everywhere).
- **Data Deletion Request:** YES (Users can request account & booking data deletion via `privacy@dulhaniya.app`).
- **Target Audience:** Ages 18 and older.

---

## 4. Graphic Asset Specifications

To finalize your Google Play Console store presence, prepare the following visual assets:

1. **App Icon:** 512 x 512 px, 32-bit PNG (with alpha), max 1024 KB.
2. **Feature Graphic:** 1024 x 500 px, JPG or 24-bit PNG (no alpha).
3. **Phone Screenshots:** At least 2 screenshots, minimum 1080 x 1920 px (16:9 or 18:9 aspect ratio). Recommended views:
   - Hero banner with AI Consultation button
   - Rituals catalog showing SafeSeal and BYOP toggle
   - Cart summary showing transparent pricing breakdown
   - Real-time Doorstep Tracker with 4-digit OTP
4. **7-inch / 10-inch Tablet Screenshots:** (Optional but recommended for tablet visibility).

---

## 5. Google Play Console Publishing Steps

### Step 1: Open Google Play Console
1. Navigate to [Google Play Console](https://play.google.com/console).
2. Log in with your registered Google Play Developer Account.
3. Click **Create App**:
   - App Name: `Dulhaniya: Salon & Bridal Home`
   - Default language: `English (India)`
   - App or game: `App`
   - Free or paid: `Free`
   - Accept the Developer Program Policies.

### Step 2: Set Up Store Listing & Data Safety
1. Go to **Grow** > **Store presence** > **Main store listing**.
2. Copy and paste the Title, Short Description, and Full Description from Section 1 above.
3. Upload the App Icon and Feature Graphic.
4. Go to **Policy** > **App content** > **Data safety** and apply the answers from Section 3 above.
5. Provide the Privacy Policy URL: `https://dulhaniya.netlify.app/privacy.html`.

### Step 3: Build & Upload the Android App Bundle (`.aab`)
You can obtain the signed `.aab` file via either:
- **Cloud Build (Recommended):** Push your code to GitHub. GitHub Actions automatically executes `.github/workflows/android-build.yml` and uploads the production `.aab` as an artifact under the **Actions** tab of your repository!
- **Local Build:** Open the `android/` directory in Android Studio, select **Build** > **Generate Signed Bundle / APK**, and select **Android App Bundle**.

### Step 4: Submit for Review
1. In Google Play Console, go to **Release** > **Production** (or **Closed testing**).
2. Create a new release, upload the `.aab` file, write release notes: `Initial production release of Dulhaniya Luxury Bridal & Home Salon`.
3. Click **Review Release** and **Start rollout to Production**!
