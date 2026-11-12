# Specification: AI Credit Hub Platform

## Problem Statement

Developers and end-users in Vietnam face substantial friction when attempting to consume premier artificial intelligence models (such as Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3, and Gemini 2.0 Flash). International payment barriers (requiring foreign Visa/Mastercard cards), exorbitant individual subscription fees across disparate vendors, and high complexity in managing multiple developer accounts prevent seamless adoption. Furthermore, users integrating AI into local workflows (Cursor, Cline, LibreChat, NextChat) lack an automated, cost-effective Vietnamese Dong (VND) payment bridge that allows pay-as-you-go micro-deposits via instant VietQR banking.

## Solution

AI Credit Hub is a turnkey, self-hostable, and Vercel-deployable platform combining:
1. An OpenAI-compatible reverse proxy endpoint (`/v1/chat/completions`) routing requests to OpenRouter with automatic token tracking and dynamic VND credit deductions.
2. Automated instant VietQR top-up via SePay/Casso webhook integration, converting VND deposits to credit balance within ~3 seconds without manual human verification.
3. Multi-key management with per-key spending limits and instant revocation.
4. An integrated browser Playground for immediate model testing.
5. A Bento Grid dark mode interface built with Next.js 15, Tailwind CSS, and Supabase, designed for immediate zero-config deployment to Vercel.

## User Stories

1. As an unauthenticated visitor, I want to explore a landing page highlighting supported models, transparent pricing tables, and integration guides, so that I understand the value before signing up.
2. As a new customer, I want to authenticate via email/password or OAuth using Supabase Auth, so that my account credentials and credits remain strictly private.
3. As a developer, I want to generate multiple API Keys with human-readable labels, so that I can isolate key usage across different applications (e.g. Cursor, LibreChat, CLI tools).
4. As a developer, I want to configure an optional Spending Limit on an individual API Key, so that an accidental leak cannot drain my entire account Credit balance.
5. As a developer, I want to revoke any active API Key immediately, so that compromised keys are rejected instantly at the Proxy Endpoint.
6. As a customer, I want to select prepaid deposit tiers (50,000 VND, 100,000 VND, 200,000 VND, 500,000 VND) with tiered credit bonuses, so that I get greater value when purchasing larger packages.
7. As a customer, I want to see a dynamic VietQR code with an encoded transfer content and exact amount, so that I can scan with any mobile banking app and complete payment without manual typing.
8. As a customer, I want my Credit balance to increment automatically within 3 seconds of bank transfer completion, so that I can use AI services without waiting for administrative approval.
9. As a developer, I want to point my Cursor or OpenAI-compatible client to `https://<domain>/v1/chat/completions` using my API Key, so that I can consume AI inference seamlessly without changing client code.
10. As a developer, I want streaming responses (Server-Sent Events) to stream with low latency, so that interactive code generation feels snappy and responsive.
11. As a customer, I want the system to protect me from overdrafts by blocking requests if my Credit balance is below the minimum threshold (1,000 VND), so that my account never enters an invalid negative state.
12. As a customer, I want to test models in an interactive browser Playground directly on the website, so that I can verify latency and quality before integrating keys into my development environment.
13. As an account owner, I want to view my usage analytics by model, token volume, and date, so that I understand where my Credit is spent.
14. As a system administrator, I want to deploy this repository to Vercel with standard environment variables in under 5 minutes, so that setup overhead is virtually zero.

## Implementation Decisions

### Architectural Shape
- Next.js 15 with App Router, TypeScript, and Tailwind CSS.
- Deployed on Vercel Edge/Serverless runtime with zero custom daemon dependencies.
- Supabase (PostgreSQL with Row Level Security) handles user identity, keys, ledgers, and transactions.
- OpenRouter serves as the upstream aggregator, translating OpenAI-compliant requests across 200+ foundation models.

### Testing Seams
- **Primary Seam 1 (Proxy Gateway)**: `POST /v1/chat/completions` tested with mocked upstream SSE streams, asserting key auth, minimum balance gate, and post-stream credit ledger reconciliation.
- **Primary Seam 2 (Banking Webhook)**: `POST /api/webhooks/sepay` tested with simulated banking payload and API token header, asserting transaction status change and immediate account credit increment.

### Core Modules
1. `src/lib/proxy`: OpenAI request transformer, bearer auth validator, SSE chunk pipe, and token usage extractor.
2. `src/lib/billing`: Currency conversion (USD token cost to VND with 1.35x margin multiplier), minimum balance enforcement, and atomic credit ledger operations.
3. `src/lib/payment`: Payment order creation, VietQR payload generation, and SePay webhook signature verification.
4. `src/lib/supabase`: Client and server-side Supabase factories with typed database schemas and RLS policies.
5. `src/components/ui`: Bento Grid, OLED dark surfaces (#08090D), neon glow telemetry indicators, and reactive state pills.

### Database Schema Contracts
- `profiles`: `id (uuid, fk auth.users)`, `email (text)`, `credit_balance (bigint in VND)`, `created_at (timestamp)`.
- `api_keys`: `id (uuid)`, `user_id (uuid)`, `name (text)`, `key_hash (text)`, `key_prefix (text)`, `spending_limit (bigint, nullable)`, `total_spent (bigint)`, `is_active (boolean)`, `created_at (timestamp)`.
- `payment_orders`: `id (uuid)`, `user_id (uuid)`, `order_code (text, unique)`, `amount_vnd (bigint)`, `bonus_credit (bigint)`, `status (enum: pending, completed, expired)`, `created_at (timestamp)`.
- `usage_logs`: `id (uuid)`, `user_id (uuid)`, `api_key_id (uuid)`, `model (text)`, `prompt_tokens (int)`, `completion_tokens (int)`, `total_cost_vnd (bigint)`, `created_at (timestamp)`.

## Testing Decisions

- Tests exercise behaviors only through the two external seams (`/v1/chat/completions` and `/api/webhooks/sepay`) and pure utility functions (`calculateTokenCost`).
- No mocking of internal implementation details; only external HTTP dependencies (OpenRouter upstream endpoint and bank incoming request) are stubbed.
- Zero flaky timing checks: SSE streaming tests assert sequence completion and atomic DB deduction.

## Out of Scope

- Credit card payment processing (Stripe/PayPal) is deferred to future adapter milestones.
- Custom model fine-tuning or local model self-hosting.
- Native mobile applications (desktop and mobile web responsiveness is prioritized).

## Further Notes

- Vercel Deployment readiness requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, and `SEPAY_API_KEY` configured in Vercel project environment variables.
- All database mutations to `credit_balance` run via Postgres RPC stored procedures to prevent concurrency race conditions during parallel requests.
