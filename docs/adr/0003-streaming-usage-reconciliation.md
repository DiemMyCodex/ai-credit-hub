# Streaming Usage Reconciliation

We verify a minimum customer credit balance (> 1,000 VND) before initiating any server-sent events (SSE) stream, and deduct actual token costs upon receiving the final usage chunk emitted by OpenRouter. This design eliminates complex database locking mechanisms during high-concurrency token streaming while safeguarding against negative balances.
