# 05: Proxy Gateway `/v1/chat/completions` with Streaming and Ledger Billing

**What to build:** An OpenAI-compliant reverse proxy route handler (`POST /v1/chat/completions`) that validates customer API Keys against SHA-256 hashes, checks minimum balance thresholds, forwards inference requests to OpenRouter, streams Server-Sent Events (SSE) chunks with ultra-low latency, and calculates token charges with margin multipliers to atomically deduct account Credit upon completion.

**Blocked by:** 01: Scaffold Next.js 15, Supabase Schema and Vercel Configuration, 04: API Key Management Dashboard with Spending Limits.

**Status:** completed

- [x] Route handler `POST /v1/chat/completions` parsing `Authorization: Bearer <api_key>` and standard OpenAI payload.
- [x] API Key validation asserting active status and balance adequacy (minimum 1,000 VND).
- [x] Spending limit verification ensuring the individual key has not exceeded its configured cap.
- [x] Upstream forwarder routing prompts to OpenRouter with upstream headers and streaming options.
- [x] Server-Sent Events (SSE) streaming proxy pipeline piping chunks directly to the caller with zero buffering.
- [x] Final chunk usage parser capturing prompt and completion token counts.
- [x] Pricing engine converting token usage to VND using defined model rates multiplied by the margin factor (1.35x).
- [x] Atomic deduction invoking `deduct_credit_and_record_usage` and logging usage record.
