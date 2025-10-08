import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.0.0?target=deno";

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

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const { email, amount } = await req.json();

    if (!email || !amount) {
      return new Response(
        JSON.stringify({ error: 'email and amount are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cents = Math.round(parseFloat(amount) * 100);

    // Find Stripe Customer by email
    const customers = await stripe.customers.search({
      query: `email:'${email}'`,
    });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const customerId = customers.data[0].id;

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: cents,
      currency: 'usd',
      description: 'Custom setup fee',
    });

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
      auto_advance: true,
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    console.log('Setup fee charged:', finalizedInvoice.id, 'for customer:', email);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        invoice_id: finalizedInvoice.id,
        amount_charged: cents / 100,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error charging setup fee:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
