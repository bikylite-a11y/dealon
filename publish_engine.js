#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 *  DealOn Omnichannel Publishing Engine v1.0
 * ═══════════════════════════════════════════════════════════════════
 *  Unified 5-platform deal broadcaster:
 *    1. Telegram   — sendPhoto with rich caption + inline buttons
 *    2. Facebook   — Graph API photo post (or fallback caption)
 *    3. Instagram  — Graph API container→publish (or fallback caption)
 *    4. Website    — products.json sync + index.html PRODUCTS update
 *    5. Google Biz — Offer Post draft generation
 *
 *  Usage:
 *    node publish_engine.js --id="cmf-nothing-65w-gan"
 *    node publish_engine.js --deal='{"title":"...","price":1499,...}'
 *    node publish_engine.js --top=5
 *    node publish_engine.js --id="cmf-nothing-65w-gan" --dry-run
 *    node publish_engine.js --id="cmf-nothing-65w-gan" --telegram-only
 * ═══════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ── Load .env ────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ── Config ───────────────────────────────────────────────────────
const CONFIG = {
  telegramToken:    process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChat:     process.env.TELEGRAM_CHANNEL_ID || '@dealon_offers',
  affiliateTag:     process.env.AMAZON_AFFILIATE_TAG || 'dealon04-21',
  metaToken:        process.env.META_ACCESS_TOKEN || '',
  fbPageId:         process.env.FB_PAGE_ID || '',
  igAccountId:      process.env.IG_ACCOUNT_ID || '',
  gbpUrl:           process.env.GBP_LOCATION_URL || 'https://share.google/X2MkXQhyJFo0RrpKK',
  portalUrl:        process.env.DEALON_PORTAL_URL || 'https://dealon.netlify.app',
  catalogPath:      path.join(__dirname, 'products.json'),
  indexPath:        path.join(__dirname, 'index.html'),
  socialLinks: {
    telegram:  'https://t.me/dealon_offers',
    facebook:  'https://www.facebook.com/dealonoffers/',
    instagram: 'https://www.instagram.com/dealon_offers/',
    google:    'https://share.google/X2MkXQhyJFo0RrpKK',
    website:   'https://dealon.netlify.app',
  }
};

// ── Helpers ───────────────────────────────────────────────────────
function fmtPrice(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function isoDate() { return new Date().toISOString().slice(0, 10); }
function isoTimestamp() { return new Date().toISOString(); }

function getDealUrl(product) {
  return product.product_url ||
    (product.asin ? `https://www.amazon.in/dp/${product.asin}?tag=${CONFIG.affiliateTag}` :
    `https://www.amazon.in/s?k=${encodeURIComponent(product.title)}&tag=${CONFIG.affiliateTag}`);
}

function loadCatalog() {
  if (!fs.existsSync(CONFIG.catalogPath)) throw new Error('products.json not found');
  return JSON.parse(fs.readFileSync(CONFIG.catalogPath, 'utf-8'));
}

function httpRequest(url, options, postData) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM 1: TELEGRAM — sendPhoto with rich caption
// ═══════════════════════════════════════════════════════════════════
function buildTelegramCaption(p) {
  const savings = p.mrp - p.current_price;
  const discount = p.discount_pct || Math.round(((p.mrp - p.current_price) / p.mrp) * 100);
  const isLow = p.is_historical_low || p.current_price <= p.historical_low;
  const url = getDealUrl(p);
  const header = isLow ? '🔥 *HISTORICAL ALL-TIME LOW ALERT*' : '⚡ *PRICE DROP ALERT*';
  const catTag = '#' + (p.category || '').replace(/\s+/g, '');
  const specs = (p.features || []).slice(0, 3).map(f => `• ${f}`).join('\n');

  return (
    `${header}\n\n` +
    `📦 *${p.title}*\n` +
    `🏢 Brand: *${p.brand}* | ${catTag}\n\n` +
    `💰 Deal Price: *${fmtPrice(p.current_price)}*\n` +
    `❌ MRP: ~${fmtPrice(p.mrp)}~\n` +
    `📉 Savings: *${fmtPrice(savings)}* (${discount}% OFF)\n` +
    `🎯 Verified 90-Day Low: *${fmtPrice(p.historical_low || p.current_price)}*\n\n` +
    (specs ? specs + '\n\n' : '') +
    `👉 *GRAB DEAL ON AMAZON:*\n${url}\n\n` +
    `🔔 Tracked 24/7 by @dealon\\_offers\n` +
    `🌐 ${CONFIG.portalUrl}\n` +
    `📸 Follow @dealon\\_offers on Instagram`
  );
}

function buildTelegramKeyboard(p) {
  const url = getDealUrl(p);
  return {
    inline_keyboard: [
      [{ text: `🛒 Buy on Amazon (${fmtPrice(p.current_price)})`, url }],
      [{
        text: '📢 Share Deal with Friend',
        url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
          `🔥 Deal Alert!\n\n${p.title}\n💰 ${fmtPrice(p.current_price)} (${p.discount_pct}% OFF!)\n\n👉 ${url}`
        )}`
      }],
      [
        { text: '🌐 DealOn Portal', url: `${CONFIG.portalUrl}/#${p.id}` },
        { text: '📸 Instagram', url: CONFIG.socialLinks.instagram }
      ]
    ]
  };
}

async function publishTelegram(p, dryRun) {
  const caption = buildTelegramCaption(p);
  const keyboard = buildTelegramKeyboard(p);
  const imageUrl = p.image_url || '';

  if (dryRun) {
    return {
      platform: 'Telegram',
      status: 'DRY-RUN',
      caption,
      image: imageUrl,
      buttons: keyboard.inline_keyboard.map(row => row.map(b => b.text).join(' | '))
    };
  }

  if (!CONFIG.telegramToken) {
    return { platform: 'Telegram', status: 'SKIPPED', reason: 'No bot token' };
  }

  // Use sendPhoto if we have an image, otherwise sendMessage
  const usePhoto = !!imageUrl;
  const endpoint = usePhoto ? 'sendPhoto' : 'sendMessage';
  const payload = usePhoto
    ? { chat_id: CONFIG.telegramChat, photo: imageUrl, caption, parse_mode: 'Markdown', reply_markup: keyboard }
    : { chat_id: CONFIG.telegramChat, text: caption, parse_mode: 'Markdown', disable_web_page_preview: false, reply_markup: keyboard };

  const body = JSON.stringify(payload);
  const res = await httpRequest(
    `https://api.telegram.org/bot${CONFIG.telegramToken}/${endpoint}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
    body
  );

  return {
    platform: 'Telegram',
    status: res.body?.ok ? '✅ PUBLISHED' : '❌ FAILED',
    statusCode: res.status,
    detail: res.body?.ok ? `Message ID: ${res.body.result?.message_id}` : (res.body?.description || 'Unknown error'),
    timestamp: isoTimestamp()
  };
}

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM 2: FACEBOOK — Graph API photo post
// ═══════════════════════════════════════════════════════════════════
function buildFacebookCaption(p) {
  const discount = p.discount_pct || Math.round(((p.mrp - p.current_price) / p.mrp) * 100);
  const url = getDealUrl(p);
  return (
    `🔥 DEAL ALERT: ${p.title}\n\n` +
    `💰 Deal Price: ${fmtPrice(p.current_price)}\n` +
    `❌ MRP: ${fmtPrice(p.mrp)} (${discount}% OFF!)\n` +
    `📉 Save ${fmtPrice(p.mrp - p.current_price)} today!\n\n` +
    `🛒 Grab Deal: ${url}\n\n` +
    `⚡ ${p.is_historical_low ? 'VERIFIED HISTORICAL LOW — Lowest price in 90 days!' : 'Price Drop Alert — Don\'t miss this deal!'}\n\n` +
    `📢 Follow @dealonoffers for daily tech deals!\n` +
    `📱 Instant alerts: t.me/dealon_offers\n` +
    `🌐 Browse all deals: ${CONFIG.portalUrl}\n\n` +
    `#DealOn #TechDeals #AmazonDeals #Offers #${(p.category || '').replace(/\s+/g, '')} #${(p.brand || '').replace(/\s+/g, '')} #Deals #Discount #India`
  );
}

async function publishFacebook(p, dryRun) {
  const caption = buildFacebookCaption(p);
  const imageUrl = p.image_url || '';

  if (dryRun || !CONFIG.metaToken || !CONFIG.fbPageId) {
    return {
      platform: 'Facebook',
      status: dryRun ? 'DRY-RUN' : '📋 MANUAL POST REQUIRED',
      reason: dryRun ? 'Preview mode' : 'Meta Access Token not configured — copy caption below',
      caption,
      image: imageUrl,
      postUrl: 'https://www.facebook.com/dealonoffers/',
      instruction: '➡️ Go to facebook.com/dealonoffers → Create Post → Paste caption + upload image'
    };
  }

  // Graph API: Post photo to Facebook Page
  const postBody = `url=${encodeURIComponent(imageUrl)}&message=${encodeURIComponent(caption)}&access_token=${encodeURIComponent(CONFIG.metaToken)}`;
  const res = await httpRequest(
    `https://graph.facebook.com/v19.0/${CONFIG.fbPageId}/photos`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postBody) } },
    postBody
  );

  return {
    platform: 'Facebook',
    status: res.body?.id ? '✅ PUBLISHED' : '❌ FAILED',
    statusCode: res.status,
    detail: res.body?.id ? `Post ID: ${res.body.id}` : JSON.stringify(res.body),
    timestamp: isoTimestamp()
  };
}

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM 3: INSTAGRAM — Graph API container → publish
// ═══════════════════════════════════════════════════════════════════
function buildInstagramCaption(p) {
  const discount = p.discount_pct || Math.round(((p.mrp - p.current_price) / p.mrp) * 100);
  return (
    `🔥 DEAL ALERT: ${p.title}\n\n` +
    `💰 Price: ${fmtPrice(p.current_price)} (was ${fmtPrice(p.mrp)})\n` +
    `📉 Save ${discount}% — that's ${fmtPrice(p.mrp - p.current_price)} OFF!\n\n` +
    `${p.is_historical_low ? '🎯 VERIFIED 90-DAY HISTORICAL LOW!\n\n' : ''}` +
    `👉 Link in bio or join t.me/dealon_offers for instant deal links!\n\n` +
    `📢 Follow @dealon_offers for daily price drops\n` +
    `🌐 Browse all: dealon.netlify.app\n\n` +
    `#dealon #deals #techdeals #amazonindia #offers #lootdeal #discount ` +
    `#${(p.brand || '').replace(/\s+/g, '').toLowerCase()} ` +
    `#${(p.category || '').replace(/\s+/g, '').toLowerCase()} ` +
    `#pricedrops #savings #dealsoftheday #india #onlineshopping`
  );
}

async function publishInstagram(p, dryRun) {
  const caption = buildInstagramCaption(p);
  const imageUrl = p.image_url || '';

  if (dryRun || !CONFIG.metaToken || !CONFIG.igAccountId) {
    return {
      platform: 'Instagram',
      status: dryRun ? 'DRY-RUN' : '📋 MANUAL POST REQUIRED',
      reason: dryRun ? 'Preview mode' : 'Meta Access Token not configured — copy caption below',
      caption,
      image: imageUrl,
      postUrl: 'https://www.instagram.com/dealon_offers/',
      instruction: '➡️ Open Instagram → New Post → Upload image → Paste caption'
    };
  }

  // Step 1: Create media container
  const containerBody = `image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${encodeURIComponent(CONFIG.metaToken)}`;
  const containerRes = await httpRequest(
    `https://graph.facebook.com/v19.0/${CONFIG.igAccountId}/media`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(containerBody) } },
    containerBody
  );

  const creationId = containerRes.body?.id;
  if (!creationId) {
    return { platform: 'Instagram', status: '❌ FAILED', detail: JSON.stringify(containerRes.body), timestamp: isoTimestamp() };
  }

  // Step 2: Publish container
  const publishBody = `creation_id=${creationId}&access_token=${encodeURIComponent(CONFIG.metaToken)}`;
  const pubRes = await httpRequest(
    `https://graph.facebook.com/v19.0/${CONFIG.igAccountId}/media_publish`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(publishBody) } },
    publishBody
  );

  return {
    platform: 'Instagram',
    status: pubRes.body?.id ? '✅ PUBLISHED' : '❌ FAILED',
    statusCode: pubRes.status,
    detail: pubRes.body?.id ? `Media ID: ${pubRes.body.id}` : JSON.stringify(pubRes.body),
    timestamp: isoTimestamp()
  };
}

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM 4: WEBSITE — products.json + index.html sync
// ═══════════════════════════════════════════════════════════════════
function syncWebsite(p, dryRun) {
  if (dryRun) {
    return { platform: 'Website', status: 'DRY-RUN', detail: `Would sync "${p.title}" to products.json + index.html` };
  }

  // Check if product already exists in catalog
  const catalog = loadCatalog();
  const existingIdx = catalog.findIndex(x => x.id === p.id);

  if (existingIdx >= 0) {
    // Update existing product
    catalog[existingIdx] = { ...catalog[existingIdx], ...p };
  } else if (p.id) {
    // Append new product
    catalog.push(p);
  }

  // Write products.json
  fs.writeFileSync(CONFIG.catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

  // Sync PRODUCTS array in index.html
  if (fs.existsSync(CONFIG.indexPath)) {
    const lines = fs.readFileSync(CONFIG.indexPath, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('const PRODUCTS =')) {
        lines[i] = '    const PRODUCTS = ' + JSON.stringify(catalog) + ';';
        break;
      }
    }
    fs.writeFileSync(CONFIG.indexPath, lines.join('\n'), 'utf-8');
  }

  return {
    platform: 'Website',
    status: '✅ SYNCED',
    detail: `${catalog.length} products in catalog. "${p.title}" ${existingIdx >= 0 ? 'updated' : 'added'}.`,
    files: ['products.json', 'index.html'],
    timestamp: isoTimestamp()
  };
}

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM 5: GOOGLE BUSINESS PROFILE — Offer Post draft
// ═══════════════════════════════════════════════════════════════════
function buildGoogleBusinessDraft(p) {
  const discount = p.discount_pct || Math.round(((p.mrp - p.current_price) / p.mrp) * 100);
  const url = getDealUrl(p);
  const today = new Date();
  const expiry = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    platform: 'Google Business Profile',
    status: '📋 DRAFT GENERATED',
    postType: 'Offer',
    title: `${discount}% OFF — ${p.title}`,
    summary: `Deal Price: ${fmtPrice(p.current_price)} (MRP: ${fmtPrice(p.mrp)}). Save ${fmtPrice(p.mrp - p.current_price)}! ${p.is_historical_low ? 'Verified 90-day historical low.' : 'Limited time price drop.'}`,
    couponCode: 'No coupon needed — price auto-applied',
    redeemUrl: url,
    startDate: isoDate(),
    endDate: expiry.toISOString().slice(0, 10),
    imageUrl: p.image_url || '',
    managerUrl: CONFIG.gbpUrl,
    instruction: `➡️ Go to ${CONFIG.gbpUrl} → Posts → Add Offer → Paste details above`,
    readyText: [
      `📌 OFFER POST — Google Business Profile`,
      ``,
      `Title: ${discount}% OFF — ${p.title}`,
      ``,
      `Details: Deal Price ${fmtPrice(p.current_price)} (was ${fmtPrice(p.mrp)}). ` +
        `${p.is_historical_low ? 'Verified lowest price in 90 days. ' : ''}` +
        `Brand: ${p.brand}. Category: ${p.category}.`,
      ``,
      `Redeem Online Link: ${url}`,
      `Valid: ${isoDate()} to ${expiry.toISOString().slice(0, 10)}`,
      ``,
      `More deals: ${CONFIG.portalUrl}`,
      `Join Telegram: ${CONFIG.socialLinks.telegram}`
    ].join('\n'),
    timestamp: isoTimestamp()
  };
}

// ═══════════════════════════════════════════════════════════════════
//  DEPLOY LOG — structured execution report
// ═══════════════════════════════════════════════════════════════════
function saveDeployLog(product, results) {
  const logPath = path.join(__dirname, 'deploy_log.json');
  let logs = [];
  if (fs.existsSync(logPath)) {
    try { logs = JSON.parse(fs.readFileSync(logPath, 'utf-8')); } catch { logs = []; }
  }

  logs.unshift({
    deal: { id: product.id, title: product.title, price: product.current_price, discount: product.discount_pct },
    deployedAt: isoTimestamp(),
    results: results.map(r => ({ platform: r.platform, status: r.status, detail: r.detail || '' }))
  });

  // Keep last 100 entries
  if (logs.length > 100) logs = logs.slice(0, 100);
  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf-8');
}

// ═══════════════════════════════════════════════════════════════════
//  ORCHESTRATOR — publish to all platforms
// ═══════════════════════════════════════════════════════════════════
async function publishDeal(product, options = {}) {
  const { dryRun = false, telegramOnly = false } = options;
  const results = [];

  console.log(`\n${'═'.repeat(65)}`);
  console.log(`  📡 OMNICHANNEL PUBLISH: ${product.title}`);
  console.log(`  💰 ${fmtPrice(product.current_price)} (${product.discount_pct || '??'}% OFF)`);
  console.log(`  🔗 ${getDealUrl(product)}`);
  console.log(`  📅 ${isoTimestamp()}`);
  console.log(`${'═'.repeat(65)}\n`);

  // 1. Telegram (always first — instant alert)
  console.log('📱 [1/5] Telegram...');
  const tgResult = await publishTelegram(product, dryRun);
  results.push(tgResult);
  console.log(`   → ${tgResult.status} ${tgResult.detail || ''}`);
  if (dryRun && tgResult.caption) {
    console.log('\n   ── Telegram Caption Preview ──');
    console.log('   ' + tgResult.caption.split('\n').join('\n   '));
    console.log('   ── Buttons: ' + (tgResult.buttons || []).join(' | '));
    console.log('');
  }

  if (telegramOnly) {
    console.log('\n⚡ Telegram-only mode. Skipping other platforms.\n');
    if (!dryRun) saveDeployLog(product, results);
    return results;
  }

  // 2. Facebook
  console.log('📘 [2/5] Facebook...');
  const fbResult = await publishFacebook(product, dryRun);
  results.push(fbResult);
  console.log(`   → ${fbResult.status} ${fbResult.detail || ''}`);
  if ((dryRun || fbResult.status.includes('MANUAL')) && fbResult.caption) {
    console.log('\n   ── Facebook Caption (Copy-Paste Ready) ──');
    console.log('   ' + fbResult.caption.split('\n').join('\n   '));
    console.log('');
  }

  // 3. Instagram
  console.log('📸 [3/5] Instagram...');
  const igResult = await publishInstagram(product, dryRun);
  results.push(igResult);
  console.log(`   → ${igResult.status} ${igResult.detail || ''}`);
  if ((dryRun || igResult.status.includes('MANUAL')) && igResult.caption) {
    console.log('\n   ── Instagram Caption (Copy-Paste Ready) ──');
    console.log('   ' + igResult.caption.split('\n').join('\n   '));
    console.log('');
  }

  // 4. Website
  console.log('🌐 [4/5] Website sync...');
  const webResult = syncWebsite(product, dryRun);
  results.push(webResult);
  console.log(`   → ${webResult.status} ${webResult.detail || ''}`);

  // 5. Google Business Profile
  console.log('🏢 [5/5] Google Business Profile...');
  const gbpResult = buildGoogleBusinessDraft(product);
  results.push(gbpResult);
  console.log(`   → ${gbpResult.status}`);
  if (dryRun || gbpResult.status.includes('DRAFT')) {
    console.log('\n   ── Google Business Offer Draft ──');
    console.log('   ' + gbpResult.readyText.split('\n').join('\n   '));
    console.log('');
  }

  // Save deploy log
  if (!dryRun) saveDeployLog(product, results);

  // Summary
  console.log(`${'─'.repeat(65)}`);
  console.log(`📊 DEPLOYMENT SUMMARY — ${product.title}`);
  console.log(`${'─'.repeat(65)}`);
  for (const r of results) {
    const icon = r.status.includes('✅') ? '✅' :
                 r.status.includes('❌') ? '❌' :
                 r.status.includes('DRAFT') || r.status.includes('MANUAL') ? '📋' : '🔍';
    console.log(`  ${icon} ${r.platform.padEnd(25)} ${r.status}`);
  }
  console.log(`${'─'.repeat(65)}\n`);

  return results;
}

// ═══════════════════════════════════════════════════════════════════
//  CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const getArg = (prefix) => {
    for (const a of args) {
      if (a.startsWith(prefix + '=')) return a.slice(prefix.length + 1).replace(/^['"]|['"]$/g, '');
      if (a === prefix) return 'true';
    }
    return null;
  };

  const dryRun = args.includes('--dry-run');
  const telegramOnly = args.includes('--telegram-only');
  const dealId = getArg('--id');
  const dealJson = getArg('--deal');
  const topN = parseInt(getArg('--top') || '0', 10);

  console.log(`\n🚀 DealOn Omnichannel Publishing Engine v1.0`);
  console.log(`📅 ${isoTimestamp()}`);
  console.log(`🛠️  Mode: ${dryRun ? 'DRY-RUN (Preview)' : 'LIVE DEPLOYMENT'}`);
  if (telegramOnly) console.log(`📱 Telegram-only mode enabled`);
  console.log('');

  // Determine what to publish
  let products = [];

  if (dealJson) {
    // Custom deal JSON
    try {
      const deal = JSON.parse(dealJson);
      // Normalize custom deal
      products.push({
        id: deal.id || 'custom-' + Date.now(),
        title: deal.title,
        brand: deal.brand || 'Various',
        category: deal.category || 'Electronics',
        current_price: deal.price || deal.current_price,
        mrp: deal.original_price || deal.mrp || deal.price * 2,
        historical_low: deal.historical_low || deal.price || deal.current_price,
        is_historical_low: deal.is_historical_low !== undefined ? deal.is_historical_low : true,
        discount_pct: deal.discount || deal.discount_pct || Math.round(((deal.mrp || deal.original_price || deal.price * 2) - (deal.price || deal.current_price)) / (deal.mrp || deal.original_price || deal.price * 2) * 100),
        rating: deal.rating || 4.5,
        reviews_count: deal.reviews_count || 0,
        asin: deal.asin || '',
        product_url: deal.deal_url || deal.product_url || '',
        image_url: deal.image_url || '',
        badge: deal.badge || 'DEAL ALERT',
        features: deal.features || [],
        price_history: deal.price_history || [deal.mrp || deal.price * 2, deal.price || deal.current_price]
      });
    } catch (e) {
      console.error('❌ Invalid deal JSON:', e.message);
      process.exit(1);
    }
  } else if (dealId) {
    // Find product by ID in catalog
    const catalog = loadCatalog();
    const found = catalog.find(p => p.id === dealId);
    if (!found) {
      console.error(`❌ Product "${dealId}" not found in catalog.`);
      console.log(`Available IDs: ${catalog.map(p => p.id).join(', ')}`);
      process.exit(1);
    }
    products.push(found);
  } else if (topN > 0) {
    // Top N deals by discount
    const catalog = loadCatalog();
    products = [...catalog].sort((a, b) => b.discount_pct - a.discount_pct).slice(0, topN);
    console.log(`📊 Selected top ${products.length} deals by discount from ${catalog.length} products.\n`);
  } else {
    console.log('Usage:');
    console.log('  node publish_engine.js --id="product-id"              # Publish single product');
    console.log('  node publish_engine.js --deal=\'{"title":"..."}\'       # Publish custom deal JSON');
    console.log('  node publish_engine.js --top=5                        # Publish top 5 deals');
    console.log('');
    console.log('Flags:');
    console.log('  --dry-run         Preview all outputs without publishing');
    console.log('  --telegram-only   Only publish to Telegram');
    console.log('');
    console.log(`📊 Catalog: ${loadCatalog().length} products available.`);
    process.exit(0);
  }

  // Publish each product
  let allResults = [];
  for (let i = 0; i < products.length; i++) {
    if (i > 0) {
      console.log(`\n⏱️  Rate limit delay: 3 seconds...\n`);
      await new Promise(r => setTimeout(r, 3000));
    }
    const results = await publishDeal(products[i], { dryRun, telegramOnly });
    allResults.push({ product: products[i].title, results });
  }

  // Final summary for batch
  if (products.length > 1) {
    console.log(`\n${'═'.repeat(65)}`);
    console.log(`  📊 BATCH DEPLOYMENT COMPLETE — ${products.length} deals`);
    console.log(`${'═'.repeat(65)}`);
    for (const entry of allResults) {
      const statuses = entry.results.map(r => r.status.includes('✅') ? '✅' : r.status.includes('❌') ? '❌' : '📋').join('');
      console.log(`  ${statuses} ${entry.product}`);
    }
    console.log(`${'═'.repeat(65)}\n`);
  }

  console.log(`✅ All done! ${products.length} deal(s) processed across ${telegramOnly ? 1 : 5} platform(s).`);
}

main().catch(err => {
  console.error('💥 Fatal Error:', err);
  process.exit(1);
});
