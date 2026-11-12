-- ==============================================================================
-- AI CREDIT HUB - INITIAL DATABASE SCHEMA & ATOMIC PROCEDURES
-- ==============================================================================

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    credit_balance BIGINT NOT NULL DEFAULT 0 CHECK (credit_balance >= 0),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    spending_limit BIGINT DEFAULT NULL, -- NULL means no limit (capped only by profile credit_balance)
    total_spent BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);

-- 3. Payment Orders table (VietQR deposits)
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_code TEXT NOT NULL UNIQUE,
    amount_vnd BIGINT NOT NULL CHECK (amount_vnd > 0),
    bonus_credit BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_code ON public.payment_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);

-- 4. Usage Logs table
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost_vnd BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON public.usage_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- API Keys: Users can manage their own API keys
CREATE POLICY "Users can view own api keys"
    ON public.api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys"
    ON public.api_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys"
    ON public.api_keys FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
    ON public.api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- Payment Orders: Users can view and create their own orders
CREATE POLICY "Users can view own payment orders"
    ON public.payment_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment orders"
    ON public.payment_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usage Logs: Users can view their own usage logs
CREATE POLICY "Users can view own usage logs"
    ON public.usage_logs FOR SELECT
    USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, credit_balance)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        10000 -- Give 10,000 VND free starting credit to test!
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ATOMIC STORED PROCEDURES (RACE-CONDITION PROOF)
-- ==============================================================================

-- Atomic credit deduction and usage record function
CREATE OR REPLACE FUNCTION public.deduct_credit_and_record_usage(
    p_user_id UUID,
    p_key_id UUID,
    p_model TEXT,
    p_prompt_tokens INTEGER,
    p_completion_tokens INTEGER,
    p_total_cost_vnd BIGINT
)
RETURNS JSONB AS $$
DECLARE
    v_current_balance BIGINT;
    v_key_spent BIGINT;
    v_key_limit BIGINT;
    v_new_balance BIGINT;
BEGIN
    -- 1. Lock profile row for atomic update
    SELECT credit_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
    END IF;

    -- Check balance
    IF v_current_balance < p_total_cost_vnd THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient credit balance');
    END IF;

    -- 2. If API Key provided, check key limit and lock row
    IF p_key_id IS NOT NULL THEN
        SELECT total_spent, spending_limit INTO v_key_spent, v_key_limit
        FROM public.api_keys
        WHERE id = p_key_id AND user_id = p_user_id AND is_active = true
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'API Key inactive or invalid');
        END IF;

        IF v_key_limit IS NOT NULL AND (v_key_spent + p_total_cost_vnd) > v_key_limit THEN
            RETURN jsonb_build_object('success', false, 'error', 'API Key spending limit exceeded');
        END IF;

        -- Update key total spent
        UPDATE public.api_keys
        SET total_spent = total_spent + p_total_cost_vnd,
            last_used_at = timezone('utc'::text, now())
        WHERE id = p_key_id;
    END IF;

    -- 3. Deduct credit from profile
    v_new_balance := v_current_balance - p_total_cost_vnd;
    UPDATE public.profiles
    SET credit_balance = v_new_balance,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_user_id;

    -- 4. Insert usage log
    INSERT INTO public.usage_logs (
        user_id,
        api_key_id,
        model,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        total_cost_vnd
    ) VALUES (
        p_user_id,
        p_key_id,
        p_model,
        p_prompt_tokens,
        p_completion_tokens,
        (p_prompt_tokens + p_completion_tokens),
        p_total_cost_vnd
    );

    RETURN jsonb_build_object(
        'success', true,
        'previous_balance', v_current_balance,
        'deducted', p_total_cost_vnd,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic payment order fulfillment
CREATE OR REPLACE FUNCTION public.complete_payment_order(
    p_order_code TEXT,
    p_reference TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_total_credit BIGINT;
    v_new_balance BIGINT;
BEGIN
    -- Lock order row
    SELECT * INTO v_order
    FROM public.payment_orders
    WHERE order_code = p_order_code
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order code not found');
    END IF;

    IF v_order.status = 'completed' THEN
        RETURN jsonb_build_object('success', true, 'already_completed', true, 'user_id', v_order.user_id);
    END IF;

    -- Calculate total credit (deposit amount + bonus)
    v_total_credit := v_order.amount_vnd + v_order.bonus_credit;

    -- Update order status
    UPDATE public.payment_orders
    SET status = 'completed',
        payment_reference = p_reference,
        completed_at = timezone('utc'::text, now())
    WHERE id = v_order.id;

    -- Update user credit balance
    UPDATE public.profiles
    SET credit_balance = credit_balance + v_total_credit,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_order.user_id
    RETURNING credit_balance INTO v_new_balance;

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_order.user_id,
        'credited_amount', v_total_credit,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
