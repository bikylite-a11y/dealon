/**
 * DealOn Centralized Affiliate URL Sanitizer & Canonical Formatter
 * ================================================================
 * Generates canonical, high-converting Amazon India affiliate URLs
 * that reliably retain 24-hour associate cookie attribution.
 */

const AMAZON_TAG = process.env.AMAZON_AFFILIATE_TAG || 'dealon04-21';

function formatAmazonUrl(rawUrl, tag = AMAZON_TAG) {
  try {
    if (!rawUrl) return '';
    const str = String(rawUrl).trim();

    // Direct ASIN string (10 chars alphanumeric)
    if (/^[A-Z0-9]{10}$/i.test(str)) {
      return `https://www.amazon.in/dp/${str.toUpperCase()}/?tag=${tag}&linkCode=ll1&language=en_IN`;
    }

    // Extract 10-character ASIN from standard Amazon path patterns
    const asinMatch = str.match(/(?:dp|gp\/product|\/d\/)\/([A-Z0-9]{10})/i);
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1].toUpperCase();
      return `https://www.amazon.in/dp/${asin}/?tag=${tag}&linkCode=ll1&language=en_IN`;
    }

    // Parse URL and cleanly set parameters without duplicate questions marks
    const urlObj = new URL(str);
    urlObj.searchParams.set('tag', tag);
    urlObj.searchParams.set('linkCode', 'll1');
    urlObj.searchParams.set('language', 'en_IN');
    return urlObj.toString();
  } catch (e) {
    // Regex fallback if URL constructor fails
    const fallbackMatch = String(rawUrl).match(/([A-Z0-9]{10})/i);
    if (fallbackMatch && fallbackMatch[1]) {
      return `https://www.amazon.in/dp/${fallbackMatch[1].toUpperCase()}/?tag=${tag}&linkCode=ll1&language=en_IN`;
    }
    return rawUrl;
  }
}

module.exports = { formatAmazonUrl, AMAZON_TAG };
