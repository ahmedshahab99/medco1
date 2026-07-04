'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { sendSignupOtp, verifySignupOtp } from './actions'
import { CheckCircle2, AlertCircle, Loader2, UserPlus, ArrowLeft, RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signupWithGoogle } from '@/utils/supabase/signInGoogle'

const emailSchema = z.object({
  email: z.string().email({ message: 'يرجى إدخال بريد إلكتروني صالح' }),
})

type EmailFormValues = z.infer<typeof emailSchema>

const RESEND_COOLDOWN_SEC = 60
const OTP_LEN = 6

export default function SignUpPage() {
  const router = useRouter()

  // ---- multi-step state ----
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // ---- otp input state (mirrors BookingOtpForm pattern) ----
  const [code, setCode] = useState<string[]>(Array(OTP_LEN).fill(''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const fullCode = code.join('')

  // ---- email form (step 1) ----
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  // ---- cooldown countdown ----
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // ---- auto-focus first OTP input ----
  useEffect(() => {
    if (step === 'otp') inputsRef.current[0]?.focus()
  }, [step])

  // ---- step 1: send OTP ----
  const onSendOtp = async (data: EmailFormValues) => {
    setError(null)
    setIsSending(true)

    const formData = new FormData()
    formData.append('email', data.email)

    const result = await sendSignupOtp(formData)
    setIsSending(false)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setEmail(data.email)
      setStep('otp')
      setCooldown(RESEND_COOLDOWN_SEC)
    }
  }

  // ---- step 2: verify OTP ----
  const onVerifyOtp = async () => {
    setError(null)

    if (fullCode.length !== OTP_LEN) {
      setError('أدخل الرمز المكوّن من 6 أرقام')
      return
    }

    setIsVerifying(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('token', fullCode)

    const result = await verifySignupOtp(formData)
    setIsVerifying(false)

    if (result?.error) {
      setError(result.error)
      setCode(Array(OTP_LEN).fill(''))
    } else if (result?.success) {
      setSuccess(true)
      router.push('/dashboard')
    }
  }

  // ---- step 2: resend OTP ----
  const onResend = async () => {
    setError(null)
    setIsSending(true)

    const formData = new FormData()
    formData.append('email', email)

    const result = await sendSignupOtp(formData)
    setIsSending(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setCode(Array(OTP_LEN).fill(''))
      setCooldown(RESEND_COOLDOWN_SEC)
    }
  }

  // ---- step 2: back to email ----
  const onBackToEmail = () => {
    setStep('email')
    setError(null)
    setCode(Array(OTP_LEN).fill(''))
    setCooldown(0)
  }

  // ---- OTP input handlers ----
  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < OTP_LEN - 1) {
      inputsRef.current[i + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN)
    if (!digits) return
    const next = Array(OTP_LEN).fill('')
    for (let i = 0; i < digits.length; i++) next[i] = digits[i]
    setCode(next)
    inputsRef.current[Math.min(digits.length, OTP_LEN - 1)]?.focus()
  }

  // ---- Google sign-up ----
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
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase bg-blue-50 text-blue-600 rounded-lg">
            سجل حساب
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/30">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">انضم إلى ميدكو</h1>
          <p className="text-sm text-gray-500 text-center">
            {step === 'email'
              ? 'أنشئ حسابًا لإدارة عيادتك بسهولة.'
              : 'أدخل رمز التحقق المرسل إلى بريدك الإلكتروني.'}
          </p>
          {step === 'otp' && (
            <p className="text-md font-bold text-red-600 mt-1">تحقق من الرسائل غير المرغوب فيها الخاص ببريدك الالكتروني (spam)</p>
          )}
        </div>

        <div>
          {/* ===================== STEP 1: EMAIL ===================== */}
          {step === 'email' && (
            <form onSubmit={handleSubmit(onSendOtp)} className="space-y-5">
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
                disabled={isSending}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    جارٍ إرسال الرمز...
                  </>
                ) : (
                  <>
                    إرسال رمز التحقق
                    <ArrowLeft className="w-4 h-4 ms-2 opacity-70 group-hover:-translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ===================== STEP 2: OTP ===================== */}
          {step === 'otp' && (
            <>
              {/* Back to email */}
              <button
                onClick={onBackToEmail}
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={16} />
                تغيير البريد الإلكتروني
              </button>

              {/* Sent-to info */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {email}
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-start text-sm border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 me-3 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center text-sm border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 me-3 flex-shrink-0" />
                  <p>تم التحقق بنجاح، جارٍ التحويل...</p>
                </div>
              )}

              {/* 6-digit OTP inputs */}
              <div className="flex gap-2 justify-center mb-6" dir="ltr">
                {Array.from({ length: OTP_LEN }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                    disabled={isVerifying || success}
                    className="size-12 text-center text-lg font-bold border rounded-xl outline-none transition-all bg-white/50 text-gray-800 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 disabled:opacity-50"
                    aria-label={`الرقم ${i + 1}`}
                  />
                ))}
              </div>

              {/* Verify button */}
              <button
                onClick={onVerifyOtp}
                disabled={isVerifying || success || fullCode.length !== OTP_LEN}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : (
                  'تحقق'
                )}
              </button>

              {/* Resend */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {cooldown > 0 ? (
                  <span className="text-xs text-gray-400">
                    إعادة الإرسال خلال {cooldown} ثانية
                  </span>
                ) : (
                  <button
                    onClick={onResend}
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                  >
                    <RotateCw size={14} className={isSending ? 'animate-spin' : ''} />
                    {isSending ? 'جارٍ الإرسال...' : 'إعادة إرسال الرمز'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Google sign-up (only shown in step 1) */}
          {step === 'email' && (
            <div className="mt-6">
              <button
                onClick={handleSignupWithGoogle}
                className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                التسجيل مع Google
                <svg className="w-6 mx-2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
