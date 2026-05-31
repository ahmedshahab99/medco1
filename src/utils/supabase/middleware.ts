import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: "lax",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              path: "/",
            })
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes: redirect to /login if no user
  const protectedRoutes = ['/dashboard', '/admin', '/doctor', '/hr']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const isSalesRepRoute =
    request.nextUrl.pathname.startsWith('/signup/salesrep') ||
    request.nextUrl.pathname.startsWith('/salesrep') ||
    request.nextUrl.pathname.startsWith('/auth/salesrep-callback')

  // Auth routes: redirect clinic users to /dashboard if already logged in.
  // Sales reps complete onboarding under /signup/salesrep and do not have a clinic tenant.
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (user && isAuthRoute && !isSalesRepRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Invitation pages are always public
  if (request.nextUrl.pathname.startsWith('/invite/')) {
    return supabaseResponse
  }

  return supabaseResponse
}
