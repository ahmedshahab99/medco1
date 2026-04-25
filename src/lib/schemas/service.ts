import { z } from "zod";

const optionalString = z.string().nullable().optional();

export const serviceCreateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  description: optionalString,
  duration: z.number().int().min(1, "المدة يجب أن تكون دقيقة واحدة على الأقل"),
  color: z.string().min(1, "اللون مطلوب"),
  price: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const serviceUpdateSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").optional(),
  description: optionalString,
  duration: z.number().int().min(1).optional(),
  color: z.string().min(1).optional(),
  price: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;