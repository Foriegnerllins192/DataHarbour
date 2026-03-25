-- Add columns for guest purchases to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255);

-- Update existing transactions to have original_amount same as amount
UPDATE transactions 
SET original_amount = amount 
WHERE original_amount IS NULL;

-- Add index for guest purchases
CREATE INDEX IF NOT EXISTS idx_transactions_guest ON transactions(is_guest);
CREATE INDEX IF NOT EXISTS idx_transactions_guest_email ON transactions(guest_email);

-- Update the user_id constraint to allow NULL for guest purchases
ALTER TABLE transactions ALTER COLUMN user_id DROP NOT NULL;