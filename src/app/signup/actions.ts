'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()

  // Validate the inputs via Zod
  const validation = signUpSchema.safeParse({ email })
  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  // Define the base URL dynamically based on environment
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  const callbackUrl = new URL(`${origin}/auth/callback`)

  const { error } = await supabase.auth.signInWithOtp({
    email: validation.data.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  return { success: true }
}
