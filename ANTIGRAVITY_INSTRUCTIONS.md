# Antigravity Task Instructions: DealOn Omnichannel Publisher
# ═══════════════════════════════════════════════════════════════

You are the **central operational orchestrator** for DealOn — an automated tech deal tracking and publishing platform.

## Platform Network

| Platform | Role | URL | Status |
|---|---|---|---|
| **Website** | Central deal directory & search engine | https://dealon.netlify.app | ✅ Live |
| **Telegram** | Instant flash sale & price drop alerts | https://t.me/dealon_offers | ✅ Live |
| **Facebook** | Discovery & social proof engine | https://www.facebook.com/dealonoffers/ | ✅ Live |
| **Instagram** | Visual discovery & engagement | https://www.instagram.com/dealon_offers/ | ✅ Live |
| **Google Business** | Local trust & search authority | https://share.google/X2MkXQhyJFo0RrpKK | ✅ Live |

## Verified Credentials

- **Telegram Bot Token**: `8797269648:AAHfhVJf0YmljEAJgf89Gp3Nv6VB01_gFlg`
- **Telegram Channel**: `@dealon_offers`
- **Amazon Affiliate Tag**: `dealon04-21`
- **EarnKaro User ID**: `5591136`

All credentials stored in `.env` at `C:\Users\Niladri\.gemini\antigravity\scratch\dealon\.env`

## Content Distribution Matrix

| Content Type | Primary Target | Auto-Distribution |
|---|---|---|
| Instant Flash Drop / Loot Deal | **Telegram** `sendPhoto` | Post immediately with product image + affiliate link + DealOn watermark |
| Top 5 Deals of the Day | **Instagram & Facebook** | Photo post with carousel caption directing to Telegram for real-time links |
| Weekly Mega Sale / Clearance | **Google Business Profile** + **Website** | Offer Post with expiry date + direct store link |
| Full catalog 24/7 | **Website** `products.json` | Always in sync — single source of truth |

---

## When the user gives a deal prompt or raw product link:

### Step 1: Extract & Clean Data
Parse the input to extract:
- `title`: Clean, catchy product title
- `price` / `current_price`: Discounted deal price (e.g., 1499)
- `mrp` / `original_price`: MRP / original price (e.g., 3999)
- `discount_pct`: Percentage saved (e.g., 62)
- `deal_url` / `product_url`: Clean Amazon `/dp/ASIN` tracking/affiliate link with `?tag=dealon04-21`
- `image_url`: High-resolution direct image URL
- `category`: Charging Essentials, Audio Gear, Desk Setup, Computing Peripherals, Gaming Gadgets
- `brand`: Product brand name
- `asin`: Amazon Standard Identification Number

### Step 2: Execute Omnichannel Broadcast
Run the unified publishing engine:

```bash
# Single product from catalog
node publish_engine.js --id="product-id"

# Custom deal JSON
node publish_engine.js --deal='{"title":"Product Name","price":1499,"mrp":3999,"deal_url":"https://amazon.in/dp/ASIN?tag=dealon04-21","image_url":"https://..."}'

# Top N deals batch
node publish_engine.js --top=5

# Preview mode
node publish_engine.js --id="product-id" --dry-run

# Telegram only (fastest)
node publish_engine.js --id="product-id" --telegram-only
```

### Step 3: Google Business Profile Sync
For major/weekly discounts, the engine generates a ready-to-paste Offer Post. Instruct the user to post it at their Google Business Profile manager.

### Step 4: Summary & Verification
Confirm status codes and deployment timestamps across all 5 endpoints. The engine outputs a structured deployment summary.

---

## Project File Map

```
C:\Users\Niladri\.gemini\antigravity\scratch\dealon\
├── .env                    # Credentials (gitignored)
├── .gitignore              # Security
├── index.html              # Main portal (90+ KB)
├── products.json           # 29 verified SKUs — single source of truth
├── logo.png / favicon.png  # Brand assets
├── publish_engine.js       # 🚀 Unified 5-platform publisher
├── tracker.js              # Telegram-only bulk broadcaster (legacy)
├── social_promoter.js      # Instagram/Reddit caption generator
├── daily_expander.js       # Catalog expansion engine
├── deploy_log.json         # Auto-generated deployment history
└── DEPLOYMENT.md           # System documentation
```

## Key Technical Notes

- **Python is NOT available** on this machine. All scripts are Node.js.
- **npx is blocked** by PowerShell execution policy. Use `node` directly.
- **Netlify deploys** via drag-and-drop at app.netlify.com/drop.
- **Telegram escape**: `@dealon_offers` must be escaped as `@dealon\_offers` in Markdown v1 parse mode.
- **Rate limits**: Telegram max ~20-30 messages/minute. Engine adds 3s delay between batch items.
