import { z } from "zod";

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50, "الاسم الأول طويل جداً"),
  lastName: z.string().min(1, "اسم العائلة مطلوب").max(50, "اسم العائلة طويل جداً"),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
