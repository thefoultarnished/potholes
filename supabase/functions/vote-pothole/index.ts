import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id } = await req.json()
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing pothole ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Increment votes
    const { data: current } = await supabase.from('potholes').select('votes').eq('id', id).single()
    if (!current) throw new Error('Pothole not found')

    const { error: updateError } = await supabase.from('potholes').update({ votes: (current.votes || 0) + 1 }).eq('id', id)
    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: 'Success', new_votes: (current.votes || 0) + 1 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
