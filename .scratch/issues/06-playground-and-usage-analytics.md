# 06: Interactive In-Browser Model Playground and Usage Analytics

**What to build:** An in-app chat playground allowing authenticated customers to interact directly with multiple AI models (Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3, Gemini 2.0 Flash) from their browser, observing real-time streaming tokens and balance updates, paired with visual analytics charts detailing historical token consumption and expenditure over time.

**Blocked by:** 04: API Key Management Dashboard with Spending Limits, 05: Proxy Gateway `/v1/chat/completions` with Streaming and Ledger Billing.

**Status:** completed

- [x] Model selector dropdown supporting all core offerings with latency and token price badges.
- [x] Responsive chat message thread rendering markdown, syntax-highlighted code blocks, and copy buttons.
- [x] Streaming completion client connecting directly to the internal proxy endpoint using session auth.
- [x] Real-time telemetry pill displaying tokens per second, total token count, and deducted VND for the turn.
- [x] Analytics dashboard section presenting daily consumption bar charts and model breakdown distribution.
