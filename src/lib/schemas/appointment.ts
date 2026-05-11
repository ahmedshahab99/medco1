import { z } from "zod";

const phoneRegex = /^(\+964|0)?[1-9]\d{9}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const appointmentCreateSchema = z.object({
  patientId: z.string().optional(),
  newPatient: z
    .object({
      firstName: z.string().min(1, "الاسم الأول مطلوب"),
      lastName: z.string().min(1, "اسم العائلة مطلوب"),
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
    })
    .optional(),
  waitlistId: z.string().optional(),
  doctorId: z.string().min(1, "الطبيب مطلوب"),
  serviceId: z.string().min(1, "الخدمة مطلوبة"),
  caseId: z.string().optional(),
  newCase: z
    .object({
      title: z.string().min(1, "عنوان الحالة مطلوب"),
      description: z.string().optional(),
    })
    .optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

export const appointmentPatchSchema = z.object({
  status: z
    .enum([
      "SCHEDULED",
      "CONFIRMED",
      "ARRIVED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ])
    .optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  notes: z.string().optional(),
  caseId: z.string().optional(),
  serviceId: z.string().optional(),
  doctorId: z.string().optional(),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentPatchInput = z.infer<typeof appointmentPatchSchema>;
