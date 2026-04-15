'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  const validation = loginSchema.safeParse({ email, password })
  if (!validation.success) {
    return {
      error: validation.error.issues[0].message,
    }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  })

  if (error) {
    // Check for specific error messages to translate or simplify
    if (error.message === 'Invalid login credentials') {
      return { error: 'بيانات الاعتماد غير صالحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}
