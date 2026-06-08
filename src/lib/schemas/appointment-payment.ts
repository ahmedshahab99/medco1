import { z } from "zod";

export const appointmentPaymentSchema = z.object({
  amount: z.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().max(500, "الوصف طويل جداً").optional(),
  date: z.string().min(1, "التاريخ مطلوب"),
});

export type AppointmentPaymentInput = z.infer<typeof appointmentPaymentSchema>;
