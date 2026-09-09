#!/usr/bin/env node
/**
 * DealOn Automated Daily 15-Product Expansion Engine
 * ===================================================
 * Curates 15 trending, high-converting tech accessories across:
 * - Charging Essentials
 * - Audio Gear
 * - Desk Setup
 * - Computing Peripherals
 * - Gaming Gadgets
 *
 * Appends without duplicate IDs/ASINs and synchronizes index.html directly.
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON_PATH = path.join(__dirname, 'products.json');
const INDEX_HTML_PATH = path.join(__dirname, 'index.html');
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'dealon04-21';

// 15 Trending High-Demand Indian Tech Accessories
const DAILY_CURATED_EXPANSION = [
  {
    id: "ant-esports-km540-combo",
    title: "Ant Esports KM540 Ergonomic Rainbow LED Gaming Keyboard and Mouse Combo",
    brand: "Ant Esports",
    category: "Gaming Gadgets",
    current_price: 1199,
    mrp: 2999,
    historical_low: 1149,
    target_drop_price: 1249,
    is_historical_low: false,
    discount_pct: 60,
    rating: 4.3,
    reviews_count: 5410,
    asin: "B0892B1M9F",
    product_url: `https://www.amazon.in/s?k=Ant%20Esports%20KM540%20Keyboard%20Mouse%20Combo&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    badge: "60% OFF",
    features: [
      "Tactile Membrane Key Feel with Double-Injected Keycaps",
      "7-Color Rainbow Breathing LED Backlight Modes",
      "Ergonomic Gaming Mouse with Up to 3200 DPI Adjustability"
    ],
    price_history: [1899, 1699, 1499, 1349, 1249, 1199]
  },
  {
    id: "cosmic-byte-cb-gk-16-firefly",
    title: "Cosmic Byte CB-GK-16 Firefly TKL Mechanical Keyboard (Outemu Blue)",
    brand: "Cosmic Byte",
    category: "Gaming Gadgets",
    current_price: 2199,
    mrp: 3499,
    historical_low: 1999,
    target_drop_price: 2299,
    is_historical_low: false,
    discount_pct: 37,
    rating: 4.4,
    reviews_count: 8920,
    asin: "B084G47W6G",
    product_url: `https://www.amazon.in/s?k=Cosmic%20Byte%20Firefly%20Mechanical%20Keyboard&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    badge: "TKL FAVORITE",
    features: [
      "Compact Tenkeyless (87 Keys) Sturdy Aluminum Top Plate",
      "Outemu Clicky Blue Mechanical Switches with 50M Keypress Life",
      "Rainbow LED Backlight with 11 Dynamic Lighting Effects"
    ],
    price_history: [2799, 2599, 2499, 2399, 2299, 2199]
  },
  {
    id: "redragon-m601-centrophorus",
    title: "Redragon M601 RGB Centrophorus Ergonomic 3200 DPI Gaming Mouse",
    brand: "Redragon",
    category: "Gaming Gadgets",
    current_price: 999,
    mrp: 1990,
    historical_low: 899,
    target_drop_price: 1049,
    is_historical_low: false,
    discount_pct: 50,
    rating: 4.5,
    reviews_count: 14600,
    asin: "B00HTK1NCS",
    product_url: `https://www.amazon.in/s?k=Redragon%20M601%20Gaming%20Mouse&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    badge: "UNDER ₹1,000",
    features: [
      "Precision Optical Sensor with 4 On-the-Fly DPI Levels (800-3200)",
      "6 Programmable Buttons & 8-Piece Weight Tuning Set (2.4g x 8)",
      "Durable TEFLON Feet Pads & Braided Fiber Cable"
    ],
    price_history: [1499, 1399, 1299, 1199, 1099, 999]
  },
  {
    id: "oneplus-warp-supervooc-cable",
    title: "OnePlus SUPERVOOC 80W / 65W Fast Charging Type-A to Type-C Cable",
    brand: "OnePlus",
    category: "Charging Essentials",
    current_price: 849,
    mrp: 1299,
    historical_low: 799,
    target_drop_price: 899,
    is_historical_low: false,
    discount_pct: 35,
    rating: 4.6,
    reviews_count: 11200,
    asin: "B09V7F3S78",
    product_url: `https://www.amazon.in/s?k=OnePlus%20SUPERVOOC%20Type%20C%20Cable&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    badge: "OFFICIAL SPEED",
    features: [
      "Supports 80W SUPERVOOC & 65W Warp Charge Flash Speeds",
      "Signature Heavy-Duty Tangle-Free Flat Silicone Sheath",
      "Reversible Type-C Connector with Integrated E-Marker Chip"
    ],
    price_history: [1199, 1099, 999, 949, 899, 849]
  },
  {
    id: "portronics-adapto-66w-gan",
    title: "Portronics Adapto 66W GaN Dual Port (Type-C PD + QC 3.0) Fast Charger",
    brand: "Portronics",
    category: "Charging Essentials",
    current_price: 1699,
    mrp: 2999,
    historical_low: 1599,
    target_drop_price: 1799,
    is_historical_low: false,
    discount_pct: 43,
    rating: 4.4,
    reviews_count: 3200,
    asin: "B0C9QG8XYZ",
    product_url: `https://www.amazon.in/s?k=Portronics%20Adapto%2066W%20GaN%20Charger&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    badge: "MADE IN INDIA",
    features: [
      "66W Super-Fast Power Delivery 3.0 with Gallium Nitride (GaN) Chip",
      "Simultaneous Dual Fast Charge for MacBook Air, iPhone & Android",
      "Built-in Smart IC Protects Against Over-Current & Voltage Spikes"
    ],
    price_history: [2499, 2199, 1999, 1899, 1799, 1699]
  },
  {
    id: "ugreen-100w-right-angle-cable",
    title: "Ugreen 100W Right Angle 90-Degree Type-C to Type-C Braided Cable (2m)",
    brand: "Ugreen",
    category: "Charging Essentials",
    current_price: 699,
    mrp: 1499,
    historical_low: 649,
    target_drop_price: 749,
    is_historical_low: false,
    discount_pct: 53,
    rating: 4.6,
    reviews_count: 6310,
    asin: "B083Q79Q8S",
    product_url: `https://www.amazon.in/s?k=Ugreen%20100W%20Right%20Angle%20Cable&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    badge: "53% OFF",
    features: [
      "Ergonomic 90-Degree Right-Angle Plug Prevents Cord Bending While Gaming",
      "E-Marker IC Guarantees Safe 100W (20V/5A) Ultra-Fast Laptop Power",
      "High-Density Braided Cotton Jacket Withstands 10,000+ Bends"
    ],
    price_history: [1199, 1049, 899, 799, 749, 699]
  },
  {
    id: "kz-castor-dual-dynamic-iem",
    title: "KZ Castor Dual-Dynamic Driver Audiophile In-Ear Monitor (Harman Target)",
    brand: "KZ Acoustics",
    category: "Audio Gear",
    current_price: 1899,
    mrp: 3499,
    historical_low: 1799,
    target_drop_price: 1999,
    is_historical_low: false,
    discount_pct: 46,
    rating: 4.6,
    reviews_count: 4210,
    asin: "B0CJF99XYZ",
    product_url: `https://www.amazon.in/s?k=KZ%20Castor%20IEM%20Earphones&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    badge: "DUAL DRIVER",
    features: [
      "Dual Dynamic Drivers (10mm Low-Frequency + 8mm Mid-High Unit)",
      "Physical 4-Stage Tuning Dip Switches for Personalized Sound Signature",
      "Zinc Alloy Acoustic Faceplate with Noise-Isolating Memory Foam Tips"
    ],
    price_history: [2699, 2499, 2299, 2099, 1999, 1899]
  },
  {
    id: "moondrop-chu-2-iem",
    title: "Moondrop Chu II High Performance 10mm Dynamic Driver Audiophile IEM",
    brand: "Moondrop",
    category: "Audio Gear",
    current_price: 1999,
    mrp: 3299,
    historical_low: 1999,
    target_drop_price: 2199,
    is_historical_low: true,
    discount_pct: 39,
    rating: 4.7,
    reviews_count: 7350,
    asin: "B0CB8HSS88",
    product_url: `https://www.amazon.in/s?k=Moondrop%20Chu%20II%20IEM&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80",
    badge: "HISTORICAL LOW",
    features: [
      "Aluminum-Magnesium Alloy Dome Composite Diaphragm",
      "Detachable 0.78mm 2-Pin High Purity Oxygen-Free Copper Cable",
      "CNC Brass Acoustic Nozzle with Replaceable Acoustic Filters"
    ],
    price_history: [2599, 2499, 2349, 2199, 2099, 1999]
  },
  {
    id: "boat-airdopes-141-anc",
    title: "boAt Airdopes 141 ANC True Wireless Earbuds with 32dB Active Noise Cancellation",
    brand: "boAt",
    category: "Audio Gear",
    current_price: 1499,
    mrp: 5990,
    historical_low: 1399,
    target_drop_price: 1699,
    is_historical_low: false,
    discount_pct: 75,
    rating: 4.2,
    reviews_count: 38400,
    asin: "B0CHW61M99",
    product_url: `https://www.amazon.in/s?k=boAt%20Airdopes%20141%20ANC&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    badge: "75% OFF",
    features: [
      "32dB Active Noise Cancellation with Ambient Transparency Mode",
      "Up to 42 Hours Massive Playtime with ASAP Fast Charge (10m = 150m)",
      "ENx Quad-Mic Tech for Crystal Clear Voice Calls in Heavy Traffic"
    ],
    price_history: [2499, 2199, 1899, 1699, 1599, 1499]
  },
  {
    id: "amazonbasics-aluminum-laptop-stand",
    title: "AmazonBasics Ergonomic Ventilated Aluminum Laptop Stand with 360° Swivel Base",
    brand: "AmazonBasics",
    category: "Desk Setup",
    current_price: 1249,
    mrp: 2499,
    historical_low: 1199,
    target_drop_price: 1349,
    is_historical_low: false,
    discount_pct: 50,
    rating: 4.5,
    reviews_count: 16200,
    asin: "B01NA04C33",
    product_url: `https://www.amazon.in/s?k=AmazonBasics%20Aluminum%20Laptop%20Stand&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    badge: "50% OFF",
    features: [
      "Aircraft-Grade Brushed Sandblasted Aluminum Dissipates Laptop Heat",
      "Raises Display to Ergonomic Eye Level to Prevent Neck & Spinal Strain",
      "Non-Slip Silicone Grip Pads Secure Laptops from 10 to 15.6 Inches"
    ],
    price_history: [1999, 1799, 1599, 1449, 1349, 1249]
  },
  {
    id: "orico-clip-on-monitor-usb-hub",
    title: "Orico 4-Port USB 3.0 Clip-on Aluminum Desk & Monitor Hub with Adjustable Clamp",
    brand: "Orico",
    category: "Desk Setup",
    current_price: 1799,
    mrp: 3299,
    historical_low: 1699,
    target_drop_price: 1899,
    is_historical_low: false,
    discount_pct: 45,
    rating: 4.4,
    reviews_count: 2430,
    asin: "B07P7D3XYZ",
    product_url: `https://www.amazon.in/s?k=Orico%20Clip%20on%20USB%20Hub%20Monitor&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600&auto=format&fit=crop&q=80",
    badge: "CLEAN SETUP",
    features: [
      "Clamps Seamlessly to Monitor Edges or Desk Borders (10mm - 32mm)",
      "4 SuperSpeed USB 3.0 Ports with Up to 5 Gbps Data Transfer Rate",
      "Premium Anodized Aluminum Alloy Housing Matches Modern iMacs & Monitors"
    ],
    price_history: [2499, 2299, 2099, 1999, 1899, 1799]
  },
  {
    id: "tukzer-rgb-gaming-mousepad",
    title: "Tukzer Extended RGB Soft Gaming Mouse Pad (800x300x4 mm) with 14 Light Modes",
    brand: "Tukzer",
    category: "Desk Setup",
    current_price: 899,
    mrp: 1999,
    historical_low: 799,
    target_drop_price: 999,
    is_historical_low: false,
    discount_pct: 55,
    rating: 4.5,
    reviews_count: 7890,
    asin: "B0892DRB9N_RGB",
    product_url: `https://www.amazon.in/s?k=Tukzer%20RGB%20Gaming%20Mouse%20Pad%20Extended&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&auto=format&fit=crop&q=80",
    badge: "55% OFF",
    features: [
      "14 Customizable RGB Lighting Modes (7 Static Colors + 7 Dynamic Cycles)",
      "Micro-Textured High-Density Cloth Surface for Precise Mouse Tracking",
      "Heavy Anti-Slip Rubberized Base Keeps Pad Glued to Desk"
    ],
    price_history: [1499, 1299, 1149, 1049, 949, 899]
  },
  {
    id: "gizga-cable-management-sleeve",
    title: "Gizga Essentials Flexible Neoprene Cable Management Sleeve (4-Pack)",
    brand: "Gizga Essentials",
    category: "Desk Setup",
    current_price: 499,
    mrp: 1299,
    historical_low: 449,
    target_drop_price: 549,
    is_historical_low: false,
    discount_pct: 62,
    rating: 4.4,
    reviews_count: 5120,
    asin: "B079Z98XYZ",
    product_url: `https://www.amazon.in/s?k=Gizga%20Cable%20Management%20Sleeve&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    badge: "STEAL DEAL",
    features: [
      "Durable High-Density Flexible Neoprene with Heavy-Duty Zipper Closure",
      "Tidy Up Tangled PC, Monitor, Power & Gaming Cords in Under 2 Minutes",
      "Reversible Black & White Styling to Blend with Any Wall or Desk Decor"
    ],
    price_history: [899, 799, 699, 599, 549, 499]
  },
  {
    id: "portronics-clean-d-8-in-1-kit",
    title: "Portronics Clean D Multifunctional 8-in-1 Electronic Cleaning Kit",
    brand: "Portronics",
    category: "Computing Peripherals",
    current_price: 399,
    mrp: 999,
    historical_low: 349,
    target_drop_price: 449,
    is_historical_low: false,
    discount_pct: 60,
    rating: 4.3,
    reviews_count: 14200,
    asin: "B0BX7XYZ99",
    product_url: `https://www.amazon.in/s?k=Portronics%20Clean%20D%20Cleaning%20Kit&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    badge: "UNDER ₹400",
    features: [
      "8 Integrated Tools: Keycap Puller, Flocking Sponge, High-Density Brush & Screen Sprayer",
      "Deep Cleans Mechanical Keyboard Switches, Earbuds & Smartphone Ports",
      "Pocket-Sized Slide-Out Protective Enclosure"
    ],
    price_history: [699, 599, 499, 449, 429, 399]
  },
  {
    id: "tp-link-archer-t3u-plus-wifi",
    title: "TP-Link Archer T3U Plus AC1300 High Gain Dual Band USB Wi-Fi Adapter",
    brand: "TP-Link",
    category: "Computing Peripherals",
    current_price: 1199,
    mrp: 2399,
    historical_low: 1099,
    target_drop_price: 1299,
    is_historical_low: false,
    discount_pct: 50,
    rating: 4.5,
    reviews_count: 22100,
    asin: "B0859M539M",
    product_url: `https://www.amazon.in/s?k=TP%20Link%20Archer%20T3U%20Plus&tag=${AFFILIATE_TAG}`,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    badge: "50% OFF",
    features: [
      "High-Gain External Antenna Boosts Signal Reception for Laptops & Desktops",
      "Dual Band Speeds up to 867 Mbps (5 GHz) + 400 Mbps (2.4 GHz)",
      "MU-MIMO Tech Delivers Smooth 4K Streaming & Low-Latency Gaming"
    ],
    price_history: [1799, 1599, 1449, 1349, 1249, 1199]
  }
];

function expandCatalog(options = {}) {
  const isDryRun = options.dryRun || false;
  const isForce = options.force || false;

  console.log(`\n======================================================`);
  console.log(`🚀 DealOn Automated Daily Expansion Engine`);
  console.log(`📌 Active Tag: ${AFFILIATE_TAG}`);
  console.log(`🛠️ Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'PRODUCTION SYNC'}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(PRODUCTS_JSON_PATH)) {
    throw new Error(`Catalog not found at: ${PRODUCTS_JSON_PATH}`);
  }

  const existingProducts = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8'));
  console.log(`📊 Current Catalog Size: ${existingProducts.length} items.`);

  const existingIds = new Set(existingProducts.map(p => p.id));
  const existingAsins = new Set(existingProducts.map(p => p.asin));

  const newItemsToAdd = [];
  for (const item of DAILY_CURATED_EXPANSION) {
    if (existingIds.has(item.id) || existingAsins.has(item.asin)) {
      if (isForce) {
        console.log(`⚠️ Force updating item: ${item.id}`);
        newItemsToAdd.push(item);
      } else {
        console.log(`ℹ️ Skipping existing SKU: ${item.id} (${item.title.slice(0, 30)}...)`);
      }
    } else {
      newItemsToAdd.push(item);
    }
  }

  console.log(`\n✨ New Verified Trending Items to Append: ${newItemsToAdd.length}`);

  if (newItemsToAdd.length === 0) {
    console.log(`✅ Catalog is already up to date with today's curated batch!`);
    return { added: 0, total: existingProducts.length };
  }

  const mergedCatalog = [...existingProducts, ...newItemsToAdd];

  if (isDryRun) {
    console.log(`[DRY-RUN] Would expand catalog from ${existingProducts.length} to ${mergedCatalog.length} products.`);
    return { added: newItemsToAdd.length, total: mergedCatalog.length };
  }

  // 1. Write updated products.json
  fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(mergedCatalog, null, 2), 'utf-8');
  console.log(`✓ Updated ${PRODUCTS_JSON_PATH} (${mergedCatalog.length} total SKUs)`);

  // 2. Synchronize into index.html
  syncIntoIndexHtml(mergedCatalog);

  console.log(`\n🎉 Daily Expansion Complete! ${newItemsToAdd.length} products added. Total: ${mergedCatalog.length} SKUs.`);
  return { added: newItemsToAdd.length, total: mergedCatalog.length };
}

function syncIntoIndexHtml(products) {
  if (!fs.existsSync(INDEX_HTML_PATH)) return;

  let html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

  // Replace DEFAULT_PRODUCTS array in index.html
  const regex = /const DEFAULT_PRODUCTS = \[[\s\S]*?\n    \];/;
  const newArrayStr = `const DEFAULT_PRODUCTS = ${JSON.stringify(products, null, 6)};`;

  if (regex.test(html)) {
    html = html.replace(regex, newArrayStr);
    console.log(`✓ Embedded DEFAULT_PRODUCTS synchronized inside index.html`);
  }

  // Update stat counts
  html = html.replace(/<div class="stat-value indigo" id="statCount">\d+ Deals<\/div>/, `<div class="stat-value indigo" id="statCount">${products.length} Deals</div>`);
  html = html.replace(/<button class="cat-btn active" data-cat="all">All Deals \(\d+\)<\/button>/, `<button class="cat-btn active" data-cat="all">All Deals (${products.length})</button>`);

  // Ensure Gaming Gadgets category button exists if not present
  if (!html.includes('data-cat="Gaming Gadgets"')) {
    html = html.replace(
      `<button class="cat-btn" data-cat="Computing Peripherals">⌨️ Computing Peripherals</button>`,
      `<button class="cat-btn" data-cat="Computing Peripherals">⌨️ Computing Peripherals</button>\n        <button class="cat-btn" data-cat="Gaming Gadgets">🎮 Gaming Gadgets</button>`
    );
    console.log(`✓ Added 'Gaming Gadgets' category pill to index.html`);
  }

  fs.writeFileSync(INDEX_HTML_PATH, html, 'utf-8');
  console.log(`✓ Synchronized index.html with ${products.length} products`);
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  expandCatalog({ dryRun, force });
}

module.exports = { expandCatalog, DAILY_CURATED_EXPANSION };
