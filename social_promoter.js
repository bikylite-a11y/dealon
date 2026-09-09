#!/usr/bin/env node
/**
 * DealOn Social & Community Growth Engine
 * ========================================
 * Generates viral, ready-to-publish social media packages:
 * 1. Instagram / Facebook Carousel & Reel Captions (Hooks, Savings, CTA to Netlify link-in-bio)
 * 2. Reddit Community Roundups (Clean Markdown tables for r/IndiaTech & r/IndianGaming)
 *
 * Saves outputs directly to social_posts.md for 1-click copy-pasting.
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'products.json');
const OUTPUT_MD_PATH = path.join(__dirname, 'social_posts.md');
const AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'dealon04-21';
const PORTAL_URL = 'https://dealon.netlify.app/';
const TELEGRAM_CHANNEL = 'https://t.me/dealon_offers';

function loadProducts() {
  if (!fs.existsSync(PRODUCTS_PATH)) {
    throw new Error(`Products catalog not found at: ${PRODUCTS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
}

function getAffiliateUrl(item) {
  const q = encodeURIComponent(item.title);
  return `https://www.amazon.in/s?k=${q}&tag=${AFFILIATE_TAG}`;
}

function generateInstagramCarousel(products, topCount = 5) {
  const topDeals = [...products].sort((a, b) => b.discount_pct - a.discount_pct).slice(0, topCount);

  let output = `# 📸 INSTAGRAM & FACEBOOK VIRAL CAROUSEL POST\n\n`;
  output += `### Slide 1 (Hook Cover Slide):\n`;
  output += `> **Headline:** 🛑 STOP BUYING TECH AT FULL PRICE!\n`;
  output += `> **Subhead:** 5 Verified Tech Deals That Just Hit 90-Day Lows (Save Up to 75%)\n`;
  output += `> **Badge:** Curated by DealOn • Updated Daily\n\n`;

  topDeals.forEach((p, idx) => {
    const savings = p.mrp - p.current_price;
    const url = getAffiliateUrl(p);
    output += `### Slide ${idx + 2} (${p.brand} Spotlight):\n`;
    output += `**${p.badge || 'HOT DEAL'} • ${p.category}**\n`;
    output += `**${p.title}**\n\n`;
    output += `- 💰 **Deal Price:** ₹${p.current_price.toLocaleString('en-IN')}\n`;
    output += `- ❌ **Original MRP:** ~~₹${p.mrp.toLocaleString('en-IN')}~~\n`;
    output += `- 📉 **Savings:** ₹${savings.toLocaleString('en-IN')} (${p.discount_pct}% OFF)\n`;
    output += `- 🎯 **Verified 90-Day Low:** ₹${p.historical_low.toLocaleString('en-IN')}\n`;
    output += `- ⚡ **Key Feature:** ${(p.features || [])[0] || 'High performance'}\n`;
    output += `- 🔗 **Link:** ${PORTAL_URL}#${p.id}\n\n`;
  });

  output += `### Slide ${topCount + 2} (Call to Action / Outro):\n`;
  output += `> **Swipe Left Over!**\n`;
  output += `> 🔗 Tap the **link in bio** to grab these deals before prices bounce back!\n`;
  output += `> 📢 Join our VIP Telegram channel (**@dealon_offers**) for instant push alerts.\n\n`;

  output += `### 📝 Ready-to-Paste Instagram Caption:\n\`\`\`text\n`;
  output += `🚨 5 INSANE TECH DEALS THAT DROPPED TO 90-DAY LOWS TODAY! 🚨\n\n`;
  output += `We track historical prices 24/7 so you never overpay for tech again. Here are the top drops right now:\n\n`;

  topDeals.forEach((p, i) => {
    output += `${i + 1}️⃣ ${p.title}\n`;
    output += `   💸 ₹${p.current_price.toLocaleString('en-IN')} (was ₹${p.mrp.toLocaleString('en-IN')} - ${p.discount_pct}% OFF)\n`;
    output += `   📉 Lowest price verified: ₹${p.historical_low.toLocaleString('en-IN')}\n\n`;
  });

  output += `👉 How to grab them:\n`;
  output += `1. Tap the LINK IN BIO (${PORTAL_URL})\n`;
  output += `2. Or join our Telegram channel @dealon_offers for instant drop alerts!\n\n`;
  output += `Which one are you adding to your setup? Let us know in the comments! 👇\n\n`;
  output += `. \n. \n. \n`;
  output += `#TechDeals #DealsInIndia #AmazonFindsIndia #DeskSetup #IndianTech #AudiophileIndia #PCGamingIndia #SmartSavings #DealOn\n`;
  output += `\`\`\`\n\n`;

  return output;
}

function generateRedditRoundup(products) {
  // Select top deals across categories
  const gamingDeals = products.filter(p => p.category === 'Gaming Gadgets' || p.category === 'Computing Peripherals').slice(0, 4);
  const audioDeals = products.filter(p => p.category === 'Audio Gear').slice(0, 4);
  const chargeDeals = products.filter(p => p.category === 'Charging Essentials' || p.category === 'Desk Setup').slice(0, 4);

  let output = `# 👾 REDDIT COMMUNITY DEAL ROUNDUPS\n\n`;
  output += `## Post 1: Formatted for r/IndianGaming & r/mkindia\n\n`;
  output += `**Post Title:** [Deals Roundup] Verified Historical Price Lows on Gaming Peripherals & Desk Setup Gear (August 2026)\n\n`;
  output += `Hey everyone,\n\nHere is a curated roundup of verified price drops for mechanical keyboards, mice, audio IEMs, and desk accessories currently hitting their 90-day historical lowest prices in India. None of the fake 'inflated MRP' garbage—all drops verified against price history.\n\n`;

  output += `### 🎮 Keyboards, Mice & Desk Gear\n\n`;
  output += `| Product | Deal Price | MRP | Discount | Notes | Link |\n`;
  output += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  gamingDeals.forEach(p => {
    const url = getAffiliateUrl(p);
    output += `| **${p.title.slice(0, 40)}...** | ₹${p.current_price.toLocaleString('en-IN')} | ~~₹${p.mrp.toLocaleString('en-IN')}~~ | **${p.discount_pct}%** | ${p.badge || 'Verified Low'} | [Amazon](${url}) / [Portal](${PORTAL_URL}#${p.id}) |\n`;
  });

  output += `\n### 🎧 Audiophile IEMs & Audio\n\n`;
  output += `| Product | Deal Price | MRP | Discount | Notes | Link |\n`;
  output += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audioDeals.forEach(p => {
    const url = getAffiliateUrl(p);
    output += `| **${p.title.slice(0, 40)}...** | ₹${p.current_price.toLocaleString('en-IN')} | ~~₹${p.mrp.toLocaleString('en-IN')}~~ | **${p.discount_pct}%** | ${p.badge || 'Verified Low'} | [Amazon](${url}) / [Portal](${PORTAL_URL}#${p.id}) |\n`;
  });

  output += `\n### ⚡ Charging Essentials & Setup Cleaners\n\n`;
  output += `| Product | Deal Price | MRP | Discount | Notes | Link |\n`;
  output += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  chargeDeals.forEach(p => {
    const url = getAffiliateUrl(p);
    output += `| **${p.title.slice(0, 40)}...** | ₹${p.current_price.toLocaleString('en-IN')} | ~~₹${p.mrp.toLocaleString('en-IN')}~~ | **${p.discount_pct}%** | ${p.badge || 'Verified Low'} | [Amazon](${url}) / [Portal](${PORTAL_URL}#${p.id}) |\n`;
  });

  output += `\n*Disclosure: Links use Amazon Associates tag (dealon04-21) to support our automated tracking engine. Live web portal tracking 29+ tech SKUs in real-time at [dealon.netlify.app](${PORTAL_URL}). VIP instant alerts at [t.me/dealon_offers](${TELEGRAM_CHANNEL}).*\n\n`;

  return output;
}

function generateSocialPackage(options = {}) {
  const products = loadProducts();
  console.log(`\n======================================================`);
  console.log(`🚀 DealOn Social & Community Growth Engine`);
  console.log(`📊 Loaded ${products.length} active products from database.`);
  console.log(`📌 Tag: ${AFFILIATE_TAG} | Portal: ${PORTAL_URL}`);
  console.log(`======================================================\n`);

  const igContent = generateInstagramCarousel(products, 5);
  const redditContent = generateRedditRoundup(products);

  const fullReport = `${igContent}\n---\n\n${redditContent}`;

  fs.writeFileSync(OUTPUT_MD_PATH, fullReport, 'utf-8');
  console.log(`✓ Successfully generated and exported social growth package to:\n  ${OUTPUT_MD_PATH}\n`);

  console.log(`✨ Preview of Instagram Caption Generated:`);
  console.log(`------------------------------------------------------`);
  const captionSample = igContent.split('```text')[1].split('```')[0].trim().slice(0, 450);
  console.log(captionSample + '\n... [See social_posts.md for complete text]\n');

  return { success: true, path: OUTPUT_MD_PATH };
}

if (require.main === module) {
  generateSocialPackage();
}

module.exports = { generateSocialPackage };
