"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const setupSchema = z.object({
  name: z.string().min(2, "اسم العيادة يجب أن يحتوي على حرفين الأقل"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح").optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  logo: z.string().url("رابط الشعار غير صحيح").optional().or(z.literal('')),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export async function submitSetupWizard(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "يرجى تسجيل الدخول أولاً." };
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    bio: formData.get("bio")?.toString() || "",
    logo: formData.get("logo")?.toString() || "",
    address: formData.get("address")?.toString() || "",
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
  };

  const validation = setupSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.message };
  }

  const { name, phone, bio, logo, address, latitude, longitude } = validation.data;

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;

  async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        lastError = error as Error;
        const isRetryable =
          lastError.message?.includes("Unable to start a transaction") ||
          lastError.message?.includes("transaction") ||
          "code" in lastError && (lastError as { code?: string }).code === "P2024";
        if (!isRetryable || attempt === MAX_RETRIES) {
          throw error;
        }
        console.log(`Transaction attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
    throw lastError;
  }

  try {
    await withRetry(async () => {
      await prisma.$transaction(async (tx) => {
        // Check if profile exists; create if it somehow doesn't
        let profile = await tx.profile.findUnique({
          where: { id: user.id }
        });

        if (!profile) {
          profile = await tx.profile.create({
            data: {
              id: user.id,
              email: user.email!,
              role: "ADMIN"
            }
          });
        }

        if (profile.tenantId) {
          throw new Error("لقد قمت بإعداد العيادة مسبقاً.");
        }

        // Generate a simple slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 6);

        // Create new tenant
        const newTenant = await tx.tenant.create({
          data: {
            name,
            slug,
            phone: phone || null,
            bio: bio || null,
            logo: logo || null,
            address: address || null,
            latitude: latitude || null,
            longitude: longitude || null,
          }
        });

        // Update profile with tenantId
        await tx.profile.update({
          where: { id: user.id },
          data: { tenantId: newTenant.id, role: "ADMIN" }
        });
      });
    });
  } catch (err: unknown) {
    console.error("Setup error:", err);
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء إعداد العيادة.";
    return { error: message };
  }

  // Redirect on success
  redirect("/dashboard");
}
