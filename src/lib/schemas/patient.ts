import { z } from "zod";

const phoneRegex = /^(\+964|0)?[1-9]\d{9}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const patientCreateSchema = z.object({
  firstName: z.string("الاسم الأول مطلوب").min(1, "الاسم الأول مطلوب"),
  lastName: z.string("اسم العائلة مطلوب").min(1, "اسم العائلة مطلوب"),
  phone: z
    .string()
    .regex(phoneRegex, "رقم الجوال غير صحيح")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .regex(dateRegex, "تاريخ الميلاد غير صحيح")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  address: z
    .string()
    .min(3, "العنوان يجب أن يكون 3 أحرف على الأقل")
    .optional()
    .or(z.literal("")),
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
