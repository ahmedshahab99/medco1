import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { acceptInvitation } from '@/lib/invite'
import prisma from '@/lib/prisma'

function getRedirectUrl(request: Request, origin: string, path: string): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  if (isLocalEnv) {
    return `${origin}${path}`
  } else if (forwardedHost) {
    return `https://${forwardedHost}${path}`
  }
  return `${origin}${path}`
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  let invitationId = searchParams.get('redirect')
  if (invitationId) {
    invitationId = new URL(invitationId).searchParams.get('invitation_id')
  }

  const next = searchParams.get('next') || '/dashboard'

  async function handleAuthSuccess(supabase: ReturnType<typeof createServerClient>) {
    if (!invitationId) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const result = await acceptInvitation(invitationId, user.id, user.email)
    if (result.success) {
      await supabase.auth.refreshSession()
    }
  }

  // Create the redirect response first, then attach the supabase client to it
  // so cookies are set on the same response object that gets returned.
  const dispatchUrl = getRedirectUrl(request, origin, next)
  const response = NextResponse.redirect(dispatchUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
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

  // --- Strategy 1: PKCE code exchange (same-browser confirmation) ---
  const code = searchParams.get('code')
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      await handleAuthSuccess(supabase)
      // Check if user is a SalesRep → redirect to their portal
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const isRep = await prisma.salesRep.findUnique({ where: { email: user.email } })
        if (isRep) {
          response.headers.set('Location', getRedirectUrl(request, origin, '/salesrep'))
          return response
        }
        // New user (no doctor Profile) → send to salesrep signup
        const isDoctor = await prisma.profile.findUnique({ where: { email: user.email } })
        if (!isDoctor) {
          response.headers.set('Location', getRedirectUrl(request, origin, '/signup/salesrep?auth=1'))
          return response
        }
      }
      return response
    }
    // Pass the error message to the error page
    const errorMsg = error?.message || 'unknown'
    return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(errorMsg)}`)
  }

  // --- Strategy 2: token_hash verification (cross-browser confirmation) ---
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (!error) {
      await handleAuthSuccess(supabase)
      return response
    }
  }

  // --- Strategy 3: already authenticated and just needs to accept the invite ---
  const { data: { user }, error } = await supabase.auth.getUser()
  if (user && !error) {
    await handleAuthSuccess(supabase)
    if (user?.email) {
      const isRep = await prisma.salesRep.findUnique({ where: { email: user.email } })
      if (isRep) {
        response.headers.set('Location', getRedirectUrl(request, origin, '/salesrep'))
        return response
      }
    }
    return response
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
