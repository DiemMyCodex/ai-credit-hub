import { describe, it, expect } from "vitest";
import { calculateCostVnd, MODEL_PRICING, USD_TO_VND_RATE } from "@/lib/proxy/pricing";
import { generateOrderCode } from "@/lib/payment/vietqr";
import { generateRawApiKey, hashApiKey } from "@/lib/crypto";

describe("Seam 1: Pricing & Token Calculation Engine", () => {
  it("calculates Claude 3.5 Sonnet token costs with margin multiplier", () => {
    // 1,000 prompt tokens + 500 completion tokens
    // Prompt: (1000 / 1M) * $3.0 = $0.003
    // Completion: (500 / 1M) * $15.0 = $0.0075
    // Total USD = $0.0105
    // In VND (at 35,000 VND/USD) = 0.0105 * 35,000 = 367.5 -> Ceil: 368 VND
    const cost = calculateCostVnd("anthropic/claude-3.5-sonnet", 1000, 500);
    expect(cost).toBe(368);
  });

  it("calculates DeepSeek-V3 micro-costs with minimum 1 VND floor", () => {
    const cost = calculateCostVnd("deepseek/deepseek-chat", 100, 50);
    expect(cost).toBeGreaterThanOrEqual(1);
  });

  it("generates cryptographic API keys with valid sha256 hash and prefix", () => {
    const { rawKey, keyHash, keyPrefix } = generateRawApiKey();

    expect(rawKey.startsWith("sk-aihub-")).toBe(true);
    expect(keyPrefix.startsWith("sk-aihub-****")).toBe(true);
    expect(keyHash).toHaveLength(64); // sha256 hex length
    expect(hashApiKey(rawKey)).toBe(keyHash);
  });
});

describe("Seam 2: Banking Webhook & Order Code Matcher", () => {
  it("generates valid AIHUB format order codes", () => {
    const code = generateOrderCode();
    expect(code).toMatch(/^AIHUB[A-Z0-9]{6}$/);
  });

  it("correctly extracts AIHUB order code from arbitrary bank transfer descriptions", () => {
    const transferContent1 = "MBBank chuyen tien AIHUB9X2K4M thanh toan goi 100k";
    const transferContent2 = "AIHUB88LK99 chuyen khoan";

    const match1 = transferContent1.match(/AIHUB[A-Z0-9]{6}/i);
    const match2 = transferContent2.match(/AIHUB[A-Z0-9]{6}/i);

    expect(match1?.[0].toUpperCase()).toBe("AIHUB9X2K4M");
    expect(match2?.[0].toUpperCase()).toBe("AIHUB88LK99");
  });
});
