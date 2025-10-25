-- Database schema for CSV to JSON API
-- Run this script to create the required table

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,          -- name = firstName + ' ' + lastName
  age INT NOT NULL,
  address JSONB,
  additional_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on age for faster queries
CREATE INDEX IF NOT EXISTS idx_users_age ON public.users(age);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
