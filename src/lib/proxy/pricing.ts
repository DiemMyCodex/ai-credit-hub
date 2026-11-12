// Currency conversion & margin multiplier
// 1 USD = 35,000 VND (Base exchange rate 26,000 VND * 1.35 margin factor)
export const USD_TO_VND_RATE = 35000;

export interface ModelRate {
  promptCostPerMillionUsd: number;
  completionCostPerMillionUsd: number;
}

// Canonical model rates in USD per 1M tokens
export const MODEL_PRICING: Record<string, ModelRate> = {
  // Anthropic
  "anthropic/claude-sonnet-4.5": { promptCostPerMillionUsd: 3.0, completionCostPerMillionUsd: 15.0 },
  "anthropic/claude-haiku-4.5": { promptCostPerMillionUsd: 0.8, completionCostPerMillionUsd: 4.0 },
  "anthropic/claude-3.5-sonnet": { promptCostPerMillionUsd: 3.0, completionCostPerMillionUsd: 15.0 },
  "anthropic/claude-3.5-haiku": { promptCostPerMillionUsd: 0.8, completionCostPerMillionUsd: 4.0 },
  "claude-3-5-sonnet-20241022": { promptCostPerMillionUsd: 3.0, completionCostPerMillionUsd: 15.0 },

  // OpenAI
  "openai/gpt-4o-2024-11-20": { promptCostPerMillionUsd: 2.5, completionCostPerMillionUsd: 10.0 },
  "openai/gpt-4o": { promptCostPerMillionUsd: 2.5, completionCostPerMillionUsd: 10.0 },
  "openai/gpt-4o-mini": { promptCostPerMillionUsd: 0.15, completionCostPerMillionUsd: 0.6 },
  "gpt-4o": { promptCostPerMillionUsd: 2.5, completionCostPerMillionUsd: 10.0 },
  "gpt-4o-mini": { promptCostPerMillionUsd: 0.15, completionCostPerMillionUsd: 0.6 },

  // DeepSeek
  "deepseek/deepseek-chat": { promptCostPerMillionUsd: 0.14, completionCostPerMillionUsd: 0.28 },
  "deepseek/deepseek-coder": { promptCostPerMillionUsd: 0.14, completionCostPerMillionUsd: 0.28 },
  "deepseek-chat": { promptCostPerMillionUsd: 0.14, completionCostPerMillionUsd: 0.28 },

  // Google Gemini
  "google/gemini-3.5-flash-lite": { promptCostPerMillionUsd: 0.075, completionCostPerMillionUsd: 0.3 },
  "google/gemini-2.0-flash": { promptCostPerMillionUsd: 0.1, completionCostPerMillionUsd: 0.4 },
  "google/gemini-1.5-pro": { promptCostPerMillionUsd: 1.25, completionCostPerMillionUsd: 5.0 },
};

// Map legacy or retired model IDs to currently active models on OpenRouter
export const MODEL_ALIASES: Record<string, string> = {
  "anthropic/claude-3.5-sonnet": "anthropic/claude-sonnet-4.5",
  "claude-3-5-sonnet-20241022": "anthropic/claude-sonnet-4.5",
  "claude-3.5-sonnet": "anthropic/claude-sonnet-4.5",
  "claude-3-5-sonnet": "anthropic/claude-sonnet-4.5",
  "anthropic/claude-3.5-haiku": "anthropic/claude-haiku-4.5",
  "claude-3.5-haiku": "anthropic/claude-haiku-4.5",
  "openai/gpt-4o": "openai/gpt-4o-2024-11-20",
  "gpt-4o": "openai/gpt-4o-2024-11-20",
  "deepseek/deepseek-v3": "deepseek/deepseek-chat",
  "google/gemini-2.0-flash": "google/gemini-3.5-flash-lite",
  "google/gemini-2.0-flash-exp:free": "google/gemini-3.5-flash-lite",
};

export function resolveUpstreamModel(model: string): string {
  const normalized = model.toLowerCase().trim();
  return MODEL_ALIASES[normalized] || model;
}

// Default fallback rate for unlisted models ($1.00 / $3.00 per M)
export const DEFAULT_MODEL_RATE: ModelRate = {
  promptCostPerMillionUsd: 1.0,
  completionCostPerMillionUsd: 3.0,
};

export function calculateCostVnd(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const resolved = resolveUpstreamModel(model);
  const normalizedModel = resolved.toLowerCase().trim();
  const rate = MODEL_PRICING[normalizedModel] || DEFAULT_MODEL_RATE;

  const promptCostUsd = (promptTokens / 1_000_000) * rate.promptCostPerMillionUsd;
  const completionCostUsd = (completionTokens / 1_000_000) * rate.completionCostPerMillionUsd;
  const totalUsd = promptCostUsd + completionCostUsd;

  // Convert to VND and round up to whole VND (minimum 1 VND)
  const costVnd = Math.ceil(totalUsd * USD_TO_VND_RATE);
  return Math.max(1, costVnd);
}

export const calculateTokenCostVND = calculateCostVnd;
