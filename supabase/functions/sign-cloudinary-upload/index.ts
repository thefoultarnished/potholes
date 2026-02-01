import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha1(string: string) {
  const buffer = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const cloudinarySecret = Deno.env.get('CLOUDINARY_API_SECRET')!
    const cloudinaryKey = Deno.env.get('CLOUDINARY_API_KEY')!

    if (!cloudinarySecret || !cloudinaryKey) {
      throw new Error("Cloudinary credentials not set in Supabase Secrets")
    }

    // Rate Limiting (10 seconds for uploads)
    const forwardedFor = req.headers.get('x-forwarded-for') || 'unknown'
    const pureIp = forwardedFor.split(',')[0].trim()
    const rateLimitKey = `${pureIp}_upload`
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: rateData } = await supabase
      .from('rate_limits')
      .select('last_request_at')
      .eq('ip_address', rateLimitKey)
      .single()

    if (rateData) {
      const lastRequest = new Date(rateData.last_request_at).getTime()
      if (Date.now() - lastRequest < 10000) {
        return new Response(JSON.stringify({ error: 'Please wait 10s between uploads' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    await supabase.from('rate_limits').upsert({ ip_address: rateLimitKey, last_request_at: new Date().toISOString() })

    // Cloudinary Signing
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "potholes";
    
    // Signature requires alphabetical order: folder -> timestamp
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${cloudinarySecret}`;
    const signature = await sha1(paramsToSign);

    return new Response(
      JSON.stringify({ 
        signature, 
        timestamp, 
        folder,
        apiKey: cloudinaryKey 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
