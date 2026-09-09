const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const tracker = fs.readFileSync('tracker.js', 'utf8');
const expander = fs.readFileSync('daily_expander.js', 'utf8');
const promoter = fs.readFileSync('social_promoter.js', 'utf8');
const products = require('./products.json');

console.log('--- DealOn Production Upgrade Verification ---');
console.log('1. Catalog Products count:', products.length, products.length === 29 ? '✓ PASS' : '✗ FAIL');
console.log('2. SEO OpenGraph tags:', html.includes('og:title') && html.includes('og:image') ? '✓ PASS' : '✗ FAIL');
console.log('3. SEO Twitter cards:', html.includes('twitter:card') && html.includes('twitter:image') ? '✓ PASS' : '✗ FAIL');
console.log('4. SEO Canonical URL:', html.includes('rel="canonical"') && html.includes('https://dealon.netlify.app/') ? '✓ PASS' : '✗ FAIL');
console.log('5. Schema.org JSON-LD ItemList:', html.includes('"ItemList"') ? '✓ PASS' : '✗ FAIL');
console.log('6. Deal of the Day Spotlight:', html.includes('dealOfTheDayWrap') && html.includes('renderDealOfTheDay') ? '✓ PASS' : '✗ FAIL');
console.log('7. 1-Click WhatsApp Share Button:', html.includes('shareToWhatsApp') ? '✓ PASS' : '✗ FAIL');
console.log('8. 1-Click SKU Direct Link Anchor:', html.includes('copyDirectSkuLink') && html.includes('deal-card" id=') ? '✓ PASS' : '✗ FAIL');
console.log('9. Keyboard Shortcut ("/" to search):', html.includes("e.key === '/'") ? '✓ PASS' : '✗ FAIL');
console.log('10. Sticky Mobile Bottom Navigation:', html.includes('mobile-bottom-nav') ? '✓ PASS' : '✗ FAIL');
console.log('11. Amazon Search URL generation:', html.includes('amazon.in/s?k=') && html.includes('tag=') ? '✓ PASS' : '✗ FAIL');
console.log('12. Telegram Share Deal with Friend:', tracker.includes('Share Deal with Friend') ? '✓ PASS' : '✗ FAIL');
console.log('13. Telegram Spaced Broadcaster logic:', tracker.includes('intervalMin') && tracker.includes('intervalSec') ? '✓ PASS' : '✗ FAIL');
console.log('14. Social Promoter Output generated:', fs.existsSync('social_posts.md') ? '✓ PASS' : '✗ FAIL');
console.log('15. Affiliate tag dealon04-21 integrity:', !html.includes('dealon-21') && !tracker.includes('dealon-21') ? '✓ PASS' : '✗ FAIL');
console.log('----------------------------------------------');
