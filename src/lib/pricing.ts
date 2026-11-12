export interface ModelPricing {
  promptUsdPer1M: number;
  completionUsdPer1M: number;
}

export const USD_TO_VND_RATE = 26000;
export const MARGIN_MULTIPLIER = 1.35; // 35% margin markup

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Anthropic Claude 3.5 Sonnet: $3 / $15
  "anthropic/claude-3.5-sonnet": { promptUsdPer1M: 3.0, completionUsdPer1M: 15.0 },
  "claude-3-5-sonnet-20241022": { promptUsdPer1M: 3.0, completionUsdPer1M: 15.0 },

  // OpenAI GPT-4o: $2.5 / $10
  "openai/gpt-4o": { promptUsdPer1M: 2.5, completionUsdPer1M: 10.0 },
  "gpt-4o": { promptUsdPer1M: 2.5, completionUsdPer1M: 10.0 },

  // OpenAI GPT-4o-mini: $0.15 / $0.6
  "openai/gpt-4o-mini": { promptUsdPer1M: 0.15, completionUsdPer1M: 0.6 },
  "gpt-4o-mini": { promptUsdPer1M: 0.15, completionUsdPer1M: 0.6 },

  // DeepSeek V3: $0.14 / $0.28
  "deepseek/deepseek-chat": { promptUsdPer1M: 0.14, completionUsdPer1M: 0.28 },
  "deepseek-chat": { promptUsdPer1M: 0.14, completionUsdPer1M: 0.28 },

  // DeepSeek R1 Reasoning: $0.55 / $2.19
  "deepseek/deepseek-r1": { promptUsdPer1M: 0.55, completionUsdPer1M: 2.19 },

  // Google Gemini 2.0 Flash: $0.1 / $0.4
  "google/gemini-2.0-flash-exp": { promptUsdPer1M: 0.1, completionUsdPer1M: 0.4 },
  "google/gemini-flash-1.5": { promptUsdPer1M: 0.075, completionUsdPer1M: 0.3 },
};

// Default fallback pricing for any unlisted OpenRouter model: $2 / $8 per 1M
const DEFAULT_PRICING: ModelPricing = {
  promptUsdPer1M: 2.0,
  completionUsdPer1M: 8.0,
};

export function calculateTokenCostVND(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const normalizedModel = model.toLowerCase().trim();
  const pricing = MODEL_PRICING[normalizedModel] || DEFAULT_PRICING;

  const promptUsd = (promptTokens / 1_000_000) * pricing.promptUsdPer1M;
  const completionUsd = (completionTokens / 1_000_000) * pricing.completionUsdPer1M;
  const totalUsd = promptUsd + completionUsd;

  const totalVND = Math.ceil(totalUsd * USD_TO_VND_RATE * MARGIN_MULTIPLIER);
  // Minimum deduction floor of 1 VND for any non-zero request
  return Math.max(totalVND, promptTokens + completionTokens > 0 ? 1 : 0);
}
