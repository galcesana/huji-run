
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
      athlete_id: Number(tokens.athlete.id),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      profile_picture: tokens.athlete.profile,
    })

  if (dbError) {
    console.error('Database Save Error:', dbError)
    return NextResponse.redirect(new URL('/dashboard?error=database_save_failed', request.url))
  }

  // 3. Initial Activity Import
  try {
    const { fetchStravaActivities } = await import('@/lib/strava')
    const activities = await fetchStravaActivities(user.id, tokens.access_token, 30)

    if (activities && Array.isArray(activities) && activities.length > 0) {
      // Get the user's team ID
      const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single()

      if (profile?.team_id) {
        // Map Strava format to our DB schema
        const activitiesToInsert = activities.map((act: any) => ({
          user_id: user.id,
          team_id: profile.team_id,
          strava_id: act.id,
          name: act.name,
          distance: act.distance,
          moving_time: act.moving_time,
          elapsed_time: act.elapsed_time,
          total_elevation_gain: act.total_elevation_gain || 0,
          start_date: act.start_date,
          map_polyline: act.map?.summary_polyline || null,
          average_speed: act.average_speed || 0,
          type: act.type
        }))

        // Insert into database (ignoring duplicates based on the unique strava_id constraint)
        const { error: insertError } = await supabase.from('activities').upsert(activitiesToInsert, { onConflict: 'strava_id' })

        if (insertError) {
          console.error("Error inserting initial activities:", insertError)
        } else {
          // Also generate Feed Posts for these new activities
          const { data: insertedActivities } = await supabase.from('activities').select('id').in('strava_id', activitiesToInsert.map(a => a.strava_id))

          if (insertedActivities && insertedActivities.length > 0) {
            const postsToInsert = insertedActivities.map(a => ({
              team_id: profile.team_id,
              user_id: user.id,
              activity_id: a.id,
              content: "Completed a run!" // Basic default content
            }))
            await supabase.from('posts').upsert(postsToInsert, { onConflict: 'activity_id' })
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to perform initial activity import:", err)
    // We don't want to fail the whole OAuth flow just because the import failed
  }

  // 3. Success Redirect
  return NextResponse.redirect(new URL('/dashboard?success=strava_connected', request.url))
}
