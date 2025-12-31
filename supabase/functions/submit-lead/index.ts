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

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

interface LeadPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  createdAt: string;
}

async function createAirtableRecord(payload: LeadPayload): Promise<void> {
  const apiKey = Deno.env.get('AIRTABLE_API_KEY');
  const baseId = Deno.env.get('AIRTABLE_BASE_ID');
  const tableName = Deno.env.get('AIRTABLE_TABLE_NAME') || 'Leads';

  if (!apiKey || !baseId) {
    throw new Error('Airtable configuration missing');
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        fields: {
          'Name': payload.name,
          'Company': payload.company,
          'Email': payload.email,
          'Phone': payload.phone,
          'Source': payload.source,
          'Created At': payload.createdAt,
        }
      }]
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[AIRTABLE] Error:', error);
    throw new Error(`Airtable error: ${response.status}`);
  }

  console.log('[AIRTABLE] Lead created successfully');
}

async function sendSlackNotification(payload: LeadPayload): Promise<void> {
  const webhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  
  if (!webhookUrl) {
    console.warn('[SLACK] Webhook URL not configured, skipping');
    return;
  }

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 New Rocky Demo Request',
          emoji: true,
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${payload.name}` },
          { type: 'mrkdwn', text: `*Company:*\n${payload.company}` },
          { type: 'mrkdwn', text: `*Email:*\n${payload.email}` },
          { type: 'mrkdwn', text: `*Phone:*\n${payload.phone}` },
        ]
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `Source: ${payload.source} | Time: ${payload.createdAt}` }
        ]
      }
    ]
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
      console.log('[SLACK] Notification sent successfully');
    }
  } catch (error) {
    console.error('[SLACK] Failed to send notification:', error);
  }
}

async function triggerN8nWebhook(payload: LeadPayload): Promise<void> {
  const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
  
  if (!webhookUrl) {
    console.warn('[N8N] Webhook URL not configured, skipping');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[N8N] Error:', await response.text());
    } else {
      console.log('[N8N] Webhook triggered successfully');
    }
  } catch (error) {
    console.error('[N8N] Failed to trigger webhook:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    if (isRateLimited(clientIp)) {
      console.warn('[RATE_LIMIT] Request blocked from:', clientIp);
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { name, company, email, phone } = body;

    // Validate required fields
    if (!name || !company || !email || !phone) {
      return new Response(
        JSON.stringify({ success: false, error: 'All fields are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone number
    if (!validatePhone(phone)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid phone number (at least 10 digits).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: LeadPayload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      source: 'Homepage Popup',
      createdAt: new Date().toISOString(),
    };

    console.log('[SUBMIT_LEAD] Processing lead:', { name: payload.name, company: payload.company, email: payload.email });

    // Create Airtable record (primary - must succeed)
    await createAirtableRecord(payload);

    // Send Slack and n8n notifications in parallel (non-blocking)
    await Promise.allSettled([
      sendSlackNotification(payload),
      triggerN8nWebhook(payload),
    ]);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[SUBMIT_LEAD] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
