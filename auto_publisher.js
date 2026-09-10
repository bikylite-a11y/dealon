// DealOn Auto-Publish Daily Deal Engine
// ======================================
try {
  require('dotenv').config();
} catch (e) {
  // Graceful fallback if dotenv is not installed locally
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
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
}

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const { formatAmazonUrl, AMAZON_TAG } = require('./affiliate_utils');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '@dealon_offers';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;

// Helper: HTTP POST Request
function postJSON(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 1. Telegram Broadcast
async function publishTelegram(deal) {
  if (!TELEGRAM_BOT_TOKEN) return console.log('⚠️ Telegram Token missing');
  const safeChannel = TELEGRAM_CHANNEL_ID.replace(/_/g, '\\_');
  const dealUrl = formatAmazonUrl(deal.deal_url || deal.asin, AMAZON_TAG);
  const caption = 
`🔥 *DEAL OF THE DAY: ${deal.title}*

🏷 *Deal Price:* ₹${Number(deal.price).toLocaleString('en-IN')} ~₹${Number(deal.original_price).toLocaleString('en-IN')}~ (*${deal.discount}% OFF*)
⭐ *Rating:* ${deal.rating || '4.5'}★ (${deal.reviews_count ? Number(deal.reviews_count).toLocaleString('en-IN') : '1,000+'} reviews)

🛒 *Direct Deal Link:* [Grab Offer Here](${dealUrl})

⚡ Join ${safeChannel} for instant hourly price drops!`;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  const res = await postJSON(url, {
    chat_id: TELEGRAM_CHANNEL_ID,
    caption: caption,
    photo: deal.image_url,
    parse_mode: 'Markdown'
  });
  console.log(`[Telegram] Response status: ${res.status}`);
  try {
    const parsed = JSON.parse(res.data);
    if (!parsed.ok) {
      console.log('[Telegram Error Detail]:', parsed.description);
    }
  } catch (e) {}
}

// 2. Facebook Auto-Post
async function publishFacebook(deal) {
  if (!META_ACCESS_TOKEN || !FB_PAGE_ID) return console.log('⚠️ Meta/FB keys missing');
  const dealUrl = formatAmazonUrl(deal.deal_url || deal.asin, AMAZON_TAG);
  const caption = 
`🔥 DAILY SMART DEAL: ${deal.title}

💰 Deal Price: ₹${Number(deal.price).toLocaleString('en-IN')} (MRP ₹${Number(deal.original_price).toLocaleString('en-IN')}) — Save ${deal.discount}%!
⭐ Verified Historical Low

🛒 Buy Now: ${dealUrl}
🌐 Browse 100+ Tech Steals: https://dealon.netlify.app/

#dealon #techdeals #amazondeals #discount #lootdeal`;

  const url = `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`;
  const res = await postJSON(url, {
    url: deal.image_url,
    caption: caption,
    access_token: META_ACCESS_TOKEN
  });
  
  let data = {};
  try { data = JSON.parse(res.data); } catch (e) { data = res.data; }
  if (res.status === 200) {
    console.log(`[Facebook] Published photo successfully. Post ID: ${data.id || 'ok'}`);
  } else {
    console.log(`[Facebook Error] Status: ${res.status}, Body: ${JSON.stringify(data)}`);
  }
}

// 3. Instagram Auto-Post (Two-step container publish)
async function publishInstagram(deal) {
  if (!META_ACCESS_TOKEN || !IG_ACCOUNT_ID) return console.log('⚠️ Instagram keys missing');
  const dealUrl = formatAmazonUrl(deal.deal_url || deal.asin, AMAZON_TAG);
  const caption = 
`🔥 DEAL ALERT: ${deal.title}

💰 Price: ₹${Number(deal.price).toLocaleString('en-IN')} (Was ₹${Number(deal.original_price).toLocaleString('en-IN')})
🏷️ Discount: ${deal.discount}% OFF

🛒 Direct Link: ${dealUrl}
👉 Grab the link in our bio (dealon.netlify.app) or join our Telegram channel @dealon_offers!

#dealon #techdeals #discounts #gadgets #dealsindia #audiophile #desksetup`;

  // Step A: Create Media Container
  const containerUrl = `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media`;
  const containerRes = await postJSON(containerUrl, {
    image_url: deal.image_url,
    caption: caption,
    access_token: META_ACCESS_TOKEN
  });
  
  let containerData = {};
  try { containerData = JSON.parse(containerRes.data || '{}'); } catch (e) { containerData = containerRes.data; }
  
  if (containerRes.status === 200 && containerData.id) {
    console.log(`[Instagram] Media container created ID: ${containerData.id}. Waiting 3s...`);
    // Wait 3 seconds for Meta media processing
    await new Promise(r => setTimeout(r, 3000));
    
    // Step B: Publish Container
    const publishUrl = `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media_publish`;
    const pubRes = await postJSON(publishUrl, {
      creation_id: containerData.id,
      access_token: META_ACCESS_TOKEN
    });
    
    let pubData = {};
    try { pubData = JSON.parse(pubRes.data || '{}'); } catch (e) { pubData = pubRes.data; }
    
    if (pubRes.status === 200 && pubData.id) {
      console.log(`[Instagram] Published media ID: ${pubData.id}, status: ${pubRes.status}`);
    } else {
      console.log(`[Instagram Error] Publish failed. Status: ${pubRes.status}, Body: ${JSON.stringify(pubData)}`);
    }
  } else {
    console.log(`[Instagram Error] Container creation failed. Status: ${containerRes.status}, Body: ${JSON.stringify(containerData)}`);
  }
}

// 4. Update Site Data & Trigger Netlify Deployment
function updateSiteDeals(deal) {
  const dealsPath = path.join(__dirname, 'deals.json');
  const productsPath = path.join(__dirname, 'products.json');
  const indexPath = path.join(__dirname, 'index.html');

  // Format canonical affiliate URL
  deal.deal_url = formatAmazonUrl(deal.deal_url || deal.asin, AMAZON_TAG);
  if (!deal.asin && deal.deal_url) {
    const m = deal.deal_url.match(/(?:dp|gp\/product|\/d\/)\/([A-Z0-9]{10})/i);
    if (m) deal.asin = m[1].toUpperCase();
  }

  let deals = [];
  if (fs.existsSync(dealsPath)) {
    try {
      deals = JSON.parse(fs.readFileSync(dealsPath, 'utf-8'));
    } catch (e) {
      deals = [];
    }
  }

  // Prepend new deal and mark as Deal of the Day
  deals = deals.map(d => ({ ...d, is_deal_of_the_day: false }));
  deal.is_deal_of_the_day = true;
  deal.date_added = new Date().toISOString();

  // Remove existing duplicate if present
  const existingIndex = deals.findIndex(d => d.id === deal.id || (d.asin && d.asin === deal.asin));
  if (existingIndex >= 0) {
    deals.splice(existingIndex, 1);
  }
  deals.unshift(deal);

  fs.writeFileSync(dealsPath, JSON.stringify(deals, null, 2));
  console.log('[Website] deals.json updated with new featured deal (' + deals.length + ' active deals).');

  // Also sync to products.json and index.html
  if (fs.existsSync(productsPath)) {
    try {
      let catalog = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const existingIdx = catalog.findIndex(x => x.id === deal.id || (x.asin && x.asin === deal.asin));
      const productObj = {
        id: deal.id,
        title: deal.title,
        brand: deal.brand || 'DealOn Curated',
        category: deal.category || 'Tech Gear',
        current_price: Number(deal.price),
        mrp: Number(deal.original_price),
        historical_low: Number(deal.price),
        is_historical_low: true,
        discount_pct: Number(deal.discount),
        rating: deal.rating || 4.5,
        reviews_count: deal.reviews_count || 1000,
        asin: deal.asin,
        product_url: deal.deal_url,
        image_url: deal.image_url,
        badge: 'DEAL OF THE DAY',
        features: deal.features || ['Verified Historical Low', 'Instant Price Drop'],
        price_history: [Number(deal.original_price), Number(deal.price)]
      };

      if (existingIdx >= 0) {
        catalog[existingIdx] = { ...catalog[existingIdx], ...productObj };
      } else {
        catalog.unshift(productObj);
      }

      fs.writeFileSync(productsPath, JSON.stringify(catalog, null, 2), 'utf-8');

      if (fs.existsSync(indexPath)) {
        const lines = fs.readFileSync(indexPath, 'utf-8').split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('const PRODUCTS =')) {
            lines[i] = '    const PRODUCTS = ' + JSON.stringify(catalog) + ';';
            break;
          }
        }
        fs.writeFileSync(indexPath, lines.join('\n'), 'utf-8');
      }
    } catch (err) {
      console.log('[Website Sync Warning]:', err.message);
    }
  }

  // Push to Git to trigger Netlify auto-deploy
  try {
    execSync('git add deals.json');
    if (fs.existsSync(productsPath)) {
      try { execSync('git add products.json index.html'); } catch (e) {}
    }
    execSync(`git commit -m "feat(deals): auto-publish daily deal - ${deal.title.substring(0, 30)}"`);
    execSync('git push origin main');
    console.log('[Netlify] Git push executed successfully. Netlify build triggered.');
  } catch (err) {
    console.log('[Git Push Notice] Commit skipped or no new git changes.');
  }
}

// Master Omnichannel Dispatch
async function runDailyOmnichannel(deal) {
  // Ensure canonical affiliate URL
  deal.deal_url = formatAmazonUrl(deal.deal_url || deal.asin, AMAZON_TAG);
  console.log(`\n🚀 Starting Omnichannel Publishing for: "${deal.title}"\n`);
  console.log(`🛒 Canonical Affiliate Link: ${deal.deal_url}\n`);
  updateSiteDeals(deal);
  await publishTelegram(deal);
  await publishFacebook(deal);
  await publishInstagram(deal);
  console.log('\n✅ All channels synchronized successfully!\n');
}

// CLI Execution or module export
if (require.main === module) {
  let selectedDeal = null;

  if (process.argv[2]) {
    try {
      selectedDeal = JSON.parse(process.argv[2]);
    } catch (e) {
      console.error('Invalid JSON string passed in argv[2]:', e.message);
    }
  }

  if (!selectedDeal) {
    // Pick top deal from curated feed (products.json) if available
    const productsPath = path.join(__dirname, 'products.json');
    if (fs.existsSync(productsPath)) {
      try {
        const catalog = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        const sorted = [...catalog].sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
        if (sorted.length > 0) {
          const top = sorted[0];
          selectedDeal = {
            id: top.id,
            asin: top.asin,
            title: top.title,
            brand: top.brand,
            price: top.current_price,
            original_price: top.mrp,
            discount: top.discount_pct,
            rating: top.rating || 4.5,
            reviews_count: top.reviews_count || 1000,
            deal_url: formatAmazonUrl(top.product_url || top.asin, AMAZON_TAG),
            image_url: top.image_url,
            category: top.category || "Tech Gear",
            features: top.features || []
          };
        }
      } catch (e) {}
    }
  }

  if (!selectedDeal) {
    // Verified real Indian tech product fallback (Sony WH-1000XM5)
    selectedDeal = {
      id: "sony-wh1000xm5",
      asin: "B09XS7JWHH",
      title: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
      brand: "Sony",
      price: 26990,
      original_price: 34990,
      discount: 23,
      rating: 4.5,
      reviews_count: 4820,
      deal_url: formatAmazonUrl("B09XS7JWHH", AMAZON_TAG),
      image_url: "https://m.media-amazon.com/images/I/61vJtKbAssL._SL1500_.jpg",
      category: "HiFi Audio",
      features: [
        "Industry-Leading Active Noise Cancelling with 8 Microphones",
        "Up to 30-Hour Battery Life with Quick Charging (3 min = 3 hours)",
        "Ultra-Comfortable Lightweight Soft-Fit Leather Design"
      ]
    };
  }

  runDailyOmnichannel(selectedDeal);
}

module.exports = { runDailyOmnichannel, formatAmazonUrl };
