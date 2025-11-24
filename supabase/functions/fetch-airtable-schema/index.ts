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
    const apiKey = Deno.env.get('AIRTABLE_API_KEY');
    if (!apiKey) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    const baseId = 'appNY035P7OCHTYKt';
    const tableName = 'Calls';

    console.log('[SCHEMA FETCHER] Fetching schema for base:', baseId);

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

    // Find the "Calls" table
    const callsTable = data.tables.find((table: any) => table.name === tableName);
    
    if (!callsTable) {
      throw new Error(`Table "${tableName}" not found in base`);
    }

    // Extract field information
    const fields = callsTable.fields.map((field: any) => ({
      name: field.name,
      type: field.type,
      options: field.options || null,
    }));

    console.log(`[SCHEMA FETCHER] Found ${fields.length} fields in "${tableName}" table`);

    // Create the mapping for verification
    const fieldMapping = {
      tableName: callsTable.name,
      tableId: callsTable.id,
      totalFields: fields.length,
      fields: fields,
      
      // Expected mapping for verification
      expectedMapping: {
        'clinic_id': fields.find((f: any) => f.name === 'clinic_id'),
        'Created time': fields.find((f: any) => f.name === 'Created time'),
        'Caller Name': fields.find((f: any) => f.name === 'Caller Name'),
        'Phone Number': fields.find((f: any) => f.name === 'Phone Number'),
        'Email Address': fields.find((f: any) => f.name === 'Email Address'),
        'Patient Type': fields.find((f: any) => f.name === 'Patient Type'),
        'Call Summary': fields.find((f: any) => f.name === 'Call Summary'),
        'Intake URL Sent': fields.find((f: any) => f.name === 'Intake URL Sent'),
        'Call Status': fields.find((f: any) => f.name === 'Call Status'),
        'Duration Seconds': fields.find((f: any) => f.name === 'Duration Seconds'),
        'Needs Callback': fields.find((f: any) => f.name === 'Needs Callback'),
      },
      
      // Verification status
      verification: {
        allExpectedFieldsFound: true,
        missingFields: [] as string[],
        unexpectedFields: fields.filter((f: any) => 
          ![
            'clinic_id',
            'Created time',
            'Caller Name',
            'Phone Number',
            'Email Address',
            'Patient Type',
            'Call Summary',
            'Intake URL Sent',
            'Call Status',
            'Duration Seconds',
            'Needs Callback'
          ].includes(f.name)
        ),
      }
    };

    // Check for missing expected fields
    const expectedFields = [
      'clinic_id',
      'Created time',
      'Caller Name',
      'Phone Number',
      'Email Address',
      'Patient Type',
      'Call Summary',
      'Intake URL Sent',
      'Call Status',
      'Duration Seconds',
      'Needs Callback'
    ];

    expectedFields.forEach(fieldName => {
      if (!fields.find((f: any) => f.name === fieldName)) {
        fieldMapping.verification.missingFields.push(fieldName);
        fieldMapping.verification.allExpectedFieldsFound = false;
      }
    });

    console.log('[SCHEMA FETCHER] Verification complete:', {
      allFieldsFound: fieldMapping.verification.allExpectedFieldsFound,
      missingCount: fieldMapping.verification.missingFields.length,
      unexpectedCount: fieldMapping.verification.unexpectedFields.length,
    });

    return new Response(JSON.stringify(fieldMapping, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[SCHEMA FETCHER] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to fetch Airtable schema'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
