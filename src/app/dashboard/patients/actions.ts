"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createPatientSchema = z.object({
  name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  phone: z.string().min(5, { message: "رقم الهاتف غير صالح" }),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  dob: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
});

export async function createPatientAction(formData: {
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: string;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "غير مصرح" };

    const actor = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!actor || !actor.tenantId) return { success: false, error: "غير مصرح" };
    if (actor.role !== "ADMIN" && actor.role !== "DOCTOR" && actor.role !== "RECEPTIONIST") {
      return { success: false, error: "ليس لديك صلاحية لإنشاء مرضى" };
    }

    const parsed = createPatientSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const names = parsed.data.name.split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ") || " ";

    await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone,
        gender: parsed.data.gender ? (parsed.data.gender.toUpperCase() as any) : null,
        dateOfBirth: parsed.data.dob ? new Date(parsed.data.dob) : null,
        tenantId: actor.tenantId,
      },
    });

    revalidatePath("/dashboard/patients");
    return { success: true };
  } catch (error) {
    console.error("Failed to create patient:", error);
    return { success: false, error: "حدث خطأ أثناء إنشاء المريض" };
  }
}
