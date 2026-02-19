import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidStravaToken } from '@/lib/strava'

// Add a constant for our webhook verification token
const VERIFY_TOKEN = 'huji_run_strava_webhook_secret_2026'

// GET request is used by Strava to verify the webhook subscription
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Strava Webhook Verified!')
            return NextResponse.json({ 'hub.challenge': challenge })
        } else {
            return new NextResponse('Forbidden', { status: 403 })
        }
    }

    return new NextResponse('Bad Request', { status: 400 })
}

// POST request is used by Strava to send us activity updates
export async function POST(request: NextRequest) {
    try {
        const payload = await request.json()
        console.log('Received Strava Webhook:', payload)

        // We only care about Activity creation for now
        if (payload.object_type === 'activity' && payload.aspect_type === 'create') {
            const stravaOwnerId = payload.owner_id
            const activityId = payload.object_id

            const supabase = await createClient()

            // 1. Find which user this belongs to
            const { data: account } = await supabase
                .from('strava_accounts')
                .select('user_id')
                .eq('athlete_id', stravaOwnerId)
                .single()

            if (!account) {
                console.log(`Webhook received for unknown athlete: ${stravaOwnerId}`)
                return NextResponse.json({ status: 'ignored' })
            }

            const userId = account.user_id

            // 2. Get a valid token for this user
            const accessToken = await getValidStravaToken(userId)

            if (!accessToken) {
                console.error(`Could not get valid token for user ${userId} to fetch activity`)
                return NextResponse.json({ status: 'failed_token' })
            }

            // 3. Fetch the full activity details from Strava
            const activityResponse = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })

            if (!activityResponse.ok) {
                console.error('Failed to fetch activity details:', await activityResponse.text())
                return NextResponse.json({ status: 'failed_fetch' })
            }

            const act = await activityResponse.json()

            // 4. Get the user's team ID
            const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', userId).single()

            if (profile?.team_id) {
                // 5. Insert into our Database
                const { data: newActivity, error: insertError } = await supabase.from('activities').insert({
                    user_id: userId,
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
                }).select().single()

                if (insertError) {
                    console.error("Webhook DB Insert Error:", insertError)
                } else if (newActivity) {
                    // 6. Generate a Feed Post
                    await supabase.from('posts').insert({
                        team_id: profile.team_id,
                        user_id: userId,
                        activity_id: newActivity.id,
                        content: "Completed a run!"
                    })
                }
            }
        }

        // Always return 200 OK so Strava knows we received it
        return NextResponse.json({ status: 'success' })
    } catch (err) {
        console.error('Webhook Error:', err)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
