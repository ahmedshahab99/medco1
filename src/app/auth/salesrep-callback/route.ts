import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)

  const redirectTo = `${origin}/signup/salesrep?auth=1`
  const response = NextResponse.redirect(redirectTo)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, { ...options, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" })
          )
        },
      },
    }
  )

  const code = searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return response
    console.error('SalesRep callback error:', error?.message)
  }

  return response
}
