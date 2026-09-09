const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const content = fs.readFileSync(indexPath, 'utf-8');

const checks = [
  { name: 'Base Background (#F0F0E0)', pass: content.includes('--bg-main: #F0F0E0') },
  { name: 'Primary Accent (#FF8C00)', pass: content.includes('--primary-accent: #FF8C00') },
  { name: 'Sea Green Accent (#128C7E)', pass: content.includes('--accent-sea-green: #128C7E') },
  { name: 'Crimson Accent (#E34234)', pass: content.includes('--accent-crimson: #E34234') },
  { name: 'Cards Background (#FFFFFF)', pass: content.includes('--bg-card: #FFFFFF') },
  { name: 'Text Primary (#1C2321)', pass: content.includes('--text-primary: #1C2321') },
  { name: 'Text Secondary (#596562)', pass: content.includes('--text-secondary: #596562') },
  { name: 'Border Color (#DCDCC8)', pass: content.includes('--border-color: #DCDCC8') },
  { name: 'Theme Color in Head', pass: content.includes('<meta name="theme-color" content="#F0F0E0">') },
  { name: 'Announcement Bar Style', pass: content.includes('.top-ticker-bar, .announcement-banner, .announcement') },
  { name: 'Primary CTA Buttons Style', pass: content.includes('.btn-primary, \n    .cta-button, \n    button[type="submit"]') },
  { name: 'Secondary Button Style', pass: content.includes('.btn-secondary, \n    .outline-cta,') },
  { name: 'Discount Badges Style', pass: content.includes('.badge-discount, \n    .discount-tag,') },
  { name: 'Verified Badges Style', pass: content.includes('.badge-verified, \n    .tag-success,') },
  { name: 'Telegram Banner & Button', pass: content.includes('.telegram-banner, .newsletter-section, .telegram-cta') && content.includes('.telegram-btn') },
  { name: 'Footer & Mobile Nav Style', pass: content.includes('footer, .mobile-bottom-nav, .mobile-nav') },
  { name: 'Sparkline Sea Green (#128C7E)', pass: content.includes("ctx.strokeStyle = '#128C7E';") }
];

console.log('=== DEALON DESIGN PALETTE VERIFICATION ===');
let failed = 0;
for (const c of checks) {
  if (c.pass) {
    console.log(`✅ PASS: ${c.name}`);
  } else {
    console.log(`❌ FAIL: ${c.name}`);
    failed++;
  }
}

if (failed === 0) {
  console.log('\n🎉 ALL 17 DESIGN TOKEN CHECKS PASSED!');
  process.exit(0);
} else {
  console.log(`\n⚠️ ${failed} check(s) failed.`);
  process.exit(1);
}
