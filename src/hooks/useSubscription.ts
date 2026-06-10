// ─── useSubscription hook ─────────────────────────────────────────────────────
// Reads the user's Stripe subscription status from the `user_profiles` Supabase table.
// Exposes isPremium (boolean) + refresh() so any screen can re-check after a payment.
//
// ── Supabase setup required ───────────────────────────────────────────────────
// Run this once in the Supabase SQL editor:
//
//   CREATE TABLE user_profiles (
//     id              uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
//     stripe_customer_id      text,
//     stripe_subscription_id  text,
//     is_premium              boolean NOT NULL DEFAULT false,
//     premium_until           timestamptz,
//     created_at              timestamptz DEFAULT now()
//   );
//   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Users can read own profile"
//     ON user_profiles FOR SELECT USING (auth.uid() = id);
//   -- The Stripe webhook Edge Function uses the service_role key and bypasses RLS.
//
// ── Stripe webhook Edge Function ─────────────────────────────────────────────
// Deploy at: supabase/functions/stripe-webhook/index.ts
// Handles: customer.subscription.created / updated / deleted
// On active:  UPDATE user_profiles SET is_premium=true,  premium_until=<period_end>
// On deleted: UPDATE user_profiles SET is_premium=false, premium_until=null
//
// ── Checkout Edge Function ────────────────────────────────────────────────────
// Deploy at: supabase/functions/create-checkout-session/index.ts
// Required env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_ID
//
//   import Stripe from "https://esm.sh/stripe@14"
//   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!)
//   Deno.serve(async (req) => {
//     const { user_id, email } = await req.json()
//     const session = await stripe.checkout.sessions.create({
//       mode: "subscription",
//       line_items: [{ price: Deno.env.get("STRIPE_PRICE_ID"), quantity: 1 }],
//       success_url: "flowpilot://payment-success",
//       cancel_url:  "flowpilot://payment-cancel",
//       customer_email: email,
//       metadata: { user_id },
//     })
//     return new Response(JSON.stringify({ url: session.url }), {
//       headers: { "Content-Type": "application/json",
//                  "Access-Control-Allow-Origin": "*" },
//     })
//   })
//
// ── Customer portal Edge Function ─────────────────────────────────────────────
// Deploy at: supabase/functions/create-portal-session/index.ts
// Allows users to manage/cancel their subscription from within the app.
//
//   Deno.serve(async (req) => {
//     const { stripe_customer_id } = await req.json()
//     const session = await stripe.billingPortal.sessions.create({
//       customer: stripe_customer_id,
//       return_url: "flowpilot://portal-return",
//     })
//     return new Response(JSON.stringify({ url: session.url }), { ... })
//   })
import { useState, useEffect, useCallback } from "react"
import { supabase } from "../lib/supabase"

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetches (or creates) the user_profiles row and resolves isPremium.
  // Returns the new value so callers can act on it immediately without waiting for re-render.
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsPremium(false); return false }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_premium, premium_until")
        .eq("id", user.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        // First login: insert a free profile row.
        await supabase.from("user_profiles").upsert({ id: user.id, is_premium: false })
        setIsPremium(false)
        return false
      }

      // premium_until = null means lifetime access (one-time payment).
      const newIsPremium = data.premium_until
        ? data.is_premium && new Date(data.premium_until) > new Date()
        : (data.is_premium ?? false)

      setIsPremium(newIsPremium)
      return newIsPremium
    } catch {
      // Table may not exist yet (before Supabase setup). Fail silently → free tier.
      setIsPremium(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [])

  return { isPremium, loading, refresh }
}
