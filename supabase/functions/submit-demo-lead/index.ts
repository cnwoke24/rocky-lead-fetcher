import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return true;
  }
  
  record.count++;
  return false;
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

interface DemoLeadPayload {
  name: string;
  phone: string;
  serviceType: string;
  date: string;
  budget: string;
  notes?: string;
  source: string;
  createdAt: string;
}

async function sendSlackNotification(payload: DemoLeadPayload): Promise<void> {
  const webhookUrl = Deno.env.get('DEMO_SLACK_WEBHOOK_URL');
  
  if (!webhookUrl) {
    console.warn('[SLACK] Demo webhook URL not configured, skipping');
    return;
  }

  const message = {
    text: `New Rocky Demo Request
Name: ${payload.name}
Phone: ${formatPhoneDisplay(payload.phone)}
Service Type: ${payload.serviceType}
Date: ${payload.date}
Budget: ${payload.budget}
Notes: ${payload.notes || 'N/A'}`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('[SLACK] Error:', await response.text());
    } else {
      console.log('[SLACK] Notification sent successfully to rocky demo channel');
    }
  } catch (error) {
    console.error('[SLACK] Failed to send notification:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    if (isRateLimited(clientIp)) {
      console.warn('[RATE_LIMIT] Request blocked from:', clientIp);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { name, phone, serviceType, date, budget, notes } = body;

    // Validate required fields
    if (!name || !phone || !serviceType || !date || !budget) {
      return new Response(
        JSON.stringify({ success: false, error: 'All required fields must be filled.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number
    if (!validatePhone(phone)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid 10-digit US phone number.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: DemoLeadPayload = {
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      serviceType: serviceType.trim(),
      date: date.trim(),
      budget: budget.trim(),
      notes: notes?.trim() || '',
      source: 'Demo Page',
      createdAt: new Date().toISOString(),
    };

    console.log('[SUBMIT_DEMO_LEAD] Processing demo request:', { 
      name: payload.name, 
      serviceType: payload.serviceType,
      date: payload.date 
    });

    // Send to Slack
    await sendSlackNotification(payload);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SUBMIT_DEMO_LEAD] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
