# 07: End-to-End Seam Tests, Production Build and 1-Click Vercel Deployment Guide

**What to build:** An automated test harness covering the two primary system seams (`POST /v1/chat/completions` and `POST /api/webhooks/sepay`), confirmation of error-free Next.js production compilation, complete environment variable specification, and step-by-step 1-click Vercel deployment documentation.

**Blocked by:** 02: Bento Grid OLED Landing Page and Supabase Authentication, 03: Automated VietQR Top-Up Flow and SePay Webhook Verification, 05: Proxy Gateway `/v1/chat/completions` with Streaming and Ledger Billing, 06: Interactive In-Browser Model Playground and Usage Analytics.

**Status:** completed

- [x] Automated integration test for Seam 1 (Proxy Gateway) verifying authorization, balance enforcement, streaming, and ledger updates against a mock upstream provider.
- [x] Automated integration test for Seam 2 (Banking Webhook) verifying SePay secret token validation, payment order matching, and credit increment.
- [x] Production build verification ensuring `npm run build` exits with code 0 without type errors or broken imports.
- [x] Comprehensive `.env.example` documenting all required Vercel environment keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `SEPAY_API_KEY`).
- [x] Production deployment guide detailing Supabase project setup, SQL migration execution, and 1-click Vercel import instructions.
