
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  orderNumber: string;
  customerName: string;
  items: string[];
  totalAmount: number;
  runnerPhones?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, customerName, items, totalAmount, runnerPhones } = await req.json() as SMSRequest;
    
    console.log('SMS notification request:', { orderNumber, customerName, items, totalAmount });

    // Get ClickSend credentials from environment
    const clicksendUsername = Deno.env.get('CLICKSEND_USERNAME');
    const clicksendApiKey = Deno.env.get('CLICKSEND_API_KEY');
    const deliveryPhoneNumber = Deno.env.get('DELIVERY_PHONE_NUMBER');

    if (!clicksendUsername || !clicksendApiKey || !deliveryPhoneNumber) {
      throw new Error('ClickSend credentials or delivery phone number not configured');
    }

    // Format items list
    const itemsList = items.slice(0, 3).join(', ') + (items.length > 3 ? '...' : '');
    
    // Create SMS message
    const message = `New order #${orderNumber} from ${customerName}. Items: ${itemsList}. Total: R${totalAmount.toFixed(2)}. Check delivery dashboard.`;

    // Prepare phone numbers - use provided list or default delivery number
    const phoneNumbers = runnerPhones && runnerPhones.length > 0 ? runnerPhones : [deliveryPhoneNumber];

    console.log('Sending SMS to:', phoneNumbers);
    console.log('Message:', message);

    // Create ClickSend messages array
    const messages = phoneNumbers.map(phone => ({
      to: phone.replace(/\s+/g, ''), // Remove spaces from phone number
      body: message,
      from: 'Delivery'
    }));

    // Send SMS via ClickSend API
    const clicksendResponse = await fetch('https://rest.clicksend.com/v3/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${clicksendUsername}:${clicksendApiKey}`)
      },
      body: JSON.stringify({
        messages: messages
      })
    });

    const result = await clicksendResponse.json();
    
    if (!clicksendResponse.ok) {
      console.error('ClickSend API error:', result);
      throw new Error(`ClickSend API error: ${result.response_msg || 'Unknown error'}`);
    }

    console.log('SMS sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS notifications sent successfully',
        sentTo: phoneNumbers.length,
        clicksendResponse: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending SMS:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send SMS notifications' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
