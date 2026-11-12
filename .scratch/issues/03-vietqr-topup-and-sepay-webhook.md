# 03: Automated VietQR Top-Up Flow and SePay Webhook Verification

**What to build:** An automated deposit flow where customers can select prepaid credit tiers (50,000 VND to 500,000 VND), scan a dynamic VietQR code with an encoded payment order reference, and have their account credit incremented within 3 seconds when SePay pushes a verified banking webhook callback.

**Blocked by:** 01: Scaffold Next.js 15, Supabase Schema and Vercel Configuration.

**Status:** completed

- [x] Top-up interface presenting preset deposit cards (50k, 100k, 200k, 500k VND) with tiered credit bonus percentages.
- [x] Dynamic payment order creation assigning a unique transfer code (e.g., `AIHUB12345`) and generating an instant VietQR code with countdown timer.
- [x] Route handler `POST /api/webhooks/sepay` verifying API authorization token and validating transfer content.
- [x] Atomic credit increment in `profiles` and status update to `completed` in `payment_orders`.
- [x] Client-side polling or Supabase realtime subscription that detects payment completion and refreshes the credit balance without a page reload.
