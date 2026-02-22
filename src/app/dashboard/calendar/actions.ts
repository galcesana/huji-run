'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitRsvp(eventId: string, status: 'GOING' | 'NOT_GOING', note?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Upsert the RSVP
    const { error } = await supabase
        .from('event_rsvps')
        .upsert(
            {
                event_id: eventId,
                user_id: user.id,
                status: status,
                response_note: note || null,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'event_id,user_id' }
        )

    if (error) {
        console.error('Failed to RSVP:', error)
        return { error: 'Failed to save RSVP' }
    }

    revalidatePath('/dashboard/schedule')
    return { success: true }
}
