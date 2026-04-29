"use server";

import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/schemas/profile";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const authProfile = await requireAuth();

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
      where: { id: authProfile.id },
      data: { firstName, lastName },
    });

    revalidatePath("/dashboard/account");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء تحديث الملف الشخصي." };
  }
}
