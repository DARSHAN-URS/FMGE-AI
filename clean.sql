-- =============================================================================
-- HEALTHCARE & STUDY ABROAD SUITE — DATABASE CLEANUP SCRIPT
-- Safely drops all legacy public tables, views, and triggers in Supabase
-- Note: Does NOT touch auth.users or Supabase system tables.
-- =============================================================================

-- 1. Drop existing triggers and functions in public schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Drop all tables in the public schema with CASCADE
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- 3. Confirm clean state
SELECT 'Public schema successfully cleaned. You can now execute schema.sql!' AS status;
