import { z } from "zod";
const optionalString = z.string().nullable().optional();
const optionalNumber = z.number().nullable().optional();

export const tenantUpdateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  specialty: optionalString,
  bio: optionalString,
  phone: optionalString,
  logo: optionalString,
  address: optionalString,
  latitude: optionalNumber,
  longitude: optionalNumber,
  defaultConsultationFee: z.string().optional(),
  socialLinks: z
    .array(
      z.object({
        id: z.string().optional(),
        platform: z.enum(["WHATSAPP", "X", "FACEBOOK", "INSTAGRAM", "LINKEDIN"] as const),
        url: z.string().min(1, "الرابط مطلوب"),
      })
    )
    .optional(),
});

export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>;
