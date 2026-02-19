
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=strava_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', request.url))
  }

  // 1. Exchange Access Code for Tokens
  const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenResponse.json()

  if (tokens.errors) {
    console.error('Strava Token Exchange Error:', tokens)
    return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', request.url))
  }

  // 2. Save Tokens to Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { error: dbError } = await supabase
    .from('strava_accounts')
    .upsert({
      user_id: user.id,
      strava_id: tokens.athlete.id.toString(),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      profile_url: tokens.athlete.profile,
    })

  if (dbError) {
    console.error('Database Save Error:', dbError)
    return NextResponse.redirect(new URL('/dashboard?error=database_save_failed', request.url))
  }

  // 3. Success Redirect
  return NextResponse.redirect(new URL('/dashboard?success=strava_connected', request.url))
}
