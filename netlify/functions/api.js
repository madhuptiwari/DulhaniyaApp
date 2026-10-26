/**
 * Dulhaniya - Netlify Serverless API Function
 * Provides a serverless backend for categories, services, bookings, coupons, and admin operations.
 * Pure Node.js Standard Library - Zero external dependencies.
 */

// In-memory runtime store with rich seed data
const store = {
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
      id: 1,
      category_slug: "bridal-wedding",
      title: "Royal Dulhaniya D-Day Bridal Makeup (HD / Airbrush)",
      subtitle: "Complete luxury bridal look with premium international cosmetics",
      duration_mins: 180,
      price: 14999,
      discounted_price: 10999,
      byo_product_discount: 1500,
      rating: 4.98,
      review_count: 342,
      image_url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80",
      description: "Flawless bridal makeover tailored for high-definition photography and emotional moments. Includes skin prep, color correction, HD airbrush foundation, dramatic eye artistry, mink lashes, long-lasting lip artistry, dupatta/lehenga styling and floral jewelry pinning.",
      included_steps: [
        "Double Cleansing & Hydration Prep",
        "Skin Tone Correction & Primer",
        "HD/Airbrush Base Application",
        "Contour, Blush & Highlighter",
        "Artistic Eye Makeup & Mink Lashes",
        "Lip Contouring & Matte Lock",
        "Hair Bun / Floral Styling",
        "Lehenga / Saree Draping & Dupatta Pinning"
      ],
      products_used: [
        "MAC Studio Fix",
        "Huda Beauty Rose Quartz Palette",
        "Estée Lauder Double Wear",
        "Charlotte Tilbury Flawless Filter",
        "Anastasia Beverly Hills Brow Kit"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 1
    },
    {
      id: 2,
      category_slug: "bridal-wedding",
      title: "Haldi & Mehendi Sunshine Radiance Look",
      subtitle: "Fresh, dewy and joyful glow for daytime pre-wedding ceremonies",
      duration_mins: 120,
      price: 6999,
      discounted_price: 4999,
      byo_product_discount: 800,
      rating: 4.95,
      review_count: 218,
      image_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=700&q=80",
      description: "Waterproof, dewy and radiant look with soft playful curls or floral braid. Specially formulated sweat-proof products to withstand joyful turmeric rituals and mehendi festivities.",
      included_steps: [
        "Radiance Hydration Mask",
        "Sweat-proof Dewy Foundation Base",
        "Sun-kissed Peach/Coral Blush",
        "Waterproof Eye Makeup",
        "Messy Braid or Floral Half-Updo",
        "Dupatta Setting"
      ],
      products_used: [
        "Bobbi Brown Dewy Glow",
        "Clinique Moisture Surge",
        "Too Faced Better Than Sex Waterproof",
        "Rare Beauty Liquid Blush"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 1
    },
    {
      id: 3,
      category_slug: "bridal-wedding",
      title: "Sangeet & Cocktail Glam Night Look",
      subtitle: "Smokey eyes, glitter glam and high-voltage evening elegance",
      duration_mins: 150,
      price: 8999,
      discounted_price: 6499,
      byo_product_discount: 900,
      rating: 4.94,
      review_count: 189,
      image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
      description: "Bold, shimmering and party-ready bridal look designed to dazzle under stage lights and dance through the night. Includes volumized Hollywood waves or structured updo.",
      included_steps: [
        "Primer & Strobe Cream Glow",
        "Long-wear Matte Foundation",
        "Shimmer Smokey Eyes with Pressed Pigments",
        "Winged Eyeliner & Volumizing Lashes",
        "Sculpted Contour",
        "Glam Hollywood Waves or Updo"
      ],
      products_used: [
        "Fenty Beauty Pro Filt'r",
        "Urban Decay Naked Cyber",
        "MAC Prep+Prime Fix+",
        "NARS Radiant Creamy Concealer"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 1
    },
    {
      id: 4,
      category_slug: "bridal-wedding",
      title: "Pre-Bridal 7-Day Countdown Radiance Cocoon",
      subtitle: "Curated pre-wedding skin purification, full body polish & relaxation",
      duration_mins: 240,
      price: 18999,
      discounted_price: 13999,
      byo_product_discount: 2000,
      rating: 4.99,
      review_count: 164,
      image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
      description: "The ultimate royal bridal transformation package conducted in the tranquility of your home over two sessions. Unclogs pores, dissolves dead cells, brightens skin tone, and melts away wedding planning stress.",
      included_steps: [
        "O3+ Bridal Oxygen Glow Facial",
        "Full Body Walnut & Rose Petal Scrub",
        "Ayurvedic Sandalwood & Ubtan Body Cocoon",
        "Full Body Rica Chocolate Waxing",
        "Deluxe Crystal Manicure & Pedicure Spa",
        "Aroma Stress-Relief Back & Shoulder Massage"
      ],
      products_used: [
        "O3+ Bridal Vitamin C Pack",
        "Forest Essentials Cane Sugar Polish",
        "Rica Liposoluble Wax Italy",
        "Kama Ayurveda Kumkumadi Oil"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 1
    },
    {
      id: 5,
      category_slug: "bridal-wedding",
      title: "Traditional Saree Draping & Dupatta Artistry",
      subtitle: "Flawless pleating, pinning and silhouette styling for any ritual",
      duration_mins: 45,
      price: 1499,
      discounted_price: 999,
      byo_product_discount: 100,
      rating: 4.91,
      review_count: 512,
      image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
      description: "Expert stylist creates crisp, crease-free pleats and secure anchoring for Kanjeevaram, Banarasi, Nauvari, Bengali, or contemporary designer lehengas and gowns.",
      included_steps: [
        "Fabric Ironing & Pre-pleat Measurement",
        "Saree / Lehenga Waist Anchoring",
        "Pallu Pleating & Shoulder Pinning",
        "Double Dupatta Head Veil Pinning",
        "Jewelry Placement Adjustments"
      ],
      products_used: [
        "Anti-slip Fabric Anchors",
        "Gold/Silver Head Pins",
        "Reinforced Safety Safety-Clips"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 1
    },
    {
      id: 6,
      category_slug: "facials-cleanups",
      title: "O3+ Bridal Glow Oxygenating Facial",
      subtitle: "India's #1 gold standard bridal facial for high-wattage luminescence",
      duration_mins: 75,
      price: 3299,
      discounted_price: 2299,
      byo_product_discount: 400,
      rating: 4.97,
      review_count: 1120,
      image_url: "https://images.unsplash.com/photo-1512290900672-1f02f9011746?auto=format&fit=crop&w=700&q=80",
      description: "Dermatologically tested facial delivering active oxygen molecules deep into dermal layers. Lightens pigmentation, reduces blemishes and delivers a glass-skin finish lasting up to 21 days.",
      included_steps: [
        "Meladerm Brightening Cleansing",
        "Micro-dermabrasion Enzyme Exfoliation",
        "High-Frequency Ozone Disinfection",
        "Deep Penetration Whitening Serum & Jade Roller",
        "20-min Facial Acupressure Lymphatic Massage",
        "Oxygenating Peel-off Rubber Mask"
      ],
      products_used: [
        "O3+ Whitening Cleansing Foam",
        "O3+ Derma Fade Tonic",
        "O3+ Whitening Massage Cream",
        "O3+ Bio-Cellulose Oxygen Rubber Mask"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 7,
      category_slug: "facials-cleanups",
      title: "Hydra-Dew Hyaluronic Plump & Glow Facial",
      subtitle: "Deep aqua infusion, pore extraction and multi-molecular hydration",
      duration_mins: 60,
      price: 2499,
      discounted_price: 1799,
      byo_product_discount: 300,
      rating: 4.93,
      review_count: 670,
      image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
      description: "Instantly recharges dull, tired and dehydrated skin. Uses ultrasonic vibration for painless blackhead removal followed by multi-depth hyaluronic acid saturation.",
      included_steps: [
        "Aromatic Steam & Pore Softener",
        "Ultrasonic Skin Scrubber Extraction",
        "Triple Hyaluronic Acid Ampoule Infusion",
        "Cooling Cryo Ice Globe Massage",
        "Deep Moisture Barrier Seal"
      ],
      products_used: [
        "Kiehl's Ultra Facial Cleanser",
        "The Ordinary Multi-Molecular Hyaluronic Acid",
        "Bioderma Hydrabio Gel-Creme"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 8,
      category_slug: "facials-cleanups",
      title: "Diamond Sparkle Micro-Polishing Facial",
      subtitle: "Skin illumination, cellular regeneration and gentle fine-line smoothing",
      duration_mins: 70,
      price: 2799,
      discounted_price: 1999,
      byo_product_discount: 350,
      rating: 4.91,
      review_count: 530,
      image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
      description: "Infused with pure micronized diamond dust to buff away dead layers, polish uneven skin texture, and restore natural youthful brilliance.",
      included_steps: [
        "Diamond Ash Deep Cleanser",
        "Diamond Polish Scrub",
        "Cellular Renewal Massage Gel",
        "Firming Face Mask",
        "Sun Defense Lotion"
      ],
      products_used: [
        "VLCC Diamond Professional Kit",
        "Pure Diamond Bhasma Extract",
        "SPF 50 PA+++ Shield"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 9,
      category_slug: "facials-cleanups",
      title: "Kama Kumkumadi Ayurvedic Radiance Facial",
      subtitle: "Pure Kashmiri saffron & 16 precious herbs for timeless Indian royal glow",
      duration_mins: 65,
      price: 3499,
      discounted_price: 2499,
      byo_product_discount: 450,
      rating: 4.96,
      review_count: 410,
      image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=700&q=80",
      description: "100% organic holistic beauty ritual. Utilizes pure Kashmiri Kumkumadi Tailam, Kansa wand marma-point stimulation, and sandalwood paste to restore harmony and luminosity.",
      included_steps: [
        "Pure Rose Jasmine Cleanser",
        "Kumkumadi Brightening Scrub",
        "Kansa Wand Vital Energy Point Massage",
        "Suvarna Haldi & Chandan Pack",
        "Pure Mogra Water Mist"
      ],
      products_used: [
        "Kama Ayurveda Kumkumadi Miraculous Beauty Fluid",
        "Pure Bronze Kansa Vataki Wand",
        "Pure Mysore Sandalwood Paste"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 10,
      category_slug: "waxing",
      title: "Rica Italian Chocolate Waxing (Full Arms + Full Legs + Underarms)",
      subtitle: "100% Colophony-free liposoluble wax with zero skin peeling and minimal pain",
      duration_mins: 60,
      price: 1999,
      discounted_price: 1399,
      byo_product_discount: 250,
      rating: 4.97,
      review_count: 1480,
      image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80",
      description: "Made in Italy with natural vegetable oils and cocoa butter. Specially formulated for delicate sensitive skin. Removes the shortest hair from the root without irritation or redness.",
      included_steps: [
        "Pre-wax Antiseptic Cotton Gel Prep",
        "Temperature-Controlled Warm Wax Application",
        "Single-Stroke Smooth Hair Removal",
        "Post-Wax Coconut Soothing Lotion",
        "Underarm Antiperspirant Mist"
      ],
      products_used: [
        "Rica Dark Chocolate Liposoluble Wax (Italy)",
        "Rica Pre-Wax Gel with Aloe",
        "Rica Post-Wax Soothing Oil"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 11,
      category_slug: "waxing",
      title: "Rica Brazilian / Bikini Peel-Off Stripless Wax",
      subtitle: "Ultra-gentle painless wax formulated exclusively for intimate zones",
      duration_mins: 35,
      price: 1599,
      discounted_price: 1099,
      byo_product_discount: 200,
      rating: 4.94,
      review_count: 820,
      image_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=700&q=80",
      description: "Zero paper strips. The warm peel-off wax shrink-wraps around individual hairs rather than sticking to delicate skin, making it virtually pain-free and hyper-hygienic.",
      included_steps: [
        "Sanitizing Disinfection Wipe",
        "Pre-wax Calming Talc Powder",
        "Painless Film Wax Application",
        "Gentle Quick Peel Removal",
        "Tea Tree Cooling & Antiseptic Gel"
      ],
      products_used: [
        "Rica Brazilian Avocado Film Wax",
        "Pure Tea Tree Extract Gel"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 12,
      category_slug: "waxing",
      title: "Honey Regular Smooth Wax (Full Arms + Underarms)",
      subtitle: "Quick, effective, and pocket-friendly hair removal with soothing honey",
      duration_mins: 40,
      price: 899,
      discounted_price: 599,
      byo_product_discount: 100,
      rating: 4.88,
      review_count: 630,
      image_url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=700&q=80",
      description: "Classic warm honey formulation for swift hair removal and smooth everyday skin. Includes sanitization and after-wax cooling gel.",
      included_steps: [
        "Skin Powdering",
        "Warm Honey Waxing",
        "Cold Water Cleanse",
        "Aloe Vera After-Wax Gel"
      ],
      products_used: [
        "Natural Honey Wax",
        "99% Pure Organic Aloe Gel"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 13,
      category_slug: "mani-pedi",
      title: "Royal Rose Petal Crystal Pedicure & Foot Spa",
      subtitle: "Aroma soak, dead heel exfoliation, crystal scrub and 20-min foot reflexology",
      duration_mins: 60,
      price: 1699,
      discounted_price: 1199,
      byo_product_discount: 200,
      rating: 4.96,
      review_count: 940,
      image_url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80",
      description: "Submerge tired feet into a steaming basin of Himalayan pink salts and fresh Indian rose petals. Revitalizes cracked heels and calms the nervous system through acupressure.",
      included_steps: [
        "Warm Himalayan Salt & Rose Petal Soak",
        "Painless Cuticle Detailing & Nail Shaping",
        "Pumice Stone Heel Filing & Dead Skin Buffing",
        "Effervescent Crystal Scrub",
        "20-min Deep Foot Reflexology Massage",
        "Hydrating Foot Butter & Gel Polish"
      ],
      products_used: [
        "Bombini Rose Crystal Spa Pack",
        "Organic Jojoba Cuticle Elixir",
        "OPI Breathable Nail Lacquer"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 14,
      category_slug: "mani-pedi",
      title: "Bridal Chrome & Gel Nail Art Manicure",
      subtitle: "Mirror shine chrome finish, nail extensions, cuticles and cuticle nutrition",
      duration_mins: 75,
      price: 2499,
      discounted_price: 1799,
      byo_product_discount: 250,
      rating: 4.95,
      review_count: 480,
      image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80",
      description: "Celebrity bridal nails that remain chipped-free through all wedding functions. Includes gel extensions, chrome glaze, Swarovski crystals and hand massage.",
      included_steps: [
        "Dry Cuticle Care & Nail Bed Dehydration",
        "Gel Tip Extension Placement",
        "Base Coat + UV LED Lamp Curing",
        "Mirror Chrome Powder Glaze",
        "Accent Gem Placement & Top Coat Seal",
        "Warm Almond Oil Hand Massage"
      ],
      products_used: [
        "OPI GelColor Pro System",
        "Chrome Mirror Powder Glaze",
        "Swarovski Crystal Accents"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 1
    },
    {
      id: 15,
      category_slug: "mani-pedi",
      title: "Classic Essential Mani-Pedi Combo",
      subtitle: "Basic nail shaping, buffing, cuticle nourishment and soothing massage",
      duration_mins: 60,
      price: 1299,
      discounted_price: 899,
      byo_product_discount: 150,
      rating: 4.9,
      review_count: 780,
      image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
      description: "Complete grooming for hands and feet. Eliminates cuticles, cleanses nail beds, and nourishes tired skin with a soothing aromatic lotion.",
      included_steps: [
        "Soak & Cleanse",
        "Nail Trimming & Shaping",
        "Gentle Cuticle Push",
        "Hand & Calf Massage",
        "Gloss Buff or Polish"
      ],
      products_used: [
        "Vaadi Herbals Foot Care",
        "Colorbar Nail Lacquer"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 16,
      category_slug: "hair-care",
      title: "L'Oreal Mythic Oil Deep Nourishment Hair Spa",
      subtitle: "Argan oil infusion, steam cocoon, and soothing scalp tension release",
      duration_mins: 60,
      price: 2299,
      discounted_price: 1599,
      byo_product_discount: 250,
      rating: 4.94,
      review_count: 880,
      image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=700&q=80",
      description: "Reverses frizz, chemical damage and split ends. Includes hot ozone steam penetration and 20 minutes of rhythmic Indian champi scalp massage.",
      included_steps: [
        "Scalp Analysis & Detangling",
        "L'Oreal Creambath + Argan Concentrate Application",
        "20-min Deep Scalp & Neck Massage",
        "Hot Towel Steam Cocoon",
        "Rinse & Serum Infusion"
      ],
      products_used: [
        "L'Oreal Professionnel Hair Spa Creambath",
        "Mythic Oil Argan Elixir",
        "Thermal Steam Cap"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 17,
      category_slug: "hair-care",
      title: "Bridal Designer Hair Updo & Floral Bun Styling",
      subtitle: "Regal bridal braids, messy floral buns or vintage cascading waves",
      duration_mins: 60,
      price: 2999,
      discounted_price: 1999,
      byo_product_discount: 300,
      rating: 4.96,
      review_count: 420,
      image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=700&q=80",
      description: "Crafted to hold securely for 12+ hours with heavy dupattas and maang tikka. Fresh baby's breath, red roses or gajra arrangement included.",
      included_steps: [
        "Texture Prep & Heat Protection",
        "Crimping & Backcombing for Volume",
        "Structural Donut Bun or Textured Braiding",
        "Maang Tikka & Matha Patti Anchoring",
        "Fresh Flower / Gajra Pinning",
        "Strong Hold Finishing Spray"
      ],
      products_used: [
        "Schwarzkopf Osis+ Freeze Spray",
        "Toni&Guy Heat Protection Mist",
        "Handpicked Fresh Jasmine/Rose Gajra"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 1
    },
    {
      id: 18,
      category_slug: "bleach-detan",
      title: "Sara Oxy Detan Brightening Pack (Face + Neck)",
      subtitle: "Zero-bleach peroxide-free sun tan reversal with lactic acid & eucalyptus",
      duration_mins: 35,
      price: 999,
      discounted_price: 699,
      byo_product_discount: 100,
      rating: 4.92,
      review_count: 1250,
      image_url: "https://images.unsplash.com/photo-1512290900672-1f02f9011746?auto=format&fit=crop&w=700&q=80",
      description: "Instant skin revival without irritating hair bleaching chemicals. Uses natural eucalyptus and clove oils with botanical lactic acid to lift deep-seated sun oxidation.",
      included_steps: [
        "Gentle Face Cleansing",
        "Sara Oxy De-Tan Pack Application",
        "15-min Cooling Dermal Absorption",
        "Sponging with Cold Rose Water",
        "SPF 50 Hydrating Screen"
      ],
      products_used: [
        "Sara Oxy D-Tan Professional Gel",
        "Pure Eucalyptus Oil Complex",
        "Aloe Soothing Gel"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 19,
      category_slug: "bleach-detan",
      title: "Insta-Glow Diamond Pre-Bridal Bleach",
      subtitle: "Camouflages facial hair and brightens complexion in 20 minutes",
      duration_mins: 25,
      price: 799,
      discounted_price: 499,
      byo_product_discount: 80,
      rating: 4.89,
      review_count: 710,
      image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80",
      description: "Quick glow treatment that matches fine facial hair with your natural skin tone and delivers a sparkling radiant complexion.",
      included_steps: [
        "Pre-bleach Cream Protection",
        "Even Bleach Paste Application",
        "12-min Oxidation Monitoring",
        "Gentle Removal & Cold Compress",
        "Post-bleach Calming Serum"
      ],
      products_used: [
        "Oxyglow Diamond Bleach",
        "Chamomile Calming Serum"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 20,
      category_slug: "body-spa",
      title: "Swedish Stress Relief Full Body Massage (Female Pro)",
      subtitle: "60 minutes of long flowing strokes to release knots and anxiety",
      duration_mins: 60,
      price: 2999,
      discounted_price: 1999,
      byo_product_discount: 300,
      rating: 4.98,
      review_count: 910,
      image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80",
      description: "Conducted on a sanitized portable spa bed by an experienced female therapist. Uses cold-pressed sesame and lavender oils to enhance circulation, ease muscular aches and foster deep peaceful sleep.",
      included_steps: [
        "Foot Reflexology Welcome Soak",
        "Warm Lavender Oil Effleurage",
        "Back, Shoulder & Neck Deep Kneading",
        "Leg & Hip Tension Release",
        "Hot Towel Steam Wipe Down"
      ],
      products_used: [
        "Cold-pressed Sweet Almond Oil",
        "French Lavender Essential Oil",
        "Sterilized Disposable Spa Linen"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 0
    },
    {
      id: 21,
      category_slug: "body-spa",
      title: "Ayurvedic Herbal Potli Kizhi Pain-Relief Massage",
      subtitle: "Warm herbal poultice massage steeped in classical medicated oils",
      duration_mins: 75,
      price: 3499,
      discounted_price: 2499,
      byo_product_discount: 400,
      rating: 4.95,
      review_count: 530,
      image_url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=700&q=80",
      description: "Authentic Kerala Kizhi therapy. Muslin pouches filled with 12 medicinal herbs are warmed in medicated oil and rhythmic rhythmic tapped onto aching joints, shoulders and spine.",
      included_steps: [
        "Full Body Abhyanga Oil Application",
        "Warm Herbal Potli Rhythmic Fomentation",
        "Spine & Lumbar Acupressure Alignment",
        "Herbal Decoction Compress"
      ],
      products_used: [
        "Kerala Authentic Eladi Choornam Potli",
        "Mahanarayana Medicated Oil",
        "Steam Inhaler"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
    },
    {
      id: 22,
      category_slug: "groom-men",
      title: "Groom Signature D-Day Makeover & Beard Sculpting",
      subtitle: "Subtle matte skin perfection, precision beard trim & styling for groom",
      duration_mins: 60,
      price: 2999,
      discounted_price: 1999,
      byo_product_discount: 300,
      rating: 4.95,
      review_count: 320,
      image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
      description: "Tailored grooming for the modern groom. Eliminates under-eye fatigue, reduces shine for photography, and sculpts beard and hair to sharp masculine perfection.",
      included_steps: [
        "Charcoal Detox Pore Cleansing",
        "Beard Outline Shaping & Steam Razor Detailing",
        "Matte Anti-Shine Skin Hydrator",
        "Subtle Dark Circle Concealer",
        "Matte Pomade Hair Styling"
      ],
      products_used: [
        "Clinique for Men Oil Control Mattifying",
        "Beardo Godfather Oil",
        "Uppercut Deluxe Pomade"
      ],
      is_bestseller: 1,
      is_bridal_exclusive: 1
    },
    {
      id: 23,
      category_slug: "groom-men",
      title: "Gentlemen's Anti-Stress Scalp & Shoulder Massage",
      subtitle: "Intense pressure point champi to dissolve neck stiffness and fatigue",
      duration_mins: 40,
      price: 1199,
      discounted_price: 799,
      byo_product_discount: 100,
      rating: 4.93,
      review_count: 440,
      image_url: "https://images.unsplash.com/photo-1516914943479-89db7d9ae7f2?auto=format&fit=crop&w=700&q=80",
      description: "Intense traditional head, neck and shoulder massage to melt away workday stress and activate dormant hair follicles.",
      included_steps: [
        "Deep Scalp Detangling",
        "Warm Forest Essentials Bhringraj Oil Massage",
        "Acupressure Tension Point Release",
        "Shoulder & Upper Back Kneading",
        "High Frequency Comb (5 mins)"
      ],
      products_used: [
        "Forest Essentials Ayurvedic Bhringraj Taila",
        "High Frequency Scalp Wand"
      ],
      is_bestseller: 0,
      is_bridal_exclusive: 0
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
    { code: "DULHANIYA500", discount_type: "FLAT", discount_value: 500, min_order_amount: 1499, max_discount: 500, description: "Flat ₹500 off on bridal & salon bookings above ₹1499", is_active: 1 },
    { code: "FIRSTGLOW", discount_type: "PERCENTAGE", discount_value: 20, min_order_amount: 799, max_discount: 400, description: "20% off up to ₹400 on your first at-home appointment", is_active: 1 },
    { code: "BRIDALQUEEN", discount_type: "FLAT", discount_value: 1500, min_order_amount: 4999, max_discount: 1500, description: "Royal ₹1,500 privilege discount on Bridal D-Day & Pre-Bridal packages", is_active: 1 },
    { code: "SHADI2026", discount_type: "PERCENTAGE", discount_value: 15, min_order_amount: 1999, max_discount: 1000, description: "15% off up to ₹1000 for wedding season rituals", is_active: 1 }
  ],
  bookings: [
    {
      id: 1,
      booking_ref: "DLH-9842",
      customer_name: "Priya Malhotra",
      customer_phone: "+91 98765 43210",
      customer_email: "priya.m@example.com",
      address: "Tower 4, Apt 1102, The Palm Springs, Golf Course Road",
      city: "Gurugram",
      service_date: "2026-10-27",
      service_slot: "09:00 AM - 12:00 PM",
      total_amount: 9499,
      discount_amount: 1500,
      kit_type: "byo_product",
      coupon_code: "BRIDALQUEEN",
      status: "ASSIGNED",
      otp_code: "4829",
      payment_mode: "Pay After Service",
      items: [
        { title: "Royal Dulhaniya D-Day Bridal Makeup (HD / Airbrush)", price: 9499, qty: 1 }
      ],
      beautician_id: 1,
      beautician_name: "Pooja Sharma",
      beautician_phone: "+91 98112 34567",
      beautician_rating: 4.98,
      beautician_photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      experience_years: 9,
      created_at: new Date().toISOString()
    }
  ],
  reviews: [
    {
      id: 1,
      customer_name: "Simran Kaur",
      rating: 5,
      comment: "Pooja did my wedding makeup and I couldn't have asked for anything more perfect! 100% sealed kits were opened in front of me.",
      service_title: "Royal Dulhaniya D-Day Bridal Makeup",
      date: "2026-10-22",
      beautician_name: "Pooja Sharma"
    },
    {
      id: 2,
      customer_name: "Neha Gupta",
      rating: 5,
      comment: "The BYOP labor discount option saved me ₹1,500 because I already had my MAC and Huda palettes. Honest pricing!",
      service_title: "Haldi & Mehendi Sunshine Radiance",
      date: "2026-10-20",
      beautician_name: "Sunita Verma"
    }
  ]
};

// Response helper
function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    },
    body: JSON.stringify(data)
  };
}

exports.handler = async (event, context) => {
  // CORS Preflight
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(200, { ok: true });
  }

  // Parse relative route path
  let path = event.path || "";
  path = path.replace(/^\/\.netlify\/functions\/api/, "");
  path = path.replace(/^\/api/, "");
  if (!path.startsWith("/")) path = "/" + path;

  const method = event.httpMethod;
  const query = event.queryStringParameters || {};
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {}
  }

  // Route: GET /categories
  if (path === "/categories" && method === "GET") {
    return jsonResponse(200, { success: true, categories: store.categories });
  }

  // Route: GET /services
  if (path === "/services" && method === "GET") {
    let result = [...store.services];
    if (query.category && query.category !== "all") {
      result = result.filter(s => s.category_slug === query.category);
    }
    if (query.bridal_only === "1") {
      result = result.filter(s => s.is_bridal_exclusive === 1);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q))
      );
    }
    return jsonResponse(200, { success: true, count: result.length, services: result });
  }

  // Route: GET /services/:id
  const serviceMatch = path.match(/^\/services\/(\d+)$/);
  if (serviceMatch && method === "GET") {
    const sId = Number(serviceMatch[1]);
    const service = store.services.find(s => s.id === sId);
    if (!service) return jsonResponse(404, { success: false, error: "Service not found" });
    return jsonResponse(200, { success: true, service });
  }

  // Route: GET /beauticians
  if (path === "/beauticians" && method === "GET") {
    return jsonResponse(200, { success: true, beauticians: store.beauticians.filter(b => b.is_available === 1) });
  }

  // Route: GET /coupons
  if (path === "/coupons" && method === "GET") {
    return jsonResponse(200, { success: true, coupons: store.coupons.filter(c => c.is_active === 1) });
  }

  // Route: POST /coupons/apply
  if (path === "/coupons/apply" && method === "POST") {
    const { code, subtotal } = body;
    const coupon = store.coupons.find(c => c.code === (code || "").toUpperCase() && c.is_active === 1);
    if (!coupon) return jsonResponse(400, { success: false, error: "Invalid or expired coupon code." });
    if (subtotal < coupon.min_order_amount) {
      return jsonResponse(400, {
        success: false,
        error: `Minimum order of ₹${coupon.min_order_amount} required for this coupon.`
      });
    }
    let discount = 0;
    if (coupon.discount_type === "FLAT") {
      discount = coupon.discount_value;
    } else {
      discount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
    }
    return jsonResponse(200, {
      success: true,
      code: coupon.code,
      discount,
      description: coupon.description
    });
  }

  // Route: GET /slots
  if (path === "/slots" && method === "GET") {
    const slots = [
      { time: "07:00 AM - 09:00 AM", available: true, label: "Morning Glow Slot" },
      { time: "09:00 AM - 12:00 PM", available: true, label: "Bridal Priority Slot" },
      { time: "12:00 PM - 03:00 PM", available: true, label: "Afternoon Pampering" },
      { time: "03:00 PM - 06:00 PM", available: true, label: "Golden Hour Slot" },
      { time: "06:00 PM - 09:00 PM", available: true, label: "Evening Prep Slot" }
    ];
    return jsonResponse(200, { success: true, date: query.date || "Today", slots });
  }

  // Route: POST /bookings
  if (path === "/bookings" && method === "POST") {
    const ref = "DLH-" + Math.floor(1000 + Math.random() * 9000);
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const pro = store.beauticians[0];

    const newBooking = {
      id: Date.now(),
      booking_ref: ref,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email || "",
      address: body.address,
      city: body.city || "New Delhi",
      service_date: body.service_date,
      service_slot: body.service_slot,
      total_amount: body.total_amount,
      discount_amount: body.discount_amount || 0,
      kit_type: body.kit_type || "dulhaniya_kit",
      coupon_code: body.coupon_code || "",
      status: "CONFIRMED",
      otp_code: otp,
      payment_mode: body.payment_mode || "Pay After Service",
      items: body.items || [],
      beautician_id: pro.id,
      beautician_name: pro.name,
      beautician_phone: pro.phone,
      beautician_rating: pro.rating,
      beautician_photo: pro.photo_url,
      experience_years: pro.experience_years,
      created_at: new Date().toISOString()
    };
    store.bookings.unshift(newBooking);
    return jsonResponse(200, {
      success: true,
      booking_ref: ref,
      otp_code: otp,
      status: "CONFIRMED",
      total_amount: body.total_amount,
      message: "Booking placed successfully on Dulhaniya Cloud!"
    });
  }

  // Route: GET /bookings/:ref
  const bookingMatch = path.match(/^\/bookings\/([A-Za-z0-9\-]+)$/);
  if (bookingMatch && method === "GET") {
    const ref = bookingMatch[1];
    const b = store.bookings.find(item => item.booking_ref === ref);
    if (!b) return jsonResponse(404, { success: false, error: "Booking not found" });
    return jsonResponse(200, { success: true, booking: b });
  }

  // Route: POST /bookings/:ref/verify-otp
  const otpMatch = path.match(/^\/bookings\/([A-Za-z0-9\-]+)\/verify-otp$/);
  if (otpMatch && method === "POST") {
    const ref = otpMatch[1];
    const b = store.bookings.find(item => item.booking_ref === ref);
    if (!b) return jsonResponse(404, { success: false, error: "Booking not found" });
    if (b.otp_code === String(body.otp).trim()) {
      b.status = "IN_SERVICE";
      return jsonResponse(200, { success: true, message: "OTP verified! Safe service begun." });
    }
    return jsonResponse(400, { success: false, error: "Incorrect 4-digit OTP." });
  }

  // Route: GET /admin/stats
  if (path === "/admin/stats" && method === "GET") {
    return jsonResponse(200, {
      success: true,
      stats: {
        total_bookings: store.bookings.length,
        total_revenue: store.bookings.reduce((sum, b) => sum + (b.total_amount || 0), 48200),
        active_beauticians: store.beauticians.filter(b => b.is_available === 1).length,
        average_rating: 4.98
      }
    });
  }

  // Route: GET /admin/beauticians
  if (path === "/admin/beauticians" && method === "GET") {
    return jsonResponse(200, { success: true, beauticians: store.beauticians });
  }

  // Route: GET /admin/coupons
  if (path === "/admin/coupons" && method === "GET") {
    return jsonResponse(200, { success: true, coupons: store.coupons });
  }

  // Route: GET /admin/reviews
  if (path === "/admin/reviews" && method === "GET") {
    return jsonResponse(200, { success: true, reviews: store.reviews });
  }

  // Default Fallback
  return jsonResponse(404, { success: false, error: `Route ${path} not found on serverless API` });
};
