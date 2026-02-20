import { cache } from 'react'
import { createClient } from './server'

/**
 * Get the currently authenticated user
 * Memoized per-request to prevent redundant auth checks
 */
export const getUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
})

/**
 * Get the current user's profile with role and team_id
 * Memoized per-request
 */
export const getProfile = cache(async () => {
    const user = await getUser()
    if (!user) return null

    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, team_id, full_name, avatar_url, status')
        .eq('id', user.id)
        .single()

    return profile
})
