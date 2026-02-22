import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { EventCard } from '@/components/calendar/EventCard'
import { CalendarDays } from 'lucide-react'

export default async function CalendarPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getProfile()

    if (!profile?.team_id) {
        redirect('/onboarding')
    }
    if (profile?.status === 'PENDING') {
        redirect('/pending')
    }

    const supabase = await createClient()

    // Fetch upcoming events for the team, including the RSVPs array
    const { data: events, error } = await supabase
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
        .gte('starts_at', new Date().toISOString()) // Only upcoming
        .order('starts_at', { ascending: true })
        .limit(30)

    if (error) {
        console.error("Error fetching events:", error)
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-4 md:px-8 md:pb-8 pt-4 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center gap-4 mb-10 pt-4">
                    <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none mt-1">
                        Team Calendar<span className="text-[#10b981]">.</span>
                    </h1>
                    <p className="text-[18px] text-[#64748b] font-medium">Upcoming practices, races, and events</p>
                </header>

                <div className="flex flex-col gap-6">
                    {events && events.length > 0 ? (
                        events.map((event) => (
                            <EventCard key={event.id} event={event} currentUserId={user.id} />
                        ))
                    ) : (
                        <div className="text-center p-12 bg-white rounded-[24px] border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col items-center gap-4 border border-slate-100/50">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                                <CalendarDays size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-[20px] font-[700] text-[#0f172a] tracking-tight">No upcoming events</h3>
                            <p className="text-[#64748b] leading-[1.6] max-w-sm">When your coach schedules a team practice or a race, it will appear here so you can RSVP.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
