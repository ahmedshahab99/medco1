import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Builds the appropriate redirect URL, accounting for load balancers
 * that set x-forwarded-host in production environments.
 */
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

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'

  // --- Strategy 1: PKCE code exchange (same-browser confirmation) ---
  const code = searchParams.get('code')
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, origin, next))
    }
  }

  // --- Strategy 2: token_hash verification (cross-browser confirmation) ---
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (!error) {
      return NextResponse.redirect(getRedirectUrl(request, origin, next))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
