import { describe, it, expect } from "vitest";
import { calculateTokenCostVND, MODEL_PRICING, USD_TO_VND_RATE, MARGIN_MULTIPLIER } from "@/lib/pricing";
import { hashApiKey, generateApiKey } from "@/lib/keys";

describe("Seam 1: Proxy Gateway & Pricing Security Engine", () => {
  it("should generate cryptographically valid sk-aihub- keys and SHA-256 hashes", async () => {
    const { plaintextKey, keyHash, keyPrefix } = await generateApiKey();

    expect(plaintextKey).toMatch(/^sk-aihub-[0-9a-f]{48}$/);
    expect(keyPrefix).toMatch(/^sk-aihub-\*\*\*\*[0-9a-f]{4}$/);
    expect(keyHash).toHaveLength(64); // SHA-256 hex string

    // Recomputing hash must be deterministic
    const recomputedHash = await hashApiKey(plaintextKey);
    expect(recomputedHash).toBe(keyHash);
  });

  it("should calculate exact token costs with 35% margin markup in VND", () => {
    // Test Claude 3.5 Sonnet: $3 input / $15 output per 1M tokens
    // 1000 input tokens = (1000 / 1M) * 3 = $0.003
    // 1000 output tokens = (1000 / 1M) * 15 = $0.015
    // Total USD = $0.018
    // Total VND = ceil(0.018 * 26000 * 1.35) = ceil(631.8) = 632 VND
    const costVND = calculateTokenCostVND("anthropic/claude-3.5-sonnet", 1000, 1000);
    expect(costVND).toBe(632);

    // Test DeepSeek V3: $0.14 input / $0.28 output per 1M tokens
    // 1000 input tokens = (1000 / 1M) * 0.14 = $0.00014
    // 1000 output tokens = (1000 / 1M) * 0.28 = $0.00028
    // Total USD = $0.00042
    // Total VND = ceil(0.00042 * 26000 * 1.35) = ceil(14.742) = 15 VND
    const deepSeekCost = calculateTokenCostVND("deepseek/deepseek-chat", 1000, 1000);
    expect(deepSeekCost).toBe(15);
  });

  it("should enforce minimum 1 VND floor on non-zero token requests", () => {
    const cost = calculateTokenCostVND("google/gemini-2.0-flash-exp", 1, 1);
    expect(cost).toBeGreaterThanOrEqual(1);
  });
});
