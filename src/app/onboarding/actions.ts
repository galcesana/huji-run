
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function joinTeam(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const code = formData.get('code') as string
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

    // 3. Create Join Request
    const { error: requestError } = await supabase
        .from('join_requests')
        .insert({
            user_id: user.id,
            team_id: team.id,
            status: 'PENDING',
            note: note
        })

    if (requestError) {
        return { error: 'Request failed. You might have already applied.' }
    }

    // 4. Update Profile Status
    await supabase
        .from('profiles')
        .update({
            team_id: team.id,
            status: 'PENDING'
        })
        .eq('id', user.id)

    revalidatePath('/', 'layout')
    redirect('/pending')
}
