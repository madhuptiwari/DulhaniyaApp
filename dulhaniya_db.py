"""
Dulhaniya - SQLite Database & Seed Data Module
Safe, transparent, patent-free bridal & salon-at-home web platform.
"""
import sqlite3
import json
import os
import random
import hashlib
import secrets
from datetime import datetime, timedelta

DB_FILE = os.path.join(os.path.dirname(__file__), "dulhaniya.db")

def get_connection():
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA busy_timeout = 30000;")
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # 1. Categories
    cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        badge TEXT,
        sort_order INTEGER DEFAULT 0
    )
    """)

    # 2. Services
    cur.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_slug TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        duration_mins INTEGER NOT NULL,
        price INTEGER NOT NULL,
        discounted_price INTEGER NOT NULL,
        byo_product_discount INTEGER DEFAULT 150,
        rating REAL DEFAULT 4.9,
        review_count INTEGER DEFAULT 120,
        image_url TEXT,
        description TEXT,
        included_steps TEXT, -- JSON array
        products_used TEXT, -- JSON array
        is_bestseller INTEGER DEFAULT 0,
        is_bridal_exclusive INTEGER DEFAULT 0
    )
    """)

    # 3. Beauticians / Professionals
    cur.execute("""
    CREATE TABLE IF NOT EXISTS beauticians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        photo_url TEXT,
        experience_years INTEGER NOT NULL,
        rating REAL DEFAULT 4.9,
        jobs_completed INTEGER DEFAULT 250,
        phone TEXT,
        specialty TEXT,
        bio TEXT,
        certifications TEXT, -- JSON array
        is_verified INTEGER DEFAULT 1,
        is_available INTEGER DEFAULT 1,
        current_lat REAL DEFAULT 28.6139,
        current_lng REAL DEFAULT 77.2090
    )
    """)

    # 4. Coupons
    cur.execute("""
    CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        discount_type TEXT NOT NULL, -- 'percent' or 'flat'
        discount_value INTEGER NOT NULL,
        min_order_value INTEGER DEFAULT 500,
        max_discount INTEGER DEFAULT 1000,
        description TEXT
    )
    """)

    # 5. Bookings
    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_ref TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        pincode TEXT,
        service_date TEXT NOT NULL,
        service_slot TEXT NOT NULL,
        beautician_id INTEGER,
        total_amount INTEGER NOT NULL,
        discount_amount INTEGER DEFAULT 0,
        kit_type TEXT DEFAULT 'dulhaniya_kit', -- 'dulhaniya_kit' or 'byo_product'
        coupon_code TEXT,
        status TEXT DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'ASSIGNED', 'ON_THE_WAY', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'
        otp_code TEXT NOT NULL,
        payment_mode TEXT DEFAULT 'Pay After Service',
        payment_status TEXT DEFAULT 'PENDING',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        beautician_lat REAL,
        beautician_lng REAL,
        special_notes TEXT,
        FOREIGN KEY (beautician_id) REFERENCES beauticians(id)
    )
    """)

    # 6. Booking Items
    cur.execute("""
    CREATE TABLE IF NOT EXISTS booking_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        price INTEGER NOT NULL,
        duration_mins INTEGER NOT NULL,
        kit_choice TEXT DEFAULT 'dulhaniya_kit',
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )
    """)

    # 7. Reviews
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER,
        service_title TEXT,
        beautician_id INTEGER,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL,
        verified_purchase INTEGER DEFAULT 1
    )
    """)

    # 8. Users (Customers, Partners, Admin)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        partner_id INTEGER,
        token TEXT,
        addresses TEXT, -- JSON array
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    seed_if_empty(conn)
    conn.close()

def seed_catalog_data(conn):
    cur = conn.cursor()

    # Seed Categories
    categories = [
        ("Bridal & Wedding Glow", "bridal-wedding", "crown", "Exclusive bridal packages, HD airbrush makeup, saree draping & pre-wedding rituals", "Grand Bridal", 1),
        ("Facials & Skin Rituals", "facials-cleanups", "sparkles", "O3+, Diamond, Hydra, Tan-Clear, & Ayurvedic organic facials", "Trending", 2),
        ("Waxing & Smooth Skin", "waxing", "feather", "Rica Chocolate, Honey, Brazilian & Painless Roll-on Waxing", "Most Booked", 3),
        ("Manicure & Pedicure Spas", "mani-pedi", "gem", "Rose petal aroma soak, crystal scrub, gel nails & bridal foot spa", "Relaxing", 4),
        ("Hair Care, Spa & Styling", "hair-care", "scissors", "L'Oreal professional hair spa, keratin infusion, haircut & bridal buns", "Popular", 5),
        ("Bleach, Detan & Glow Packs", "bleach-detan", "sun", "Sara Oxy Detan, Raaga tan removal, Insta-glow herbal bleach", "Instant Glow", 6),
        ("Full Body Spa & Massages", "body-spa", "heart-pulse", "Swedish relaxation, Aromatherapy stress-relief & Ayurvedic potli", "Wellness", 7),
        ("Groom & Men's Salon", "groom-men", "smile", "Charcoal facial, beard styling, hair care & de-stress head massage", "For Him", 8)
    ]
    cur.executemany("""
    INSERT INTO categories (name, slug, icon, description, badge, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
    """, categories)

    # Seed Services
    services = [
        # Bridal & Wedding Glow
        (
            "bridal-wedding",
            "Royal Dulhaniya D-Day Bridal Makeup (HD / Airbrush)",
            "Complete luxury bridal look with premium international cosmetics",
            180, 14999, 10999, 1500, 4.98, 342,
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80",
            "Flawless bridal makeover tailored for high-definition photography and emotional moments. Includes skin prep, color correction, HD airbrush foundation, dramatic eye artistry, mink lashes, long-lasting lip artistry, dupatta/lehenga styling and floral jewelry pinning.",
            json.dumps(["Double Cleansing & Hydration Prep", "Skin Tone Correction & Primer", "HD/Airbrush Base Application", "Contour, Blush & Highlighter", "Artistic Eye Makeup & Mink Lashes", "Lip Contouring & Matte Lock", "Hair Bun / Floral Styling", "Lehenga / Saree Draping & Dupatta Pinning"]),
            json.dumps(["MAC Studio Fix", "Huda Beauty Rose Quartz Palette", "Estée Lauder Double Wear", "Charlotte Tilbury Flawless Filter", "Anastasia Beverly Hills Brow Kit"]),
            1, 1
        ),
        (
            "bridal-wedding",
            "Haldi & Mehendi Sunshine Radiance Look",
            "Fresh, dewy and joyful glow for daytime pre-wedding ceremonies",
            120, 6999, 4999, 800, 4.95, 218,
            "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=700&q=80",
            "Waterproof, dewy and radiant look with soft playful curls or floral braid. Specially formulated sweat-proof products to withstand joyful turmeric rituals and mehendi festivities.",
            json.dumps(["Radiance Hydration Mask", "Sweat-proof Dewy Foundation Base", "Sun-kissed Peach/Coral Blush", "Waterproof Eye Makeup", "Messy Braid or Floral Half-Updo", "Dupatta Setting"]),
            json.dumps(["Bobbi Brown Dewy Glow", "Clinique Moisture Surge", "Too Faced Better Than Sex Waterproof", "Rare Beauty Liquid Blush"]),
            1, 1
        ),
        (
            "bridal-wedding",
            "Sangeet & Cocktail Glam Night Look",
            "Smokey eyes, glitter glam and high-voltage evening elegance",
            150, 8999, 6499, 900, 4.94, 189,
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
            "Bold, shimmering and party-ready bridal look designed to dazzle under stage lights and dance through the night. Includes volumized Hollywood waves or structured updo.",
            json.dumps(["Primer & Strobe Cream Glow", "Long-wear Matte Foundation", "Shimmer Smokey Eyes with Pressed Pigments", "Winged Eyeliner & Volumizing Lashes", "Sculpted Contour", "Glam Hollywood Waves or Updo", "Saree/Gown Draping"]),
            json.dumps(["NARS Radiant Longwear", "Urban Decay Naked Palette", "Fenty Beauty Highlighter", "Kryolan Fixer Spray"]),
            0, 1
        ),
        (
            "bridal-wedding",
            "7-Day Pre-Bridal Countdown Radiance Ritual",
            "Holistic full body makeover: Facial + Full Body Wax + Detan + Mani-Pedi + Hair Spa",
            300, 12999, 8499, 1200, 4.99, 412,
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
            "The quintessential bridal countdown package. Takes care of all your skin, hair, and body wellness right at your home with sterilized tools and soothing aromatics.",
            json.dumps(["Sara Oxy Full Body Detan", "Rica Chocolate Full Body Waxing", "O3+ Bridal Whitening & Glow Facial", "Rose Petal Crystal Manicure & Pedicure", "L'Oreal Mythic Oil Deep Hair Spa", "Full Body Polishing Scrub"]),
            json.dumps(["O3+ Bridal Kit (Sealed)", "Rica Italian Wax", "L'Oreal Professional Spa Creambath", "Sara Ayurvedic Detan Pack"]),
            1, 1
        ),
        (
            "bridal-wedding",
            "Traditional Saree & Dupatta Draping Masterclass",
            "Ironed pleats, pin-free comfort and regal silhouette",
            45, 1499, 999, 200, 4.91, 156,
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80",
            "Professional draping in South Indian Kanjeevaram, Bengali, Gujarati, Nauvari, Lehenga Saree or Double Dupatta bridal styling with zero sagging.",
            json.dumps(["Measurement & Pleat Planning", "Safety Pin & Grip Reinforcement", "Pallu Draping & Shoulder Pinning", "Dupatta Crown Placement"]),
            json.dumps(["Bridal Cushion Pins", "Silicon Grip Tape", "Invisible Draping Clips"]),
            0, 1
        ),

        # Facials & Skin Rituals
        (
            "facials-cleanups",
            "O3+ Bridal Luxury Glow Facial",
            "India's #1 dermatological glow facial for glass-like luminosity",
            75, 3499, 2299, 350, 4.96, 680,
            "https://images.unsplash.com/photo-1512290900672-1f02e6462791?auto=format&fit=crop&w=700&q=80",
            "Infused with botanical actives, lactic acid and pure oxygenating complex. Removes deep stubborn pigmentation, reduces pores, and restores a bridal translucent glow.",
            json.dumps(["O3+ Deep Cleanser", "Derma Polish Micro Exfoliation", "Meladerm Vitamin C Serum Infusion", "Hydrating Lymphatic Massage (20 mins)", "Peel-Off Rubber Alginate Brightening Mask", "UV Protective Finish Serum"]),
            json.dumps(["O3+ Sealed Monodose Kit", "Rose Water Hydrosol", "Sterilized Blackhead Extractor"]),
            1, 0
        ),
        (
            "facials-cleanups",
            "Hydra-Infusion Glow Facial with Ultrasound Wand",
            "Deep pore vacuum cleanse, hyaluronic surge and cold hammer lock",
            60, 3999, 2699, 400, 4.93, 310,
            "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=700&q=80",
            "Next-gen hydro-dermabrasion facial performed in the comfort of your room. Eliminates blackheads, infuses peptides and gives instantaneous plumpness.",
            json.dumps(["AHA/BHA Solution Exfoliation", "Hydro-Vacuum Pore Extraction", "Ultrasonic Peptide Infusion", "Cryo-Hammer Skin Tightening", "LED Blue/Red Light Therapy Shield"]),
            json.dumps(["Hyaluronic Acid 2% + B5", "Centella Asiatica Calming Ampoule", "Collagen Sheet Mask"]),
            1, 0
        ),
        (
            "facials-cleanups",
            "Cheryl's TanClear Brightening Facial",
            "Gentle sun-tan reversal with natural fruit enzymes and milk proteins",
            50, 2199, 1499, 250, 4.88, 450,
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=700&q=80",
            "Formulated by Cheryl's Cosmeceuticals to undo sun damage, even out skin tone and infuse intense radiance without irritation.",
            json.dumps(["TanClear Cleansing Gel", "Bio-Enzyme Scrub Peel", "Radiance Whitening Massage Cream", "Lightening Pack with Licorice Extract", "Derma Sunblock SPF 50"]),
            json.dumps(["Cheryl's Cosmeceuticals Single-Use Sealed Kit"]),
            0, 0
        ),
        (
            "facials-cleanups",
            "Organic Ayurvedic Kansa Wand Face Cleanup",
            "Detoxifying bronze wand acupressure massage with kumkumadi oil",
            45, 1599, 1099, 200, 4.89, 290,
            "https://images.unsplash.com/photo-1522337094346-24b585352c8c?auto=format&fit=crop&w=700&q=80",
            "Ancient healing ritual using pure copper & tin Kansa metal alloy. Pulls out acidity, tones facial muscles, and brings natural rosy warmth.",
            json.dumps(["Herbal Rose & Turmeric Cleansing", "Walnut Shell Gentle Scrub", "Steam & Blackhead Purifying", "Pure Kumkumadi Tailam Massage with Kansa Wand", "Sandalwood & Multani Mitti Lep"]),
            json.dumps(["Kama Ayurveda Kumkumadi Oil", "Pure Vedic Bronze Kansa Wand", "Kashmiri Rose Hydrosol"]),
            0, 0
        ),

        # Waxing & Smooth Skin
        (
            "waxing",
            "Rica Chocolate Full Body Waxing (Italian Luxury)",
            "Colophony-free, virtually painless hair removal with cocoa butter",
            90, 3199, 2199, 300, 4.97, 1250,
            "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=700&q=80",
            "Original Italian Rica wax that adheres only to the hair and not to the skin. Zero redness, prevents ingrown hair and leaves skin velvety smooth for 4+ weeks.",
            json.dumps(["Skin Sanitization & Cotton Gel Prep", "Full Arms + Underarms Rica Waxing", "Full Legs Rica Waxing", "Soothing Tea Tree Post-Wax Lotion", "Ingrown Prevention Spray"]),
            json.dumps(["Rica Italy White Chocolate Wax", "Disposable Non-Woven Wax Strips", "Sterilized Wooden Spatulas"]),
            1, 0
        ),
        (
            "waxing",
            "Rica Brazilian / Bikini Peel-Off Hard Wax",
            "Ultra-sensitive strip-less avocado butter wax for delicate areas",
            30, 1799, 1199, 200, 4.92, 590,
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80",
            "100% hygienic, strip-less peel wax with pre-wax soothing oil and post-wax aloe vera cooling gel. Handled only by certified senior aestheticians.",
            json.dumps(["Antiseptic Cleansing Wipe", "Pre-Wax Calming Lavender Oil", "Strip-less Rica Hard Wax Application", "Painless Fast Lift", "Aloe Vera + Vitamin E Calming Pack"]),
            json.dumps(["Rica Brazilian Hard Wax Beads", "Single-Use Disposable Undergarments & Sheets"]),
            0, 0
        ),
        (
            "waxing",
            "Honey Herbal Full Arms + Full Legs + Underarms",
            "Budget-friendly classic natural honey wax for silky hairless skin",
            60, 1499, 999, 150, 4.86, 920,
            "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=700&q=80",
            "Classic natural sugar & honey formulation enriched with lemon juice. Cleans dead skin cells while leaving arms and legs silky and soft.",
            json.dumps(["Talc Dusting & Moisture Removal", "Full Arms & Underarms Waxing", "Full Legs Waxing", "Cucumber Cool Astringent Mist"]),
            json.dumps(["Patanjali / Sleek Natural Honey Wax", "Sanitized Disposable Towels"]),
            0, 0
        ),

        # Manicure & Pedicure Spas
        (
            "mani-pedi",
            "Dulhaniya Bridal Crystal Spa Pedicure",
            "Effervescent bubbling salt soak, diamond heel filing & foot massage",
            60, 1899, 1299, 200, 4.95, 740,
            "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80",
            "Luxurious foot restoration experience. Deeply softens cracked heels, massages tired arches, and leaves toenails polished to perfection with salon shine.",
            json.dumps(["Warm Himalayan Crystal Salt & Rose Soak", "Nail Shaping, Cuticle Care & Buffing", "Diamond Callus & Dead Skin Filing", "Dead Sea Salt Sugar Scrub", "Aromatherapy Foot & Calf Reflexology Massage (20 mins)", "Moisture Lock Paraffin Booties & Base Polish"]),
            json.dumps(["Bombini Crystal Bath Fizz", "Sterilized Stainless Cuticle Tools", "OPI Natural Base & Top Coat"]),
            1, 0
        ),
        (
            "mani-pedi",
            "Rose Petal Aroma Deluxe Manicure",
            "Botanical cuticle nourishing, hand scrub & relaxing acupressure",
            45, 1299, 899, 150, 4.91, 580,
            "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80",
            "Complete hand pampering. Eliminates sun tan on hands and fingers, hydrates brittle nails, and includes an ultra-relaxing wrist and forearm massage.",
            json.dumps(["Rose Water Warm Soak", "Filing, Shaping & Buffing", "Gentle Walnut Hand Exfoliation", "Rose Essential Oil Acupressure Massage", "Cuticle Nourishing Oil Drop"]),
            json.dumps(["Organic Rose Petals", "Lotus Herbals Manicare Scrub", "Sally Hansen Cuticle Rehab"]),
            0, 0
        ),
        (
            "mani-pedi",
            "Bridal Nail Art & Gel Polish Duo",
            "Long-lasting chip-free gel polish with subtle bridal stones or French tips",
            60, 2499, 1799, 250, 4.93, 310,
            "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80",
            "Professional UV/LED cured gel polish that lasts 3+ weeks through all wedding ceremonies. Includes 2 accent designer nail art finger accents.",
            json.dumps(["Nail Dehydrator & Primer", "Base Coat UV Curing", "Dual Layer Gel Pigment", "Bridal Glitters / Stones / Chrome Accent", "High-Gloss Top Coat Curing"]),
            json.dumps(["OPI GelColor", "Bluesky Professional LED Lamp", "Swarovski Crystals (Accent)"]),
            0, 1
        ),

        # Hair Care, Spa & Styling
        (
            "hair-care",
            "L'Oreal Mythic Oil Deep Nourishing Hair Spa",
            "Argan oil infusion, steam cocoon, and soothing scalp tension release",
            60, 2299, 1599, 250, 4.94, 880,
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80",
            "Reverses frizz, chemical damage and split ends. Includes hot ozone steam penetration and 20 minutes of rhythmic Indian champi scalp massage.",
            json.dumps(["Scalp Analysis & Detangling", "L'Oreal Creambath + Argan Concentrate Application", "20-min Deep Scalp & Neck Massage", "Hot Towel Steam Cocoon", "Rinse & Serum Infusion"]),
            json.dumps(["L'Oreal Professionnel Hair Spa Creambath", "Mythic Oil Argan Elixir", "Thermal Steam Cap"]),
            1, 0
        ),
        (
            "hair-care",
            "Bridal Designer Hair Updo & Floral Bun Styling",
            "Regal bridal braids, messy floral buns or vintage cascading waves",
            60, 2999, 1999, 300, 4.96, 420,
            "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=700&q=80",
            "Crafted to hold securely for 12+ hours with heavy dupattas and maang tikka. Fresh baby's breath, red roses or gajra arrangement included.",
            json.dumps(["Texture Prep & Heat Protection", "Crimping & Backcombing for Volume", "Structural Donut Bun or Textured Braiding", "Maang Tikka & Matha Patti Anchoring", "Fresh Flower / Gajra Pinning", "Strong Hold Finishing Spray"]),
            json.dumps(["Schwarzkopf Osis+ Freeze Spray", "Toni&Guy Heat Protection Mist", "Handpicked Fresh Jasmine/Rose Gajra"]),
            0, 1
        ),

        # Bleach, Detan & Glow Packs
        (
            "bleach-detan",
            "Sara Oxy D-Tan Face, Neck & Arms Brightener",
            "Gentle eucalyptus & camphor tan removal pack with instant brightening",
            40, 1299, 899, 150, 4.90, 610,
            "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=700&q=80",
            "Non-irritating, ammonia-free detan formulation that reverses tan lines caused by Indian sun exposure within a single 40-minute session.",
            json.dumps(["Clarifying Face Wash", "Sara Oxy D-Tan Mask Application", "Cool Rose Water Pad Eye Rest", "Steam & Wet Towel Cleanse", "Aloe Soothing Gel Finish"]),
            json.dumps(["Sara Oxy D-Tan Sealed Pack", "Organic Rose Mist"]),
            1, 0
        ),
        (
            "bleach-detan",
            "Full Body Bridal De-Tan & Polishing Scrub",
            "Exfoliates dead skin, softens dark elbows/knees and evens tone",
            75, 2999, 1999, 300, 4.93, 340,
            "https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=700&q=80",
            "Full body therapy covering back, stomach, arms, legs and neck with coffee walnut scrub followed by detan clay pack.",
            json.dumps(["Dry Body Brushing", "Coffee-Walnut Sugar Exfoliation", "Herbal Detan Mud Wrap", "Warm Towel Steam Bath Wipe", "Hydrating Shea Butter Body Lotion"]),
            json.dumps(["mCaffeine Roasted Arabica Scrub", "Sara Body Detan", "The Body Shop Shea Butter"]),
            0, 0
        ),

        # Full Body Spa & Massages
        (
            "body-spa",
            "Dulhaniya Swedish Stress-Relief Full Body Massage",
            "Full 60 mins of gentle long strokes to dissolve pre-wedding exhaustion",
            60, 2699, 1899, 250, 4.97, 720,
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80",
            "Performed with warm cold-pressed sweet almond oil and lavender aroma. Eases back pain, improves blood circulation and relaxes mind and body.",
            json.dumps(["Foot Cleansing Ritual", "Upper & Lower Back Massage", "Shoulder, Neck & Arm Tension Relief", "Legs & Feet Reflexology", "Head & Scalp Calming Release"]),
            json.dumps(["Cold-pressed Almond Oil", "French Lavender Essential Oil", "Disposable Linen & Disinfected Towels"]),
            1, 0
        ),
        (
            "body-spa",
            "Traditional Ayurvedic Potli Warm Herbal Massage",
            "Steamed cloth pouches filled with 12 medicinal herbs for muscle aches",
            75, 3299, 2399, 300, 4.92, 280,
            "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=700&q=80",
            "Ancient therapy (Kizhi) using warm medicated boluses dipped in warm Dhanwantharam oil. Deeply rejuvenates tired nerves and alleviates joint stiffness.",
            json.dumps(["Abhyanga Warm Oil Body Rub", "Herbal Potli Steaming & Rhythmic Pounding", "Spinal Column Soothing", "Warm Herbal Towel Cleanse"]),
            json.dumps(["Kottakkal Arya Vaidya Sala Dhanwantharam Tailam", "Kizhi Herbal Potlis (Ashwagandha, Nirgundi, Ginger)"]),
            0, 0
        ),

        # Groom & Men's Salon
        (
            "groom-men",
            "Royal Groom D-Day Shaving, Beard Sculpt & Facial",
            "Sharp beard contouring, detox charcoal scrub & gold glow facial",
            75, 2999, 1999, 250, 4.91, 390,
            "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80",
            "Designed specially for grooms and gentlemen. Refines beard lines, deep cleanses pores clogged by city pollution, and provides an energized, camera-ready finish.",
            json.dumps(["Hot Towel Beard Softening", "Precision Razor/Trimmer Edge Shaping", "Charcoal Face Scrub & Blackhead Extraction", "Groom Radiance Cream Massage", "Peel-Off Gold Alginate Mask", "Beard Oil & Matte SPF Finish"]),
            json.dumps(["Beardo Activated Charcoal Kit", "Bombay Shaving Company Pre-Shave Oil", "L'Oreal Men Expert Hydra Energetic"]),
            1, 0
        ),
        (
            "groom-men",
            "Anti-Stress Head Champi & Hair Loss Therapy",
            "Warm Bhringraj oil massage + high-frequency scalp stimulation",
            45, 1499, 999, 150, 4.93, 440,
            "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&w=700&q=80",
            "Intense traditional head, neck and shoulder massage to melt away workday stress and activate dormant hair follicles.",
            json.dumps(["Deep Scalp Detangling", "Warm Forest Essentials Bhringraj Oil Massage", "Acupressure Tension Point Release", "Shoulder & Upper Back Kneading", "High Frequency Comb (5 mins)"]),
            json.dumps(["Forest Essentials Ayurvedic Bhringraj Taila", "High Frequency Scalp Wand"]),
            0, 0
        )
    ]

    cur.executemany("""
    INSERT INTO services (
        category_slug, title, subtitle, duration_mins, price, discounted_price,
        byo_product_discount, rating, review_count, image_url, description,
        included_steps, products_used, is_bestseller, is_bridal_exclusive
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, services)

    # Seed Beauticians
    beauticians = [
        (
            "Pooja Sharma",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
            9, 4.98, 1420, "+91 98112 34567",
            "Elite Bridal Makeup Artist & Skin Specialist",
            "Certified from London School of Makeup & VLCC. Over 9 years of creating magical bridal looks and glowing skin across Delhi NCR.",
            json.dumps(["CIDESCO International Diplome", "VLCC Master Esthetician", "Police Background Verified 2026", "Double Vaccinated & Sanitization Certified"]),
            1, 1, 28.6289, 77.2065
        ),
        (
            "Sunita Verma",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
            7, 4.95, 980, "+91 98223 45678",
            "Senior Waxing & Spa Therapist",
            "Rica Italian Wax Master certified. Renowned for zero-pain waxing techniques, relaxing Swedish therapy, and warm gentle bedside manner.",
            json.dumps(["Rica Italy Certified Master", "Habibs Hair & Skin Academy", "Verified Female Professional", "Hygiene Level 5 Star"]),
            1, 1, 28.6145, 77.2180
        ),
        (
            "Ananya Sen",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            6, 4.96, 750, "+91 98334 56789",
            "Bridal Hair Stylist & Nail Art Designer",
            "Specialist in intricate Sabyasachi floral buns, Hollywood curls, and bridal gel nail extensions. Has styled over 400 Indian brides.",
            json.dumps(["Toni & Guy Advanced Styling", "OPI International Gel Specialist", "Verified Background Clear", "Clean Kit Certified"]),
            1, 1, 28.6410, 77.2250
        ),
        (
            "Meena Kumari",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
            11, 4.99, 1850, "+91 98445 67890",
            "Ayurvedic Kansa & O3+ Derma Specialist",
            "11+ years senior aesthetician. Deep expertise in customized facial treatments, tan reversal and pressure-point relaxation therapy.",
            json.dumps(["Kottakkal Ayurvedic Therapy Diploma", "O3+ Derma Certified Lead", "Police Background Verified", "5-Star Top Partner"]),
            1, 1, 28.5980, 77.1950
        )
    ]

    cur.executemany("""
    INSERT INTO beauticians (
        name, photo_url, experience_years, rating, jobs_completed, phone,
        specialty, bio, certifications, is_verified, is_available,
        current_lat, current_lng
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, beauticians)

    # Seed Coupons
    coupons = [
        ("DULHANIYA500", "flat", 500, 1499, 500, "Flat ₹500 off on bridal & salon bookings above ₹1499"),
        ("FIRSTGLOW", "percent", 20, 799, 400, "20% off on your very first salon-at-home order!"),
        ("BRIDALQUEEN", "flat", 1500, 4999, 1500, "Save ₹1500 on all D-Day Bridal Makeup & Countdown rituals"),
        ("SHADI2026", "percent", 15, 1999, 750, "Wedding season special: 15% off up to ₹750")
    ]
    cur.executemany("""
    INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount, description)
    VALUES (?, ?, ?, ?, ?, ?)
    """, coupons)

    # Seed Sample Reviews
    sample_reviews = [
        ("Royal Dulhaniya D-Day Bridal Makeup (HD / Airbrush)", 1, "Kritika Mehra", 5, "Pooja did my bridal makeup for my wedding in Connaught Place. Everyone in the mandap was gasping! Flawless, didn't crack at all even after 8 hours of rituals. True artist!"),
        ("O3+ Bridal Luxury Glow Facial", 4, "Rhea Sengupta", 5, "I had severe tanning after my bachelorette trip. Meena arrived exactly on time with a sealed kit, showed me the expiry date, and the facial glow was insane. My skin feels like butter!"),
        ("Rica Chocolate Full Body Waxing (Italian Luxury)", 2, "Sneha Kapoor", 5, "Sunita is so gentle! Rica wax made a huge difference, practically painless compared to normal salon wax. Loved the disposable sheets and hygiene standard."),
        ("Dulhaniya Bridal Crystal Spa Pedicure", 3, "Tanvi Rao", 5, "Such a relaxing pedicure at home! The rose crystal soak and foot massage took away all my wedding shopping fatigue. Ananya was fantastic!"),
        ("7-Day Pre-Bridal Countdown Radiance Ritual", 1, "Simran Walia", 5, "Best decision to book Dulhaniya instead of traveling back and forth to crowded parlors. Full salon setup at home with music, disposable towels and 100% transparent pricing.")
    ]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for r in sample_reviews:
        cur.execute("""
        INSERT INTO reviews (service_title, beautician_id, customer_name, rating, comment, created_at, verified_purchase)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (r[0], r[1], r[2], r[3], r[4], now_str))

    # Seed an Initial Active Demo Booking for live tracking demo
    demo_otp = str(random.randint(1000, 9999))
    demo_ref = "DLH-9842"
    cur.execute("""
    INSERT INTO bookings (
        booking_ref, customer_name, customer_phone, customer_email,
        address, city, pincode, service_date, service_slot,
        beautician_id, total_amount, discount_amount, kit_type,
        coupon_code, status, otp_code, payment_mode, payment_status,
        created_at, updated_at, beautician_lat, beautician_lng, special_notes
    ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
    )
    """, (
        demo_ref, "Aanya Sharma", "+91 98765 43210", "aanya@example.com",
        "Villa 42, Gulmohar Enclave, Near Saket Metro", "New Delhi", "110017",
        (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"), "10:30 AM - 11:30 AM",
        1, 3198, 500, "dulhaniya_kit",
        "DULHANIYA500", "ON_THE_WAY", demo_otp, "Pay After Service", "PENDING",
        now_str, now_str, 28.6250, 77.2100, "Please bring fresh red roses for hair bun."
    ))

    booking_id = cur.lastrowid
    cur.execute("""
    INSERT INTO booking_items (booking_id, service_id, title, price, duration_mins, kit_choice)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (booking_id, 6, "O3+ Bridal Luxury Glow Facial", 2299, 75, "dulhaniya_kit"))
    cur.execute("""
    INSERT INTO booking_items (booking_id, service_id, title, price, duration_mins, kit_choice)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (booking_id, 13, "Dulhaniya Bridal Crystal Spa Pedicure", 1299, 60, "dulhaniya_kit"))

    conn.commit()

def seed_users_data(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users")
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if cur.fetchone()[0] == 0:
        demo_users = [
            (
                "Komal Singhania",
                "customer@dulhaniya.com",
                "+91 98765 12345",
                hash_password("customer123"),
                "customer",
                None,
                "dlh_tok_customer123",
                json.dumps([
                    {
                        "id": 1,
                        "label": "Home",
                        "address": "Flat 402, Tower B, Palm Meadows, Saket",
                        "city": "New Delhi",
                        "pincode": "110017",
                        "landmark": "Opposite Saket City Club",
                        "is_default": True
                    }
                ]),
                now_str
            ),
            (
                "Pooja Sharma",
                "partner@dulhaniya.com",
                "+91 98112 34567",
                hash_password("partner123"),
                "partner",
                1,
                "dlh_tok_partner123",
                json.dumps([]),
                now_str
            ),
            (
                "Operations Director",
                "admin@dulhaniya.com",
                "+91 98000 00000",
                hash_password("dulhaniya@royal2026"),
                "admin",
                None,
                "dlh_adm_royal2026",
                json.dumps([]),
                now_str
            )
        ]
        cur.executemany("""
        INSERT INTO users (name, email, phone, password_hash, role, partner_id, token, addresses, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_users)
        conn.commit()

    # Update any existing Komal booking or insert
    cur.execute("UPDATE bookings SET customer_email = 'customer@dulhaniya.com' WHERE customer_phone = '+91 98765 12345' AND (customer_email IS NULL OR customer_email = '' OR customer_email = 'komal.s@example.com')")
    conn.commit()
    cur.execute("SELECT COUNT(*) FROM bookings WHERE customer_email = 'customer@dulhaniya.com' OR customer_phone = '+91 98765 12345'")
    if cur.fetchone()[0] == 0:
        demo_ref_komal = "DLH-7102"
        demo_otp_komal = "3189"
        cur.execute("""
        INSERT INTO bookings (
            booking_ref, customer_name, customer_phone, customer_email,
            address, city, pincode, service_date, service_slot,
            beautician_id, total_amount, discount_amount, kit_type,
            coupon_code, status, otp_code, payment_mode, payment_status,
            created_at, updated_at, beautician_lat, beautician_lng, special_notes
        ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, 'CONFIRMED', ?, 'Pay After Service', 'PENDING',
            ?, ?, 28.6289, 77.2065, 'Please sanitize tools before service.'
        )
        """, (
            demo_ref_komal, "Komal Singhania", "+91 98765 12345", "customer@dulhaniya.com",
            "Flat 402, Tower B, Palm Meadows, Saket", "New Delhi", "110017",
            (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"), "02:30 PM - 04:00 PM",
            1, 2299, 0, "dulhaniya_kit",
            "", demo_otp_komal, now_str, now_str
        ))
        b2_id = cur.lastrowid
        cur.execute("""
        INSERT INTO booking_items (booking_id, service_id, title, price, duration_mins, kit_choice)
        VALUES (?, 6, 'O3+ Bridal Luxury Glow Facial', 2299, 75, 'dulhaniya_kit')
        """, (b2_id,))
        conn.commit()

def seed_if_empty(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM categories")
    if cur.fetchone()[0] == 0:
        seed_catalog_data(conn)
    seed_users_data(conn)

# ----------------- User Authentication & Management Helpers -----------------

def hash_password(password: str) -> str:
    if not password:
        return ""
    return hashlib.sha256(password.strip().encode("utf-8")).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    if not password or not hashed:
        return False
    return hashed == password or hashed == hash_password(password)

def generate_token(prefix: str = "dlh_tok_") -> str:
    return f"{prefix}{secrets.token_hex(16)}"

def get_user_by_id(user_id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            return None
        u = dict(row)
        u["addresses"] = json.loads(u["addresses"]) if u["addresses"] else []
        return u
    finally:
        conn.close()

def get_user_by_email(email):
    if not email:
        return None
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
        row = cur.fetchone()
        if not row:
            return None
        u = dict(row)
        u["addresses"] = json.loads(u["addresses"]) if u["addresses"] else []
        return u
    finally:
        conn.close()

def get_user_by_token(token):
    if not token:
        return None
    token = token.strip()
    if token.startswith("Bearer "):
        token = token[7:].strip()
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE token = ?", (token,))
        row = cur.fetchone()
        if not row:
            # Check hardcoded default admin token
            if token == "dlh_adm_royal2026":
                cur.execute("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
                row = cur.fetchone()
                if row:
                    u = dict(row)
                    u["addresses"] = json.loads(u["addresses"]) if u["addresses"] else []
                    return u
            return None
        u = dict(row)
        u["addresses"] = json.loads(u["addresses"]) if u["addresses"] else []
        return u
    finally:
        conn.close()

def get_user_by_identifier(identifier):
    if not identifier:
        return None
    ident = str(identifier).strip()
    conn = get_connection()
    try:
        cur = conn.cursor()
        if ident.lower() in ("admin", "admin@dulhaniya.com"):
            cur.execute("SELECT * FROM users WHERE role = 'admin' LIMIT 1")
        else:
            cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phone = ?", (ident, ident))
        row = cur.fetchone()
        if not row:
            return None
        u = dict(row)
        u["addresses"] = json.loads(u["addresses"]) if u["addresses"] else []
        return u
    finally:
        conn.close()

def create_user(name, email, phone, password, role="customer", partner_id=None, addresses=None, token=None):
    conn = get_connection()
    try:
        cur = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pwd_hash = hash_password(password)
        addr_json = json.dumps(addresses if addresses is not None else [])
        if token is None:
            prefix = "dlh_adm_" if role == "admin" else ("dlh_prt_" if role == "partner" else "dlh_usr_")
            token = generate_token(prefix)

        cur.execute("""
        INSERT INTO users (name, email, phone, password_hash, role, partner_id, token, addresses, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, email.strip().lower(), phone, pwd_hash, role, partner_id, token, addr_json, now_str))
        user_id = cur.lastrowid
        conn.commit()

        return {
            "id": user_id,
            "name": name,
            "email": email.strip().lower(),
            "phone": phone,
            "role": role,
            "partner_id": partner_id,
            "token": token,
            "addresses": addresses if addresses is not None else []
        }
    finally:
        conn.close()

def authenticate_user(identifier, password, role=None):
    user = get_user_by_identifier(identifier)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    if role and user["role"] != role:
        return None

    token = user["token"]
    if not token:
        prefix = "dlh_adm_" if user["role"] == "admin" else ("dlh_prt_" if user["role"] == "partner" else "dlh_usr_")
        token = generate_token(prefix)
        update_user_token(user["id"], token)
        user["token"] = token

    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"user": safe_user, "token": token}

def update_user_token(user_id, token):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE users SET token = ? WHERE id = ?", (token, user_id))
        conn.commit()
    finally:
        conn.close()

def update_user_addresses(user_id, addresses):
    conn = get_connection()
    try:
        cur = conn.cursor()
        addr_json = json.dumps(addresses)
        cur.execute("UPDATE users SET addresses = ? WHERE id = ?", (addr_json, user_id))
        conn.commit()
        return addresses
    finally:
        conn.close()

def get_user_bookings(user_identifier=None, email=None, phone=None):
    conn = get_connection()
    try:
        cur = conn.cursor()
        clauses = []
        params = []
        if user_identifier:
            ident = str(user_identifier).strip()
            clauses.append("(LOWER(b.customer_email) = LOWER(?) OR b.customer_phone = ? OR b.customer_name = ?)")
            params.extend([ident, ident, ident])
        if email:
            clauses.append("LOWER(b.customer_email) = LOWER(?)")
            params.append(str(email).strip())
        if phone:
            clauses.append("b.customer_phone = ?")
            params.append(str(phone).strip())

        if not clauses:
            return []

        sql = f"""
        SELECT b.*, be.name as beautician_name, be.phone as beautician_phone, be.photo_url as beautician_photo
        FROM bookings b
        LEFT JOIN beauticians be ON b.beautician_id = be.id
        WHERE {' OR '.join(clauses)}
        ORDER BY b.id DESC
        """
        cur.execute(sql, params)
        bookings = []
        for r in cur.fetchall():
            b = dict(r)
            cur.execute("SELECT * FROM booking_items WHERE booking_id = ?", (b["id"],))
            b["items"] = [dict(it) for it in cur.fetchall()]
            bookings.append(b)
        return bookings
    finally:
        conn.close()

def get_partner_dashboard_data(partner_id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM beauticians WHERE id = ?", (partner_id,))
        b_row = cur.fetchone()
        if not b_row:
            return None
        partner = dict(b_row)
        partner["certifications"] = json.loads(partner["certifications"]) if partner["certifications"] else []

        cur.execute("SELECT * FROM bookings WHERE beautician_id = ? ORDER BY id DESC", (partner_id,))
        all_jobs = []
        for r in cur.fetchall():
            job = dict(r)
            cur.execute("SELECT * FROM booking_items WHERE booking_id = ?", (job["id"],))
            job["items"] = [dict(it) for it in cur.fetchall()]
            all_jobs.append(job)

        active_jobs = [j for j in all_jobs if j["status"] in ("CONFIRMED", "ASSIGNED", "ON_THE_WAY", "IN_SERVICE")]
        completed_jobs = [j for j in all_jobs if j["status"] == "COMPLETED"]
        today_str = datetime.now().strftime("%Y-%m-%d")
        today_completed = [j for j in completed_jobs if (j.get("service_date") == today_str or (j.get("updated_at") and j["updated_at"].startswith(today_str)))]
        today_earnings = sum(j.get("total_amount", 0) for j in (today_completed if today_completed else completed_jobs))

        return {
            "partner": partner,
            "duty_status": bool(partner["is_available"]),
            "is_available": bool(partner["is_available"]),
            "today_earnings": today_earnings,
            "earnings_today": today_earnings,
            "jobs_completed": len(completed_jobs) + (partner.get("jobs_completed", 0) or 0),
            "completed_today": len(today_completed),
            "active_jobs": active_jobs,
            "recent_jobs": all_jobs[:10]
        }
    finally:
        conn.close()

def get_partner_jobs(partner_id):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM bookings WHERE beautician_id = ? ORDER BY id DESC", (partner_id,))
        jobs = []
        for r in cur.fetchall():
            job = dict(r)
            cur.execute("SELECT * FROM booking_items WHERE booking_id = ?", (job["id"],))
            job["items"] = [dict(it) for it in cur.fetchall()]
            jobs.append(job)
        return jobs
    finally:
        conn.close()

def update_partner_duty(partner_id, is_available=None):
    conn = get_connection()
    try:
        cur = conn.cursor()
        if is_available is None:
            cur.execute("UPDATE beauticians SET is_available = CASE WHEN is_available = 1 THEN 0 ELSE 1 END WHERE id = ?", (partner_id,))
        else:
            val = 1 if is_available else 0
            cur.execute("UPDATE beauticians SET is_available = ? WHERE id = ?", (val, partner_id))
        conn.commit()
        cur.execute("SELECT is_available FROM beauticians WHERE id = ?", (partner_id,))
        row = cur.fetchone()
        return bool(row["is_available"]) if row else False
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("Dulhaniya Database initialized and seeded successfully.")
