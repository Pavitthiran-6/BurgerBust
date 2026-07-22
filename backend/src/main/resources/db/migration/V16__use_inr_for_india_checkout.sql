UPDATE restaurant_settings
SET currency = 'INR',
    updated_at = CURRENT_TIMESTAMP
WHERE deleted_at IS NULL
  AND country = 'India'
  AND currency <> 'INR';
