-- ============================================================
-- Custom Access Token Hook for Supabase Auth
-- Injects user_role and tenant_id from Profile table into JWT
-- ============================================================
-- IMPORTANT: After running this migration, enable the hook in:
--   Supabase Dashboard → Authentication → Hooks → Custom Access Token
--   → Select function: public.custom_access_token_hook
-- ============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  profile_role text;
  profile_tenant_id text;
BEGIN
  -- Fetch role and tenantId from the Profile table
  SELECT "role", "tenantId"
  INTO profile_role, profile_tenant_id
  FROM public."Profile"
  WHERE id = (event->>'user_id')::text;

  claims := event->'claims';

  -- Inject user_role claim
  IF profile_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(profile_role));
  ELSE
    -- Default to DOCTOR if no profile exists yet
    claims := jsonb_set(claims, '{user_role}', '"DOCTOR"');
  END IF;

  -- Inject tenant_id claim
  IF profile_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(profile_tenant_id));
  ELSE
    claims := jsonb_set(claims, '{tenant_id}', 'null');
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Grant execute permission to supabase_auth_admin (required for Auth hooks)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public-facing roles to prevent direct invocation
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Grant SELECT on Profile table so the hook can read roles
GRANT SELECT ON TABLE public."Profile" TO supabase_auth_admin;
