import { createClient } from '@/lib/supabase/server'

// Ensure we have a valid token (refresh if necessary)
export async function getValidStravaToken(userId: string): Promise<string | null> {
    const supabase = await createClient()

    const { data: account, error } = await supabase
        .from('strava_accounts')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !account) {
        console.error('Failed to get Strava account for user:', userId, error)
        return null
    }

    // Check if token is expired (adding a 5-minute buffer)
    const nowEpoch = Math.floor(Date.now() / 1000)
    if (account.expires_at < nowEpoch + 300) {
        try {
            // Token is expired, refresh it
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
                    client_secret: process.env.STRAVA_CLIENT_SECRET,
                    refresh_token: account.refresh_token,
                    grant_type: 'refresh_token',
                }),
            })

            const newTokens = await response.json()

            if (newTokens.errors) {
                console.error('Error refreshing token:', newTokens)
                return null
            }

            // Save new tokens to DB
            await supabase
                .from('strava_accounts')
                .update({
                    access_token: newTokens.access_token,
                    refresh_token: newTokens.refresh_token,
                    expires_at: newTokens.expires_at,
                })
                .eq('user_id', userId)

            return newTokens.access_token
        } catch (err) {
            console.error('Failed to refresh Strava token:', err)
            return null
        }
    }

    return account.access_token
}

// Fetch activities for a user
export async function fetchStravaActivities(userId: string, accessToken: string, limit = 30) {
    try {
        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${limit}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            console.error('Failed to fetch activities from Strava:', await response.text())
            return null
        }

        const activities = await response.json()
        return activities
    } catch (err) {
        console.error('Error fetching Strava activities:', err)
        return null
    }
}
