import { z } from "zod";

export const medicationSchema = z.object({
  id: z.string().optional(),
  name: z.string("اسم الدواء مطلوب").min(1, "اسم الدواء مطلوب"),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

export const visitNoteCreateSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  content: z.string().optional(),
  diagnosis: z.string().optional(),
  medications: z.array(medicationSchema).optional().default([]),
  notes: z.string().optional(),
  validityDays: z.number().int().positive().default(30),
});

export const visitNoteUpdateSchema = visitNoteCreateSchema.partial();

export type VisitNoteCreateInput = z.infer<typeof visitNoteCreateSchema>;
export type VisitNoteUpdateInput = z.infer<typeof visitNoteUpdateSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
