import { createClient } from "./client";

export async function signupWithGoogle() {
  const supabase = await createClient()
  const origin = `${window.location.origin}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
  console.log('Google sign-in data:', data)
  console.log('Google sign-in error:', error)

  if (error) {
    return { error: error.message }
  }

  
}