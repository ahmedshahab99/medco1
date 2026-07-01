'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
})

const otpSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, { message: "يجب أن يتكون الرمز من 6 أرقام" }),
})

export async function sendSignupOtp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()

  const validation = emailSchema.safeParse({ email })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: validation.data.email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function verifySignupOtp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()
  const token = formData.get('token')?.toString()

  const validation = otpSchema.safeParse({ email, token })
  if (!validation.success) {
    return { error: validation.error.issues[0].message }
  }

  const { error } = await supabase.auth.verifyOtp({
    email: validation.data.email,
    token: validation.data.token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')

  return { success: true }
}
