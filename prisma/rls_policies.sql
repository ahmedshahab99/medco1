-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PatientFile" ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's tenant_id from JWT metadata
CREATE OR REPLACE FUNCTION auth.get_tenant_id() 
RETURNS uuid AS $$
  SELECT ((auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
$$ LANGUAGE sql STABLE;

-- Tenant Policies
CREATE POLICY "Users can view their own tenant" ON "Tenant"
  FOR SELECT USING (id = auth.get_tenant_id());

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
