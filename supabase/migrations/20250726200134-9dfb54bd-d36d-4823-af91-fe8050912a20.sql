-- Add RLS policy to allow runners to view customer information for their assigned orders
CREATE POLICY "Runners can view customer info for assigned orders" 
ON public.users 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.customer_id = users.id 
    AND orders.runner_id = auth.uid()
  )
);