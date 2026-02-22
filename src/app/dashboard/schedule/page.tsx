import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { ScheduleViewer } from '@/components/schedule/ScheduleViewer'

export default async function SchedulePage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getProfile()

    if (!profile?.team_id) redirect('/onboarding')
    if (profile?.status === 'PENDING') redirect('/pending')

    const supabase = await createClient()

    // Fetch all published training plans
    const { data: plans } = await supabase
        .from('training_plans')
        .select(`
            id,
            title,
            week_start_date,
            workouts (
                title,
                description,
                type,
                distance_km,
                duration_min,
                target_pace,
                day_of_week
            )
        `)
        .eq('team_id', profile.team_id)
        .eq('status', 'PUBLISHED')
        .order('week_start_date', { ascending: false })
        .limit(52)

    // Fetch all events (past + future for browsing)
    const { data: events } = await supabase
        .from('events')
        .select(`
            id,
            title,
            description,
            type,
            location,
            starts_at,
            ends_at,
            repeat_weekly,
            event_rsvps (
                user_id,
                status,
                profiles (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq('team_id', profile.team_id)
        .order('starts_at', { ascending: true })
        .limit(200)

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-4 md:px-8 md:pb-8 pt-4 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center gap-4 mb-6 pt-4">
                    <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none mt-1">
                        Schedule<span className="text-violet-500">.</span>
                    </h1>
                    <p className="text-[18px] text-[#64748b] font-medium">Trainings, events & races</p>
                </header>

                <ScheduleViewer
                    plans={plans || []}
                    events={(events as any) || []}
                    currentUserId={user.id}
                />
            </div>
        </main>
    )
}
