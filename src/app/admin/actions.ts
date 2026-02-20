'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Helper to check if user is coach
async function checkCoach() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'COACH' && profile?.role !== 'CO_COACH') {
        redirect('/feed') // Redirect unauthorized users
    }

    return supabase
}

export async function approveRequest(requestId: string, userId: string) {
    const supabase = await checkCoach()
    const { data: { user } } = await supabase.auth.getUser()
    const adminClient = await createAdminClient()

    // 0. Get Coach's Team ID
    const { data: coachProfile } = await adminClient
        .from('profiles')
        .select('team_id')
        .eq('id', user!.id)
        .single()

    // 1. Update Request Status
    const { error: reqError } = await adminClient
        .from('join_requests')
        .update({ status: 'APPROVED' })
        .eq('id', requestId)

    if (reqError) {
        console.error('Failed to update request:', reqError)
        return
    }

    // 2. Update User Profile Status & Enforce Team Assignment
    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            status: 'ACTIVE',
            team_id: coachProfile?.team_id
        })
        .eq('id', userId)

    if (profileError) {
        console.error('Failed to activate user:', profileError)
        return
    }

    revalidatePath('/admin')
}

export async function rejectRequest(requestId: string, userId: string) {
    await checkCoach()
    const adminClient = await createAdminClient()

    // 1. Cascading Delete Dependent Data
    await adminClient.from('posts').delete().eq('user_id', userId)
    await adminClient.from('activities').delete().eq('user_id', userId)
    await adminClient.from('join_requests').delete().eq('user_id', userId)
    await adminClient.from('strava_accounts').delete().eq('user_id', userId)

    // 2. Delete the user from Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)
    if (authError) {
        console.error('Failed to delete auth user on rejection:', authError)
        return
    }

    // 3. Explicitly delete profile
    await adminClient.from('profiles').delete().eq('id', userId)

    revalidatePath('/admin')
}

export async function removeAthlete(userId: string) {
    await checkCoach()
    const adminClient = await createAdminClient()

    // 1. Cascading Delete Dependent Data
    await adminClient.from('posts').delete().eq('user_id', userId)
    await adminClient.from('activities').delete().eq('user_id', userId)
    await adminClient.from('join_requests').delete().eq('user_id', userId)
    await adminClient.from('strava_accounts').delete().eq('user_id', userId)

    // 2. Delete the user from Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
        console.error('Failed to delete auth user:', authError)
        return
    }

    // 3. Explicitly delete profile
    const { error: profileError } = await adminClient
        .from('profiles')
        .delete()
        .eq('id', userId)

    if (profileError) {
        console.error('Failed to delete profile:', profileError)
    }

    revalidatePath('/admin')
}
