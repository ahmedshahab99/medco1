import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">❌</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">فشل تسجيل الدخول</h1>
        <p className="text-gray-500 mb-6">
          حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.
        </p>
        <Link href="/login" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  )
}
