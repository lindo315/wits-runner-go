
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const useSMSNotifications = () => {
  const { toast } = useToast()

  const sendSMSToRunners = async (orderData: {
    order_number: string
    merchant_name: string
    delivery_address: string
    total_amount: number
    order_id: string
  }) => {
    try {
      console.log('Sending SMS notifications to available runners...')
      
      // Get all active runners with phone numbers
      const { data: runners, error: runnersError } = await supabase
        .from('users')
        .select('id, full_name, phone_number')
        .eq('role', 'runner')
        .not('phone_number', 'is', null)

      if (runnersError) {
        console.error('Error fetching runners:', runnersError)
        return
      }

      if (!runners || runners.length === 0) {
        console.log('No runners with phone numbers found')
        return
      }

      // Prepare SMS message
      const message = `🚚 New Delivery Available!\n\nOrder: ${orderData.order_number}\nFrom: ${orderData.merchant_name}\nTo: ${orderData.delivery_address}\nAmount: R${orderData.total_amount.toFixed(2)}\n\nOpen the app to accept this delivery!`

      // Send SMS to each runner
      const smsPromises = runners.map(async (runner) => {
        if (!runner.phone_number) return

        try {
          const { error } = await supabase.functions.invoke('send-sms-notification', {
            body: {
              phone_number: runner.phone_number,
              message: message,
              order_id: orderData.order_id
            }
          })

          if (error) {
            console.error(`Error sending SMS to ${runner.full_name}:`, error)
          } else {
            console.log(`SMS sent successfully to ${runner.full_name}`)
          }
        } catch (error) {
          console.error(`Failed to send SMS to ${runner.full_name}:`, error)
        }
      })

      await Promise.allSettled(smsPromises)
      
      toast({
        title: "SMS Notifications Sent",
        description: `Notified ${runners.length} runners about the new order`,
      })

    } catch (error) {
      console.error('Error in sendSMSToRunners:', error)
      toast({
        title: "SMS Error",
        description: "Failed to send SMS notifications to runners",
        variant: "destructive",
      })
    }
  }

  const sendSMSToCustomer = async (customerData: {
    phone_number: string
    order_number: string
    status: string
    estimated_time?: string
  }) => {
    try {
      let message = `📱 Order Update: ${customerData.order_number}\n\nStatus: ${customerData.status}`
      
      if (customerData.estimated_time) {
        message += `\nEstimated delivery: ${customerData.estimated_time}`
      }

      const { error } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          phone_number: customerData.phone_number,
          message: message
        }
      })

      if (error) {
        console.error('Error sending SMS to customer:', error)
      } else {
        console.log('SMS sent successfully to customer')
      }
    } catch (error) {
      console.error('Failed to send SMS to customer:', error)
    }
  }

  return {
    sendSMSToRunners,
    sendSMSToCustomer
  }
}
