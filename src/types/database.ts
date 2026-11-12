export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          credit_balance: number;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          credit_balance?: number;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          credit_balance?: number;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          spending_limit: number | null;
          total_spent: number;
          is_active: boolean;
          created_at: string;
          last_used_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          spending_limit?: number | null;
          total_spent?: number;
          is_active?: boolean;
          created_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          spending_limit?: number | null;
          total_spent?: number;
          is_active?: boolean;
          created_at?: string;
          last_used_at?: string | null;
        };
      };
      payment_orders: {
        Row: {
          id: string;
          user_id: string;
          order_code: string;
          amount_vnd: number;
          bonus_credit: number;
          status: 'pending' | 'completed' | 'cancelled' | 'expired';
          payment_reference: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_code: string;
          amount_vnd: number;
          bonus_credit?: number;
          status?: 'pending' | 'completed' | 'cancelled' | 'expired';
          payment_reference?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_code?: string;
          amount_vnd?: number;
          bonus_credit?: number;
          status?: 'pending' | 'completed' | 'cancelled' | 'expired';
          payment_reference?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          api_key_id: string | null;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          total_cost_vnd: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          api_key_id?: string | null;
          model: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          total_cost_vnd: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          api_key_id?: string | null;
          model?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          total_cost_vnd?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      deduct_credit_and_record_usage: {
        Args: {
          p_user_id: string;
          p_key_id: string | null;
          p_model: string;
          p_prompt_tokens: number;
          p_completion_tokens: number;
          p_total_cost_vnd: number;
        };
        Returns: Json;
      };
      complete_payment_order: {
        Args: {
          p_order_code: string;
          p_reference: string;
        };
        Returns: Json;
      };
    };
  };
}
