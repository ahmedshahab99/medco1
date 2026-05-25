'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
 
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()
  

  const validation = loginSchema.safeParse({ email })
  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.signInWithOtp({
    email: validation.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    // Check for specific error messages to translate or simplify
    if (error.message === 'Invalid login credentials') {
      return { error: 'بيانات الاعتماد غير صالحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.' }
    }
    return { error: error.message }
  }

  return { success: true };
}
