# DealOn: Turnkey Deployment & Growth Automation Playbook
**Version 2.1 (Brand Identity & Modern Store Upgrade)**  
*Smart Tech Deals. Automated Savings.*

---

## 1. Verified Credentials & Live Infrastructure

| Property | Value / Endpoint | Purpose |
| :--- | :--- | :--- |
| **Live Web Portal** | [https://dealon.netlify.app/](https://dealon.netlify.app/) | Single-page modern tech deals store with rich product images |
| **Official Telegram Channel** | [https://t.me/dealon_offers](https://t.me/dealon_offers) (`@dealon_offers`) | Instant push notifications for verified historical lows |
| **Telegram Bot** | `DealOn Bot` (`@Deal_On_Bot`) | Automated deal publisher & alert dispatcher |
| **Bot Token** | `8797269648:AAHfhVJf0YmljEAJgf89Gp3Nv6VB01_gFlg` | Telegram Bot API authorization |
| **Amazon Associates Store ID** | `dealon04-21` | Direct product page affiliate attribution (`/dp/ASIN`) |
| **Brand Identity** | `logo.png` & `favicon.png` | Official brand mark & browser icon |

---

## 2. System Architecture & Directory Structure

All files reside in `C:\Users\Niladri\.gemini\antigravity\scratch\dealon`:
```
scratch/dealon/
├── index.html                  # Modern e-commerce deal portal (Logo, Favicon, Make in India, Images, Wishlist)
├── logo.png / favicon.png      # Official brand logo & favicon
├── products.json               # 29 verified Indian tech SKUs with real product images & direct /dp/ ASIN links
├── daily_expander.js           # Automated daily 15-product curation & index.html synchronizer
├── tracker.js                  # Telegram engine with spaced interval broadcasting & viral share buttons
├── tracker.py                  # Multi-platform Python CLI deal engine
├── social_promoter.js          # Social & community growth engine (Instagram carousels & Reddit roundups)
├── social_posts.md             # Copy-paste ready Markdown posts for Instagram, Facebook, and Reddit
├── dealon_n8n_workflow.json    # n8n workflow for Docker integration
├── verify_redesign.js          # 10-point automated brand and feature verification test suite
└── DEPLOYMENT.md / README.md   # Complete system documentation
```

---

## 3. Brand & Front-End Enhancements

### A. Official Logo & Favicon
- **Favicon**: `<link rel="icon" type="image/png" href="favicon.png">` and `<link rel="apple-touch-icon" href="favicon.png">`
- **Header & Footer Branding**: High-resolution official DealOn logo emblem with glow effect

### B. "Make in India" 🇮🇳 Pride & Trust Card
- Dedicated Indian flag tricolor accent line across the footer
- Official Make in India feature card: *"Curated with pride for Indian techies, builders & gamers. Tracking verified lowest prices across Amazon India (amazon.in)."*

### C. Rich 4-Column Useful Navigation Footer
1. **Brand & Mission**: Logo, tagline, Make in India badge, quick category tags
2. **Top Categories**: Instant filter links (Charging Essentials, Audio Gear, Desk Setup, Computing Peripherals, Gaming)
3. **Deal Hunting Tools**: 90-Day Lows, 50%+ Steal Deals, 60%+ Fire Deals, Saved Wishlist (❤️), Price Alert trigger
4. **Trust & Transparency**: Telegram VIP link, WhatsApp Share, Amazon Associates disclosure (`dealon04-21`), 3-hour price sync guarantee

---

## 4. Manual Netlify Deployment

1. Open [app.netlify.com](https://app.netlify.com)
2. Open your DealOn project
3. Go to **Deploys** → Drag and drop the `scratch/dealon` folder
4. Live site updates instantly at [https://dealon.netlify.app/](https://dealon.netlify.app/)
