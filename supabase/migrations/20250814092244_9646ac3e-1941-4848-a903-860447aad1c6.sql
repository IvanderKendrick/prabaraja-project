-- Add tax_details column to sales table
ALTER TABLE public.sales 
ADD COLUMN tax_details jsonb;

-- Add tax_details column to order_deliveries table  
ALTER TABLE public.order_deliveries
ADD COLUMN tax_details jsonb;

-- Add tax_details column to quotations table
ALTER TABLE public.quotations
ADD COLUMN tax_details jsonb;