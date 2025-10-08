import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const { email } = await req.json();
    const siteUrl = Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'http://localhost:5173';

    const priceId = Deno.env.get('STRIPE_PRICE_MONTHLY_35');
    if (!priceId) {
      throw new Error('STRIPE_PRICE_MONTHLY_35 not configured. Please create a $35/month recurring price in Stripe.');
    }

    const form = new URLSearchParams();
    form.append('mode', 'subscription');
    form.append('line_items[0][price]', priceId);
    form.append('line_items[0][quantity]', '1');
    form.append('subscription_data[trial_period_days]', '14');
    form.append('payment_method_collection', 'always');
    form.append('allow_promotion_codes', 'true');
    form.append('success_url', `${siteUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`);
    form.append('cancel_url', `${siteUrl}/?canceled=1`);
    if (email) form.append('customer_email', String(email));

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-08-27.basil',
        'Accept': 'application/json',
      },
      body: form.toString(),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Stripe create session error:', errText);
      throw new Error('Failed to create Stripe checkout session');
    }

    const session = await resp.json();
    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: (error as any)?.message ?? String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});