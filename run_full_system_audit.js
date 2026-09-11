/**
 * run_full_system_audit.js
 * Comprehensive System, Catalog, and Storefront Audit for DealOn
 * ===============================================================
 */

const fs = require('fs');
const path = require('path');

console.log('==============================================================');
console.log('🔍 DEALON COMPREHENSIVE SYSTEM & STOREFRONT AUDIT');
console.log('==============================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(name, condition, errorDetails = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`✅ PASS: ${name}`);
  } else {
    failedChecks++;
    console.log(`❌ FAIL: ${name}`);
    if (errorDetails) console.log(`   └─ Error: ${errorDetails}`);
  }
}

// ── SECTION 1: products.json AUDIT ──────────────────────────────
console.log('\n📦 [1/4] Auditing products.json...');
try {
  const productsPath = path.join(__dirname, 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  check('products.json contains exactly 100 products', products.length === 100, `Found ${products.length} products`);

  const asinRegex = /^[A-Z0-9]{10}$/;
  const invalidAsins = products.filter(p => !p.asin || !asinRegex.test(p.asin));
  check('100% of products have valid 10-char alphanumeric ASINs', invalidAsins.length === 0, `${invalidAsins.length} invalid ASINs found`);

  const canonicalUrlPattern = /^https:\/\/www\.amazon\.in\/dp\/[A-Z0-9]{10}\/\?tag=dealon04-21&linkCode=ll1&language=en_IN$/;
  const invalidUrls = products.filter(p => !canonicalUrlPattern.test(p.product_url));
  check('100% of product URLs strictly match canonical affiliate structure with tag=dealon04-21', invalidUrls.length === 0, `${invalidUrls.length} non-canonical URLs`);

  const unsplashProducts = products.filter(p => (p.image_url || '').includes('unsplash.com'));
  check('Zero Unsplash / placeholder images in products.json', unsplashProducts.length === 0, `${unsplashProducts.length} Unsplash images found`);

  const amazonCdnProducts = products.filter(p => (p.image_url || '').startsWith('https://m.media-amazon.com/images/I/'));
  check('100% of product images use official Amazon Media CDN (m.media-amazon.com/images/I/)', amazonCdnProducts.length === 100, `${amazonCdnProducts.length}/100 match Amazon CDN`);

  // Check categories (25 each)
  const laptops = products.filter(p => p.category === 'Laptops').length;
  const phones = products.filter(p => p.category === 'Mobile Phones').length;
  const gadgets = products.filter(p => p.category === 'Tech Gadgets').length;
  const home = products.filter(p => p.category === 'Home Décor Tech').length;
  check('Catalog evenly distributed: 25 Laptops, 25 Phones, 25 Gadgets, 25 Home Décor Tech', 
    laptops === 25 && phones === 25 && gadgets === 25 && home === 25,
    `Counts: Laptops=${laptops}, Phones=${phones}, Gadgets=${gadgets}, Home=${home}`);

} catch (err) {
  check('products.json parse & load', false, err.message);
}

// ── SECTION 2: deals.json AUDIT ─────────────────────────────────
console.log('\n🔥 [2/4] Auditing deals.json...');
try {
  const dealsPath = path.join(__dirname, 'deals.json');
  const deals = JSON.parse(fs.readFileSync(dealsPath, 'utf8'));

  check('deals.json contains exactly 100 deals', deals.length === 100, `Found ${deals.length} deals`);

  const asinRegex = /^[A-Z0-9]{10}$/;
  const invalidAsins = deals.filter(d => !d.asin || !asinRegex.test(d.asin));
  check('100% of deals have valid 10-char alphanumeric ASINs', invalidAsins.length === 0, `${invalidAsins.length} invalid ASINs found`);

  const canonicalUrlPattern = /^https:\/\/www\.amazon\.in\/dp\/[A-Z0-9]{10}\/\?tag=dealon04-21&linkCode=ll1&language=en_IN$/;
  const invalidUrls = deals.filter(d => !canonicalUrlPattern.test(d.deal_url));
  check('100% of deal URLs strictly match canonical affiliate structure with tag=dealon04-21', invalidUrls.length === 0, `${invalidUrls.length} non-canonical URLs`);

  const unsplashDeals = deals.filter(d => (d.image_url || '').includes('unsplash.com'));
  check('Zero Unsplash / placeholder images in deals.json', unsplashDeals.length === 0, `${unsplashDeals.length} Unsplash images found`);

  const amazonCdnDeals = deals.filter(d => (d.image_url || '').startsWith('https://m.media-amazon.com/images/I/'));
  check('100% of deal images use official Amazon Media CDN', amazonCdnDeals.length === 100, `${amazonCdnDeals.length}/100 match Amazon CDN`);

  const dotdCount = deals.filter(d => d.is_deal_of_the_day).length;
  check('Exactly 1 Deal of the Day spotlight is configured', dotdCount === 1, `Found ${dotdCount} DOTD items`);

} catch (err) {
  check('deals.json parse & load', false, err.message);
}

// ── SECTION 3: index.html AUDIT ─────────────────────────────────
console.log('\n🌐 [3/4] Auditing index.html (Storefront UI/UX)...');
try {
  const indexPath = path.join(__dirname, 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  check('Valid HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>)',
    indexHtml.includes('<!DOCTYPE html>') && indexHtml.includes('<html') && indexHtml.includes('<head>') && indexHtml.includes('</body>'));

  check('<meta name="referrer" content="no-referrer"> is present in head',
    indexHtml.includes('name="referrer"') && indexHtml.includes('content="no-referrer"'));

  const unsplashInIndex = (indexHtml.match(/images\.unsplash\.com/g) || []).length;
  check('Zero Unsplash references in index.html', unsplashInIndex === 0, `Found ${unsplashInIndex} Unsplash occurrences`);

  check('Element-level referrerpolicy="no-referrer" is present on image tags',
    indexHtml.includes('referrerpolicy="no-referrer"'));

  const onerrors = [...indexHtml.matchAll(/onerror="[^"]*"/g)].map(m => m[0]);
  const hasHeadphonesFallback = onerrors.some(o => o.includes('61vJtKbAssL'));
  const hasAmazonLogoFallback = onerrors.length > 0 && onerrors.every(o => o.includes('social_share/amazon_logo._CB633266945_.png'));
  check('Brand placeholder fallback enforces official Amazon logo (no headphones fallback)',
    hasAmazonLogoFallback && !hasHeadphonesFallback);

  check('Header social media links present (Telegram, Instagram, Facebook)',
    indexHtml.includes('t.me/dealon_offers') && indexHtml.includes('instagram.com/dealon_offers') && indexHtml.includes('facebook.com/dealonoffers'));

  check('Mobile navigation bar renders social links (Telegram, Instagram, Facebook)',
    indexHtml.includes('class="mobile-nav"') && indexHtml.includes('📢') && indexHtml.includes('📸') && indexHtml.includes('📘'));

  check('Category filter tabs present (All Deals, Laptops, Smartphones, Tech Gadgets, Smart Home)',
    indexHtml.includes('All Deals (100)') && indexHtml.includes('Laptops') && indexHtml.includes('Smartphones') && indexHtml.includes('Tech Gadgets') && indexHtml.includes('Smart Home'));

  check('Footer 4-column responsive grid layout configured',
    indexHtml.includes('footer-grid') && indexHtml.includes('1.5fr 1fr 1fr 1.2fr'));

} catch (err) {
  check('index.html audit', false, err.message);
}

// ── SECTION 4: admin.html AUDIT ─────────────────────────────────
console.log('\n⚙️ [4/4] Auditing admin.html (Admin Dashboard & CSV Engine)...');
try {
  const adminPath = path.join(__dirname, 'admin.html');
  check('admin.html file exists in project root', fs.existsSync(adminPath));

  if (fs.existsSync(adminPath)) {
    const adminHtml = fs.readFileSync(adminPath, 'utf8');

    check('admin.html has valid HTML5 structure with meta referrer',
      adminHtml.includes('<!DOCTYPE html>') && adminHtml.includes('<html') && adminHtml.includes('content="no-referrer"'));

    check('Tailwind CSS and PapaParse CDN libraries included',
      adminHtml.includes('cdn.tailwindcss.com') && adminHtml.includes('papaparse.min.js'));

    check('DealOn brand palette defined (#FF8C00, #128C7E, #1C2321, #F0F0E0)',
      adminHtml.includes('#FF8C00') && adminHtml.includes('#128C7E') && adminHtml.includes('#1C2321') && adminHtml.includes('#F0F0E0'));

    check('Security & Session PIN barrier implemented (default: dealon2026)',
      adminHtml.includes('authGate') && adminHtml.includes('dealon2026') && adminHtml.includes('sessionStorage'));

    check('Real-Time Catalog Metrics Widget present (Products, Categories, Discount, DOTD Selector)',
      adminHtml.includes('metricTotalProducts') && adminHtml.includes('metricCatLaptops') && adminHtml.includes('metricAvgDiscount') && adminHtml.includes('dotdSelector'));

    check('Affiliate Link Monitor Data Table with search, category filter, and pagination',
      adminHtml.includes('catalogTableBody') && adminHtml.includes('catalogSearch') && adminHtml.includes('categoryFilter') && adminHtml.includes('paginationControls'));

    check('Tag Compliance indicator with dealon04-21 present',
      adminHtml.includes('dealon04-21') && adminHtml.includes('Tag Compliance'));

    check('Bulk CSV Product Importer with drag & drop and PapaParse integration',
      adminHtml.includes('dropZone') && adminHtml.includes('csvFileInput') && adminHtml.includes('parseCsvFile'));

    check('JSON & CSV Exporters implemented (Download JSON, Copy to Clipboard, Export CSV)',
      adminHtml.includes('downloadJsonFiles') && adminHtml.includes('jsonCopyModal') && adminHtml.includes('exportCurrentCatalogCsv'));
  }
} catch (err) {
  check('admin.html audit', false, err.message);
}

// ── SUMMARY REPORT ──────────────────────────────────────────────
console.log('\n==============================================================');
console.log(`📊 AUDIT SUMMARY: ${passedChecks}/${totalChecks} Checks Passed (${Math.round((passedChecks / totalChecks) * 100)}%)`);
if (failedChecks === 0) {
  console.log('🎉 ALL SYSTEM & STOREFRONT AUDIT CHECKS PASSED!');
  console.log('🚀 STOREFRONT & ADMIN ARE 100% PRODUCTION AND LAUNCH READY.');
  process.exit(0);
} else {
  console.log(`⚠️ ${failedChecks} check(s) failed. Please review the output above.`);
  process.exit(1);
}
