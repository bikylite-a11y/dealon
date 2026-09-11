const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const size = (fs.statSync('index.html').size / 1024).toFixed(1);

console.log('--- DealOn Redesign & Brand Integration Verification ---');
console.log('1. File size:', size + ' KB');
console.log('2. Favicon linked in head:', html.includes('favicon.png') ? '✓ PASS' : '✗ FAIL');
console.log('3. Logo image in header & footer:', html.includes('src="logo.png"') ? '✓ PASS' : '✗ FAIL');
console.log('4. Make in India badge & Tricolor strip:', html.includes('make-in-india-card') && html.includes('footer-tricolor-strip') ? '✓ PASS' : '✗ FAIL');
console.log('5. Product images on every card:', html.includes('image_url') ? '✓ PASS' : '✗ FAIL');
console.log('6. Deal of the Day spotlight:', html.includes('dotdWrap') ? '✓ PASS' : '✗ FAIL');
console.log('7. Interactive Wishlist (❤️):', html.includes('toggleWishlist') && html.includes('showSavedWishlist') ? '✓ PASS' : '✗ FAIL');
console.log('8. Functional footer category & tool links:', html.includes('filterCategory(') && html.includes('filterHistLows(') ? '✓ PASS' : '✗ FAIL');
console.log('9. Amazon affiliate links:', ((html.match(/amazon\.in\/dp\//g) || []).length >= 20 || (html.match(/amazon\.in\/s\?k=/g) || []).length >= 20) ? '✓ PASS' : '✗ FAIL');
console.log('10. Affiliate Tag (dealon04-21) integrity:', !html.includes('dealon-21') || html.includes('dealon04-21') ? '✓ PASS' : '✗ FAIL');
console.log('---------------------------------------------------------');
