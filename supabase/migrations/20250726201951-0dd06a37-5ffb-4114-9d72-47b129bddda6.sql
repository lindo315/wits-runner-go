-- Add RLS policies to allow runners to view customer addresses for their assigned orders
CREATE POLICY "Runners can view delivery addresses for assigned orders" 
ON public.customer_addresses 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.delivery_address_id = customer_addresses.id 
    AND orders.runner_id = auth.uid()
  )
);

-- Add RLS policy to allow runners to view order items for their assigned orders
CREATE POLICY "Runners can view order items for assigned orders" 
ON public.order_items 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.runner_id = auth.uid()
  )
);

-- Also add policy for runners to view order items for unassigned orders they might accept
CREATE POLICY "Runners can view order items for available orders" 
ON public.order_items 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = 'runner' AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.runner_id IS NULL
    AND orders.status IN ('ready', 'pending')
    AND orders.payment_status = 'paid'
  )
);