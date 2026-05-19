"use server";

import { PatientService } from "@/services/patient";
import { revalidatePath } from "next/cache";

/**
 * Server action to create a new patient with tenant isolation.
 */
export async function createPatientAction(formData: {
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: string;
}) {
  try {
    const names = formData.name.split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ") || " ";

    await PatientService.createPatient({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender as any,
      dateOfBirth: formData.dob ? new Date(formData.dob) : undefined,
    });

    revalidatePath("/dashboard/patients");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create patient:", error);
    return { success: false, error: error.message };
  }
}
