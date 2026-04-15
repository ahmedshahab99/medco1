'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
})

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  // Validate the inputs via Zod
  const validation = signUpSchema.safeParse({ email, password })
  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  // Define the base URL dynamically based on environment
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  return { success: true }
}
