# AI Credit Hub Context

The core domain for an OpenAI-compatible API credit proxy and AI subscription hub, enabling customers to deposit funds via automated banking and access multi-model AI inference.

## Language

**API Key**:
The bearer authentication token issued by this platform that customers supply in HTTP headers to access AI inference services.
_Avoid_: Access token, secret key, client id, app token

**Credit**:
The internal prepaid monetary balance on a customer account, denominated in standard currency units (VND), deducted proportionally upon AI token consumption.
_Avoid_: Points, coins, wallet balance, token balance

**Upstream Provider**:
The external AI aggregator or foundation vendor (specifically OpenRouter or direct provider APIs) fulfilling the actual LLM generation requests.
_Avoid_: Supplier, backend AI, external vendor, model host

**Payment Order**:
A pending deposit record associated with a unique VietQR transfer syntax and expected amount, automatically fulfilled upon receiving a banking webhook.
_Avoid_: Invoice, bill, payment transaction, checkout slip

**Proxy Endpoint**:
An OpenAI-compliant HTTP endpoint (`/v1/chat/completions`) that validates the customer API Key, routes requests to the upstream provider, and charges the customer account according to token usage.
_Avoid_: Gateway, relay, forwarder, API wrapper

**Playground**:
A web-based interactive chat UI allowing authenticated customers to test models and verify quota directly in their browser.
_Avoid_: Chatbot page, test room, demo chat, test bench

**Spending Limit**:
An optional expenditure ceiling configured on an individual API Key to prevent depletion of the entire account Credit balance.
_Avoid_: Budget cap, quota threshold, spending barrier

**Pricing Multiplier**:
The profit margin factor applied when translating upstream USD token costs into customer VND credit deductions.
_Avoid_: Markup rate, margin ratio, exchange fee

**Webhook Callback**:
An authenticated asynchronous HTTP POST notification received from SePay upon a verified bank transfer matching a Payment Order.
_Avoid_: IPN, bank notification, transaction push
