import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { processingLogId, orderStatus } = await req.json()

    if (!processingLogId || !orderStatus) {
      return new Response(
        JSON.stringify({ error: 'processingLogId and orderStatus are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate order status
    const validStatuses = ['Parked', 'Placed', 'Backordered']
    if (!validStatuses.includes(orderStatus)) {
      return new Response(
        JSON.stringify({ error: 'Invalid order status. Must be one of: ' + validStatuses.join(', ') }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, verify that the processing log exists and has a purchase_order_guid
    const { data: processingLog, error: fetchError } = await supabaseClient
      .from('processing_logs')
      .select('purchase_order_guid')
      .eq('id', processingLogId)
      .single()

    if (fetchError) {
      console.error('Error fetching processing log:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Processing log not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!processingLog.purchase_order_guid) {
      return new Response(
        JSON.stringify({ error: 'Cannot update order status: no purchase order GUID found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update the order_status in processing_logs
    const { error: updateError } = await supabaseClient
      .from('processing_logs')
      .update({ order_status: orderStatus })
      .eq('id', processingLogId)

    if (updateError) {
      console.error('Error updating processing log:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update order status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully updated order status to ${orderStatus} for processing log ${processingLogId}`)

    return new Response(
      JSON.stringify({ success: true, orderStatus }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in update-Sales-Orders function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})