"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/schemas/profile";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "يرجى تسجيل الدخول أولاً." };
  }

  // Re-query Profile from DB for authorization
  const actor = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!actor) {
    return { error: "لم يتم العثور على الملف الشخصي." };
  }

  const rawData = {
    firstName: formData.get("firstName")?.toString() ?? "",
    lastName: formData.get("lastName")?.toString() ?? "",
  };

  const validation = profileUpdateSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  const { firstName, lastName } = validation.data;

  try {
    await prisma.profile.update({
      where: { id: actor.id },
      data: { firstName, lastName },
    });

    revalidatePath("/dashboard/account");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء تحديث الملف الشخصي." };
  }
}

export async function updateFees(tenantId: string, fee: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "يرجى تسجيل الدخول أولاً." };

  const actor = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!actor?.tenantId || actor.tenantId !== tenantId) return { error: "غير مصرح" };
  if (actor.role !== "ADMIN") return { error: "فقط المدير يمكنه تعديل الكشفية" };

  const amount = fee ? parseFloat(fee) : null;
  if (amount !== null && (isNaN(amount) || amount <= 0)) return { error: "يرجى إدخال مبلغ صحيح" };

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { defaultConsultationFee: amount },
    });
    revalidatePath("/dashboard/account");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء تحديث الكشفية." };
  }
}
