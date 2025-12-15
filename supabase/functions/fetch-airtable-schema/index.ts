import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseId, tableName } = await req.json();

    if (!baseId || !tableName) {
      return new Response(
        JSON.stringify({ error: 'baseId and tableName are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const apiKey = Deno.env.get('AIRTABLE_API_KEY');
    if (!apiKey) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    console.log('[SCHEMA FETCHER] Fetching schema for base:', baseId, 'table:', tableName);

    // Use Airtable Meta API to get table schema
    const metaUrl = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;
    
    const response = await fetch(metaUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SCHEMA FETCHER] Meta API Error:', error);
      throw new Error(`Airtable Meta API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('[SCHEMA FETCHER] Retrieved base metadata');

    // Find the specified table
    const targetTable = data.tables.find((table: any) => 
      table.name === tableName || table.id === tableName
    );
    
    if (!targetTable) {
      return new Response(
        JSON.stringify({ 
          error: `Table "${tableName}" not found in base`,
          availableTables: data.tables.map((t: any) => t.name)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Extract field information
    const fields = targetTable.fields.map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      description: field.description || null,
    }));

    console.log(`[SCHEMA FETCHER] Found ${fields.length} fields in "${targetTable.name}" table`);

    return new Response(
      JSON.stringify({
        tableId: targetTable.id,
        tableName: targetTable.name,
        fields: fields,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[SCHEMA FETCHER] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
