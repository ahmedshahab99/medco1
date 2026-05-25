import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { acceptInvitation } from '@/lib/invite'

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
  const redirectTo = getRedirectUrl(request, origin, next)
  const response = NextResponse.redirect(redirectTo)

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
      return response
    }
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
    return response
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
