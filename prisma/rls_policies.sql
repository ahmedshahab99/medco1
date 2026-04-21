-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientFile" ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's tenant_id from JWT claims
-- The tenant_id is injected by the Custom Access Token Hook
CREATE OR REPLACE FUNCTION auth.get_tenant_id() 
RETURNS text AS $$
  SELECT (auth.jwt() ->> 'tenant_id');
$$ LANGUAGE sql STABLE;

-- Helper function to get the current user's role from JWT claims
-- The user_role is injected by the Custom Access Token Hook
CREATE OR REPLACE FUNCTION auth.get_user_role() 
RETURNS text AS $$
  SELECT (auth.jwt() ->> 'user_role');
$$ LANGUAGE sql STABLE;

-- Tenant Policies
CREATE POLICY "Users can view their own tenant" ON "Tenant"
  FOR SELECT USING (id = auth.get_tenant_id()::uuid);

-- Profile Policies
CREATE POLICY "Users can view profiles in their tenant" ON "Profile"
  FOR SELECT USING (tenantId = auth.get_tenant_id());

CREATE POLICY "Users can update their own profile" ON "Profile"
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Patient Policies
CREATE POLICY "Tenant isolation for Patients" ON "Patient"
  FOR ALL USING (tenantId = auth.get_tenant_id()) WITH CHECK (tenantId = auth.get_tenant_id());

-- Appointment Policies
CREATE POLICY "Tenant isolation for Appointments" ON "Appointment"
  FOR ALL USING (tenantId = auth.get_tenant_id()) WITH CHECK (tenantId = auth.get_tenant_id());

-- MedicalNote Policies
CREATE POLICY "Tenant isolation for MedicalNotes" ON "MedicalNote"
  FOR ALL USING (tenantId = auth.get_tenant_id()) WITH CHECK (tenantId = auth.get_tenant_id());

-- PatientFile Policies
CREATE POLICY "Tenant isolation for PatientFiles" ON "PatientFile"
  FOR ALL USING (tenantId = auth.get_tenant_id()) WITH CHECK (tenantId = auth.get_tenant_id());

-- Storage Policies for clinic-assets bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('clinic-assets', 'clinic-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY ""Public Access clinic-assets"" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'clinic-assets');

CREATE POLICY ""Authenticated Insert clinic-assets"" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'clinic-assets');

-- ============================================================
-- Role-Based Policies (RBAC)
-- These supplement the tenant-isolation policies above
-- ============================================================

-- Only ADMINs can delete patients within their tenant
CREATE POLICY "Only admins can delete patients" ON "Patient"
  FOR DELETE USING (
    "tenantId" = auth.get_tenant_id()
    AND auth.get_user_role() = 'ADMIN'
  );

-- Only ADMINs can insert new profiles into their tenant (team invitation)
CREATE POLICY "Only admins can insert profiles" ON "Profile"
  FOR INSERT WITH CHECK (
    "tenantId" = auth.get_tenant_id()
    AND auth.get_user_role() = 'ADMIN'
  );

-- Only ADMINs can delete profiles within their tenant
CREATE POLICY "Only admins can delete profiles" ON "Profile"
  FOR DELETE USING (
    "tenantId" = auth.get_tenant_id()
    AND auth.get_user_role() = 'ADMIN'
  );
