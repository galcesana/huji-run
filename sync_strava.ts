import { createClient } from '@supabase/supabase-js'
import { fetchStravaActivities, getValidStravaToken } from './src/lib/strava'

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supaUrl, supaKey)

async function main() {
    const { data: accounts } = await supabase.from('strava_accounts').select('*')

    if (!accounts || accounts.length === 0) {
        console.log('No strava accounts found.')
        return
    }

    for (const account of accounts) {
        console.log(`Processing user ${account.user_id}...`)
        try {
            const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', account.user_id).single()
            if (!profile || !profile.team_id) {
                console.log('User has no team, skipping...')
                continue
            }

            const token = await getValidStravaToken(account.user_id, supabase)
            if (!token) {
                console.log('No valid token for user, skipping...')
                continue
            }

            const activities = await fetchStravaActivities(token, 1) // page 1

            for (const activity of activities) {
                const { data: existing } = await supabase.from('activities').select('id').eq('strava_id', activity.id).single()
                if (existing) continue;

                const { data: actData, error: actErr } = await supabase.from('activities').insert({
                    user_id: account.user_id,
                    strava_id: activity.id.toString(),
                    name: activity.name,
                    distance: activity.distance,
                    moving_time: activity.moving_time,
                    elapsed_time: activity.elapsed_time,
                    type: activity.type,
                    start_date: activity.start_date,
                    average_speed: activity.average_speed,
                }).select().single()

                if (actErr) {
                    console.error('Failed to insert activity', actErr)
                    continue
                }

                const { error: postErr } = await supabase.from('posts').insert({
                    user_id: account.user_id,
                    team_id: profile.team_id,
                    activity_id: actData.id,
                    created_at: activity.start_date
                })

                if (!postErr) {
                    console.log(`Saved activity ${activity.name}`)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
    console.log("Done checking all accounts.")
}

main().catch(console.error)
