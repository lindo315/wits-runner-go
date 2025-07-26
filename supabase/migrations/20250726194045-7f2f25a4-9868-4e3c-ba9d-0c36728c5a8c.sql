-- Add RLS policy to allow runners to update unassigned orders when accepting them
CREATE POLICY "Runners can accept unassigned ready orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (
  get_current_user_role() = 'runner' 
  AND runner_id IS NULL 
  AND status IN ('ready', 'pending')
  AND payment_status = 'paid'
)
WITH CHECK (
  get_current_user_role() = 'runner' 
  AND runner_id = auth.uid()
  AND status IN ('picked_up', 'in_transit', 'delivered')
);