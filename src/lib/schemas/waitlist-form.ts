import { z } from "zod";
import { patientCreateSchema } from "./patient";

export const waitlistFormSchema = z
  .object({
    patientMode: z.enum(["existing", "new"]),
    patientId: z.string().optional(),
    newPatient: patientCreateSchema.optional(),
    notes: z.string().optional(),
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
  });

export type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;
