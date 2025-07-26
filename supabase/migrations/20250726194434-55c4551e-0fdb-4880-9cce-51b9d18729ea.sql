-- Add RLS policy to allow runners to update status of their assigned orders
CREATE POLICY "Runners can update status of assigned orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (
  get_current_user_role() = 'runner' 
  AND runner_id = auth.uid()
)
WITH CHECK (
  get_current_user_role() = 'runner' 
  AND runner_id = auth.uid()
);