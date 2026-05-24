"use client";

import { useParams } from "next/navigation";
import { usePatient } from "@/hooks/use-patients";
import { Loader2 } from "lucide-react";
import PrescriptionPage from "@/components/features/PrescriptionPage";

export default function PrescribePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: patient, isLoading } = usePatient(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <PrescriptionPage
      initialPatientId={id}
      initialPatientName={patient?.name}
    />
  );
}
