import crypto from "crypto";

export function generateRawApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  // Generate 24 random bytes -> 32 hex chars
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `sk-aihub-${randomBytes}`;

  // Hash with SHA-256 for secure DB lookup
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  // Prefix with masked middle for display: sk-aihub-****abcd
  const lastFour = rawKey.slice(-4);
  const keyPrefix = `sk-aihub-****${lastFour}`;

  return { rawKey, keyHash, keyPrefix };
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}
