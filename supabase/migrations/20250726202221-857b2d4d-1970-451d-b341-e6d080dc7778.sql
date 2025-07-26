-- Add RLS policy to allow runners to view delivery addresses for available orders they can accept
CREATE POLICY "Runners can view delivery addresses for available orders" 
ON public.customer_addresses 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = 'runner' AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.delivery_address_id = customer_addresses.id 
    AND orders.runner_id IS NULL
    AND orders.status IN ('ready', 'pending')
    AND orders.payment_status = 'paid'
  )
);