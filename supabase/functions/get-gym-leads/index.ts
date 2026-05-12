import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIN = "1224";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pin } = await req.json();
    if (pin !== PIN) {
      return new Response(JSON.stringify({ error: 'Invalid PIN' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, key);

    const [{ data: leads }, { data: visits }] = await Promise.all([
      admin.from('gym_leads').select('*').order('created_at', { ascending: false }),
      admin.from('page_visits').select('visitor_id,total_time_seconds').eq('page_path', '/gym'),
    ]);

    const v = visits || [];
    const totalSeconds = v.reduce((sum: number, r: any) => sum + (r.total_time_seconds || 0), 0);
    const uniqueVisitors = v.length;

    return new Response(JSON.stringify({
      leads: leads || [],
      stats: {
        uniqueVisitors,
        totalSeconds,
        avgSeconds: uniqueVisitors ? Math.round(totalSeconds / uniqueVisitors) : 0,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('[GET_GYM_LEADS]', err);
    return new Response(JSON.stringify({ error: 'failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
