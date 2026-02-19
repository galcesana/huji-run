
import { redirect } from 'next/navigation'

export async function GET() {
  const client_id = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
  const redirect_uri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/strava/callback`
  const scope = 'read,activity:read_all'

  if (!client_id) {
    return new Response('Strava Client ID not found', { status: 500 })
  }

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: 'code',
    scope,
    approval_prompt: 'force' // Access token + Refresh token
  })

  redirect(`https://www.strava.com/oauth/authorize?${params.toString()}`)
}
