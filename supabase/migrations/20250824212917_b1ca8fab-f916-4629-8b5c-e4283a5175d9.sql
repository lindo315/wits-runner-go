-- Remove merchant involvement and restore direct runner delivery flow
-- 1) Drop any collection-specific triggers
DROP TRIGGER IF EXISTS set_collection_pin_trigger ON public.orders;
DROP TRIGGER IF EXISTS enforce_collection_statuses_trigger ON public.orders;

-- 2) Remove merchant update policy tied to collection orders
DROP POLICY IF EXISTS "Merchants can update collection orders status" ON public.orders;

-- 3) Ensure delivery PIN is generated for all orders when they become 'ready'
CREATE OR REPLACE FUNCTION public.set_delivery_pin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set delivery pin when order becomes ready (for all orders)
  IF NEW.status = 'ready' AND (OLD.status IS DISTINCT FROM 'ready') THEN
    IF NEW.delivery_pin IS NULL THEN
      NEW.delivery_pin := generate_delivery_pin();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger to call set_delivery_pin on status updates
DROP TRIGGER IF EXISTS set_delivery_pin_trigger ON public.orders;
CREATE TRIGGER set_delivery_pin_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_delivery_pin();