const fs = require('fs');
const { formatAmazonUrl, AMAZON_TAG } = require('./affiliate_utils');

console.log('=== DEALON MONETIZATION & PIPELINE AUDIT VERIFICATION ===\n');

let failed = 0;

// Test 1: formatAmazonUrl canonical structure
const testUrl = formatAmazonUrl('https://www.amazon.in/dp/B0CFV8ZJ6Q?tag=oldtag-21&ref=something');
const expectedPattern = /^https:\/\/www\.amazon\.in\/(dp\/[A-Z0-9]{10}\/\?tag=dealon04-21|s\?k=.+&tag=dealon04-21)/;
if (expectedPattern.test(testUrl)) {
  console.log('✅ PASS: Canonical affiliate URL formatting works: ' + testUrl);
} else {
  console.log('❌ FAIL: Canonical URL does not match pattern: ' + testUrl);
  failed++;
}

// Test 2: products.json has 100% valid canonical affiliate URLs
const products = JSON.parse(fs.readFileSync('./products.json', 'utf-8'));
let invalidProducts = 0;
products.forEach(p => {
  if (!p.asin || !/^[A-Z0-9]{10}$/i.test(p.asin) || (!p.product_url.includes('tag=dealon04-21'))) {
    invalidProducts++;
  }
});
if (invalidProducts === 0) {
  console.log(`✅ PASS: All ${products.length} items in products.json have valid ASINs & canonical URLs.`);
} else {
  console.log(`❌ FAIL: ${invalidProducts} products in products.json have invalid URLs or ASINs.`);
  failed++;
}

// Test 3: deals.json has 100% valid canonical affiliate URLs
const deals = JSON.parse(fs.readFileSync('./deals.json', 'utf-8'));
let invalidDeals = 0;
let dotdCount = 0;
deals.forEach(d => {
  if (!d.asin || !/^[A-Z0-9]{10}$/i.test(d.asin) || (!d.deal_url.includes('tag=dealon04-21'))) {
    invalidDeals++;
  }
  if (d.is_deal_of_the_day) dotdCount++;
});
if (invalidDeals === 0 && dotdCount === 1) {
  console.log(`✅ PASS: All ${deals.length} items in deals.json have valid ASINs, canonical URLs, and 1 Deal of the Day.`);
} else {
  console.log(`❌ FAIL: deals.json has ${invalidDeals} invalid deals or ${dotdCount} DOTD count.`);
  failed++;
}

// Test 4: index.html contains formatAmazonUrl & dynamic loadLiveDeals()
const indexHtml = fs.readFileSync('./index.html', 'utf-8');
const hasSanitizer = indexHtml.includes('function formatAmazonUrl(') && indexHtml.includes('&linkCode=ll1&language=en_IN');
const hasDynamicHydration = indexHtml.includes('async function loadLiveDeals(') && indexHtml.includes("fetch('deals.json?v=");
if (hasSanitizer && hasDynamicHydration) {
  console.log('✅ PASS: index.html has client-side formatAmazonUrl sanitizer and loadLiveDeals() hydration.');
} else {
  console.log('❌ FAIL: index.html missing sanitizer or loadLiveDeals hydration.');
  failed++;
}

// Test 5: auto_publisher.js has no placeholder dummy ASINs
const autoPubContent = fs.readFileSync('./auto_publisher.js', 'utf-8');
const hasDummyAsin = autoPubContent.includes('B0C4D5N123') || autoPubContent.includes('B091DY27SA');
if (!hasDummyAsin && autoPubContent.includes('formatAmazonUrl(')) {
  console.log('✅ PASS: auto_publisher.js has zero dummy ASINs and uses formatAmazonUrl.');
} else {
  console.log('❌ FAIL: auto_publisher.js still contains dummy ASINs.');
  failed++;
}

console.log('\n-----------------------------------------------------');
if (failed === 0) {
  console.log('🎉 ALL 5 AFFILIATE AUDIT CHECKS PASSED!');
  process.exit(0);
} else {
  console.log(`⚠️ ${failed} check(s) failed.`);
  process.exit(1);
}
