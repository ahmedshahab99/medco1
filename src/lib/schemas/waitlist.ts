import { z } from "zod";
import { patientCreateSchema } from "./patient";

export const waitlistCreateSchema = z
  .object({
    patientId: z.string().optional(),
    newPatient: patientCreateSchema.optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.patientId && !data.newPatient) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "المريض مطلوب",
        path: ["patientId"],
      });
    }
  });

export const waitlistPatchSchema = z.object({
  notes: z.string().optional(),
  status: z.enum(["waiting", "converted", "cancelled"]).optional(),
});

export type WaitlistCreateInput = z.infer<typeof waitlistCreateSchema>;
export type WaitlistPatchInput = z.infer<typeof waitlistPatchSchema>;
