CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  profile_role text;
  profile_tenant_id text;
  user_email text;
BEGIN
  -- Get the user's email from auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = (event->>'user_id')::text;

  -- Fetch role and tenantId from the Profile table, first by ID then by email
  SELECT "role", "tenantId"
  INTO profile_role, profile_tenant_id
  FROM public."Profile"
  WHERE id = (event->>'user_id')::text
     OR (user_email IS NOT NULL AND email = user_email)
  LIMIT 1;

  claims := event->'claims';

  -- Inject user_role claim
  IF profile_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(profile_role));
  ELSE
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
