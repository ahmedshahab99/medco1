"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { isReservedSlug } from "@/lib/reserved-slugs";
import { SLUG_REGEX } from "@/lib/slug-utils";
import QRCode from "qrcode";
import { DEFAULT_SCHEDULE, DEFAULT_ADVANCED } from "@/components/features/availability/constants";

const setupSchema = z.object({
  name: z.string().min(2, "اسم العيادة يجب أن يحتوي على حرفين الأقل"),
  slug: z
    .string()
    .min(3, "الرابط يجب أن يكون 3 أحرف على الأقل")
    .max(30, "الرابط يجب ألا يتجاوز 30 حرف")
    .regex(SLUG_REGEX, "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات فقط"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح").optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  logo: z.string().url("رابط الشعار غير صحيح").optional().or(z.literal('')),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  consultationFee: z.string().optional(),
});

export async function checkSlugAvailability(slug: string) {
  if (!slug || slug.length === 0) {
    return { available: false, error: "الرابط مطلوب" };
  }

  if (slug.length < 3) {
    return { available: false, error: "الرابط يجب أن يكون 3 أحرف على الأقل" };
  }

  if (slug.length > 30) {
    return { available: false, error: "الرابط يجب ألا يتجاوز 30 حرف" };
  }

  if (!SLUG_REGEX.test(slug)) {
    return { available: false, error: "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة، أرقام، وشرطات فقط" };
  }

  if (isReservedSlug(slug)) {
    return { available: false, error: "هذا الرابط محجوز" };
  }

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (existingTenant) {
    return { available: false, error: "هذا الرابط مستخدم بالفعل" };
  }

  return { available: true };
}

export async function submitSetupWizard(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "يرجى تسجيل الدخول أولاً." };
  }

  const rawData = {
    name: formData.get("name")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    bio: formData.get("bio")?.toString() || "",
    logo: formData.get("logo")?.toString() || "",
    address: formData.get("address")?.toString() || "",
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
    consultationFee: formData.get("consultationFee")?.toString() || "",
  };

  const validation = setupSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.message };
  }

  const { name, slug, phone, bio, logo, address, latitude, longitude, consultationFee } = validation.data;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clinicUrl = `${baseUrl}/${slug}`;

  const qrCodeDataUrl = await QRCode.toDataURL(clinicUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  });

  const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");

  const qrCodeFileName = `qrcodes/${slug}.png`;
  const { error: uploadError } = await supabase.storage
    .from("clinic-assets")
    .upload(qrCodeFileName, qrCodeBuffer, {
      contentType: "image/png",
      upsert: true
    });

  if (uploadError) {
    return { error: `فشل في رفع رمز QR: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from("clinic-assets")
    .getPublicUrl(qrCodeFileName);

  const qrCodeUrl = urlData.publicUrl;

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

  let alreadySetup = false;

  try {
    await withRetry(async () => {
      await prisma.$transaction(async (tx) => {
        // Check if profile exists by email first (handles Google OAuth with existing email)
        let profile = await tx.profile.findUnique({
          where: { email: user.email! }
        });

        if (profile) {
          // Profile exists but might have a different auth ID — update it to match
          if (profile.id !== user.id) {
            await tx.profile.update({
              where: { id: profile.id },
              data: { id: user.id }
            });
          }
        } else {
          profile = await tx.profile.create({
            data: {
              id: user.id,
              email: user.email!,
              role: "ADMIN"
            }
          });
        }

        if (profile.tenantId) {
          alreadySetup = true;
          return;
        }

        // Check slug uniqueness one more time
        const existingTenant = await tx.tenant.findUnique({
          where: { slug },
        });

        if (existingTenant) {
          throw new Error("هذا الرابط مستخدم بالفعل. يرجى اختيار رابط آخر.");
        }

        // Create new tenant with user-provided slug
        const feeAmount = consultationFee ? parseFloat(consultationFee) : undefined;
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
            qrCode: qrCodeUrl,
            defaultConsultationFee: (feeAmount && !isNaN(feeAmount)) ? feeAmount : undefined,
          }
        });

        await tx.service.create({
          data: {
            name: "الاستشارة",
            description: "الخدمة الافتراضية للاستشارات الطبية",
            price: 25000,
            tenantId: newTenant.id,
            color: "#3B82F6",
            duration: 30,
          }
        })
        await tx.service.create({
          data: {
            name: "المراجعة",
            description: "الخدمة الافتراضية للاستشارات الطبية",
            price: 0,
            tenantId: newTenant.id,
            color: "#10B981",
            duration: 30,
          }
        })

        await tx.clinicAvailability.create({
          data: {
            tenantId: newTenant.id,
            schedule: DEFAULT_SCHEDULE as unknown as Prisma.InputJsonValue,
            settings: DEFAULT_ADVANCED as unknown as Prisma.InputJsonValue,
          }
        })

        await tx.profile.update({
          where: { id: user.id },
          data: { tenantId: newTenant.id, role: "ADMIN" }
        });
      }, {
        maxWait: 10000, // 10 seconds max wait for connection
        timeout: 20000, // 20 seconds max transaction duration
      });
    });
  } catch (err: unknown) {
    if (alreadySetup) {
      redirect("/dashboard");
    }
    console.error("Setup error:", err);
    const message = err instanceof Error ? err.message : "حدث خطأ أثناء إعداد العيادة.";
    return { error: message };
  }

  if (alreadySetup) {
    redirect("/dashboard");
  }

  // Refresh session so the JWT picks up the new user_role and tenant_id claims
  // injected by the Custom Access Token Hook
  await supabase.auth.refreshSession();

  // Redirect on success
  redirect("/dashboard");
}
