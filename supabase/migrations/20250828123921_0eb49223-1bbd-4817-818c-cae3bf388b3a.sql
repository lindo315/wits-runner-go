-- 1) Order automation triggers (order number, pins, notifications)

-- Ensure sequence exists for order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- Generate order number on insert
DROP TRIGGER IF EXISTS before_insert_set_order_number ON public.orders;
CREATE TRIGGER before_insert_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();

-- Set delivery PIN on insert/update for delivery orders
DROP TRIGGER IF EXISTS before_insupd_set_delivery_pin ON public.orders;
CREATE TRIGGER before_insupd_set_delivery_pin
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_delivery_pin();

-- Enforce collection-specific statuses on update
DROP TRIGGER IF EXISTS before_update_enforce_collection_statuses ON public.orders;
CREATE TRIGGER before_update_enforce_collection_statuses
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_collection_statuses();

-- Generate collection PIN when moving to ready_for_collection (update only)
DROP TRIGGER IF EXISTS before_update_set_collection_pin ON public.orders;
CREATE TRIGGER before_update_set_collection_pin
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_collection_pin();

-- Send notifications on order creation
DROP TRIGGER IF EXISTS after_insert_order_notification ON public.orders;
CREATE TRIGGER after_insert_order_notification
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trigger_order_notification();

-- Send notifications on status changes
DROP TRIGGER IF EXISTS after_update_status_notification ON public.orders;
CREATE TRIGGER after_update_status_notification
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trigger_order_status_notification();

-- Auto-set sent_at for push_notifications
DROP TRIGGER IF EXISTS before_insert_set_notification_sent_at ON public.push_notifications;
CREATE TRIGGER before_insert_set_notification_sent_at
BEFORE INSERT ON public.push_notifications
FOR EACH ROW
EXECUTE FUNCTION public.set_notification_sent_at();


-- 3) Merchant mapping and policies (merchant users manage their own orders)

-- Create merchant_users mapping table
CREATE TABLE IF NOT EXISTS public.merchant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, merchant_id)
);

ALTER TABLE public.merchant_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for merchant_users
DROP POLICY IF EXISTS "Admins can manage all merchant_users" ON public.merchant_users;
CREATE POLICY "Admins can manage all merchant_users"
ON public.merchant_users
FOR ALL
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can view their merchant mappings" ON public.merchant_users;
CREATE POLICY "Users can view their merchant mappings"
ON public.merchant_users
FOR SELECT
USING (auth.uid() = user_id);

-- Allow merchants to view and update orders belonging to their merchant(s)
DROP POLICY IF EXISTS "Merchants can view their store orders" ON public.orders;
CREATE POLICY "Merchants can view their store orders"
ON public.orders
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.merchant_users mu
  WHERE mu.merchant_id = orders.merchant_id
    AND mu.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Merchants can update their store orders" ON public.orders;
CREATE POLICY "Merchants can update their store orders"
ON public.orders
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.merchant_users mu
  WHERE mu.merchant_id = orders.merchant_id
    AND mu.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.merchant_users mu
  WHERE mu.merchant_id = orders.merchant_id
    AND mu.user_id = auth.uid()
));

-- Allow merchants to view order items for their orders
DROP POLICY IF EXISTS "Merchants can view order items for their orders" ON public.order_items;
CREATE POLICY "Merchants can view order items for their orders"
ON public.order_items
FOR SELECT
USING (EXISTS (
  SELECT 1 
  FROM public.orders o
  JOIN public.merchant_users mu 
    ON mu.merchant_id = o.merchant_id 
   AND mu.user_id = auth.uid()
  WHERE o.id = order_items.order_id
));

-- Tighten merchant_order_updates and allow merchants to view
DROP POLICY IF EXISTS "Merchants can insert their order updates" ON public.merchant_order_updates;
CREATE POLICY "Merchants can insert their order updates"
ON public.merchant_order_updates
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.merchant_users mu
  WHERE mu.merchant_id = merchant_order_updates.merchant_id
    AND mu.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Merchants can view their order updates" ON public.merchant_order_updates;
CREATE POLICY "Merchants can view their order updates"
ON public.merchant_order_updates
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.merchant_users mu
  WHERE mu.merchant_id = merchant_order_updates.merchant_id
    AND mu.user_id = auth.uid()
));