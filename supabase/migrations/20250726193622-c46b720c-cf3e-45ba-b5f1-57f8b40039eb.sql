-- Add RLS policy to allow runners to view unassigned orders that are ready for pickup
CREATE POLICY "Runners can view unassigned ready orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role() = 'runner' 
  AND runner_id IS NULL 
  AND status IN ('ready', 'pending')
  AND payment_status = 'paid'
);