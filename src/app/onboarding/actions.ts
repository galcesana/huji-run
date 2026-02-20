
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function joinTeam(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    const code = (formData.get('code') as string)?.trim().toUpperCase()
    const note = formData.get('note') as string

    // 1. Validate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Find Team by Code
    const { data: team, error } = await supabase
        .from('teams')
        .select('id')
        .eq('join_code', code)
        .single()

    if (error || !team) {
        return { error: 'Invalid Team Code' }
    }

    // 3. Check for existing request or Create New (Admin Client for reliability)
    const { data: existingRequest } = await adminClient
        .from('join_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('team_id', team.id)
        .single()

    if (!existingRequest) {
        const { error: requestError } = await adminClient
            .from('join_requests')
            .insert({
                user_id: user.id,
                team_id: team.id,
                status: 'PENDING',
                note: note
            })

        if (requestError) {
            console.error('Join request error:', requestError)
            return { error: 'Failed to send request. Please try again.' }
        }
    }

    // 4. Update Profile Status (Admin Client to bypass RLS)
    const { error: profileError } = await adminClient
        .from('profiles')
        .update({
            team_id: team.id,
            status: 'PENDING'
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Profile update error:', profileError)
        return { error: 'Failed to update profile. Please try again.' }
    }

    revalidatePath('/', 'layout')
    redirect('/pending')
}
