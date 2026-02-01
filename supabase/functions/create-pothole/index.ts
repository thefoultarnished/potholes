import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image_url, location, severity, votes, created_at } = await req.json()

    // Basic validation
    if (!image_url || !location || severity === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: image_url, location, severity' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for IP-based Rate Limiting (1 request per 10 seconds)
    const forwardedFor = req.headers.get('x-forwarded-for') || 'unknown'
    const clientIp = forwardedFor.split(',')[0].trim()
    console.log(`[RateLimit] Raw: ${forwardedFor} -> Extracted: ${clientIp}`)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const rawServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabaseServiceKey = rawServiceKey ? rawServiceKey.trim() : ''
    
    if (!supabaseServiceKey) {
       throw new Error(`Configuration Error: SERVICE_ROLE_KEY is missing`)
    }

    const rateLimitUrl = `${supabaseUrl}/rest/v1/rate_limits`
    
    // 1. Check last request time for this IP
    const rateCheckRes = await fetch(`${rateLimitUrl}?ip_address=eq.${clientIp}&select=last_request_at`, {
      headers: { 'apikey': supabaseServiceKey, 'Authorization': `Bearer ${supabaseServiceKey}` }
    })
    
    if (rateCheckRes.ok) {
      const rateData = await rateCheckRes.json()
      if (rateData && rateData.length > 0) {
        const lastRequest = new Date(rateData[0].last_request_at).getTime()
        const now = Date.now()
        // 10 seconds cooldown
        if (now - lastRequest < 10000) {
           return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please wait 10 seconds.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // 2. Upsert the new timestamp for this IP
    await fetch(rateLimitUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ ip_address: clientIp, last_request_at: new Date().toISOString() })
    })

    // Create Supabase client with service role key (bypasses RLS)

    const dbUrl = `${supabaseUrl}/rest/v1/potholes`
    const dbPayload = {
        image_url,
        location: typeof location === 'object' ? JSON.stringify(location) : location,
        severity,
        votes: votes || 0,
        created_at: created_at || new Date().toISOString()
    }

    const response = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'x-client-info': 'edge-function-manual'
      },
      body: JSON.stringify(dbPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DB Insert Error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `Database error (V3): ${response.status} - ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    // data is an array [ { ... } ]
    const record = data[0]

    return new Response(
      JSON.stringify(data),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
