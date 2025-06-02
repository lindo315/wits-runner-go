
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  orderTimestamp: string;
  priority?: string;
  specialInstructions?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

const formatTimestamp = (timestamp: string): string => {
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg'
  }).format(new Date(timestamp));
};

const generateEmailTemplate = (orderData: OrderNotificationRequest): string => {
  const priorityBadge = orderData.priority === 'urgent' 
    ? '<span style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">URGENT</span>'
    : orderData.priority === 'high'
    ? '<span style="background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">HIGH PRIORITY</span>'
    : '';

  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🍽️ New Nutrix Order!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${orderData.orderNumber}</p>
          ${priorityBadge ? `<div style="margin-top: 10px;">${priorityBadge}</div>` : ''}
        </div>

        <!-- Order Summary -->
        <div style="padding: 30px 20px;">
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">Order Summary</h2>
            <div style="display: grid; gap: 10px;">
              <div><strong>Order ID:</strong> ${orderData.orderId}</div>
              <div><strong>Order Number:</strong> ${orderData.orderNumber}</div>
              <div><strong>Order Time:</strong> ${formatTimestamp(orderData.orderTimestamp)}</div>
              <div><strong>Total Amount:</strong> <span style="color: #059669; font-weight: bold; font-size: 18px;">${formatCurrency(orderData.totalAmount)}</span></div>
            </div>
          </div>

          <!-- Customer Information -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">👤 Customer Information</h3>
            <div style="background-color: #fefefe; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="margin-bottom: 10px;"><strong>Name:</strong> ${orderData.customerName}</div>
              <div style="margin-bottom: 10px;"><strong>Phone:</strong> <a href="tel:${orderData.customerPhone}" style="color: #3b82f6; text-decoration: none;">${orderData.customerPhone}</a></div>
              ${orderData.customerEmail ? `<div style="margin-bottom: 10px;"><strong>Email:</strong> <a href="mailto:${orderData.customerEmail}" style="color: #3b82f6; text-decoration: none;">${orderData.customerEmail}</a></div>` : ''}
              <div><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</div>
            </div>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🛍️ Order Items</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; background-color: #fefefe; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 12px 8px; text-align: left; font-weight: bold; color: #374151;">Item</th>
                    <th style="padding: 12px 8px; text-align: center; font-weight: bold; color: #374151;">Qty</th>
                    <th style="padding: 12px 8px; text-align: right; font-weight: bold; color: #374151;">Price</th>
                    <th style="padding: 12px 8px; text-align: right; font-weight: bold; color: #374151;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Order Totals -->
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>${formatCurrency(orderData.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Delivery Fee:</span>
              <span>${formatCurrency(orderData.deliveryFee)}</span>
            </div>
            <hr style="margin: 12px 0; border: none; border-top: 1px solid #d1d5db;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #059669;">
              <span>Total:</span>
              <span>${formatCurrency(orderData.totalAmount)}</span>
            </div>
          </div>

          ${orderData.specialInstructions ? `
          <!-- Special Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📝 Special Instructions</h3>
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; color: #92400e;">
              ${orderData.specialInstructions}
            </div>
          </div>
          ` : ''}

          <!-- Call to Action -->
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${Deno.env.get('DASHBOARD_URL') || 'https://nutrix-runner-go.vercel.app/'}" 
               style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s;">
              🚚 View in Dashboard
            </a>
          </div>

          <div style="text-align: center; font-size: 14px; color: #6b7280;">
            <p>This order was placed at ${formatTimestamp(orderData.orderTimestamp)}</p>
            <p>Please ensure timely delivery for optimal customer satisfaction.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            © 2024 Nutrix Eats. This is an automated notification.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendOrderNotification = async (orderData: OrderNotificationRequest): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const deliveryTeamEmail = Deno.env.get("DELIVERY_TEAM_EMAIL");
    
    if (!deliveryTeamEmail) {
      throw new Error("DELIVERY_TEAM_EMAIL environment variable not set");
    }

    const subject = `New Nutrix Order #${orderData.orderNumber} - ${orderData.customerName}${orderData.priority === 'urgent' ? ' [URGENT]' : ''}`;
    
    const emailResponse = await resend.emails.send({
      from: "Nutrix Eats <support@nutrixeats.co.za>",
      to: [deliveryTeamEmail],
      subject,
      html: generateEmailTemplate(orderData),
    });

    console.log("Email sent successfully:", emailResponse);

    return {
      success: true,
      messageId: emailResponse.data?.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderNotificationRequest = await req.json();

    // Validate required fields
    if (!orderData.orderId || !orderData.customerName || !orderData.customerPhone) {
      return new Response(
        JSON.stringify({ error: "Missing required order data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Attempt to send email with retry logic
    let result;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      result = await sendOrderNotification(orderData);
      
      if (result.success) {
        break;
      }

      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Email send failed, retrying... (attempt ${retryCount + 1}/${maxRetries})`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    if (!result.success) {
      console.error(`Failed to send email after ${maxRetries} attempts:`, result.error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email notification", 
          details: result.error,
          retryCount 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.messageId,
        message: "Order notification sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
