'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from './actions'
import { AlertCircle, Loader2, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormValues) => {
    setError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      const result = await login(formData)

      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden"
      dir="rtl"
      style={{ fontFamily: 'var(--font-almarai)' }}
    >
      {/* Background design elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md p-8 md:p-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase bg-blue-50 text-blue-600 rounded-lg">
            تسجيل الدخول
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">مرحباً بك مجدداً</h1>
          <p className="text-sm text-gray-500 text-center">
            سجل دخولك للوصول إلى لوحة التحكم الخاصة بك.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start text-sm border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 me-3 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 bg-white/50 border rounded-xl text-sm transition-all outline-none text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder:text-gray-400 ${
                  errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                }`}
                style={{ textAlign: 'right', paddingRight: '16px' }}
              />
              {errors.email && (
                <p className="text-xs text-red-500 px-1 animate-in slide-in-from-top-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">كلمة المرور</label>
                {/* Optional: Add Forgot Password link here later */}
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 bg-white/50 border rounded-xl text-sm transition-all outline-none text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder:text-gray-400 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                  }`}
                  style={{ textAlign: 'right', paddingRight: '16px', paddingLeft: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 px-1 animate-in slide-in-from-top-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                تسجيل الدخول
                <ArrowLeft className="w-4 h-4 ms-2 opacity-70 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6 font-medium">
            ليس لديك حساب بعد؟{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 hover:underline transition-all">
              إنشاء حساب جديد
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
