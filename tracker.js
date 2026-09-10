#!/usr/bin/env node
/**
 * DealOn Automated Tech Deal Tracker & Telegram Dispatcher (Node.js Engine)
 * =========================================================================
 * Version: 1.0 (Live Ready)
 * Evaluates drop alert thresholds, attaches Amazon Associates tag, and broadcasts to Telegram.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { formatAmazonUrl } = require('./affiliate_utils');

const CATALOG_PATH = path.join(__dirname, 'products.json');
const DEFAULT_AFFILIATE_TAG = process.env.AMAZON_AFFILIATE_TAG || 'dealon04-21';
const DEFAULT_TELEGRAM_CHAT = process.env.TELEGRAM_CHAT_ID || '@dealon_offers';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

function loadCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`Catalog not found at: ${CATALOG_PATH}`);
  }
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
}

function formatMessage(product, tag) {
  const current = product.current_price;
  const mrp = product.mrp;
  const savings = mrp - current;
  const discount = product.discount_pct || Math.round(((mrp - current) / mrp) * 100);
  const url = formatAmazonUrl(product.product_url || product.asin, tag) || `https://www.amazon.in/s?k=${encodeURIComponent(product.title)}&tag=${encodeURIComponent(tag)}&linkCode=ll1&language=en_IN`;

  const header = isLow ? '🔥 *HISTORICAL ALL-TIME LOW ALERT*' : '⚡ *PRICE DROP ALERT*';
  const categoryTag = '#' + product.category.replace(/\s+/g, '');
  const specs = (product.features || []).slice(0, 3).map(f => `• ${f}`).join('\n');

  return (
    `${header}\n\n` +
    `📦 *${product.title}*\n` +
    `🏢 Brand: *${product.brand}* | ${categoryTag}\n\n` +
    `💰 Deal Price: *₹${current.toLocaleString('en-IN')}*\n` +
    `❌ MRP: ~₹${mrp.toLocaleString('en-IN')}~\n` +
    `📉 Savings: *₹${savings.toLocaleString('en-IN')}* (${discount}% OFF)\n` +
    `🎯 Verified 90-Day Low: *₹${product.historical_low.toLocaleString('en-IN')}*\n\n` +
    (specs ? specs + '\n\n' : '') +
    `👉 *GRAB DEAL ON AMAZON:*\n${url}\n\n` +
    `🔔 Tracked 24/7 by @dealon\\_offers | DealOn Portal`
  );
}

function sendTelegramMessage(token, chatId, text, product, tag) {
  return new Promise((resolve, reject) => {
    const url = formatAmazonUrl(product.product_url || product.asin, tag) || `https://www.amazon.in/s?k=${encodeURIComponent(product.title)}&tag=${encodeURIComponent(tag)}&linkCode=ll1&language=en_IN`;
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
      reply_markup: {
        inline_keyboard: [
          [{ text: `🛒 Buy on Amazon (₹${product.current_price.toLocaleString('en-IN')})`, url: url }],
          [
            {
              text: '📢 Share Deal with Friend',
              url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🔥 Deal Alert on DealOn!\n\n${product.title}\n💰 Deal Price: ₹${product.current_price.toLocaleString('en-IN')} (${product.discount_pct}% OFF!)\n\n👉 Grab Deal: ${url}`)}`
            }
          ],
          [
            { text: '🌐 DealOn Portal', url: `https://dealon.netlify.app/#${product.id}` },
            { text: '📢 VIP Channel', url: 'https://t.me/dealon_offers' }
          ]
        ]
      }
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ ok: false, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  const args = process.argv.slice(2);
  const getArg = (prefix) => {
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith(prefix + '=')) {
        return args[i].slice(prefix.length + 1).replace(/^["']|["']$/g, '');
      }
      if (args[i] === prefix && i + 1 < args.length) {
        return args[i + 1].replace(/^["']|["']$/g, '');
      }
    }
    return null;
  };

  const cliToken = getArg('--token');
  const token = cliToken || BOT_TOKEN;
  const isDryRun = args.includes('--dry-run') || (!token);
  const isTest = args.includes('--test');
  const tag = getArg('--tag') || DEFAULT_AFFILIATE_TAG;
  const chat = getArg('--chat') || DEFAULT_TELEGRAM_CHAT;
  const intervalMin = parseFloat(getArg('--interval-minutes') || '0');
  const intervalSec = parseFloat(getArg('--interval-seconds') || (intervalMin > 0 ? (intervalMin * 60) : '2'));
  const limit = parseInt(getArg('--limit') || (isTest ? '1' : '0'), 10);

  console.log(`🚀 DealOn Node Engine Starting`);
  console.log(`📌 Active Affiliate Tag: ${tag}`);
  console.log(`📢 Target Channel: ${chat}`);
  console.log(`🔑 Bot Token: ${token ? (token.slice(0, 10) + '...' + token.slice(-5)) : 'None (Dry Run)'}`);
  console.log(`⏱️ Broadcast Spacing: ${intervalMin > 0 ? `${intervalMin} min (${intervalSec}s)` : `${intervalSec}s rate-limit delay`}`);
  console.log(`🛠️ Mode: ${isDryRun ? 'DRY-RUN (Console Output)' : 'LIVE TELEGRAM DISPATCH'}\n`);

  const catalog = loadCatalog();
  console.log(`📊 Catalog: Loaded ${catalog.length} verified products.`);

  let triggered = 0;

  for (const product of catalog) {
    const current = product.current_price;
    const dropThreshold = product.target_drop_price || product.historical_low;
    const isHistoricalLow = product.is_historical_low || current <= product.historical_low;

    if (current <= dropThreshold || isHistoricalLow) {
      triggered++;
      const message = formatMessage(product, tag);

      if (isDryRun) {
        console.log('='.repeat(65));
        console.log(`📢 [ALERT PREVIEW #${triggered}] -> ${chat}`);
        console.log('='.repeat(65));
        console.log(message);
        console.log('-'.repeat(65));
        console.log(`[INLINE BUTTON 1] 🛒 Buy on Amazon (₹${current})`);
        console.log(`[INLINE BUTTON 2] 📢 Share Deal with Friend`);
        console.log(`[INLINE BUTTON 3] 🌐 DealOn Portal (#${product.id})`);
        console.log('='.repeat(65) + '\n');
      } else {
        try {
          const res = await sendTelegramMessage(token, chat, message, product, tag);
          if (res.ok) {
            console.log(`✓ Dispatched [#${triggered}]: ${product.title} (₹${current})`);
          } else {
            console.error(`✗ Telegram Error for ${product.id}:`, res.description);
          }
        } catch (err) {
          console.error(`✗ Failed sending ${product.id}:`, err.message);
        }
      }

      if (limit > 0 && triggered >= limit) {
        console.log(`⚡ Limit reached (${triggered} deals dispatched). Exiting.`);
        break;
      }

      // Spacing delay between broadcasts
      if (intervalSec > 0 && triggered < catalog.length) {
        if (intervalMin > 0) {
          console.log(`⏱️ Spacing: Waiting ${intervalMin} minutes before next deal alert...`);
        }
        await new Promise(r => setTimeout(r, intervalSec * 1000));
      }
    }
  }

  console.log(`✅ Run complete: ${triggered}/${catalog.length} deals processed.`);
}

run().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
