const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// 1. Update meta theme-color
html = html.replace(
  /<meta name="theme-color" content="#[^"]+">/,
  '<meta name="theme-color" content="#F0F0E0">'
);

// 2. New CSS to replace between <style> and </style>
const newCss = `
    /* ── Reset & Base ──────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    :root {
      /* Core Brand Colors */
      --bg-main: #F0F0E0;              /* Off-White */
      --bg-card: #FFFFFF;              /* Pure White for clean contrast on cards */
      --bg-subtle: #E7E7D6;            /* Slightly darker tone for borders/dividers */

      /* Interactive Elements */
      --primary-accent: #FF8C00;       /* Terracotta Orange (Buttons & Primary Links) */
      --primary-hover: #E07B00;        /* Darker Terracotta for active/hover */
      --primary-glow: rgba(255, 140, 0, 0.25);

      /* Functional Accents */
      --accent-sea-green: #128C7E;     /* Sea Green (Trust, Verified, WhatsApp, Badges) */
      --accent-sea-green-light: #E8F5F3;
      --accent-crimson: #E34234;       /* Crimson Red (Flash Sales, % Discounts, Steals) */
      --accent-crimson-light: #FDECEB;

      /* Typography & Neutral Colors */
      --text-primary: #1C2321;         /* Deep slate for high contrast */
      --text-secondary: #596562;       /* Readable secondary body text */
      --border-color: #DCDCC8;         /* Subtle warm border */

      /* System Aliases for Component Rules */
      --bg: var(--bg-main);
      --bg-card2: #F8F8F0;
      --border: var(--border-color);
      --border-light: var(--bg-subtle);
      --indigo: var(--primary-accent);
      --indigo-dark: var(--primary-hover);
      --indigo-glow: var(--primary-glow);
      --emerald: var(--accent-sea-green);
      --emerald-dark: #0E7064;
      --emerald-glow: rgba(18, 140, 126, 0.2);
      --rose: var(--accent-crimson);
      --amber: #D97706;
      --text: var(--text-primary);
      --text-muted: var(--text-secondary);
      --text-dim: #788884;
      --radius: 14px;
      --radius-sm: 8px;
      --radius-lg: 20px;
      --shadow: 0 4px 20px rgba(28, 35, 33, 0.08);
      --transition: 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      --font: 'Inter', system-ui, -apple-system, sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }

    /* Global Background and Typography */
    body {
      background-color: var(--bg-main) !important;
      color: var(--text-primary);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Links */
    a {
      color: var(--primary-accent);
      text-decoration: none;
      transition: color 0.2s ease, opacity 0.2s ease;
    }

    a:hover {
      color: var(--primary-hover);
    }

    /* ── Scrollbar ──────────────────────────────────── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-main); }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 99px; }

    /* ── Layout ──────────────────────────────────── */
    .container { max-width: 1380px; margin: 0 auto; padding: 0 24px; }

    /* ── Top Live Deal Bar ──────────────────────────────────── */
    .top-ticker-bar, .announcement-banner, .announcement {
      background-color: var(--accent-sea-green) !important;
      color: #FFFFFF !important;
      padding: 10px 0;
      text-align: center;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .top-ticker-bar a, .announcement-banner a, .announcement a {
      color: #FFFFFF !important;
      text-decoration: underline;
      font-weight: 700;
      margin-left: 6px;
    }

    .pulse {
      display: inline-block;
      width: 7px;
      height: 7px;
      background: #FFFFFF;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 1.5s ease-in-out infinite;
      vertical-align: middle;
    }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(0.7);} }

    /* ── Header ──────────────────────────────────── */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(240, 240, 224, 0.94);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color);
      padding: 0;
    }

    .header-inner {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 14px 0;
    }

    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }

    .logo-img {
      height: 38px;
      max-width: 170px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(255,140,0,0.25));
      display: block;
    }

    .hero-logo-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
    }

    .hero-logo-img {
      height: 76px;
      max-width: 340px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 6px 24px rgba(255,140,0,0.25));
      transition: var(--transition);
    }

    .hero-logo-img:hover {
      transform: scale(1.03);
    }

    /* Search bar in header */
    .header-search {
      flex: 1;
      max-width: 500px;
      position: relative;
    }

    .header-search input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-family: var(--font);
      font-size: 0.9rem;
      padding: 10px 44px 10px 16px;
      border-radius: 99px;
      outline: none;
      transition: var(--transition);
    }

    .header-search input:focus {
      border-color: var(--primary-accent);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .header-search input::placeholder { color: var(--text-secondary); }

    .header-search .search-icon-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      pointer-events: none;
    }

    .header-search .kbd-hint {
      position: absolute;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.68rem;
      font-family: var(--mono);
      color: var(--text-secondary);
      background: var(--bg-subtle);
      padding: 1px 6px;
      border-radius: 4px;
      pointer-events: none;
      transition: var(--transition);
    }

    .header-search input:focus ~ .kbd-hint { opacity: 0; }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: auto;
    }

    /* ── Buttons ──────────────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-family: var(--font);
      font-weight: 600;
      font-size: 0.85rem;
      padding: 9px 16px;
      border-radius: 99px;
      border: none;
      cursor: pointer;
      transition: var(--transition);
      text-decoration: none;
      white-space: nowrap;
    }

    /* Primary CTA Buttons */
    .btn-primary, 
    .cta-button, 
    button[type="submit"],
    .hero-cta,
    .view-deal-btn,
    .buy-btn {
      background-color: var(--primary-accent) !important;
      color: #FFFFFF !important;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      box-shadow: 0 4px 14px var(--primary-glow);
      transition: all 0.2s ease;
    }

    .btn-primary:hover, 
    .cta-button:hover, 
    .view-deal-btn:hover,
    .buy-btn:hover {
      background-color: var(--primary-hover) !important;
      transform: translateY(-1px);
    }

    /* Secondary Button / Outlines */
    .btn-secondary, 
    .outline-cta,
    .btn-ghost {
      background-color: transparent !important;
      color: var(--primary-accent) !important;
      border: 2px solid var(--primary-accent) !important;
      border-radius: 8px;
    }

    .btn-secondary:hover,
    .outline-cta:hover,
    .btn-ghost:hover {
      background-color: var(--primary-accent) !important;
      color: #FFFFFF !important;
    }

    .btn-emerald {
      background: var(--accent-sea-green) !important;
      color: #FFFFFF !important;
      box-shadow: 0 4px 14px rgba(18, 140, 126, 0.25);
    }
    .btn-emerald:hover {
      background: var(--emerald-dark) !important;
      transform: translateY(-1px);
    }

    .btn-whatsapp {
      background: #25D366 !important;
      color: #FFFFFF !important;
      font-weight: 700;
      border-radius: 8px;
    }
    .btn-whatsapp:hover {
      background: #20BA59 !important;
      transform: translateY(-1px);
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: var(--transition);
    }
    .icon-btn:hover { background: var(--bg-subtle); color: var(--text-primary); }
    .icon-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; }

    /* ── Hero Section ──────────────────────────────────── */
    .hero {
      padding: 56px 0 40px;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -120px; left: -120px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero::after {
      content: '';
      position: absolute;
      bottom: -80px; right: -80px;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(18,140,126,0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-content { position: relative; z-index: 1; text-align: center; }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--accent-sea-green-light);
      border: 1px solid var(--accent-sea-green);
      color: var(--accent-sea-green);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 99px;
      margin-bottom: 20px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .hero h1 {
      font-size: clamp(2.2rem, 5vw, 3.8rem);
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin-bottom: 16px;
      color: var(--text-primary);
    }

    .hero h1 span {
      background: linear-gradient(135deg, var(--primary-accent) 0%, var(--accent-sea-green) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-sub {
      font-size: 1.05rem;
      color: var(--text-secondary);
      max-width: 560px;
      margin: 0 auto 32px;
      line-height: 1.7;
    }

    .hero-ctas {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }

    /* Stats row */
    .stats-row, .stat-box {
      display: flex;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
      background-color: var(--bg-card) !important;
      border: 1px solid var(--border-color) !important;
      border-radius: var(--radius);
      padding: 20px 32px;
      max-width: 760px;
      margin: 0 auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .stat-item {
      flex: 1;
      min-width: 140px;
      text-align: center;
      padding: 0 20px;
      position: relative;
    }

    .stat-item + .stat-item::before {
      content: '';
      position: absolute;
      left: 0; top: 15%; height: 70%;
      width: 1px;
      background: var(--border-color);
    }

    .stat-num {
      font-size: 1.65rem;
      font-weight: 800;
      font-family: var(--mono);
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-num.indigo { color: var(--primary-accent); }
    .stat-num.emerald { color: var(--accent-sea-green); }
    .stat-num.amber { color: var(--accent-crimson); }
    .stat-label { font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

    /* ── Deal of the Day ──────────────────────────────────── */
    .dotd-section { padding: 32px 0 0; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .section-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* Discount & Flash Sale Badges (Crimson Red) */
    .badge-discount, 
    .discount-tag, 
    .tag-fire, 
    .price-drop-badge,
    .card-discount-chip,
    .badge-hot,
    .badge-steal,
    .badge-rose {
      background-color: var(--accent-crimson-light) !important;
      color: var(--accent-crimson) !important;
      border: 1px solid var(--accent-crimson) !important;
      font-weight: 700;
    }

    /* Verified / Trust / Category Badges (Sea Green) */
    .badge-verified, 
    .tag-success, 
    .verified-historical-low,
    .badge-historical,
    .badge-emerald {
      background-color: var(--accent-sea-green-light) !important;
      color: var(--accent-sea-green) !important;
      border: 1px solid var(--accent-sea-green) !important;
      font-weight: 600;
    }

    .badge-indigo {
      background: rgba(255, 140, 0, 0.12) !important;
      color: var(--primary-accent) !important;
      border: 1px solid rgba(255, 140, 0, 0.35) !important;
      font-weight: 700;
    }

    .badge-deal {
      background: var(--primary-accent) !important;
      color: #FFFFFF !important;
    }

    .badge-popular {
      background: var(--accent-sea-green) !important;
      color: #FFFFFF !important;
    }

    .dotd-card {
      background: var(--bg-card) !important;
      border: 2px solid var(--accent-sea-green) !important;
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: grid;
      grid-template-columns: 280px 1fr;
      box-shadow: 0 4px 24px rgba(18,140,126,0.12), 0 2px 8px rgba(0,0,0,0.04);
      position: relative;
    }

    .dotd-img-wrap {
      position: relative;
      background: var(--bg-card2);
      overflow: hidden;
    }

    .dotd-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .dotd-card:hover .dotd-img-wrap img { transform: scale(1.04); }

    .dotd-strip {
      position: absolute;
      top: 0; left: 0; right: 0;
      background: var(--accent-sea-green);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 5px 16px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .dotd-body {
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .dotd-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .dotd-title {
      font-size: 1.45rem;
      font-weight: 800;
      line-height: 1.3;
      color: var(--text-primary);
    }

    .dotd-prices { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }

    .dotd-price {
      font-size: 2rem;
      font-weight: 900;
      font-family: var(--mono);
      color: var(--accent-sea-green);
    }

    .dotd-mrp {
      font-size: 1.05rem;
      font-family: var(--mono);
      color: var(--text-secondary);
      text-decoration: line-through;
    }

    .dotd-save {
      font-size: 0.82rem;
      font-weight: 700;
      padding: 4px 10px;
      background: var(--accent-crimson-light);
      border: 1px solid var(--accent-crimson);
      color: var(--accent-crimson);
      border-radius: 99px;
    }

    .dotd-features { display: flex; flex-direction: column; gap: 6px; }

    .dotd-feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.88rem;
      color: var(--text-secondary);
    }

    .dotd-feature-item::before { content: '✓'; color: var(--accent-sea-green); font-weight: 700; }

    .dotd-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }

    .star-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }

    .stars { color: #D97706; letter-spacing: -1px; }
    .rating-count { color: var(--text-secondary); }

    /* ── Category Tabs + Filters ──────────────────────────────────── */
    .controls-section { padding: 32px 0 0; }

    .cat-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }

    .cat-scroll::-webkit-scrollbar { display: none; }

    .cat-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 9px 18px;
      border-radius: 99px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .cat-btn:hover { background: var(--bg-subtle); color: var(--text-primary); border-color: var(--border-color); }

    .cat-btn.active {
      background: var(--primary-accent) !important;
      color: #FFFFFF !important;
      border-color: var(--primary-accent) !important;
      box-shadow: 0 2px 12px var(--primary-glow);
    }

    .filter-row, .filter-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
      flex-wrap: wrap;
    }

    .select-custom {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-family: var(--font);
      font-size: 0.84rem;
      padding: 8px 14px;
      border-radius: 10px;
      outline: none;
      cursor: pointer;
      transition: var(--transition);
    }

    .select-custom:focus { border-color: var(--primary-accent); box-shadow: 0 0 0 3px var(--primary-glow); }

    .toggle-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-secondary);
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      font-family: var(--font);
    }

    .toggle-pill input { accent-color: var(--accent-sea-green); cursor: pointer; }

    .results-count {
      margin-left: auto;
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* ── Products Grid ──────────────────────────────────── */
    .deals-section { padding: 24px 0 48px; }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
      gap: 20px;
    }

    /* ── Product Card ──────────────────────────────────── */
    .deal-card {
      background-color: var(--bg-card) !important;
      border: 1px solid var(--border-color) !important;
      border-radius: var(--radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      position: relative;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .deal-card:hover {
      border-color: var(--primary-accent) !important;
      transform: translateY(-4px);
      box-shadow: 0 12px 32px var(--primary-glow), 0 4px 12px rgba(0,0,0,0.06);
    }

    .deal-card.historical-low {
      border-color: var(--accent-sea-green) !important;
    }
    .deal-card.historical-low:hover {
      border-color: var(--accent-sea-green) !important;
      box-shadow: 0 12px 32px rgba(18,140,126,0.18), 0 4px 12px rgba(0,0,0,0.06);
    }

    /* Card Image */
    .card-img-wrap {
      position: relative;
      overflow: hidden;
      aspect-ratio: 4/3;
      background: var(--bg-card2);
    }

    .card-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .deal-card:hover .card-img-wrap img { transform: scale(1.06); }

    .card-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      backdrop-filter: blur(8px);
      z-index: 2;
    }

    .card-discount-chip {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 0.78rem;
      font-weight: 800;
      font-family: var(--mono);
      padding: 4px 8px;
      border-radius: 8px;
      backdrop-filter: blur(8px);
      z-index: 2;
    }

    .card-wishlist {
      position: absolute;
      bottom: 10px;
      right: 10px;
      width: 34px; height: 34px;
      background: #FFFFFF;
      backdrop-filter: blur(8px);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      z-index: 3;
      transition: var(--transition);
      color: var(--text-secondary);
    }

    .card-wishlist:hover {
      background: var(--accent-crimson-light);
      border-color: var(--accent-crimson);
      color: var(--accent-crimson);
    }
    .card-wishlist.active {
      color: var(--accent-crimson);
      border-color: var(--accent-crimson);
      background: var(--accent-crimson-light);
    }
    .card-wishlist svg { width: 15px; height: 15px; stroke: currentColor; fill: none; stroke-width: 2; transition: var(--transition); }
    .card-wishlist.active svg { fill: currentColor; }

    /* Card Body */
    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 10px;
      background: var(--bg-card);
    }

    .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }

    .card-brand {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--primary-accent);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .card-rating-mini {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.76rem;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .star-icon { color: #D97706; font-size: 0.8rem; }

    .card-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-features {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .card-feature-tag {
      font-size: 0.74rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .card-feature-tag::before { content: '·'; color: var(--primary-accent); font-size: 1rem; line-height: 0; }

    /* Price Area */
    .card-price-area {
      background: var(--bg-card2);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .card-price {
      font-size: 1.3rem;
      font-weight: 900;
      font-family: var(--mono);
      color: var(--accent-sea-green);
    }
    .card-mrp {
      font-size: 0.8rem;
      font-family: var(--mono);
      color: var(--text-secondary);
      text-decoration: line-through;
    }
    .card-savings {
      font-size: 0.72rem;
      color: var(--text-secondary);
    }
    .card-savings strong { color: var(--accent-crimson); font-weight: 700; }

    /* Sparkline */
    .sparkline-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sparkline-label { font-size: 0.7rem; color: var(--text-secondary); white-space: nowrap; }
    .sparkline-canvas { flex: 1; height: 22px; }

    /* Card Actions */
    .card-actions {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      margin-top: auto;
    }

    .card-icon-btn {
      width: 40px; height: 40px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: var(--transition);
      flex-shrink: 0;
    }

    .card-icon-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; color: var(--text-secondary); }
    .card-icon-btn:hover { background: var(--bg-subtle); }
    .card-icon-btn:hover svg { color: var(--text-primary); }
    .card-icon-btn.whatsapp-btn:hover { background: var(--accent-sea-green-light); border-color: var(--accent-sea-green); }
    .card-icon-btn.whatsapp-btn:hover svg { color: var(--accent-sea-green); }
    .card-icon-btn.copy-btn:hover { background: var(--primary-glow); border-color: var(--primary-accent); }
    .card-icon-btn.copy-btn:hover svg { color: var(--primary-accent); }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      color: var(--text-secondary);
    }

    .empty-state .empty-icon { font-size: 3rem; margin-bottom: 16px; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
    .empty-state p { font-size: 0.9rem; margin-bottom: 20px; }

    /* ── Telegram VIP & WhatsApp Integration Cards ──────────────────────────────────── */
    .telegram-banner, .newsletter-section, .telegram-cta {
      background-color: #FFFFFF !important;
      border: 2px solid var(--primary-accent) !important;
      border-radius: var(--radius-lg);
      padding: 40px;
      text-align: center;
      margin: 8px 0 48px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 20px var(--primary-glow);
    }

    .telegram-cta::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
    }

    .telegram-btn {
      background-color: #229ED9 !important; /* Standard Telegram Blue for recognition */
      color: #FFFFFF !important;
    }

    .telegram-cta-inner { position: relative; z-index: 1; }
    .telegram-cta h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 10px; color: var(--text-primary); }
    .telegram-cta p { color: var(--text-secondary); margin-bottom: 24px; max-width: 480px; margin-left: auto; margin-right: auto; }
    .telegram-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    /* ── Footer & Mobile Bottom Navigation ──────────────────────────────────── */
    footer, .mobile-bottom-nav, .mobile-nav {
      background-color: #FFFFFF !important;
      border-top: 1px solid var(--border-color);
    }

    footer {
      position: relative;
      padding: 56px 0 28px;
    }

    .footer-tricolor-strip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #FF9933 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #138808 100%);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1.1fr;
      gap: 40px;
      margin-bottom: 44px;
    }

    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .footer-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .footer-tagline {
      color: var(--text-secondary);
      font-size: 0.88rem;
    }

    .footer-nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer-nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.84rem;
      transition: var(--transition);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      background: none;
      border: none;
      font-family: var(--font);
      text-align: left;
      padding: 0;
    }

    .footer-nav-link:hover {
      color: var(--primary-accent);
      transform: translateX(3px);
    }

    .make-in-india-card {
      background: var(--bg-card2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 14px 16px;
      margin-top: 6px;
      position: relative;
      overflow: hidden;
    }

    .make-in-india-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #FF9933, #FFFFFF, #138808);
    }

    .make-in-india-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .make-in-india-text {
      font-size: 0.78rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .footer-badge-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 6px;
    }

    .footer-tag-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 99px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .footer-bottom-bar {
      border-top: 1px solid var(--border-color);
      padding-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .footer-disclaimer {
      color: var(--text-secondary);
    }

    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
      }
    }

    @media (max-width: 580px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 26px;
      }
    }

    /* ── Toast ──────────────────────────────────── */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: var(--text-primary);
      border: 1px solid var(--border-color);
      color: #FFFFFF;
      padding: 12px 22px;
      border-radius: 12px;
      font-size: 0.87rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 8px 32px rgba(28, 35, 33, 0.25);
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
      z-index: 9999;
      opacity: 0;
      white-space: nowrap;
    }

    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    .toast-icon { color: var(--accent-sea-green); }

    /* ── Modal ──────────────────────────────────── */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(28, 35, 33, 0.6);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 24px;
      opacity: 0; visibility: hidden;
      transition: var(--transition);
    }

    .modal-overlay.active { opacity: 1; visibility: visible; }

    .modal, .modal-content {
      background-color: var(--bg-card) !important;
      border: 1px solid var(--border-color) !important;
      border-radius: var(--radius-lg);
      padding: 32px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 24px 80px rgba(28, 35, 33, 0.2);
      transform: scale(0.95);
      transition: transform 0.2s ease;
      color: var(--text-primary);
    }

    .modal-overlay.active .modal { transform: scale(1); }

    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .modal-title { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
    .modal-close { background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px; border-radius: 6px; transition: var(--transition); }
    .modal-close:hover { color: var(--text-primary); background: var(--bg-subtle); }
    .modal-close svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; display: block; }

    .form-group { margin-bottom: 18px; }
    .form-label { display: block; font-size: 0.83rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .form-input, .form-select {
      width: 100%;
      background: var(--bg-card2);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-family: var(--font);
      font-size: 0.9rem;
      padding: 10px 14px;
      border-radius: 10px;
      outline: none;
      transition: var(--transition);
    }
    .form-input:focus, .form-select:focus { border-color: var(--primary-accent); box-shadow: 0 0 0 3px var(--primary-glow); }
    .form-hint { font-size: 0.76rem; color: var(--text-secondary); margin-top: 5px; }

    /* ── Mobile Bottom Nav ──────────────────────────────────── */
    .mobile-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 64px;
      backdrop-filter: blur(16px);
      display: none;
      align-items: center;
      justify-content: space-around;
      z-index: 500;
    }

    .mobile-nav-item {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.65rem;
      font-weight: 600;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 14px;
      transition: var(--transition);
      font-family: var(--font);
    }

    .mobile-nav-item:hover, .mobile-nav-item.active-nav { color: var(--primary-accent); }
    .mobile-nav-icon { font-size: 1.2rem; }

    /* ── Responsive ──────────────────────────────────── */
    @media (max-width: 768px) {
      body { padding-bottom: 70px; }
      .mobile-nav { display: flex; }
      .header-search { display: none; }
      .dotd-card { grid-template-columns: 1fr; }
      .dotd-img-wrap { height: 220px; }
      .hero h1 { font-size: 2rem; }
      .stats-row { padding: 16px; }
      .stat-item { min-width: 100px; padding: 0 10px; }
      .stat-num { font-size: 1.3rem; }
      .products-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
      .telegram-cta { padding: 28px 20px; }
    }

    @media (max-width: 480px) {
      .products-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .card-body { padding: 10px; gap: 7px; }
      .card-price { font-size: 1.05rem; }
      .card-title { font-size: 0.8rem; }
      .card-features { display: none; }
      .card-actions { grid-template-columns: 1fr auto auto; gap: 6px; }
      .card-icon-btn { width: 36px; height: 36px; }
      .buy-btn { font-size: 0.78rem; padding: 9px 10px; }
      .card-img-wrap { aspect-ratio: 1; }
    }
  `;

// Replace <style>...</style> content
html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${newCss}\n  </style>`);

// 3. Update Sparkline Colors in Javascript
// Replace #10B981 with Sea Green #128C7E in drawSparkline
html = html.replace(
  /grad\.addColorStop\(0, 'rgba\(16,185,129,0\.25\)'\);/g,
  "grad.addColorStop(0, 'rgba(18,140,126,0.25)');"
);
html = html.replace(
  /grad\.addColorStop\(1, 'rgba\(16,185,129,0\)'\);/g,
  "grad.addColorStop(1, 'rgba(18,140,126,0)');"
);
html = html.replace(
  /ctx\.strokeStyle = '#10B981';/g,
  "ctx.strokeStyle = '#128C7E';"
);
html = html.replace(
  /ctx\.fillStyle = '#10B981';/g,
  "ctx.fillStyle = '#128C7E';"
);

fs.writeFileSync(indexPath, html, 'utf-8');
console.log('✅ Updated index.html with new design token system and component styles.');
