-- Add missing payment fields to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_date date,
ADD COLUMN IF NOT EXISTS payment_reference text;