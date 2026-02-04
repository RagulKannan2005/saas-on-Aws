-- Migration: Add missing registration fields
-- Created: 2026-02-04

-- Add Company Details to public.tenants
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100);

-- Add Admin Details to public.users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
