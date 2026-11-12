# OpenRouter as Primary Upstream Provider

We chose OpenRouter as the primary upstream inference aggregator, wrapped behind an extensible internal provider adapter pattern. OpenRouter unifies 200+ frontier models (Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3, Gemini 2.0 Flash) through a single standard OpenAI-compatible wire protocol with real-time token tracking, eliminating the operational complexity of managing disparate upstream enterprise billing accounts while enabling direct provider fallbacks when required.
