import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { redis } from '@/lib/redis'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )
    return payload
  } catch {
    return null
  }
}

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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
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

  // ── Token blacklist check for protected routes ──
  // If an admin revoked this user's session (role change / delete),
  // we compare the JWT iat with the revocation timestamp in Redis.
  if (user && isProtectedRoute) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      const payload = decodeJwtPayload(session.access_token)
      const iat = typeof payload?.iat === 'number' ? payload.iat : null

      if (iat) {
        const revokedAt = await redis.get(`session:revoked:${user.id}`)
        if (revokedAt && parseInt(revokedAt as string) > iat * 1000) {
          // Token was issued before revocation — force re-login
          // Use local signOut so Supabase SSR clears all auth cookies properly.
          await supabase.auth.signOut({ scope: 'local' })

          const loginUrl = request.nextUrl.clone()
          loginUrl.pathname = '/login'
          const redirectResponse = NextResponse.redirect(loginUrl)

          // Copy Set-Cookie headers (cookie clears) from supabaseResponse
          // so the browser actually deletes the auth cookies.
          supabaseResponse.headers.getSetCookie().forEach((cookieValue) => {
            redirectResponse.headers.append('Set-Cookie', cookieValue)
          })

          return redirectResponse
        }
      }
    }
  }

  // Auth routes: redirect to /dashboard if user is already logged in
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (user && isAuthRoute) {
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
