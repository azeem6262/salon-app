-- Migration: Add multi-part payment and installment tracking to bookings table

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT NULL;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_history jsonb DEFAULT '[]'::jsonb;
