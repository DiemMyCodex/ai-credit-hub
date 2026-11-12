export async function generateApiKey(): Promise<{
  plaintextKey: string;
  keyHash: string;
  keyPrefix: string;
}> {
  // Generate 24 random bytes -> 48 hex characters
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const plaintextKey = `sk-aihub-${randomHex}`;
  const keyPrefix = `sk-aihub-****${randomHex.slice(-4)}`;
  const keyHash = await hashApiKey(plaintextKey);

  return {
    plaintextKey,
    keyHash,
    keyPrefix,
  };
}

export async function hashApiKey(plaintextKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintextKey.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
