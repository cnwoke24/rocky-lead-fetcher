// Airtable API client with multi-tenant filtering

export interface AirtableCall {
  id: string;
  fields: {
    clinic_id: string;
    call_timestamp: string;
    patient_type: "new" | "existing";
    channel: "email" | "sms";
    intake_link_sent?: string;
    call_summary?: string;
    caller_phone?: string;
    caller_email?: string;
  };
  createdTime: string;
}

export interface AirtableResponse {
  records: AirtableCall[];
  offset?: string;
}

/**
 * Fetch calls from Airtable filtered by clinic_id
 * @param baseId - Airtable base ID
 * @param tableName - Table name (default: 'Calls')
 * @param clinicId - Clinic ID to filter by
 * @param options - Additional fetch options (maxRecords, sort, etc.)
 */
export async function fetchAirtableCalls(
  baseId: string,
  tableName: string,
  clinicId: string,
  options?: {
    maxRecords?: number;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    filterByFormula?: string;
  }
): Promise<AirtableCall[]> {
  const apiKey = Deno.env.get('AIRTABLE_API_KEY');
  if (!apiKey) {
    throw new Error('AIRTABLE_API_KEY not configured');
  }

  // Build filter formula - ALWAYS filter by clinic_id
  const clinicFilter = `{clinic_id} = '${clinicId}'`;
  const filterByFormula = options?.filterByFormula
    ? `AND(${clinicFilter}, ${options.filterByFormula})`
    : clinicFilter;

  // Build URL with query params
  const params = new URLSearchParams({
    filterByFormula,
  });

  if (options?.maxRecords) {
    params.append('maxRecords', options.maxRecords.toString());
  }

  if (options?.sort) {
    options.sort.forEach((sort, index) => {
      params.append(`sort[${index}][field]`, sort.field);
      params.append(`sort[${index}][direction]`, sort.direction);
    });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params}`;

  console.log('[AIRTABLE] Fetching calls for clinic:', clinicId);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[AIRTABLE] API Error:', error);
    throw new Error(`Airtable API error: ${response.status} - ${error}`);
  }

  const data: AirtableResponse = await response.json();
  console.log(`[AIRTABLE] Retrieved ${data.records.length} calls`);

  return data.records;
}

/**
 * Calculate statistics from call records
 */
export function calculateCallStats(calls: AirtableCall[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const callsToday = calls.filter(call => 
    new Date(call.fields.call_timestamp) >= todayStart
  );

  const newPatientsToday = callsToday.filter(
    call => call.fields.patient_type === 'new'
  ).length;

  const existingPatientsToday = callsToday.filter(
    call => call.fields.patient_type === 'existing'
  ).length;

  const intakeLinksSent = callsToday.filter(
    call => call.fields.intake_link_sent
  ).length;

  const emailsSent = callsToday.filter(
    call => call.fields.channel === 'email'
  ).length;

  const emailPercentage = callsToday.length > 0 
    ? Math.round((emailsSent / callsToday.length) * 100)
    : 0;

  // Weekly summary (last 7 days)
  const weeklyData: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    weeklyData[dateKey] = 0;
  }

  calls.forEach(call => {
    const callDate = new Date(call.fields.call_timestamp);
    const dateKey = callDate.toISOString().split('T')[0];
    if (dateKey in weeklyData) {
      weeklyData[dateKey]++;
    }
  });

  return {
    totalCallsToday: callsToday.length,
    newPatientsToday,
    existingPatientsToday,
    intakeLinksSent,
    emailPercentage,
    weeklyData: Object.entries(weeklyData).map(([date, count]) => ({
      date,
      count,
    })),
  };
}