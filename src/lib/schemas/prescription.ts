import { z } from "zod";

export const prescriptionMedicationSchema = z.object({
  id: z.string().optional(),
  name: z.string("اسم الدواء مطلوب").min(1, "اسم الدواء مطلوب"),
  dose: z.string("الجرعة مطلوبة").min(1, "الجرعة مطلوبة"),
  frequency: z.string("التكرار مطلوب").min(1, "التكرار مطلوب"),
  duration: z.string("المدة مطلوبة").min(1, "المدة مطلوبة"),
  instructions: z.string().optional(),
});

export const prescriptionCreateSchema = z.object({
  diagnosis: z.string("التشخيص مطلوب").min(1, "التشخيص مطلوب"),
  medications: z
    .array(prescriptionMedicationSchema)
    .min(1, "يجب إضافة دواء واحد على الأقل"),
  notes: z.string().optional(),
  validityDays: z.number().int().positive().default(30),
});

export const prescriptionUpdateSchema = prescriptionCreateSchema.partial();

export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;
export type PrescriptionUpdateInput = z.infer<typeof prescriptionUpdateSchema>;
export type PrescriptionMedicationInput = z.infer<typeof prescriptionMedicationSchema>;
