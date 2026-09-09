#!/usr/bin/env python3
"""
DealOn Automated Tech Deal Tracker & Telegram Dispatcher
========================================================
Version: 1.0 (Live Ready)
Automates price tracking, drop threshold evaluation, and Telegram broadcast with Amazon affiliate tags.
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional

DEFAULT_CATALOG_FILE = os.path.join(os.path.dirname(__file__), "products.json")
DEFAULT_AFFILIATE_TAG = os.environ.get("AMAZON_AFFILIATE_TAG", "dealon04-21")
DEFAULT_TELEGRAM_CHAT = os.environ.get("TELEGRAM_CHAT_ID", "@dealon_offers")
DEFAULT_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")


def load_catalog(filepath: str) -> List[Dict[str, Any]]:
    """Loads product catalog from local JSON or Google Sheets CSV/JSON URL."""
    if filepath.startswith("http://") or filepath.startswith("https://"):
        req = urllib.request.Request(filepath, headers={"User-Agent": "DealOn-Bot/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content)

    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Product catalog file not found at: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def build_affiliate_url(asin: str, affiliate_tag: str) -> str:
    """Constructs Amazon product URL with the active Associates tracking ID."""
    return f"https://www.amazon.in/dp/{asin}?tag={urllib.parse.quote(affiliate_tag)}"


def format_telegram_deal_message(product: Dict[str, Any], affiliate_tag: str) -> str:
    """Generates viral, high-converting Markdown deal copy for Telegram broadcast."""
    current_price = product["current_price"]
    mrp = product["mrp"]
    historical_low = product["historical_low"]
    savings = mrp - current_price
    discount = product.get("discount_pct", round(((mrp - current_price) / mrp) * 100))
    is_low = product.get("is_historical_low", current_price <= historical_low)
    affiliate_url = build_affiliate_url(product["asin"], affiliate_tag)

    header = "🔥 *HISTORICAL ALL-TIME LOW ALERT*" if is_low else "⚡ *PRICE DROP ALERT*"
    category_hashtag = product['category'].replace(" ", "")

    specs_bullet = ""
    if product.get("features"):
        specs_bullet = "\n".join([f"• {feat}" for feat in product["features"][:3]]) + "\n\n"

    message = (
        f"{header}\n\n"
        f"📦 *{product['title']}*\n"
        f"🏢 Brand: *{product['brand']}* | #{category_hashtag}\n\n"
        f"💰 Deal Price: *₹{current_price:,}*\n"
        f"❌ MRP: ~₹{mrp:,}~\n"
        f"📉 Savings: *₹{savings:,}* ({discount}% OFF)\n"
        f"🎯 Verified 90-Day Low: *₹{historical_low:,}*\n\n"
        f"{specs_bullet}"
        f"👉 *GRAB DEAL ON AMAZON:*\n"
        f"{affiliate_url}\n\n"
        f"🔔 Tracked 24/7 by @dealon\\_offers | DealOn Portal"
    )
    return message


def send_telegram_alert(
    bot_token: str,
    chat_id: str,
    message: str,
    product: Dict[str, Any],
    affiliate_tag: str,
    dry_run: bool = False
) -> bool:
    """Dispatches markdown deal alert with inline keyboard buttons to Telegram channel."""
    current_price = product["current_price"]
    affiliate_url = build_affiliate_url(product["asin"], affiliate_tag)

    if dry_run or not bot_token:
        print("\n" + "=" * 60)
        print(f"📢 [DRY-RUN / LOCAL PREVIEW] Target Chat: {chat_id}")
        print("=" * 60)
        print(message)
        print("-" * 60)
        print(f"[BUTTON 1] 🛒 Buy on Amazon (₹{current_price:,}) -> {affiliate_url}")
        print(f"[BUTTON 2] 🌐 DealOn Portal -> https://dealon.netlify.app")
        print("=" * 60 + "\n")
        return True

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False,
        "reply_markup": {
            "inline_keyboard": [
                [
                    {
                        "text": f"🛒 Buy on Amazon (₹{current_price:,})",
                        "url": affiliate_url
                    }
                ],
                [
                    {
                        "text": "🌐 DealOn Portal",
                        "url": "https://dealon.netlify.app"
                    },
                    {
                        "text": "📢 Join VIP Channel",
                        "url": "https://t.me/dealon_offers"
                    }
                ]
            ]
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "DealOn-Bot/1.0"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            res_body = json.loads(resp.read().decode("utf-8"))
            if res_body.get("ok"):
                print(f"✓ Alert dispatched successfully: {product['title']} (₹{current_price})")
                return True
            else:
                print(f"✗ Telegram API error: {res_body}")
                return False
    except Exception as exc:
        print(f"✗ Failed to dispatch to Telegram: {exc}", file=sys.stderr)
        return False


def run_deal_engine(
    catalog_path: str,
    affiliate_tag: str,
    bot_token: str,
    chat_id: str,
    dry_run: bool = False,
    test_mode: bool = False
):
    """Evaluates catalog prices against drop alert thresholds and triggers broadcasts."""
    print(f"🚀 DealOn Engine Starting | Affiliate Tag: '{affiliate_tag}' | Target: '{chat_id}'")
    catalog = load_catalog(catalog_path)
    print(f"📊 Loaded {len(catalog)} products from catalog.")

    triggered_count = 0

    for idx, product in enumerate(catalog):
        current_price = product["current_price"]
        target_drop_price = product.get("target_drop_price", product["historical_low"])
        is_low = product.get("is_historical_low", False)

        # Trigger condition: price at or below threshold OR verified historical low
        should_trigger = (current_price <= target_drop_price) or is_low

        if should_trigger:
            triggered_count += 1
            msg = format_telegram_deal_message(product, affiliate_tag)
            send_telegram_alert(bot_token, chat_id, msg, product, affiliate_tag, dry_run=dry_run)

            if test_mode:
                print("⚡ Test mode: stopped after first deal alert.")
                break

    print(f"✅ Run complete: {triggered_count}/{len(catalog)} deals met alert criteria.")


def main():
    parser = argparse.ArgumentParser(
        description="DealOn Automated Tech Deal Tracker & Telegram Dispatcher"
    )
    parser.add_argument(
        "--catalog",
        default=DEFAULT_CATALOG_FILE,
        help=f"Path or URL to products catalog (default: {DEFAULT_CATALOG_FILE})"
    )
    parser.add_argument(
        "--tag",
        default=DEFAULT_AFFILIATE_TAG,
        help=f"Amazon Associates tracking ID (default: {DEFAULT_AFFILIATE_TAG})"
    )
    parser.add_argument(
        "--bot-token",
        default=DEFAULT_BOT_TOKEN,
        help="Telegram Bot Token from @BotFather (or env TELEGRAM_BOT_TOKEN)"
    )
    parser.add_argument(
        "--chat-id",
        default=DEFAULT_TELEGRAM_CHAT,
        help=f"Telegram Chat ID or @channel (default: {DEFAULT_TELEGRAM_CHAT})"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print deals to console without sending actual Telegram requests"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Evaluate and broadcast only the first qualifying deal"
    )

    args = parser.parse_args()

    run_deal_engine(
        catalog_path=args.catalog,
        affiliate_tag=args.tag,
        bot_token=args.bot_token,
        chat_id=args.chat_id,
        dry_run=args.dry_run or (not args.bot_token),
        test_mode=args.test
    )


if __name__ == "__main__":
    main()
