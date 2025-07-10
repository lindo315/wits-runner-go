-- Add runner base fee configuration
INSERT INTO app_config (key, value, description) 
VALUES ('runner_base_fee', '10.00', 'Base fee paid to runners per delivery in ZAR')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();