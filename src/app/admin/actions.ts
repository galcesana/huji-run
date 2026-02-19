
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

    // 1. Update Request Status
    const { error: reqError } = await supabase
        .from('join_requests')
        .update({ status: 'APPROVED' })
        .eq('id', requestId)

    if (reqError) {
        console.error('Failed to update request:', reqError)
        return
    }

    // 2. Update User Profile Status
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', userId)

    if (profileError) {
        console.error('Failed to activate user:', profileError)
        return
    }

    revalidatePath('/admin')
}

export async function rejectRequest(requestId: string) {
    const supabase = await checkCoach()

    const { error } = await supabase
        .from('join_requests')
        .update({ status: 'REJECTED' })
        .eq('id', requestId)

    if (error) {
        console.error('Failed to reject request:', error)
        return
    }

    revalidatePath('/admin')
}
