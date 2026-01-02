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

  type FieldNameMap = {
    name: string;
    company: string;
    email: string;
    phone: string;
    source: string;
    createdAt: string;
  };

  const envFieldMap: Partial<FieldNameMap> = {
    name: Deno.env.get('AIRTABLE_LEADS_FIELD_NAME') || undefined,
    company: Deno.env.get('AIRTABLE_LEADS_FIELD_COMPANY') || undefined,
    email: Deno.env.get('AIRTABLE_LEADS_FIELD_EMAIL') || undefined,
    phone: Deno.env.get('AIRTABLE_LEADS_FIELD_PHONE') || undefined,
    source: Deno.env.get('AIRTABLE_LEADS_FIELD_SOURCE') || undefined,
    createdAt: Deno.env.get('AIRTABLE_LEADS_FIELD_CREATED_AT') || undefined,
  };

  const hasEnvOverrides = Object.values(envFieldMap).some(Boolean);

  const candidates: FieldNameMap[] = [
    ...(hasEnvOverrides
      ? [
          {
            name: envFieldMap.name || 'Name',
            company: envFieldMap.company || 'Company',
            email: envFieldMap.email || 'Email',
            phone: envFieldMap.phone || 'Phone',
            source: envFieldMap.source || 'Source',
            createdAt: envFieldMap.createdAt || 'Created At',
          },
        ]
      : []),
    // Original mapping
    {
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      source: 'Source',
      createdAt: 'Created At',
    },
    // Common variants seen in other tables
    {
      name: 'Name',
      company: 'Company',
      email: 'Email Address',
      phone: 'Phone Number',
      source: 'Source',
      createdAt: 'Created At',
    },
    {
      name: 'Full Name',
      company: 'Company',
      email: 'Email Address',
      phone: 'Phone Number',
      source: 'Source',
      createdAt: 'Created At',
    },
    {
      name: 'Name',
      company: 'Company Name',
      email: 'Email Address',
      phone: 'Phone Number',
      source: 'Source',
      createdAt: 'Created At',
    },
  ];

  const buildFields = (m: FieldNameMap) => ({
    [m.name]: payload.name,
    [m.company]: payload.company,
    [m.email]: payload.email,
    [m.phone]: payload.phone,
    [m.source]: payload.source,
    [m.createdAt]: payload.createdAt,
  });

  let lastErrorText = '';

  for (let attempt = 0; attempt < candidates.length; attempt++) {
    const mapping = candidates[attempt];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: buildFields(mapping),
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('[AIRTABLE] Lead created successfully');
      return;
    }

    lastErrorText = await response.text();
    console.error('[AIRTABLE] Error:', lastErrorText);

    // Retry on Airtable's "UNKNOWN_FIELD_NAME" (schema mismatch) with our next candidate mapping.
    // Example: {"error":{"type":"UNKNOWN_FIELD_NAME","message":"Unknown field name: \"Email\""}}
    let errorType: string | undefined;
    try {
      const parsed = JSON.parse(lastErrorText);
      errorType = parsed?.error?.type;
    } catch {
      // ignore
    }

    const shouldRetry = response.status === 422 && errorType === 'UNKNOWN_FIELD_NAME' && attempt < candidates.length - 1;
    if (shouldRetry) {
      console.warn('[AIRTABLE] Field mismatch; retrying with alternate field names.');
      continue;
    }

    throw new Error(`Airtable error: ${response.status}`);
  }

  throw new Error(`Airtable error: ${lastErrorText || 'unknown'}`);
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
