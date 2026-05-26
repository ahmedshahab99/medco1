'use client'

import { useState } from 'react'
import { login } from './actions'
import { signupWithGoogle } from '@/utils/supabase/signInGoogle'
import { Chrome, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState<'google' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading('google')
    setError(null)
    const result = await signupWithGoogle()
    if (result?.error) {
      setError(result.error)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-md p-8 md:p-10 bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gray-900/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">مرحباً بك</h1>
          <p className="text-sm text-gray-500 text-center">سجل دخولك أو أنشئ حساب جديد للوصول إلى لوحة التحكم</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start text-sm border border-red-100 mb-5">
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading === 'google'}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-all border border-gray-200 shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span className="font-semibold">{loading === 'google' ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بحساب Google'}</span>
        </button>

        <div className="mt-6 text-center text-xs text-gray-400">
          بالضغط على تسجيل الدخول، أنت توافق على{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">شروط الخدمة</Link>
          {' '}و{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">سياسة الخصوصية</Link>
        </div>
      </div>
    </div>
  )
}
