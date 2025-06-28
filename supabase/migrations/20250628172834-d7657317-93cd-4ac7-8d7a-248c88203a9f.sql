
-- Create a function to cancel unaccepted orders after 15 minutes
CREATE OR REPLACE FUNCTION cancel_unaccepted_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update orders that are still pending and were created more than 15 minutes ago
  UPDATE orders 
  SET 
    status = 'cancelled',
    cancellation_reason = 'Order not accepted within 15 minutes',
    cancelled_at = now(),
    updated_at = now()
  WHERE 
    status = 'pending' 
    AND created_at < (now() - interval '15 minutes')
    AND runner_id IS NULL;
    
  -- Log how many orders were cancelled
  IF FOUND THEN
    INSERT INTO system_logs (level, message, context)
    VALUES (
      'info', 
      'Auto-cancelled unaccepted orders',
      json_build_object('cancelled_at', now())
    );
  END IF;
END;
$$;

-- Create a trigger function to automatically call the cancellation function
CREATE OR REPLACE FUNCTION trigger_cancel_unaccepted_orders()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Schedule the cancellation check for 15 minutes after order creation
  PERFORM pg_notify(
    'order_auto_cancel',
    json_build_object(
      'order_id', NEW.id,
      'created_at', NEW.created_at,
      'cancel_at', NEW.created_at + interval '15 minutes'
    )::text
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires when a new order is inserted
CREATE OR REPLACE TRIGGER auto_cancel_trigger
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION trigger_cancel_unaccepted_orders();

-- Enable pg_cron extension if not already enabled (for scheduled tasks)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cancellation function to run every minute
SELECT cron.schedule(
  'cancel-unaccepted-orders',
  '* * * * *', -- every minute
  'SELECT cancel_unaccepted_orders();'
);
