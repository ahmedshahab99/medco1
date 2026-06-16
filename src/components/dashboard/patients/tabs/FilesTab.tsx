"use client";

import React from "react";
import { PatientFilesSection } from "@/components/dashboard/patients/files/PatientFilesSection";

interface FilesTabProps {
  patientId: string;
}

export function FilesTab({ patientId }: FilesTabProps) {
  return (
    <div className="space-y-4">
      <PatientFilesSection patientId={patientId} title="ملفات المريض" />
    </div>
  );
}
