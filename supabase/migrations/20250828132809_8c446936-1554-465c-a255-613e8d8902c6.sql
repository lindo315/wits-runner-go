-- Fix collection PIN generation for delivery orders
-- Runners need a collection PIN to show merchants when picking up food for delivery

-- Update the set_delivery_pin function to also generate collection PIN for delivery orders when they become ready
CREATE OR REPLACE FUNCTION public.set_delivery_pin()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Set delivery pin when order is first created (pending status) for delivery orders
  IF TG_OP = 'INSERT' OR (NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending') THEN
    IF NEW.delivery_pin IS NULL AND NEW.delivery_type = 'delivery' THEN
      NEW.delivery_pin := generate_delivery_pin();
    END IF;
  END IF;
  
  -- Set collection pin when delivery order becomes ready (for runner to show merchant)
  IF NEW.delivery_type = 'delivery' AND NEW.status = 'ready' AND (OLD.status IS DISTINCT FROM 'ready') THEN
    IF NEW.collection_pin IS NULL THEN
      NEW.collection_pin := generate_delivery_pin();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;