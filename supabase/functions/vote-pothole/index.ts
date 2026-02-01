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
    const { id } = await req.json()

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing pothole ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!

    if (!supabaseServiceKey) {
       throw new Error(`Configuration Error: SERVICE_ROLE_KEY is missing`)
    }

    // Call RPC or Direct Update
    // Since we want to increment safely and atomically, it is best to use an RPC (Stored Procedure)
    // But since you might not want to create an SQL function right now, we can just fetch -> increment -> update
    // OR BETTER: Use the rpc 'increment_vote' if we created it.
    // Let's stick to simple REST for now, BUT beware: REST updates are not atomic without RPC.
    
    // Actually, let's create a quick Client connection to run the update
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Using the 'rpc' is the only atomic way. 
    // If not, we risk race conditions (two people vote at once = only +1 count).
    // Let's try to just do a simple update for now, accepting the race condition risk as it's a small app.
    
    // Fetch current
    const { data: current, error: fetchError } = await supabase
      .from('potholes')
      .select('votes')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
        throw new Error('Pothole not found')
    }

    const newVotes = (current.votes || 0) + 1

    const { error: updateError } = await supabase
      .from('potholes')
      .update({ votes: newVotes })
      .eq('id', id)

    if (updateError) {
        throw updateError
    }

    return new Response(
      JSON.stringify({ message: 'Voted successfully', new_votes: newVotes }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Vote error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
