import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default async function TeamRosterPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getProfile()

    // 1. Join Flow Redirections
    if (!profile?.team_id) {
        redirect('/onboarding')
    }
    if (profile?.status === 'PENDING') {
        redirect('/pending')
    }

    const supabase = await createClient()

    // Fetch Active Athletes in the same team
    const { data: athletes } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('team_id', profile.team_id)
        .eq('status', 'ACTIVE')
        .order('full_name', { ascending: true })

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-10">
                <header className="flex flex-col items-center text-center gap-4 pt-4">
                    <div className="space-y-2">
                        <h1 className="text-[40px] sm:text-[48px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Team Roster<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium">Connect with your teammates</p>
                    </div>
                </header>

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[20px] font-[800] text-[#0f172a] tracking-tight flex items-center gap-2">
                            Active Members
                        </h2>
                        <span className="bg-[#fc4c02]/10 text-[#fc4c02] px-3 py-1 rounded-full text-sm font-bold">
                            {athletes?.length || 0}
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {athletes?.map((athlete, index) => (
                            <Card key={athlete.id} delay={index * 0.05} className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-[24px]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[14px] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 flex-shrink-0">
                                            {athlete.avatar_url ? (
                                                <img src={athlete.avatar_url} alt={athlete.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-slate-400">{athlete.full_name?.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <p className="font-[700] text-[#0f172a] text-[16px] tracking-tight">{athlete.full_name}</p>
                                                {(athlete.role === 'COACH' || athlete.role === 'CO_COACH') && (
                                                    <span className="bg-slate-100 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md">
                                                        {athlete.role === 'COACH' ? 'Coach' : 'Co-Coach'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#64748b] text-[14px] font-medium">{athlete.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {(!athletes || athletes.length === 0) && (
                            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50">
                                <p className="text-slate-500 font-medium">No active athletes found.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
