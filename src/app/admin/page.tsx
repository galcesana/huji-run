import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { approveRequest, rejectRequest, removeAthlete } from './actions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ShieldCheck, UserCheck, UserX, Mail, ArrowLeft, Clock, Users, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { RemoveAthleteButton } from '@/components/admin/RemoveAthleteButton'
import { BroadcastForm } from '@/components/admin/BroadcastForm'
import { EventForm } from '@/components/admin/EventForm'
import { TrainingPlanBuilder } from '@/components/admin/TrainingPlanBuilder'
import { PlansList } from '@/components/admin/PlansList'

export default async function AdminPage() {
    // 1. Verify Coach Access using memoized profile
    const profile = await getProfile()

    if (!profile) redirect('/login')

    if (profile.role !== 'COACH' && profile.role !== 'CO_COACH') {
        return (
            <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
                <Card className="p-10 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[32px] text-center max-w-sm">
                    <div className="bg-red-50 w-16 h-16 flex items-center justify-center rounded-2xl text-red-500 mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-[24px] font-[900] text-[#0f172a] tracking-tight mb-3">Access Denied</h1>
                    <p className="text-[#64748b] leading-[1.6]">You must be a coach to view the management panel.</p>
                    <Link href="/dashboard" className="block mt-8">
                        <Button className="w-full bg-[#0f172a] hover:bg-black text-white rounded-xl py-6 font-bold">
                            Return to Dashboard
                        </Button>
                    </Link>
                </Card>
            </main>
        )
    }

    const adminClient = await createAdminClient()
    const supabase = await createClient()

    // 2. Fetch Pending Requests (Using Admin client to see all for team)
    const { data: requests } = await adminClient
        .from('join_requests')
        .select(`
            id,
            created_at,
            note,
            team_id,
            user:profiles (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('status', 'PENDING')
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false })

    // 3. Fetch Active Athletes in the same team
    const { data: athletes } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('team_id', profile.team_id)
        .eq('status', 'ACTIVE')
        .order('full_name', { ascending: true })

    // 4. Fetch Training Plans with workouts
    const { data: trainingPlans } = await supabase
        .from('training_plans')
        .select(`
            id,
            title,
            week_start_date,
            status,
            published_at,
            created_at,
            workouts (
                id,
                day_of_week,
                title,
                description,
                type,
                distance_km,
                duration_min,
                target_pace
            )
        `)
        .eq('team_id', profile.team_id)
        .order('week_start_date', { ascending: false })
        .limit(20)

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-16">
                <header className="flex flex-col items-center text-center gap-4 pt-4">
                    <div className="space-y-2">
                        <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Coach Panel<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium">Team management & athlete review</p>
                    </div>
                </header>

                {/* Section 0: Broadcast Messages */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-[20px] font-[800] text-[#0f172a] px-2">Announcements</h2>
                        <BroadcastForm />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-[20px] font-[800] text-[#0f172a] px-2">Team Calendar</h2>
                        <EventForm />
                    </div>
                </section>

                {/* Section: Training Plans */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-violet-50 text-violet-600 p-2.5 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></svg>
                        </div>
                        <h2 className="text-[22px] font-[800] text-[#0f172a] tracking-tight">Training Plans</h2>
                    </div>
                    <TrainingPlanBuilder />
                    <PlansList plans={trainingPlans || []} />
                </section>

                {/* Section 1: Join Requests */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                            <UserCheck size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[22px] font-[800] text-[#0f172a] tracking-tight">Pending Requests</h2>
                        <div className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-wider">
                            {requests?.length || 0}
                        </div>
                    </div>

                    {!requests || requests.length === 0 ? (
                        <Card className="p-12 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[28px] flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-2">
                                <UserCheck size={32} />
                            </div>
                            <h3 className="text-[20px] font-[700] text-[#0f172a] tracking-tight">You're all caught up!</h3>
                            <p className="text-[#64748b] max-w-sm">New athletes requesting to join HUJI Run will appear here for your review.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {requests.map((req: any) => (
                                <Card key={req.id} className="bg-white border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden group transition-all hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]">
                                    <div className="p-6 md:p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                    {req.user.avatar_url ? (
                                                        <img src={req.user.avatar_url} alt={req.user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xl font-bold text-slate-400 capitalize">{req.user.full_name?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-[19px] font-[800] text-[#0f172a] tracking-tight truncate max-w-[180px] sm:max-w-none">
                                                        {req.user.full_name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-medium">
                                                        <Mail size={12} />
                                                        {req.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 text-slate-400 text-[12px] font-bold uppercase tracking-tight">
                                                    <Clock size={12} />
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {req.note && (
                                            <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
                                                <p className="text-[14px] text-[#92400e] leading-relaxed italic font-medium">
                                                    "{req.note}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <form action={rejectRequest.bind(null, req.id, req.user.id)} className="w-full">
                                                <Button variant="ghost" className="w-full bg-white border border-slate-200 !text-slate-600 hover:!bg-red-50 hover:!text-red-600 hover:!border-red-200 py-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.96]">
                                                    <UserX size={18} strokeWidth={2.5} />
                                                    Reject
                                                </Button>
                                            </form>
                                            <form action={approveRequest.bind(null, req.id, req.user.id)} className="w-full">
                                                <Button className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white py-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/10 active:scale-[0.96]">
                                                    <UserCheck size={18} strokeWidth={2.5} />
                                                    Approve
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                <div className="border-t border-slate-200/60 my-4 px-20"></div>

                {/* Section 2: Manage Team */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-orange-50 text-[#fc4c02] p-2.5 rounded-xl">
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[22px] font-[800] text-[#0f172a] tracking-tight">Team Athletes</h2>
                        <div className="ml-auto bg-orange-100 text-[#fc4c02] px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-wider">
                            {athletes?.length || 0}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {athletes?.map((athlete) => (
                            <Card key={athlete.id} className="p-4 bg-white border border-slate-100 hover:border-slate-200 shadow-sm rounded-3xl transition-all group">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                            {athlete.avatar_url ? (
                                                <img src={athlete.avatar_url} alt={athlete.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-slate-400 capitalize">{athlete.full_name?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-[700] text-[#0f172a] text-[15px] leading-tight">
                                                {athlete.full_name}
                                                {athlete.role === 'CO_COACH' && <span className="ml-2 bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-md">CO_COACH</span>}
                                                {athlete.role === 'COACH' && <span className="ml-2 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md">COACH</span>}
                                            </h4>
                                            <p className="text-[12px] text-slate-500 font-medium truncate max-w-[140px] sm:max-w-none">{athlete.email}</p>
                                        </div>
                                    </div>

                                    {/* Prevent self-deletion and deleting other coaches */}
                                    {athlete.id !== profile.id && athlete.role !== 'COACH' && athlete.role !== 'CO_COACH' && (
                                        <RemoveAthleteButton
                                            athleteId={athlete.id}
                                            athleteName={athlete.full_name}
                                        />
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
