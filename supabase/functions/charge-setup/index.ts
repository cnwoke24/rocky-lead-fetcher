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

    const cents = Math.round(parseFloat(String(amount)) * 100);

    // Find Stripe Customer by email using Search API
    const query = `email:'${String(email).replace(/'/g, "\\'")}'`;
    const customersResp = await fetch(`https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Stripe-Version': '2025-08-27.basil',
        'Accept': 'application/json',
      }
    });

    if (!customersResp.ok) {
      const errText = await customersResp.text();
      console.error('Stripe customers search error:', errText);
      throw new Error('Failed to search Stripe customer');
    }

    const customers = await customersResp.json();

    if (!customers.data || customers.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const customerId = customers.data[0].id as string;

    // Create invoice item
    const invoiceItemForm = new URLSearchParams();
    invoiceItemForm.append('customer', customerId);
    invoiceItemForm.append('amount', String(cents));
    invoiceItemForm.append('currency', 'usd');
    invoiceItemForm.append('description', 'Custom setup fee');

    const invoiceItemResp = await fetch('https://api.stripe.com/v1/invoiceitems', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-08-27.basil',
        'Accept': 'application/json',
      },
      body: invoiceItemForm.toString(),
    });

    if (!invoiceItemResp.ok) {
      const errText = await invoiceItemResp.text();
      console.error('Stripe invoice item error:', errText);
      throw new Error('Failed to create invoice item');
    }

    // Create invoice
    const invoiceForm = new URLSearchParams();
    invoiceForm.append('customer', customerId);
    invoiceForm.append('collection_method', 'charge_automatically');
    invoiceForm.append('auto_advance', 'true');

    const invoiceResp = await fetch('https://api.stripe.com/v1/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-08-27.basil',
        'Accept': 'application/json',
      },
      body: invoiceForm.toString(),
    });

    if (!invoiceResp.ok) {
      const errText = await invoiceResp.text();
      console.error('Stripe create invoice error:', errText);
      throw new Error('Failed to create invoice');
    }

    const invoice = await invoiceResp.json();

    // Finalize invoice
    const finalizeResp = await fetch(`https://api.stripe.com/v1/invoices/${invoice.id}/finalize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Stripe-Version': '2025-08-27.basil',
        'Accept': 'application/json',
      }
    });

    if (!finalizeResp.ok) {
      const errText = await finalizeResp.text();
      console.error('Stripe finalize invoice error:', errText);
      throw new Error('Failed to finalize invoice');
    }

    const finalizedInvoice = await finalizeResp.json();

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
      JSON.stringify({ error: (error as any)?.message ?? String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});