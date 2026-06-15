-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VisitNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientFile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocialLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invitation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Case" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorUnavailable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringExpense" ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's tenant_id from JWT claims
-- The tenant_id is injected by the Custom Access Token Hook
CREATE OR REPLACE FUNCTION public.get_tenant_id() 
RETURNS text AS $$
  SELECT (auth.jwt() ->> 'tenant_id');
$$ LANGUAGE sql STABLE;

-- Helper function to get the current user's role from JWT claims
-- The user_role is injected by the Custom Access Token Hook
CREATE OR REPLACE FUNCTION public.get_user_role() 
RETURNS text AS $$
  SELECT (auth.jwt() ->> 'user_role');
$$ LANGUAGE sql STABLE;

-- Tenant Policies
CREATE POLICY "Users can view their own tenant" ON "Tenant"
  FOR SELECT USING (id = public.get_tenant_id());

-- Profile Policies
CREATE POLICY "Users can view profiles in their tenant" ON "Profile"
  FOR SELECT USING (tenantId = public.get_tenant_id());

CREATE POLICY "Users can update their own profile" ON "Profile"
  FOR UPDATE USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

-- Patient Policies
CREATE POLICY "Tenant isolation for Patients" ON "Patient"
  FOR ALL USING (tenantId = public.get_tenant_id()) WITH CHECK (tenantId = public.get_tenant_id());

-- Appointment Policies
CREATE POLICY "Tenant isolation for Appointments" ON "Appointment"
  FOR ALL USING (tenantId = public.get_tenant_id()) WITH CHECK (tenantId = public.get_tenant_id());

-- VisitNote Policies
CREATE POLICY "Tenant isolation for VisitNotes" ON "VisitNote"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- SocialLink Policies
CREATE POLICY "Tenant isolation for SocialLinks" ON "SocialLink"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- Service Policies
CREATE POLICY "Tenant isolation for Services" ON "Service"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- Invitation Policies
CREATE POLICY "Tenant isolation for Invitations" ON "Invitation"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- Case Policies
CREATE POLICY "Tenant isolation for Cases" ON "Case"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- Transaction Policies
CREATE POLICY "Tenant isolation for Transactions" ON "Transaction"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- ClinicAvailability Policies
CREATE POLICY "Tenant isolation for ClinicAvailability" ON "ClinicAvailability"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- DoctorUnavailable Policies
CREATE POLICY "Tenant isolation for DoctorUnavailable" ON "DoctorUnavailable"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- RecurringExpense Policies
CREATE POLICY "Tenant isolation for RecurringExpenses" ON "RecurringExpense"
  FOR ALL USING ("tenantId" = public.get_tenant_id()) WITH CHECK ("tenantId" = public.get_tenant_id());

-- PatientFile Policies
CREATE POLICY "Tenant isolation for PatientFiles" ON "PatientFile"
  FOR ALL USING (tenantId = public.get_tenant_id()) WITH CHECK (tenantId = public.get_tenant_id());

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


