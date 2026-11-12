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
  "anthropic/claude-3.5-sonnet": { promptCostPerMillionUsd: 3.0, completionCostPerMillionUsd: 15.0 },
  "anthropic/claude-3.5-haiku": { promptCostPerMillionUsd: 0.8, completionCostPerMillionUsd: 4.0 },
  "claude-3-5-sonnet-20241022": { promptCostPerMillionUsd: 3.0, completionCostPerMillionUsd: 15.0 },

  // OpenAI
  "openai/gpt-4o": { promptCostPerMillionUsd: 2.5, completionCostPerMillionUsd: 10.0 },
  "openai/gpt-4o-mini": { promptCostPerMillionUsd: 0.15, completionCostPerMillionUsd: 0.6 },
  "gpt-4o": { promptCostPerMillionUsd: 2.5, completionCostPerMillionUsd: 10.0 },
  "gpt-4o-mini": { promptCostPerMillionUsd: 0.15, completionCostPerMillionUsd: 0.6 },

  // DeepSeek
  "deepseek/deepseek-chat": { promptCostPerMillionUsd: 0.14, completionCostPerMillionUsd: 0.28 },
  "deepseek/deepseek-coder": { promptCostPerMillionUsd: 0.14, completionCostPerMillionUsd: 0.28 },
  "deepseek-chat": { promptCostPerMillionUsd: 0.14, completionCostPerMillionUsd: 0.28 },

  // Google Gemini
  "google/gemini-2.0-flash-exp:free": { promptCostPerMillionUsd: 0.05, completionCostPerMillionUsd: 0.2 },
  "google/gemini-2.0-flash": { promptCostPerMillionUsd: 0.1, completionCostPerMillionUsd: 0.4 },
  "google/gemini-1.5-pro": { promptCostPerMillionUsd: 1.25, completionCostPerMillionUsd: 5.0 },
};

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
  const normalizedModel = model.toLowerCase().trim();
  const rate = MODEL_PRICING[normalizedModel] || DEFAULT_MODEL_RATE;

  const promptCostUsd = (promptTokens / 1_000_000) * rate.promptCostPerMillionUsd;
  const completionCostUsd = (completionTokens / 1_000_000) * rate.completionCostPerMillionUsd;
  const totalUsd = promptCostUsd + completionCostUsd;

  // Convert to VND and round up to whole VND (minimum 1 VND)
  const costVnd = Math.ceil(totalUsd * USD_TO_VND_RATE);
  return Math.max(1, costVnd);
}
