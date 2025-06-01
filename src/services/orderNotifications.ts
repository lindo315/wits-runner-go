
import { supabase } from "@/integrations/supabase/client"

export const notifyRunnersOfNewOrder = async (orderId: string) => {
  try {
    console.log('Fetching order details for SMS notification...')
    
    // Get order details with merchant and address information
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        merchants (name),
        customer_addresses (full_address)
      `)
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('Error fetching order for SMS:', orderError)
      return
    }

    if (!orderData) {
      console.log('Order not found for SMS notification')
      return
    }

    // Get all active runners with phone numbers
    const { data: runners, error: runnersError } = await supabase
      .from('users')
      .select('id, full_name, phone_number')
      .eq('role', 'runner')
      .not('phone_number', 'is', null)

    if (runnersError) {
      console.error('Error fetching runners for SMS:', runnersError)
      return
    }

    if (!runners || runners.length === 0) {
      console.log('No runners with phone numbers found')
      return
    }

    // Prepare SMS message
    const merchantName = orderData.merchants?.name || 'Unknown Restaurant'
    const deliveryAddress = orderData.customer_addresses?.full_address || 'Unknown Address'
    
    const message = `🚚 New Delivery Available!\n\nOrder: ${orderData.order_number}\nFrom: ${merchantName}\nTo: ${deliveryAddress}\nAmount: R${orderData.total_amount.toFixed(2)}\n\nOpen the app to accept this delivery!`

    // Send SMS to each runner
    const smsPromises = runners.map(async (runner) => {
      if (!runner.phone_number) return

      try {
        const { error } = await supabase.functions.invoke('send-sms-notification', {
          body: {
            phone_number: runner.phone_number,
            message: message,
            order_id: orderId
          }
        })

        if (error) {
          console.error(`Error sending SMS to ${runner.full_name}:`, error)
        } else {
          console.log(`SMS sent successfully to ${runner.full_name} (${runner.phone_number})`)
        }
      } catch (error) {
        console.error(`Failed to send SMS to ${runner.full_name}:`, error)
      }
    })

    await Promise.allSettled(smsPromises)
    console.log(`SMS notifications sent to ${runners.length} runners`)

  } catch (error) {
    console.error('Error in notifyRunnersOfNewOrder:', error)
  }
}
