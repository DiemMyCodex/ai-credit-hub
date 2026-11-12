import { hashApiKey } from "@/lib/crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthenticatedClient {
  userId: string;
  apiKeyId: string | null;
  keyPrefix: string;
  creditBalance: number;
}

export async function validateClientAuth(authHeader: string | null): Promise<AuthenticatedClient> {
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  // Extract raw key from "Bearer sk-aihub-..." or raw string
  const rawKey = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!rawKey) {
    throw new Error("Invalid API key format");
  }

  const keyHash = hashApiKey(rawKey);
  const supabase = createAdminClient();

  // Look up API Key in database
  const { data: keyRecord, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id, key_prefix, spending_limit, total_spent, is_active")
    .eq("key_hash", keyHash)
    .single();

  if (keyError || !keyRecord) {
    throw new Error("Invalid API Key");
  }

  if (!keyRecord.is_active) {
    throw new Error("API Key has been revoked");
  }

  // Check spending limit on the key if set
  if (keyRecord.spending_limit !== null && keyRecord.total_spent >= keyRecord.spending_limit) {
    throw new Error("API Key spending limit exceeded");
  }

  // Look up user profile balance
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, credit_balance")
    .eq("id", keyRecord.user_id)
    .single();

  if (profileError || !profile) {
    throw new Error("User profile not found");
  }

  // Minimum required balance to initiate requests is 1,000 VND
  if (profile.credit_balance < 1000) {
    throw new Error("Insufficient credit balance. Minimum 1,000 VND required to initiate requests.");
  }

  return {
    userId: profile.id,
    apiKeyId: keyRecord.id,
    keyPrefix: keyRecord.key_prefix,
    creditBalance: profile.credit_balance,
  };
}
