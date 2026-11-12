# 04: API Key Management Dashboard with Spending Limits

**What to build:** An intuitive developer portal within the dashboard enabling users to inspect their current Credit balance, generate multiple API Keys with custom labels and optional spending limits, copy raw keys securely upon creation, and revoke active keys immediately.

**Blocked by:** 01: Scaffold Next.js 15, Supabase Schema and Vercel Configuration.

**Status:** completed

- [x] Balance card displaying total available Credit in Vietnamese Dong (VND) with quick top-up shortcut.
- [x] API Key creation modal accepting a key label (e.g. "Cursor Editor", "LibreChat") and optional spending ceiling.
- [x] Secure token generation creating `sk-aihub-...` formatted keys, storing SHA-256 hashes in the database while revealing the plaintext key to the user only once.
- [x] API Key list displaying prefix (e.g., `sk-aihub-****abcd`), creation date, spending limit, total spend, and active status.
- [x] Instant key revocation toggle that updates `is_active = false` to immediately invalidate access at the proxy gateway.
