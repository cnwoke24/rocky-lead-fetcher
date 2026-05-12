import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { visitorId, pagePath, addSeconds } = await req.json();
    if (!visitorId || !pagePath) {
      return new Response(JSON.stringify({ error: 'visitorId and pagePath required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, key);

    const seconds = Math.max(0, Math.min(3600, Number(addSeconds) || 0));

    // Try to find existing row
    const { data: existing } = await admin
      .from('page_visits')
      .select('id, total_time_seconds')
      .eq('visitor_id', visitorId)
      .eq('page_path', pagePath)
      .maybeSingle();

    if (existing) {
      await admin
        .from('page_visits')
        .update({
          total_time_seconds: (existing.total_time_seconds || 0) + seconds,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await admin.from('page_visits').insert({
        visitor_id: visitorId,
        page_path: pagePath,
        total_time_seconds: seconds,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[TRACK_PAGE_VISIT]', err);
    return new Response(JSON.stringify({ error: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
