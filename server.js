/**
 * Dulhaniya - High-Performance Cross-Platform Web Server & REST API
 * Pure Node.js Standard Library - Zero external dependencies.
 * Companion to server.py for instant execution under any runtime.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 8000;
const PUBLIC_DIR = path.join(__dirname, "public");
const STORE_FILE = path.join(__dirname, "dulhaniya_store.json");

// MIME types
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

// Initial Seed Store
const INITIAL_STORE = {
  categories: [
    { id: 1, name: "Bridal & Wedding Glow", slug: "bridal-wedding", icon: "crown", description: "Exclusive bridal packages, HD airbrush makeup, saree draping & pre-wedding rituals", badge: "Grand Bridal", sort_order: 1, service_count: 5 },
    { id: 2, name: "Facials & Skin Rituals", slug: "facials-cleanups", icon: "sparkles", description: "O3+, Diamond, Hydra, Tan-Clear, & Ayurvedic organic facials", badge: "Trending", sort_order: 2, service_count: 4 },
    { id: 3, name: "Waxing & Smooth Skin", slug: "waxing", icon: "feather", description: "Rica Chocolate, Honey, Brazilian & Painless Roll-on Waxing", badge: "Most Booked", sort_order: 3, service_count: 3 },
    { id: 4, name: "Manicure & Pedicure Spas", slug: "mani-pedi", icon: "gem", description: "Rose petal aroma soak, crystal scrub, gel nails & bridal foot spa", badge: "Relaxing", sort_order: 4, service_count: 3 },
    { id: 5, name: "Hair Care, Spa & Styling", slug: "hair-care", icon: "scissors", description: "L'Oreal professional hair spa, keratin infusion, haircut & bridal buns", badge: "Popular", sort_order: 5, service_count: 2 },
    { id: 6, name: "Bleach, Detan & Glow Packs", slug: "bleach-detan", icon: "sun", description: "Sara Oxy Detan, Raaga tan removal, Insta-glow herbal bleach", badge: "Instant Glow", sort_order: 6, service_count: 2 },
    { id: 7, name: "Full Body Spa & Massages", slug: "body-spa", icon: "heart-pulse", description: "Swedish relaxation, Aromatherapy stress-relief & Ayurvedic potli", badge: "Wellness", sort_order: 7, service_count: 2 },
    { id: 8, name: "Groom & Men's Salon", slug: "groom-men", icon: "smile", description: "Charcoal facial, beard styling, hair care & de-stress head massage", badge: "For Him", sort_order: 8, service_count: 2 }
  ],
  services: [
    {
        "id": 1,
        "category_slug": "bridal-wedding",
        "title": "Royal Dulhaniya D-Day Bridal Makeup (HD / Airbrush)",
        "subtitle": "Complete luxury bridal look with premium international cosmetics",
        "duration_mins": 180,
        "price": 14999,
        "discounted_price": 10999,
        "byo_product_discount": 1500,
        "rating": 4.98,
        "review_count": 342,
        "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80",
        "description": "Flawless bridal makeover tailored for high-definition photography and emotional moments. Includes skin prep, color correction, HD airbrush foundation, dramatic eye artistry, mink lashes, long-lasting lip artistry, dupatta/lehenga styling and floral jewelry pinning.",
        "included_steps": [
            "Double Cleansing & Hydration Prep",
            "Skin Tone Correction & Primer",
            "HD/Airbrush Base Application",
            "Contour, Blush & Highlighter",
            "Artistic Eye Makeup & Mink Lashes",
            "Lip Contouring & Matte Lock",
            "Hair Bun / Floral Styling",
            "Lehenga / Saree Draping & Dupatta Pinning"
        ],
        "products_used": [
            "MAC Studio Fix",
            "Huda Beauty Rose Quartz Palette",
            "Est\u00e9e Lauder Double Wear",
            "Charlotte Tilbury Flawless Filter",
            "Anastasia Beverly Hills Brow Kit"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 1
    },
    {
        "id": 2,
        "category_slug": "bridal-wedding",
        "title": "Haldi & Mehendi Sunshine Radiance Look",
        "subtitle": "Fresh, dewy and joyful glow for daytime pre-wedding ceremonies",
        "duration_mins": 120,
        "price": 6999,
        "discounted_price": 4999,
        "byo_product_discount": 800,
        "rating": 4.95,
        "review_count": 218,
        "image_url": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=700&q=80",
        "description": "Waterproof, dewy and radiant look with soft playful curls or floral braid. Specially formulated sweat-proof products to withstand joyful turmeric rituals and mehendi festivities.",
        "included_steps": [
            "Radiance Hydration Mask",
            "Sweat-proof Dewy Foundation Base",
            "Sun-kissed Peach/Coral Blush",
            "Waterproof Eye Makeup",
            "Messy Braid or Floral Half-Updo",
            "Dupatta Setting"
        ],
        "products_used": [
            "Bobbi Brown Dewy Glow",
            "Clinique Moisture Surge",
            "Too Faced Better Than Sex Waterproof",
            "Rare Beauty Liquid Blush"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 1
    },
    {
        "id": 3,
        "category_slug": "bridal-wedding",
        "title": "Sangeet & Cocktail Glam Night Look",
        "subtitle": "Smokey eyes, glitter glam and high-voltage evening elegance",
        "duration_mins": 150,
        "price": 8999,
        "discounted_price": 6499,
        "byo_product_discount": 900,
        "rating": 4.94,
        "review_count": 189,
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
        "description": "Bold, shimmering and party-ready bridal look designed to dazzle under stage lights and dance through the night. Includes volumized Hollywood waves or structured updo.",
        "included_steps": [
            "Primer & Strobe Cream Glow",
            "Long-wear Matte Foundation",
            "Shimmer Smokey Eyes with Pressed Pigments",
            "Winged Eyeliner & Volumizing Lashes",
            "Sculpted Contour",
            "Glam Hollywood Waves or Updo",
            "Saree/Gown Draping"
        ],
        "products_used": [
            "NARS Radiant Longwear",
            "Urban Decay Naked Palette",
            "Fenty Beauty Highlighter",
            "Kryolan Fixer Spray"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 1
    },
    {
        "id": 4,
        "category_slug": "bridal-wedding",
        "title": "7-Day Pre-Bridal Countdown Radiance Ritual",
        "subtitle": "Holistic full body makeover: Facial + Full Body Wax + Detan + Mani-Pedi + Hair Spa",
        "duration_mins": 300,
        "price": 12999,
        "discounted_price": 8499,
        "byo_product_discount": 1200,
        "rating": 4.99,
        "review_count": 412,
        "image_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
        "description": "The quintessential bridal countdown package. Takes care of all your skin, hair, and body wellness right at your home with sterilized tools and soothing aromatics.",
        "included_steps": [
            "Sara Oxy Full Body Detan",
            "Rica Chocolate Full Body Waxing",
            "O3+ Bridal Whitening & Glow Facial",
            "Rose Petal Crystal Manicure & Pedicure",
            "L'Oreal Mythic Oil Deep Hair Spa",
            "Full Body Polishing Scrub"
        ],
        "products_used": [
            "O3+ Bridal Kit (Sealed)",
            "Rica Italian Wax",
            "L'Oreal Professional Spa Creambath",
            "Sara Ayurvedic Detan Pack"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 1
    },
    {
        "id": 5,
        "category_slug": "bridal-wedding",
        "title": "Traditional Saree & Dupatta Draping Masterclass",
        "subtitle": "Ironed pleats, pin-free comfort and regal silhouette",
        "duration_mins": 45,
        "price": 1499,
        "discounted_price": 999,
        "byo_product_discount": 200,
        "rating": 4.91,
        "review_count": 156,
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80",
        "description": "Professional draping in South Indian Kanjeevaram, Bengali, Gujarati, Nauvari, Lehenga Saree or Double Dupatta bridal styling with zero sagging.",
        "included_steps": [
            "Measurement & Pleat Planning",
            "Safety Pin & Grip Reinforcement",
            "Pallu Draping & Shoulder Pinning",
            "Dupatta Crown Placement"
        ],
        "products_used": [
            "Bridal Cushion Pins",
            "Silicon Grip Tape",
            "Invisible Draping Clips"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 1
    },
    {
        "id": 6,
        "category_slug": "facials-cleanups",
        "title": "O3+ Bridal Luxury Glow Facial",
        "subtitle": "India's #1 dermatological glow facial for glass-like luminosity",
        "duration_mins": 75,
        "price": 3499,
        "discounted_price": 2299,
        "byo_product_discount": 350,
        "rating": 4.96,
        "review_count": 680,
        "image_url": "https://images.unsplash.com/photo-1512290900672-1f02e6462791?auto=format&fit=crop&w=700&q=80",
        "description": "Infused with botanical actives, lactic acid and pure oxygenating complex. Removes deep stubborn pigmentation, reduces pores, and restores a bridal translucent glow.",
        "included_steps": [
            "O3+ Deep Cleanser",
            "Derma Polish Micro Exfoliation",
            "Meladerm Vitamin C Serum Infusion",
            "Hydrating Lymphatic Massage (20 mins)",
            "Peel-Off Rubber Alginate Brightening Mask",
            "UV Protective Finish Serum"
        ],
        "products_used": [
            "O3+ Sealed Monodose Kit",
            "Rose Water Hydrosol",
            "Sterilized Blackhead Extractor"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 7,
        "category_slug": "facials-cleanups",
        "title": "Hydra-Infusion Glow Facial with Ultrasound Wand",
        "subtitle": "Deep pore vacuum cleanse, hyaluronic surge and cold hammer lock",
        "duration_mins": 60,
        "price": 3999,
        "discounted_price": 2699,
        "byo_product_discount": 400,
        "rating": 4.93,
        "review_count": 310,
        "image_url": "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=700&q=80",
        "description": "Next-gen hydro-dermabrasion facial performed in the comfort of your room. Eliminates blackheads, infuses peptides and gives instantaneous plumpness.",
        "included_steps": [
            "AHA/BHA Solution Exfoliation",
            "Hydro-Vacuum Pore Extraction",
            "Ultrasonic Peptide Infusion",
            "Cryo-Hammer Skin Tightening",
            "LED Blue/Red Light Therapy Shield"
        ],
        "products_used": [
            "Hyaluronic Acid 2% + B5",
            "Centella Asiatica Calming Ampoule",
            "Collagen Sheet Mask"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 8,
        "category_slug": "facials-cleanups",
        "title": "Cheryl's TanClear Brightening Facial",
        "subtitle": "Gentle sun-tan reversal with natural fruit enzymes and milk proteins",
        "duration_mins": 50,
        "price": 2199,
        "discounted_price": 1499,
        "byo_product_discount": 250,
        "rating": 4.88,
        "review_count": 450,
        "image_url": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=700&q=80",
        "description": "Formulated by Cheryl's Cosmeceuticals to undo sun damage, even out skin tone and infuse intense radiance without irritation.",
        "included_steps": [
            "TanClear Cleansing Gel",
            "Bio-Enzyme Scrub Peel",
            "Radiance Whitening Massage Cream",
            "Lightening Pack with Licorice Extract",
            "Derma Sunblock SPF 50"
        ],
        "products_used": [
            "Cheryl's Cosmeceuticals Single-Use Sealed Kit"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 9,
        "category_slug": "facials-cleanups",
        "title": "Organic Ayurvedic Kansa Wand Face Cleanup",
        "subtitle": "Detoxifying bronze wand acupressure massage with kumkumadi oil",
        "duration_mins": 45,
        "price": 1599,
        "discounted_price": 1099,
        "byo_product_discount": 200,
        "rating": 4.89,
        "review_count": 290,
        "image_url": "https://images.unsplash.com/photo-1522337094346-24b585352c8c?auto=format&fit=crop&w=700&q=80",
        "description": "Ancient healing ritual using pure copper & tin Kansa metal alloy. Pulls out acidity, tones facial muscles, and brings natural rosy warmth.",
        "included_steps": [
            "Herbal Rose & Turmeric Cleansing",
            "Walnut Shell Gentle Scrub",
            "Steam & Blackhead Purifying",
            "Pure Kumkumadi Tailam Massage with Kansa Wand",
            "Sandalwood & Multani Mitti Lep"
        ],
        "products_used": [
            "Kama Ayurveda Kumkumadi Oil",
            "Pure Vedic Bronze Kansa Wand",
            "Kashmiri Rose Hydrosol"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 10,
        "category_slug": "waxing",
        "title": "Rica Chocolate Full Body Waxing (Italian Luxury)",
        "subtitle": "Colophony-free, virtually painless hair removal with cocoa butter",
        "duration_mins": 90,
        "price": 3199,
        "discounted_price": 2199,
        "byo_product_discount": 300,
        "rating": 4.97,
        "review_count": 1250,
        "image_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=700&q=80",
        "description": "Original Italian Rica wax that adheres only to the hair and not to the skin. Zero redness, prevents ingrown hair and leaves skin velvety smooth for 4+ weeks.",
        "included_steps": [
            "Skin Sanitization & Cotton Gel Prep",
            "Full Arms + Underarms Rica Waxing",
            "Full Legs Rica Waxing",
            "Soothing Tea Tree Post-Wax Lotion",
            "Ingrown Prevention Spray"
        ],
        "products_used": [
            "Rica Italy White Chocolate Wax",
            "Disposable Non-Woven Wax Strips",
            "Sterilized Wooden Spatulas"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 11,
        "category_slug": "waxing",
        "title": "Rica Brazilian / Bikini Peel-Off Hard Wax",
        "subtitle": "Ultra-sensitive strip-less avocado butter wax for delicate areas",
        "duration_mins": 30,
        "price": 1799,
        "discounted_price": 1199,
        "byo_product_discount": 200,
        "rating": 4.92,
        "review_count": 590,
        "image_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80",
        "description": "100% hygienic, strip-less peel wax with pre-wax soothing oil and post-wax aloe vera cooling gel. Handled only by certified senior aestheticians.",
        "included_steps": [
            "Antiseptic Cleansing Wipe",
            "Pre-Wax Calming Lavender Oil",
            "Strip-less Rica Hard Wax Application",
            "Painless Fast Lift",
            "Aloe Vera + Vitamin E Calming Pack"
        ],
        "products_used": [
            "Rica Brazilian Hard Wax Beads",
            "Single-Use Disposable Undergarments & Sheets"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 12,
        "category_slug": "waxing",
        "title": "Honey Herbal Full Arms + Full Legs + Underarms",
        "subtitle": "Budget-friendly classic natural honey wax for silky hairless skin",
        "duration_mins": 60,
        "price": 1499,
        "discounted_price": 999,
        "byo_product_discount": 150,
        "rating": 4.86,
        "review_count": 920,
        "image_url": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=700&q=80",
        "description": "Classic natural sugar & honey formulation enriched with lemon juice. Cleans dead skin cells while leaving arms and legs silky and soft.",
        "included_steps": [
            "Talc Dusting & Moisture Removal",
            "Full Arms & Underarms Waxing",
            "Full Legs Waxing",
            "Cucumber Cool Astringent Mist"
        ],
        "products_used": [
            "Patanjali / Sleek Natural Honey Wax",
            "Sanitized Disposable Towels"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 13,
        "category_slug": "mani-pedi",
        "title": "Dulhaniya Bridal Crystal Spa Pedicure",
        "subtitle": "Effervescent bubbling salt soak, diamond heel filing & foot massage",
        "duration_mins": 60,
        "price": 1899,
        "discounted_price": 1299,
        "byo_product_discount": 200,
        "rating": 4.95,
        "review_count": 740,
        "image_url": "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80",
        "description": "Luxurious foot restoration experience. Deeply softens cracked heels, massages tired arches, and leaves toenails polished to perfection with salon shine.",
        "included_steps": [
            "Warm Himalayan Crystal Salt & Rose Soak",
            "Nail Shaping, Cuticle Care & Buffing",
            "Diamond Callus & Dead Skin Filing",
            "Dead Sea Salt Sugar Scrub",
            "Aromatherapy Foot & Calf Reflexology Massage (20 mins)",
            "Moisture Lock Paraffin Booties & Base Polish"
        ],
        "products_used": [
            "Bombini Crystal Bath Fizz",
            "Sterilized Stainless Cuticle Tools",
            "OPI Natural Base & Top Coat"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 14,
        "category_slug": "mani-pedi",
        "title": "Rose Petal Aroma Deluxe Manicure",
        "subtitle": "Botanical cuticle nourishing, hand scrub & relaxing acupressure",
        "duration_mins": 45,
        "price": 1299,
        "discounted_price": 899,
        "byo_product_discount": 150,
        "rating": 4.91,
        "review_count": 580,
        "image_url": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80",
        "description": "Complete hand pampering. Eliminates sun tan on hands and fingers, hydrates brittle nails, and includes an ultra-relaxing wrist and forearm massage.",
        "included_steps": [
            "Rose Water Warm Soak",
            "Filing, Shaping & Buffing",
            "Gentle Walnut Hand Exfoliation",
            "Rose Essential Oil Acupressure Massage",
            "Cuticle Nourishing Oil Drop"
        ],
        "products_used": [
            "Organic Rose Petals",
            "Lotus Herbals Manicare Scrub",
            "Sally Hansen Cuticle Rehab"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 15,
        "category_slug": "mani-pedi",
        "title": "Bridal Nail Art & Gel Polish Duo",
        "subtitle": "Long-lasting chip-free gel polish with subtle bridal stones or French tips",
        "duration_mins": 60,
        "price": 2499,
        "discounted_price": 1799,
        "byo_product_discount": 250,
        "rating": 4.93,
        "review_count": 310,
        "image_url": "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80",
        "description": "Professional UV/LED cured gel polish that lasts 3+ weeks through all wedding ceremonies. Includes 2 accent designer nail art finger accents.",
        "included_steps": [
            "Nail Dehydrator & Primer",
            "Base Coat UV Curing",
            "Dual Layer Gel Pigment",
            "Bridal Glitters / Stones / Chrome Accent",
            "High-Gloss Top Coat Curing"
        ],
        "products_used": [
            "OPI GelColor",
            "Bluesky Professional LED Lamp",
            "Swarovski Crystals (Accent)"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 1
    },
    {
        "id": 16,
        "category_slug": "hair-care",
        "title": "L'Oreal Mythic Oil Deep Nourishing Hair Spa",
        "subtitle": "Argan oil infusion, steam cocoon, and soothing scalp tension release",
        "duration_mins": 60,
        "price": 2299,
        "discounted_price": 1599,
        "byo_product_discount": 250,
        "rating": 4.94,
        "review_count": 880,
        "image_url": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80",
        "description": "Reverses frizz, chemical damage and split ends. Includes hot ozone steam penetration and 20 minutes of rhythmic Indian champi scalp massage.",
        "included_steps": [
            "Scalp Analysis & Detangling",
            "L'Oreal Creambath + Argan Concentrate Application",
            "20-min Deep Scalp & Neck Massage",
            "Hot Towel Steam Cocoon",
            "Rinse & Serum Infusion"
        ],
        "products_used": [
            "L'Oreal Professionnel Hair Spa Creambath",
            "Mythic Oil Argan Elixir",
            "Thermal Steam Cap"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 17,
        "category_slug": "hair-care",
        "title": "Bridal Designer Hair Updo & Floral Bun Styling",
        "subtitle": "Regal bridal braids, messy floral buns or vintage cascading waves",
        "duration_mins": 60,
        "price": 2999,
        "discounted_price": 1999,
        "byo_product_discount": 300,
        "rating": 4.96,
        "review_count": 420,
        "image_url": "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=700&q=80",
        "description": "Crafted to hold securely for 12+ hours with heavy dupattas and maang tikka. Fresh baby's breath, red roses or gajra arrangement included.",
        "included_steps": [
            "Texture Prep & Heat Protection",
            "Crimping & Backcombing for Volume",
            "Structural Donut Bun or Textured Braiding",
            "Maang Tikka & Matha Patti Anchoring",
            "Fresh Flower / Gajra Pinning",
            "Strong Hold Finishing Spray"
        ],
        "products_used": [
            "Schwarzkopf Osis+ Freeze Spray",
            "Toni&Guy Heat Protection Mist",
            "Handpicked Fresh Jasmine/Rose Gajra"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 1
    },
    {
        "id": 18,
        "category_slug": "bleach-detan",
        "title": "Sara Oxy D-Tan Face, Neck & Arms Brightener",
        "subtitle": "Gentle eucalyptus & camphor tan removal pack with instant brightening",
        "duration_mins": 40,
        "price": 1299,
        "discounted_price": 899,
        "byo_product_discount": 150,
        "rating": 4.9,
        "review_count": 610,
        "image_url": "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=700&q=80",
        "description": "Non-irritating, ammonia-free detan formulation that reverses tan lines caused by Indian sun exposure within a single 40-minute session.",
        "included_steps": [
            "Clarifying Face Wash",
            "Sara Oxy D-Tan Mask Application",
            "Cool Rose Water Pad Eye Rest",
            "Steam & Wet Towel Cleanse",
            "Aloe Soothing Gel Finish"
        ],
        "products_used": [
            "Sara Oxy D-Tan Sealed Pack",
            "Organic Rose Mist"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 19,
        "category_slug": "bleach-detan",
        "title": "Full Body Bridal De-Tan & Polishing Scrub",
        "subtitle": "Exfoliates dead skin, softens dark elbows/knees and evens tone",
        "duration_mins": 75,
        "price": 2999,
        "discounted_price": 1999,
        "byo_product_discount": 300,
        "rating": 4.93,
        "review_count": 340,
        "image_url": "https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=700&q=80",
        "description": "Full body therapy covering back, stomach, arms, legs and neck with coffee walnut scrub followed by detan clay pack.",
        "included_steps": [
            "Dry Body Brushing",
            "Coffee-Walnut Sugar Exfoliation",
            "Herbal Detan Mud Wrap",
            "Warm Towel Steam Bath Wipe",
            "Hydrating Shea Butter Body Lotion"
        ],
        "products_used": [
            "mCaffeine Roasted Arabica Scrub",
            "Sara Body Detan",
            "The Body Shop Shea Butter"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 20,
        "category_slug": "body-spa",
        "title": "Dulhaniya Swedish Stress-Relief Full Body Massage",
        "subtitle": "Full 60 mins of gentle long strokes to dissolve pre-wedding exhaustion",
        "duration_mins": 60,
        "price": 2699,
        "discounted_price": 1899,
        "byo_product_discount": 250,
        "rating": 4.97,
        "review_count": 720,
        "image_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80",
        "description": "Performed with warm cold-pressed sweet almond oil and lavender aroma. Eases back pain, improves blood circulation and relaxes mind and body.",
        "included_steps": [
            "Foot Cleansing Ritual",
            "Upper & Lower Back Massage",
            "Shoulder, Neck & Arm Tension Relief",
            "Legs & Feet Reflexology",
            "Head & Scalp Calming Release"
        ],
        "products_used": [
            "Cold-pressed Almond Oil",
            "French Lavender Essential Oil",
            "Disposable Linen & Disinfected Towels"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 21,
        "category_slug": "body-spa",
        "title": "Traditional Ayurvedic Potli Warm Herbal Massage",
        "subtitle": "Steamed cloth pouches filled with 12 medicinal herbs for muscle aches",
        "duration_mins": 75,
        "price": 3299,
        "discounted_price": 2399,
        "byo_product_discount": 300,
        "rating": 4.92,
        "review_count": 280,
        "image_url": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=700&q=80",
        "description": "Ancient therapy (Kizhi) using warm medicated boluses dipped in warm Dhanwantharam oil. Deeply rejuvenates tired nerves and alleviates joint stiffness.",
        "included_steps": [
            "Abhyanga Warm Oil Body Rub",
            "Herbal Potli Steaming & Rhythmic Pounding",
            "Spinal Column Soothing",
            "Warm Herbal Towel Cleanse"
        ],
        "products_used": [
            "Kottakkal Arya Vaidya Sala Dhanwantharam Tailam",
            "Kizhi Herbal Potlis (Ashwagandha, Nirgundi, Ginger)"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    },
    {
        "id": 22,
        "category_slug": "groom-men",
        "title": "Royal Groom D-Day Shaving, Beard Sculpt & Facial",
        "subtitle": "Sharp beard contouring, detox charcoal scrub & gold glow facial",
        "duration_mins": 75,
        "price": 2999,
        "discounted_price": 1999,
        "byo_product_discount": 250,
        "rating": 4.91,
        "review_count": 390,
        "image_url": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80",
        "description": "Designed specially for grooms and gentlemen. Refines beard lines, deep cleanses pores clogged by city pollution, and provides an energized, camera-ready finish.",
        "included_steps": [
            "Hot Towel Beard Softening",
            "Precision Razor/Trimmer Edge Shaping",
            "Charcoal Face Scrub & Blackhead Extraction",
            "Groom Radiance Cream Massage",
            "Peel-Off Gold Alginate Mask",
            "Beard Oil & Matte SPF Finish"
        ],
        "products_used": [
            "Beardo Activated Charcoal Kit",
            "Bombay Shaving Company Pre-Shave Oil",
            "L'Oreal Men Expert Hydra Energetic"
        ],
        "is_bestseller": 1,
        "is_bridal_exclusive": 0
    },
    {
        "id": 23,
        "category_slug": "groom-men",
        "title": "Anti-Stress Head Champi & Hair Loss Therapy",
        "subtitle": "Warm Bhringraj oil massage + high-frequency scalp stimulation",
        "duration_mins": 45,
        "price": 1499,
        "discounted_price": 999,
        "byo_product_discount": 150,
        "rating": 4.93,
        "review_count": 440,
        "image_url": "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&w=700&q=80",
        "description": "Intense traditional head, neck and shoulder massage to melt away workday stress and activate dormant hair follicles.",
        "included_steps": [
            "Deep Scalp Detangling",
            "Warm Forest Essentials Bhringraj Oil Massage",
            "Acupressure Tension Point Release",
            "Shoulder & Upper Back Kneading",
            "High Frequency Comb (5 mins)"
        ],
        "products_used": [
            "Forest Essentials Ayurvedic Bhringraj Taila",
            "High Frequency Scalp Wand"
        ],
        "is_bestseller": 0,
        "is_bridal_exclusive": 0
    }
],
  beauticians: [
    {
      id: 1,
      name: "Pooja Sharma",
      photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      experience_years: 9,
      rating: 4.98,
      jobs_completed: 1420,
      phone: "+91 98112 34567",
      specialty: "Elite Bridal Makeup Artist & Skin Specialist",
      bio: "Certified from London School of Makeup & VLCC. Over 9 years of creating magical bridal looks and glowing skin across Delhi NCR.",
      certifications: ["CIDESCO International Diplome", "VLCC Master Esthetician", "Police Background Verified 2026", "Double Vaccinated & Sanitization Certified"],
      is_verified: 1,
      is_available: 1
    },
    {
      id: 2,
      name: "Sunita Verma",
      photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      experience_years: 7,
      rating: 4.95,
      jobs_completed: 980,
      phone: "+91 98223 45678",
      specialty: "Senior Waxing & Spa Therapist",
      bio: "Rica Italian Wax Master certified. Renowned for zero-pain waxing techniques, relaxing Swedish therapy, and warm gentle bedside manner.",
      certifications: ["Rica Italy Certified Master", "Habibs Hair & Skin Academy", "Verified Female Professional", "Hygiene Level 5 Star"],
      is_verified: 1,
      is_available: 1
    },
    {
      id: 3,
      name: "Ananya Sen",
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      experience_years: 6,
      rating: 4.96,
      jobs_completed: 750,
      phone: "+91 98334 56789",
      specialty: "Bridal Hair Stylist & Nail Art Designer",
      bio: "Specialist in intricate Sabyasachi floral buns, Hollywood curls, and bridal gel nail extensions. Has styled over 400 Indian brides.",
      certifications: ["Toni & Guy Advanced Styling", "OPI International Gel Specialist", "Verified Background Clear", "Clean Kit Certified"],
      is_verified: 1,
      is_available: 1
    },
    {
      id: 4,
      name: "Meena Kumari",
      photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      experience_years: 11,
      rating: 4.99,
      jobs_completed: 1850,
      phone: "+91 98445 67890",
      specialty: "Ayurvedic Kansa & O3+ Derma Specialist",
      bio: "11+ years senior aesthetician. Deep expertise in customized facial treatments, tan reversal and pressure-point relaxation therapy.",
      certifications: ["Kottakkal Ayurvedic Therapy Diploma", "O3+ Derma Certified Lead", "Police Background Verified", "5-Star Top Partner"],
      is_verified: 1,
      is_available: 1
    }
  ],
  coupons: [
    { code: "DULHANIYA500", discount_type: "flat", discount_value: 500, min_order_value: 1499, max_discount: 500, description: "Flat ₹500 off on bridal & salon bookings above ₹1499" },
    { code: "FIRSTGLOW", discount_type: "percent", discount_value: 20, min_order_value: 799, max_discount: 400, description: "20% off on your very first salon-at-home order!" },
    { code: "BRIDALQUEEN", discount_type: "flat", discount_value: 1500, min_order_value: 4999, max_discount: 1500, description: "Save ₹1500 on all D-Day Bridal Makeup & Countdown rituals" },
    { code: "SHADI2026", discount_type: "percent", discount_value: 15, min_order_value: 1999, max_discount: 750, description: "Wedding season special: 15% off up to ₹750" }
  ],
  bookings: [
    {
      id: 1,
      booking_ref: "DLH-9842",
      customer_name: "Aanya Sharma",
      customer_phone: "+91 98765 43210",
      customer_email: "aanya@example.com",
      address: "Villa 42, Gulmohar Enclave, Saket",
      city: "New Delhi",
      pincode: "110017",
      service_date: "Tomorrow",
      service_slot: "10:30 AM - 11:30 AM",
      beautician_id: 1,
      beautician_name: "Pooja Sharma",
      beautician_phone: "+91 98112 34567",
      beautician_rating: 4.98,
      experience_years: 9,
      beautician_photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      total_amount: 3198,
      discount_amount: 500,
      kit_type: "dulhaniya_kit",
      coupon_code: "DULHANIYA500",
      status: "ON_THE_WAY",
      otp_code: "7421",
      payment_mode: "Pay After Service",
      created_at: new Date().toISOString(),
      items: [
        { title: "O3+ Bridal Luxury Glow Facial", price: 2299, duration_mins: 75 },
        { title: "Dulhaniya Bridal Crystal Spa Pedicure", price: 1299, duration_mins: 60 }
      ]
    }
  ],
  reviews: [
    { id: 1, customer_name: "Kritika Mehra", rating: 5, comment: "Pooja did my bridal makeup for my wedding in Connaught Place. Everyone in the mandap was gasping! Flawless, didn't crack at all even after 8 hours of rituals.", created_at: "2026-10-25" },
    { id: 2, customer_name: "Rhea Sengupta", rating: 5, comment: "I had severe tanning after my bachelorette trip. Meena arrived exactly on time with a sealed kit, showed me the expiry date, and the facial glow was insane.", created_at: "2026-10-24" }
  ]
};

// Load or Init Store
function getStore() {
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify(INITIAL_STORE, null, 2), "utf8");
    return INITIAL_STORE;
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
  } catch (e) {
    return INITIAL_STORE;
  }
}

function saveStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save store:", e.message);
  }
}

function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-cache"
  });
  res.end(jsonStr);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const store = getStore();

  // ------------------ REST APIs ------------------
  if (pathname === "/api/categories" && req.method === "GET") {
    return sendJson(res, 200, { success: true, categories: store.categories });
  }

  if (pathname === "/api/services" && req.method === "GET") {
    const cat = query.category;
    const search = (query.search || "").toLowerCase();
    const bridalOnly = query.bridal_only === "1";

    let filtered = store.services;
    if (cat && cat !== "all") {
      filtered = filtered.filter(s => s.category_slug === cat);
    }
    if (bridalOnly) {
      filtered = filtered.filter(s => s.is_bridal_exclusive);
    }
    if (query.bestseller === "1") {
      filtered = filtered.filter(s => s.is_bestseller);
    }
    if (search) {
      filtered = filtered.filter(s => s.title.toLowerCase().includes(search) || (s.subtitle && s.subtitle.toLowerCase().includes(search)));
    }
    return sendJson(res, 200, { success: true, services: filtered });
  }

  if (pathname.startsWith("/api/services/") && req.method === "GET") {
    const id = Number(pathname.split("/").pop());
    const service = store.services.find(s => s.id === id);
    if (!service) return sendJson(res, 404, { success: false, error: "Service not found" });
    return sendJson(res, 200, { success: true, service });
  }

  if (pathname === "/api/beauticians" && req.method === "GET") {
    return sendJson(res, 200, { success: true, beauticians: store.beauticians });
  }

  if (pathname === "/api/coupons" && req.method === "GET") {
    return sendJson(res, 200, { success: true, coupons: store.coupons });
  }

  if (pathname === "/api/reviews" && req.method === "GET") {
    return sendJson(res, 200, { success: true, reviews: store.reviews });
  }

  if (pathname === "/api/slots" && req.method === "GET") {
    const dateStr = query.date || new Date().toISOString().split("T")[0];
    const slots = [
      { time: "08:00 AM - 09:30 AM", label: "Early Morning", available: true },
      { time: "10:00 AM - 11:30 AM", label: "Morning Glow", available: true },
      { time: "12:00 PM - 01:30 PM", label: "Afternoon", available: true },
      { time: "02:30 PM - 04:00 PM", label: "Afternoon Spa", available: true },
      { time: "04:30 PM - 06:00 PM", label: "Evening Makeover", available: true },
      { time: "06:30 PM - 08:00 PM", label: "Night Pamper", available: true },
      { time: "08:30 PM - 10:00 PM", label: "Late Evening", available: true }
    ];
    return sendJson(res, 200, { success: true, date: dateStr, slots });
  }

  if (pathname === "/api/coupons/apply" && req.method === "POST") {
    const body = await parseBody(req);
    const code = (body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);

    const coupon = store.coupons.find(c => c.code === code);
    if (!coupon) return sendJson(res, 400, { success: false, error: "Invalid coupon code." });
    if (subtotal < coupon.min_order_value) {
      return sendJson(res, 400, { success: false, error: `Minimum booking of ₹${coupon.min_order_value} required for ${code}.` });
    }

    let discount = 0;
    if (coupon.discount_type === "flat") {
      discount = Math.min(coupon.discount_value, subtotal);
    } else {
      discount = Math.min(Math.round((subtotal * coupon.discount_value) / 100), coupon.max_discount);
    }

    return sendJson(res, 200, {
      success: true,
      code,
      discount,
      description: coupon.description,
      final_total: Math.max(0, subtotal - discount)
    });
  }

  if (pathname === "/api/bookings" && req.method === "GET") {
    return sendJson(res, 200, { success: true, bookings: store.bookings });
  }

  if (pathname.startsWith("/api/bookings/") && req.method === "GET") {
    const ref = pathname.split("/").pop();
    const booking = store.bookings.find(b => b.booking_ref === ref || String(b.id) === ref);
    if (!booking) return sendJson(res, 404, { success: false, error: "Booking not found" });
    return sendJson(res, 200, { success: true, booking });
  }

  if (pathname === "/api/bookings" && req.method === "POST") {
    const body = await parseBody(req);
    if (!body.customer_name || !body.customer_phone || !body.address) {
      return sendJson(res, 400, { success: false, error: "Name, phone, and address are required." });
    }
    const items = body.items || [];
    if (items.length === 0) {
      return sendJson(res, 400, { success: false, error: "At least one service must be selected." });
    }

    const kitType = body.kit_type || "dulhaniya_kit";
    let subtotal = 0;
    for (const it of items) {
      let price = Number(it.price || 0);
      if (kitType === "byo_product") {
        const byoDisc = Number(it.byo_product_discount || 150);
        price = Math.max(199, price - byoDisc);
      }
      subtotal += price;
    }

    let discount = 0;
    const couponCode = (body.coupon_code || "").trim().toUpperCase();
    if (couponCode) {
      const coupon = store.coupons.find(c => c.code === couponCode);
      if (coupon && subtotal >= coupon.min_order_value) {
        if (coupon.discount_type === "flat") {
          discount = Math.min(coupon.discount_value, subtotal);
        } else {
          discount = Math.min(Math.round((subtotal * coupon.discount_value) / 100), coupon.max_discount || 1000);
        }
      }
    }

    const hygieneFee = subtotal > 1999 ? 0 : 49;
    const finalTotal = Math.max(0, subtotal - discount + hygieneFee);

    const fakeRef = "DLH-" + Math.floor(1000 + Math.random() * 9000);
    const fakeOtp = String(Math.floor(1000 + Math.random() * 9000));
    const assignedBeautician = (store.beauticians && store.beauticians.length > 0)
      ? store.beauticians[Math.floor(Math.random() * store.beauticians.length)]
      : { id: 1, name: "Pooja Sharma", phone: "+91 98112 34567", rating: 4.98, experience_years: 9, photo_url: "" };

    const newBooking = {
      id: Date.now(),
      booking_ref: fakeRef,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email || "",
      address: body.address,
      city: body.city || "New Delhi",
      pincode: body.pincode || "",
      service_date: body.service_date || "Tomorrow",
      service_slot: body.service_slot || "10:00 AM - 11:30 AM",
      beautician_id: assignedBeautician.id,
      beautician_name: assignedBeautician.name,
      beautician_phone: assignedBeautician.phone,
      beautician_rating: assignedBeautician.rating,
      experience_years: assignedBeautician.experience_years,
      beautician_photo: assignedBeautician.photo_url,
      total_amount: finalTotal,
      discount_amount: discount,
      kit_type: kitType,
      coupon_code: couponCode,
      status: "CONFIRMED",
      otp_code: fakeOtp,
      payment_mode: body.payment_mode || "Pay After Service",
      created_at: new Date().toISOString(),
      items: items
    };

    store.bookings.unshift(newBooking);
    saveStore(store);

    return sendJson(res, 200, {
      success: true,
      booking_ref: fakeRef,
      booking_id: newBooking.id,
      otp_code: fakeOtp,
      status: "CONFIRMED",
      total_amount: finalTotal,
      message: "Booking confirmed! Certified Dulhaniya beautician reserved."
    });
  }

  if (pathname.endsWith("/status") && req.method === "POST") {
    const ref = pathname.split("/").slice(-2)[0];
    const body = await parseBody(req);
    const booking = store.bookings.find(b => b.booking_ref === ref || String(b.id) === ref);
    if (!booking) return sendJson(res, 404, { success: false, error: "Booking not found" });

    booking.status = body.status;
    booking.updated_at = new Date().toISOString();
    saveStore(store);

    return sendJson(res, 200, { success: true, booking_ref: ref, new_status: body.status });
  }

  if (pathname.endsWith("/verify-otp") && req.method === "POST") {
    const ref = pathname.split("/").slice(-2)[0];
    const body = await parseBody(req);
    const booking = store.bookings.find(b => b.booking_ref === ref || String(b.id) === ref);
    if (!booking) return sendJson(res, 404, { success: false, error: "Booking not found" });

    if (String(body.otp).trim() !== String(booking.otp_code).trim()) {
      return sendJson(res, 400, { success: false, error: "Incorrect OTP." });
    }

    booking.status = "IN_SERVICE";
    booking.updated_at = new Date().toISOString();
    saveStore(store);

    return sendJson(res, 200, { success: true, status: "IN_SERVICE", message: "OTP verified! Safe service started." });
  }

  if (pathname.endsWith("/review") && req.method === "POST") {
    const ref = pathname.split("/").slice(-2)[0];
    const body = await parseBody(req);
    store.reviews.unshift({
      id: Date.now(),
      booking_ref: ref,
      customer_name: body.customer_name || "Valued Client",
      rating: Number(body.rating || 5),
      comment: body.comment || "",
      created_at: new Date().toISOString().split("T")[0]
    });
    saveStore(store);
    return sendJson(res, 200, { success: true, message: "Review published!" });
  }

  if (pathname === "/api/admin/stats" && req.method === "GET") {
    const totalRev = store.bookings.reduce((sum, b) => b.status !== "CANCELLED" ? sum + (b.total_amount || 0) : sum, 0);
    const activeCount = store.bookings.filter(b => ["CONFIRMED", "ASSIGNED", "ON_THE_WAY", "IN_SERVICE"].includes(b.status)).length;
    return sendJson(res, 200, {
      success: true,
      stats: {
        total_bookings: store.bookings.length,
        total_revenue: totalRev,
        active_orders: activeCount,
        completed_orders: store.bookings.filter(b => b.status === "COMPLETED").length,
        beauticians_count: store.beauticians.length,
        avg_rating: 4.98
      }
    });
  }

  if (pathname === "/api/admin/services" && req.method === "POST") {
    const body = await parseBody(req);
    const newService = {
      id: Date.now(),
      category_slug: body.category_slug,
      title: body.title,
      subtitle: body.subtitle,
      duration_mins: Number(body.duration_mins || 60),
      price: Number(body.price || 1999),
      discounted_price: Number(body.discounted_price || 1499),
      byo_product_discount: Number(body.byo_product_discount || 200),
      image_url: body.image_url,
      description: body.description,
      is_bestseller: body.is_bestseller ? 1 : 0,
      is_bridal_exclusive: body.is_bridal_exclusive ? 1 : 0,
      rating: 5.0,
      review_count: 1
    };
    store.services.unshift(newService);
    saveStore(store);
    return sendJson(res, 200, { success: true, message: "Service created!" });
  }

  // Admin: Update Service
  if (pathname.startsWith("/api/admin/services/") && pathname.endsWith("/update") && req.method === "POST") {
    const sId = Number(pathname.split("/")[4]);
    const body = await parseBody(req);
    const service = store.services.find(s => s.id === sId);
    if (!service) return sendJson(res, 404, { success: false, error: "Service not found" });

    if (body.title) service.title = body.title;
    if (body.category_slug) service.category_slug = body.category_slug;
    if (body.subtitle !== undefined) service.subtitle = body.subtitle;
    if (body.duration_mins) service.duration_mins = Number(body.duration_mins);
    if (body.price) service.price = Number(body.price);
    if (body.discounted_price) service.discounted_price = Number(body.discounted_price);
    if (body.byo_product_discount !== undefined) service.byo_product_discount = Number(body.byo_product_discount);
    if (body.image_url) service.image_url = body.image_url;
    if (body.description) service.description = body.description;
    if (body.is_bestseller !== undefined) service.is_bestseller = body.is_bestseller ? 1 : 0;
    if (body.is_bridal_exclusive !== undefined) service.is_bridal_exclusive = body.is_bridal_exclusive ? 1 : 0;

    saveStore(store);
    return sendJson(res, 200, { success: true, message: "Service updated!" });
  }

  // Admin: Delete Service
  if ((pathname.startsWith("/api/admin/services/") && pathname.endsWith("/delete") && req.method === "POST") ||
      (pathname.startsWith("/api/admin/services/") && req.method === "DELETE")) {
    const sId = Number(pathname.split("/")[4] || pathname.split("/").pop());
    store.services = store.services.filter(s => s.id !== sId);
    saveStore(store);
    return sendJson(res, 200, { success: true, message: "Service removed from catalog." });
  }

  // Admin: Get Beauticians Fleet
  if (pathname === "/api/admin/beauticians" && req.method === "GET") {
    return sendJson(res, 200, { success: true, beauticians: store.beauticians || [] });
  }

  // Admin: Add Beautician
  if (pathname === "/api/admin/beauticians" && req.method === "POST") {
    const body = await parseBody(req);
    if (!body.name) return sendJson(res, 400, { success: false, error: "Name is required" });

    const newBeautician = {
      id: Date.now(),
      name: body.name,
      photo_url: body.photo_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      experience_years: Number(body.experience_years || 5),
      rating: 5.0,
      jobs_completed: 0,
      phone: body.phone || "+91 98000 00000",
      specialty: body.specialty || "Bridal & Salon Specialist",
      bio: body.bio || "Certified Dulhaniya professional esthetician.",
      certifications: Array.isArray(body.certifications) ? body.certifications : ["Dulhaniya Certified Partner", "SafeSeal Sanitization Pro"],
      is_verified: body.is_verified !== undefined ? (body.is_verified ? 1 : 0) : 1,
      is_available: body.is_available !== undefined ? (body.is_available ? 1 : 0) : 1
    };

    if (!store.beauticians) store.beauticians = [];
    store.beauticians.push(newBeautician);
    saveStore(store);
    return sendJson(res, 200, { success: true, id: newBeautician.id, message: `Partner '${newBeautician.name}' registered!` });
  }

  // Admin: Toggle Beautician Status
  if (pathname.startsWith("/api/admin/beauticians/") && pathname.endsWith("/toggle") && req.method === "POST") {
    const bId = Number(pathname.split("/")[4]);
    const body = await parseBody(req);
    const b = (store.beauticians || []).find(item => item.id === bId);
    if (!b) return sendJson(res, 404, { success: false, error: "Beautician not found" });

    const field = body.field === "is_verified" ? "is_verified" : "is_available";
    b[field] = b[field] === 1 ? 0 : 1;
    saveStore(store);
    return sendJson(res, 200, { success: true, id: bId, field, value: b[field] });
  }

  // Admin: Delete Beautician
  if ((pathname.startsWith("/api/admin/beauticians/") && pathname.endsWith("/delete") && req.method === "POST") ||
      (pathname.startsWith("/api/admin/beauticians/") && req.method === "DELETE")) {
    const bId = Number(pathname.split("/")[4] || pathname.split("/").pop());
    store.beauticians = (store.beauticians || []).filter(item => item.id !== bId);
    saveStore(store);
    return sendJson(res, 200, { success: true, message: "Beautician removed." });
  }

  // Admin: Get Coupons
  if (pathname === "/api/admin/coupons" && req.method === "GET") {
    return sendJson(res, 200, { success: true, coupons: store.coupons || [] });
  }

  // Admin: Add / Update Coupon
  if (pathname === "/api/admin/coupons" && req.method === "POST") {
    const body = await parseBody(req);
    const code = (body.code || "").trim().toUpperCase();
    if (!code) return sendJson(res, 400, { success: false, error: "Code is required" });

    const couponObj = {
      code,
      discount_type: body.discount_type || "flat",
      discount_value: Number(body.discount_value || 500),
      min_order_value: Number(body.min_order_value || 1000),
      max_discount: Number(body.max_discount || body.discount_value || 500),
      description: body.description || `Special offer with code ${code}`
    };

    if (!store.coupons) store.coupons = [];
    const idx = store.coupons.findIndex(c => c.code === code);
    if (idx >= 0) {
      store.coupons[idx] = couponObj;
    } else {
      store.coupons.push(couponObj);
    }
    saveStore(store);
    return sendJson(res, 200, { success: true, code, message: `Coupon ${code} activated!` });
  }

  // Admin: Delete Coupon
  if ((pathname.startsWith("/api/admin/coupons/") && pathname.endsWith("/delete") && req.method === "POST") ||
      (pathname.startsWith("/api/admin/coupons/") && req.method === "DELETE")) {
    const code = (pathname.split("/")[4] || pathname.split("/").pop()).toUpperCase();
    store.coupons = (store.coupons || []).filter(c => c.code !== code);
    saveStore(store);
    return sendJson(res, 200, { success: true, message: `Coupon ${code} deleted.` });
  }

  // Admin: Assign Beautician to Booking
  if (pathname.startsWith("/api/admin/bookings/") && pathname.endsWith("/assign") && req.method === "POST") {
    const ref = pathname.split("/")[4];
    const body = await parseBody(req);
    const b = (store.bookings || []).find(item => item.booking_ref === ref || String(item.id) === ref);
    if (!b) return sendJson(res, 404, { success: false, error: "Booking not found" });

    const pro = (store.beauticians || []).find(p => p.id === Number(body.beautician_id));
    b.beautician_id = Number(body.beautician_id);
    if (pro) {
      b.beautician_name = pro.name;
      b.beautician_phone = pro.phone;
      b.beautician_rating = pro.rating;
      b.beautician_photo = pro.photo_url;
      b.experience_years = pro.experience_years;
    }
    if (b.status === "CONFIRMED") b.status = "ASSIGNED";
    b.updated_at = new Date().toISOString();
    saveStore(store);
    return sendJson(res, 200, { success: true, message: `Assigned pro to ${ref}` });
  }

  // Admin: Cancel Booking
  if (pathname.startsWith("/api/admin/bookings/") && pathname.endsWith("/cancel") && req.method === "POST") {
    const ref = pathname.split("/")[4];
    const b = (store.bookings || []).find(item => item.booking_ref === ref || String(item.id) === ref);
    if (!b) return sendJson(res, 404, { success: false, error: "Booking not found" });

    b.status = "CANCELLED";
    b.updated_at = new Date().toISOString();
    saveStore(store);
    return sendJson(res, 200, { success: true, message: `Booking ${ref} cancelled.` });
  }

  // Admin: Get Reviews
  if (pathname === "/api/admin/reviews" && req.method === "GET") {
    return sendJson(res, 200, { success: true, reviews: store.reviews || [] });
  }

  // Admin: Delete Review
  if ((pathname.startsWith("/api/admin/reviews/") && pathname.endsWith("/delete") && req.method === "POST") ||
      (pathname.startsWith("/api/admin/reviews/") && req.method === "DELETE")) {
    const rId = Number(pathname.split("/")[4] || pathname.split("/").pop());
    store.reviews = (store.reviews || []).filter(r => r.id !== rId);
    saveStore(store);
    return sendJson(res, 200, { success: true, message: "Review deleted." });
  }

  // ------------------ STATIC FILE SERVER ------------------
  const cleanPath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, cleanPath === "/" ? "index.html" : cleanPath);

  // If request has an extension, verify that file exists; if not, return 404
  const ext = path.extname(cleanPath).toLowerCase();
  if (ext) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ error: "File not found" }));
    }
  } else {
    // SPA fallback for clean routes
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, "index.html");
    }
  }

  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Error loading " + pathname);
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache"
    });
    res.end(content);
  });
});

const CANDIDATE_PORTS = [Number(PORT), 8080, 5000, 3000, 8001, 8081, 8888, 9000];

function startListening(ports) {
  if (!ports || ports.length === 0) {
    console.error("Could not bind to any network port. Exiting.");
    process.exit(1);
  }
  const currentPort = ports[0];

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" || err.code === "EACCES") {
      console.log(`Port ${currentPort} unavailable (${err.code}), attempting next port...`);
      server.close();
      startListening(ports.slice(1));
    } else {
      console.error("Server error:", err.message);
    }
  });

  server.listen(currentPort, "0.0.0.0", () => {
    const boundPort = server.address().port;
    const portFile = path.join(__dirname, "dulhaniya_port.txt");
    try { fs.writeFileSync(portFile, String(boundPort), "utf8"); } catch (e) {}

    console.log(`Dulhaniya Node Server running at http://127.0.0.1:${boundPort}`);
    console.log(`Serving static files from: ${PUBLIC_DIR}`);

    try {
      const { exec } = require("child_process");
      if (process.platform === "win32") {
        exec(`start http://127.0.0.1:${boundPort}`);
      }
    } catch (e) {}
  });
}

startListening(CANDIDATE_PORTS);
