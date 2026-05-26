import { z } from "zod";
import { patientCreateSchema } from "./patient";

export const appointmentFormSchema = z
  .object({
    doctorId: z.string().min(1, "الطبيب مطلوب"),
    serviceId: z.string().min(1, "الخدمة مطلوبة"),
    patientMode: z.enum(["existing", "new", "waitlist"]),
    patientId: z.string().optional(),
    waitlistId: z.string().optional(),
    newPatient: patientCreateSchema.optional(),
    caseId: z.string().optional(),
    newCase: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    date: z.string().min(1, "التاريخ مطلوب"),
    startTime: z.string().min(1, "وقت البدء مطلوب"),
    endTime: z.string().min(1, "وقت الانتهاء مطلوب"),
    notes: z.string().optional(),
    consultationFee: z.string().regex(/^\d+$/).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.patientMode === "existing" && !data.patientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى اختيار مريض",
        path: ["patientId"],
      });
    }

    if (data.patientMode === "new") {
      if (!data.newPatient) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "بيانات المريض مطلوبة",
          path: ["newPatient"],
        });
      } else {
        const result = patientCreateSchema.safeParse(data.newPatient);
        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: issue.message,
              path: ["newPatient", ...issue.path],
            });
          }
        }
      }
    }

    if (data.patientMode === "waitlist" && !data.waitlistId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "يرجى اختيار مريض من قائمة الانتظار",
        path: ["waitlistId"],
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
