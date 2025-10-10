import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    console.log("Webhook event received:", event.type);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle subscription checkout completion
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Check if this is a subscription or one-time payment
      if (session.mode === "subscription") {
        console.log("Subscription checkout completed:", session.id);
        
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        
        const customer = session.customer as string;
        
        // Find user by email
        const customerDetails = await stripe.customers.retrieve(customer);
        const email = (customerDetails as any).email;
        
        if (email) {
          const { data: users } = await supabaseClient.auth.admin.listUsers();
          const user = users.users.find(u => u.email === email);
          
          if (user) {
            // Update or create subscription record
            await supabaseClient
              .from("subscriptions")
              .upsert({
                user_id: user.id,
                stripe_customer_id: customer,
                stripe_subscription_id: subscription.id,
                status: subscription.status === "trialing" ? "trial" : "active",
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, {
                onConflict: 'user_id'
              });
            
            console.log("Subscription record updated for user:", user.id);
          }
        }
      } else {
        // Handle one-time payment (setup fee)
        const userId = session.metadata?.user_id;
        const agreementId = session.metadata?.agreement_id;

        console.log("One-time payment completed for user:", userId);

        if (userId && agreementId) {
          // Update agreement status
          await supabaseClient
            .from("agreements")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", agreementId);

          // Add billing history
          await supabaseClient
            .from("billing_history")
            .insert({
              user_id: userId,
              amount_cents: session.amount_total || 0,
              stripe_payment_id: session.payment_intent as string,
              description: "Setup fee payment",
              status: "completed",
            });

          console.log("Agreement and billing updated successfully");
        }
      }
    }

    // Handle subscription updates
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscription.id);
      
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const email = (customer as any).email;
      
      if (email) {
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);
        
        if (user) {
          await supabaseClient
            .from("subscriptions")
            .update({
              status: subscription.status === "trialing" ? "trial" : subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", user.id);
          
          console.log("Subscription status updated for user:", user.id);
        }
      }
    }

    // Handle subscription deletion/cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription deleted:", subscription.id);
      
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      const email = (customer as any).email;
      
      if (email) {
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const user = users.users.find(u => u.email === email);
        
        if (user) {
          await supabaseClient
            .from("subscriptions")
            .update({
              status: "canceled",
            })
            .eq("user_id", user.id);
          
          console.log("Subscription canceled for user:", user.id);
        }
      }
    }

    // Handle payment failure
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Payment failed for invoice:", invoice.id);
      
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        const email = (customer as any).email;
        
        if (email) {
          const { data: users } = await supabaseClient.auth.admin.listUsers();
          const user = users.users.find(u => u.email === email);
          
          if (user) {
            await supabaseClient
              .from("subscriptions")
              .update({
                status: "past_due",
              })
              .eq("user_id", user.id);
            
            console.log("Subscription marked past_due for user:", user.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
