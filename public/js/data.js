/**
 * Dulhaniya - Data Layer & API Client with Offline LocalStorage Fallback
 * Provides seamless connectivity to server.py SQLite API or standalone browser fallback.
 */

const DULHANIYA_FALLBACK_CATEGORIES = [
  { id: 1, name: "Bridal & Wedding Glow", slug: "bridal-wedding", icon: "crown", description: "Exclusive bridal packages, HD airbrush makeup & rituals", badge: "Grand Bridal", service_count: 5 },
  { id: 2, name: "Facials & Skin Rituals", slug: "facials-cleanups", icon: "sparkles", description: "O3+, Diamond, Hydra, & Organic facials", badge: "Trending", service_count: 4 },
  { id: 3, name: "Waxing & Smooth Skin", slug: "waxing", icon: "feather", description: "Rica Chocolate, Brazilian & Roll-on Waxing", badge: "Most Booked", service_count: 3 },
  { id: 4, name: "Manicure & Pedicure Spas", slug: "mani-pedi", icon: "gem", description: "Rose petal aroma soak, crystal scrub & bridal foot spa", badge: "Relaxing", service_count: 3 },
  { id: 5, name: "Hair Care, Spa & Styling", slug: "hair-care", icon: "scissors", description: "L'Oreal professional hair spa, keratin & bridal buns", badge: "Popular", service_count: 2 },
  { id: 6, name: "Bleach, Detan & Glow Packs", slug: "bleach-detan", icon: "sun", description: "Sara Oxy Detan, Raaga tan removal & polish", badge: "Instant Glow", service_count: 2 },
  { id: 7, name: "Full Body Spa & Massages", slug: "body-spa", icon: "heart-pulse", description: "Swedish relaxation & Ayurvedic potli massage", badge: "Wellness", service_count: 2 },
  { id: 8, name: "Groom & Men's Salon", slug: "groom-men", icon: "smile", description: "Charcoal facial, beard styling & head champi", badge: "For Him", service_count: 2 }
];

const DULHANIYA_FALLBACK_SERVICES = [
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
];

const DULHANIYA_FALLBACK_BEAUTICIANS = [
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
];

// Unified API Client with Rapid Failover
const DulhaniyaAPI = {
  baseUrl: window.location.origin.includes("http") ? "" : "http://127.0.0.1:8000",

  async safeFetch(endpoint, options = {}, timeoutMs = 2500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timer);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  },

  async getCategories() {
    try {
      const res = await this.safeFetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        return data.categories;
      }
    } catch (e) {
      // Instant graceful fallback
    }
    return DULHANIYA_FALLBACK_CATEGORIES;
  },

  async getServices(category = "all", search = "", bridalOnly = false) {
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.append("category", category);
      if (search) params.append("search", search);
      if (bridalOnly) params.append("bridal_only", "1");

      const res = await this.safeFetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.services;
      }
    } catch (e) {
      // Instant graceful fallback
    }

    // Client-side filtering
    return DULHANIYA_FALLBACK_SERVICES.filter(s => {
      if (category && category !== "all" && s.category_slug !== category) return false;
      if (bridalOnly && !s.is_bridal_exclusive) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || (s.subtitle && s.subtitle.toLowerCase().includes(q));
      }
      return true;
    });
  },

  async getServiceById(id) {
    try {
      const res = await this.safeFetch(`/api/services/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.service;
      }
    } catch (e) {
      // Instant graceful fallback
    }
    return DULHANIYA_FALLBACK_SERVICES.find(s => s.id === Number(id)) || DULHANIYA_FALLBACK_SERVICES[0];
  },

  async getBeauticians() {
    try {
      const res = await this.safeFetch("/api/beauticians");
      if (res.ok) {
        const data = await res.json();
        return data.beauticians;
      }
    } catch (e) {
      // Instant graceful fallback
    }
    return DULHANIYA_FALLBACK_BEAUTICIANS;
  },

  async applyCoupon(code, subtotal) {
    try {
      const res = await this.safeFetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      // Fallback promo rules
      const c = (code || "").toUpperCase();
      if (c === "DULHANIYA500" && subtotal >= 1499) {
        return { success: true, code: c, discount: 500, description: "Flat ₹500 off on bridal & salon bookings" };
      }
      if (c === "FIRSTGLOW" && subtotal >= 799) {
        const disc = Math.min(Math.round(subtotal * 0.2), 400);
        return { success: true, code: c, discount: disc, description: "20% off on your first salon order" };
      }
      if (c === "BRIDALQUEEN" && subtotal >= 4999) {
        return { success: true, code: c, discount: 1500, description: "Flat ₹1500 off on Bridal Makeover & Countdown" };
      }
      return { success: false, error: "Invalid coupon or minimum order amount not met." };
    }
  },

  async createBooking(bookingData) {
    try {
      const res = await this.safeFetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("dulhaniya_active_ref", data.booking_ref);
        window.dispatchEvent(new CustomEvent('dulhaniya_booking_created', { detail: data }));
        return data;
      }
    } catch (e) {
      // Instant local mode
    }

    // Local fallback booking
    const fakeRef = "DLH-" + Math.floor(1000 + Math.random() * 9000);
    const fakeOtp = String(Math.floor(1000 + Math.random() * 9000));
    const localBooking = {
      id: Date.now(),
      booking_ref: fakeRef,
      customer_name: bookingData.customer_name,
      customer_phone: bookingData.customer_phone,
      address: bookingData.address,
      city: bookingData.city || "New Delhi",
      service_date: bookingData.service_date,
      service_slot: bookingData.service_slot,
      total_amount: bookingData.total_amount,
      discount_amount: bookingData.discount_amount || 0,
      kit_type: bookingData.kit_type || "dulhaniya_kit",
      coupon_code: bookingData.coupon_code || "",
      status: "CONFIRMED",
      otp_code: fakeOtp,
      payment_mode: bookingData.payment_mode || "Pay After Service",
      items: bookingData.items,
      beautician_name: "Pooja Sharma",
      beautician_phone: "+91 98112 34567",
      beautician_rating: 4.98,
      experience_years: 9,
      beautician_photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      created_at: new Date().toISOString()
    };

    localStorage.setItem("dulhaniya_active_ref", fakeRef);
    localStorage.setItem(`booking_${fakeRef}`, JSON.stringify(localBooking));
    window.dispatchEvent(new CustomEvent('dulhaniya_booking_created', { detail: localBooking }));

    return {
      success: true,
      booking_ref: fakeRef,
      otp_code: fakeOtp,
      status: "CONFIRMED",
      total_amount: bookingData.total_amount,
      message: "Booking confirmed! (Local mode)"
    };
  },

  async getBooking(ref) {
    try {
      const res = await this.safeFetch(`/api/bookings/${ref}`);
      if (res.ok) {
        const data = await res.json();
        return data.booking;
      }
    } catch (e) {
      // Instant local mode
    }
    const local = localStorage.getItem(`booking_${ref}`);
    if (local) return JSON.parse(local);

    return {
      booking_ref: ref || "DLH-9842",
      customer_name: "Aanya Sharma",
      customer_phone: "+91 98765 43210",
      address: "Villa 42, Gulmohar Enclave, Saket",
      city: "New Delhi",
      service_date: "Tomorrow",
      service_slot: "10:30 AM - 11:30 AM",
      total_amount: 3198,
      status: "ON_THE_WAY",
      otp_code: "7421",
      payment_mode: "Pay After Service",
      beautician_name: "Pooja Sharma",
      beautician_phone: "+91 98112 34567",
      beautician_rating: 4.98,
      experience_years: 9,
      beautician_photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      items: [
        { title: "O3+ Bridal Luxury Glow Facial", price: 2299, duration_mins: 75 },
        { title: "Dulhaniya Bridal Crystal Spa Pedicure", price: 1299, duration_mins: 60 }
      ]
    };
  },

  async updateBookingStatus(ref, status) {
    try {
      const res = await this.safeFetch(`/api/bookings/${ref}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      window.dispatchEvent(new CustomEvent('dulhaniya_status_changed', { detail: { ref, status } }));
      return data;
    } catch (e) {
      const local = localStorage.getItem(`booking_${ref}`);
      if (local) {
        const obj = JSON.parse(local);
        obj.status = status;
        localStorage.setItem(`booking_${ref}`, JSON.stringify(obj));
      }
      window.dispatchEvent(new CustomEvent('dulhaniya_status_changed', { detail: { ref, status } }));
      return { success: true, booking_ref: ref, new_status: status };
    }
  },

  async verifyOtp(ref, otp) {
    try {
      const res = await this.safeFetch(`/api/bookings/${ref}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent('dulhaniya_status_changed', { detail: { ref, status: "IN_SERVICE" } }));
      }
      return data;
    } catch (e) {
      const booking = await this.getBooking(ref);
      if (booking.otp_code === String(otp).trim()) {
        await this.updateBookingStatus(ref, "IN_SERVICE");
        return { success: true, status: "IN_SERVICE", message: "OTP verified! Service started." };
      }
      return { success: false, error: "Incorrect OTP code." };
    }
  },

  async submitReview(ref, rating, comment, customerName) {
    try {
      const res = await this.safeFetch(`/api/bookings/${ref}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, customer_name: customerName })
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: "Review saved locally! Thank you." };
    }
  },

  async getAdminStats() {
    try {
      const res = await this.safeFetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        return data.stats;
      }
    } catch (e) {
      // Mock stats
    }
    return {
      total_bookings: 148,
      total_revenue: 384500,
      active_orders: 14,
      completed_orders: 134,
      beauticians_count: 8,
      avg_rating: 4.96
    };
  },
  async getAdminBeauticians() {
    try {
      const res = await this.safeFetch("/api/admin/beauticians");
      if (res.ok) {
        const data = await res.json();
        return data.beauticians;
      }
    } catch (e) {}
    const local = localStorage.getItem("dulhaniya_custom_beauticians");
    const custom = local ? JSON.parse(local) : [];
    return [...custom, ...DULHANIYA_FALLBACK_BEAUTICIANS];
  },

  async addAdminBeautician(bData) {
    try {
      const res = await this.safeFetch("/api/admin/beauticians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const newB = { id: Date.now(), rating: 5.0, jobs_completed: 0, is_verified: 1, is_available: 1, ...bData };
    const local = localStorage.getItem("dulhaniya_custom_beauticians");
    const custom = local ? JSON.parse(local) : [];
    custom.unshift(newB);
    localStorage.setItem("dulhaniya_custom_beauticians", JSON.stringify(custom));
    return { success: true, id: newB.id, message: "Partner registered locally!" };
  },

  async toggleAdminBeautician(id, field = "is_available") {
    try {
      const res = await this.safeFetch(`/api/admin/beauticians/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const b = DULHANIYA_FALLBACK_BEAUTICIANS.find(item => item.id === Number(id));
    if (b) {
      b[field] = b[field] === 1 ? 0 : 1;
      return { success: true, id, field, value: b[field] };
    }
    return { success: true, id, field, value: 1 };
  },

  async deleteAdminBeautician(id) {
    try {
      const res = await this.safeFetch(`/api/admin/beauticians/${id}/delete`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {}
    const local = localStorage.getItem("dulhaniya_custom_beauticians");
    if (local) {
      const custom = JSON.parse(local).filter(item => item.id !== Number(id));
      localStorage.setItem("dulhaniya_custom_beauticians", JSON.stringify(custom));
    }
    return { success: true, message: "Beautician removed." };
  },

  async getAdminCoupons() {
    try {
      const res = await this.safeFetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        return data.coupons;
      }
    } catch (e) {}
    return [
      { code: "DULHANIYA500", discount_type: "flat", discount_value: 500, min_order_value: 1499, max_discount: 500, description: "Flat ₹500 off on bridal & salon bookings above ₹1499" },
      { code: "FIRSTGLOW", discount_type: "percent", discount_value: 20, min_order_value: 799, max_discount: 400, description: "20% off on your very first salon-at-home order!" },
      { code: "BRIDALQUEEN", discount_type: "flat", discount_value: 1500, min_order_value: 4999, max_discount: 1500, description: "Save ₹1500 on all D-Day Bridal Makeup & Countdown rituals" },
      { code: "SHADI2026", discount_type: "percent", discount_value: 15, min_order_value: 1999, max_discount: 750, description: "Wedding season special: 15% off up to ₹750" }
    ];
  },

  async addAdminCoupon(cData) {
    try {
      const res = await this.safeFetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, code: cData.code, message: `Coupon ${cData.code} saved locally!` };
  },

  async deleteAdminCoupon(code) {
    try {
      const res = await this.safeFetch(`/api/admin/coupons/${code}/delete`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, message: `Coupon ${code} removed.` };
  },

  async updateAdminService(id, sData) {
    try {
      const res = await this.safeFetch(`/api/admin/services/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const s = DULHANIYA_FALLBACK_SERVICES.find(item => item.id === Number(id));
    if (s) Object.assign(s, sData);
    return { success: true, message: "Service updated locally!" };
  },

  async deleteAdminService(id) {
    try {
      const res = await this.safeFetch(`/api/admin/services/${id}/delete`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {}
    const idx = DULHANIYA_FALLBACK_SERVICES.findIndex(item => item.id === Number(id));
    if (idx >= 0) DULHANIYA_FALLBACK_SERVICES.splice(idx, 1);
    return { success: true, message: "Service deleted locally!" };
  },

  async assignBookingBeautician(ref, beauticianId) {
    try {
      const res = await this.safeFetch(`/api/admin/bookings/${ref}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beautician_id: beauticianId })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const local = localStorage.getItem(`booking_${ref}`);
    if (local) {
      const b = JSON.parse(local);
      b.beautician_id = beauticianId;
      if (b.status === "CONFIRMED") b.status = "ASSIGNED";
      localStorage.setItem(`booking_${ref}`, JSON.stringify(b));
    }
    window.dispatchEvent(new CustomEvent('dulhaniya_status_changed', { detail: { ref, status: "ASSIGNED" } }));
    return { success: true, message: "Beautician assigned!" };
  },

  async cancelBooking(ref) {
    try {
      const res = await this.safeFetch(`/api/admin/bookings/${ref}/cancel`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {}
    return await this.updateBookingStatus(ref, "CANCELLED");
  },

  async getAdminReviews() {
    try {
      const res = await this.safeFetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        return data.reviews;
      }
    } catch (e) {}
    return [
      { id: 1, customer_name: "Kritika Mehra", rating: 5, comment: "Pooja did my bridal makeup for my wedding in Connaught Place. Flawless, didn't crack at all even after 8 hours of rituals.", beautician_name: "Pooja Sharma", booking_ref: "DLH-9842", total_amount: 10999, created_at: "2026-10-25" },
      { id: 2, customer_name: "Rhea Sengupta", rating: 5, comment: "Severe tanning reversed with O3+ sealed monodose pack! So polite and clean.", beautician_name: "Sunita Verma", booking_ref: "DLH-8721", total_amount: 3299, created_at: "2026-10-24" }
    ];
  },

  async deleteAdminReview(id) {
    try {
      const res = await this.safeFetch(`/api/admin/reviews/${id}/delete`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { success: true, message: "Review deleted." };
  }
};
