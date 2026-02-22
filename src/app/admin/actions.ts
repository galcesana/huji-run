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

export async function createBroadcast(formData: FormData) {
    const supabase = await checkCoach()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Get coach's team
    const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single()

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const postType = formData.get('postType') as string || 'UPDATE'
    const imageUrl = formData.get('imageUrl') as string

    if (!content) return { error: 'Content is required' }

    const { error } = await supabase
        .from('posts')
        .insert({
            user_id: user.id,
            team_id: profile!.team_id,
            content: content,
            title: title || null,
            image_url: imageUrl || null,
            post_type: postType,
            status: 'PUBLISHED' // Broadcasts go live immediately for now
        })

    if (error) {
        console.error('Failed to create broadcast:', error)
        return { error: 'Failed to broadcast message' }
    }

    revalidatePath('/dashboard/feed')
    revalidatePath('/admin')
    return { success: true }
}

export async function createEvent(formData: FormData) {
    const supabase = await checkCoach()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single()

    const title = formData.get('title') as string
    const eventType = formData.get('eventType') as string
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const startDate = formData.get('startDate') as string
    const startTime = formData.get('startTime') as string
    const repeatWeekly = formData.get('repeatWeekly') === 'true'

    if (!title || !startDate || !startTime || !location) {
        return { error: 'Please fill in all required fields' }
    }

    // Combine date and time strings directly to ensure valid timestamptz formatting
    // Assumes local timezone of the coach submitting it (handled by browser HTML inputs)
    const datetimeStr = `${startDate}T${startTime}:00`
    const startsAt = new Date(datetimeStr).toISOString()

    const { error } = await supabase
        .from('events')
        .insert({
            team_id: profile!.team_id,
            created_by: user.id,
            title,
            type: eventType,
            description,
            location,
            starts_at: startsAt,
            // Optional: MVP auto-calculates ends_at as 2 hours later
            ends_at: new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString(),
            repeat_weekly: repeatWeekly
        })

    if (error) {
        console.error('Failed to create event:', error)
        return { error: 'Failed to schedule event' }
    }

    revalidatePath('/dashboard/schedule')
    revalidatePath('/admin')
    return { success: true }
}

// ── Training Plans ──────────────────────────────────────────────

export async function createTrainingPlan(formData: {
    title: string;
    weekStartDate: string; // ISO date string e.g. "2024-03-18"
    workouts: {
        dayOfWeek: number; // 0=Sun, 6=Sat
        title: string;
        description?: string;
        type: 'EASY' | 'WORKOUT' | 'LONG_RUN' | 'REST';
        distanceKm?: number;
        durationMin?: number;
        targetPace?: string;
    }[];
}) {
    const supabase = await checkCoach()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single()

    if (!profile?.team_id) return { error: 'No team found' }

    if (!formData.title || !formData.weekStartDate) {
        return { error: 'Title and week start date are required' }
    }

    // 1. Create the plan (DRAFT by default)
    const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .insert({
            team_id: profile.team_id,
            created_by: user.id,
            title: formData.title,
            week_start_date: formData.weekStartDate,
            status: 'DRAFT'
        })
        .select('id')
        .single()

    if (planError) {
        console.error('Failed to create training plan:', planError)
        if (planError.code === '23505') {
            return { error: 'A plan already exists for this week. Choose a different week.' }
        }
        return { error: 'Failed to create training plan' }
    }

    // 2. Bulk insert workouts (skip REST days without titles)
    const workoutRows = formData.workouts
        .filter(w => w.title.trim() !== '')
        .map(w => ({
            plan_id: plan.id,
            day_of_week: w.dayOfWeek,
            title: w.title,
            description: w.description || null,
            type: w.type,
            distance_km: w.distanceKm || null,
            duration_min: w.durationMin || null,
            target_pace: w.targetPace || null,
        }))

    if (workoutRows.length > 0) {
        const { error: workoutError } = await supabase
            .from('workouts')
            .insert(workoutRows)

        if (workoutError) {
            console.error('Failed to add workouts:', workoutError)
            // Plan was created but workouts failed — delete the plan to rollback
            await supabase.from('training_plans').delete().eq('id', plan.id)
            return { error: 'Failed to save workouts' }
        }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/schedule')
    return { success: true, planId: plan.id }
}

export async function publishPlan(planId: string) {
    const supabase = await checkCoach()

    const { error } = await supabase
        .from('training_plans')
        .update({
            status: 'PUBLISHED',
            published_at: new Date().toISOString()
        })
        .eq('id', planId)

    if (error) {
        console.error('Failed to publish plan:', error)
        return { error: 'Failed to publish plan' }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/schedule')
    return { success: true }
}

export async function unpublishPlan(planId: string) {
    const supabase = await checkCoach()

    const { error } = await supabase
        .from('training_plans')
        .update({ status: 'DRAFT', published_at: null })
        .eq('id', planId)

    if (error) {
        console.error('Failed to unpublish plan:', error)
        return { error: 'Failed to unpublish plan' }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/schedule')
    return { success: true }
}

export async function deletePlan(planId: string) {
    const supabase = await checkCoach()

    const { error } = await supabase
        .from('training_plans')
        .delete()
        .eq('id', planId)

    if (error) {
        console.error('Failed to delete plan:', error)
        return { error: 'Failed to delete plan' }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/schedule')
    return { success: true }
}
