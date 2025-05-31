
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  phone_number: string
  message: string
  order_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phone_number, message, order_id }: SMSRequest = await req.json()

    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const clickSendApiKey = Deno.env.get('CLICKSEND_API_KEY')
    if (!clickSendApiKey) {
      throw new Error('ClickSend API key not configured')
    }

    // ClickSend API endpoint
    const clickSendUrl = 'https://rest.clicksend.com/v3/sms/send'
    
    // Prepare SMS data for ClickSend
    const smsData = {
      messages: [
        {
          body: message,
          to: phone_number,
          source: "sdk"
        }
      ]
    }

    console.log('Sending SMS to:', phone_number)
    console.log('Message:', message)

    // Send SMS via ClickSend
    const response = await fetch(clickSendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(clickSendApiKey + ':')
      },
      body: JSON.stringify(smsData)
    })

    const result = await response.json()
    console.log('ClickSend response:', result)

    if (!response.ok) {
      throw new Error(`ClickSend API error: ${result.response_msg || 'Unknown error'}`)
    }

    // Log SMS notification in database if order_id is provided
    if (order_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase.from('push_notifications').insert({
        title: 'SMS Notification Sent',
        body: `SMS sent to ${phone_number}: ${message}`,
        data: { 
          type: 'sms',
          phone_number,
          order_id,
          clicksend_response: result
        }
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        clicksend_response: result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending SMS:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send SMS', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
