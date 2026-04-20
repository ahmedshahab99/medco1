'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signup } from './actions'
import { CheckCircle2, AlertCircle, Loader2, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { signupWithGoogle } from '@/utils/supabase/signInGoogle'

const signUpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = (data: SignUpFormValues) => {
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      

      const result = await signup(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }
  const handleSignupWithGoogle = async () => {
    await signupWithGoogle()
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
            سجل حساب
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">انضم إلى ميدكو</h1>
          <p className="text-sm text-gray-500 text-center">
            أنشئ حسابًا لإدارة عيادتك بسهولة.
            <br />
            او سجل دخول
          </p>
        </div>
<div>
  
          {success ? (
            <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
              <h3 className="font-semibold text-lg mb-2">تحقق من بريدك الإلكتروني</h3>
              <p className="text-sm text-emerald-600 mb-6">
                أرسلنا رابط تأكيد إلى عنوان بريدك الإلكتروني. يرجى النقر عليه لتفعيل حسابك.
              </p>
              <Link
              onClick={()=>setSuccess(false)}
                href="/signup"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
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
                    className={`w-full px-4 py-2.5 bg-white/50 border rounded-xl text-sm transition-all outline-none text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder:text-gray-400 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                      }`}
                    style={{ textAlign: 'right', paddingRight: '16px' }}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 px-1 animate-in slide-in-from-top-1">
                      {errors.email.message}
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
                    جارٍ إنشاء الحساب...
                  </>
                ) : (
                  <>
                    دخول عبر البريد الإلكتروني
                    <ArrowLeft className="w-4 h-4 ms-2 opacity-70 group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </button>
  
              
            </form>
          )}
           {/* sign up with google button */}
      <div className="mt-6">
        <button
          onClick={handleSignupWithGoogle}
          className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          
          التسجيل مع Google 
          <svg className='w-6 mx-2' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
        </button>
      </div>
          
</div>
     
      </div>
    </div>
  )
}
