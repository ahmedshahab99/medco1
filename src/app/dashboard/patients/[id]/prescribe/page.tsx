"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PrescribePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    router.replace(`/dashboard/patients/${id}?tab=visits`);
  }, [id, router]);

  return null;
}
