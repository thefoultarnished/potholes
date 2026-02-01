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

    // Create Supabase client with service role key (bypasses RLS)
    // Direct REST request to ensure strict Service Role usage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const rawServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabaseServiceKey = rawServiceKey ? rawServiceKey.trim() : ''
    
    if (!supabaseServiceKey) {
       throw new Error(`Configuration Error: SERVICE_ROLE_KEY is missing (Length: ${rawServiceKey?.length || 0})`)
    }

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
