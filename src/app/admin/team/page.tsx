import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCheck, UserX, Mail, Clock, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RemoveAthleteButton } from '@/components/admin/RemoveAthleteButton'
import { approveRequest, rejectRequest } from '../actions'

export default async function TeamManagementPage() {
    const profile = await getProfile()
    if (!profile) redirect('/login')
    if (profile.role !== 'COACH' && profile.role !== 'CO_COACH') redirect('/dashboard')

    const adminClient = await createAdminClient()
    const supabase = await createClient()

    // Fetch Pending Requests
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

    // Fetch Active Athletes
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
                    <Link
                        href="/admin"
                        className="self-start text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-[13px] font-bold shadow-sm hover:shadow"
                    >
                        <ArrowLeft size={16} /> Coach Panel
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-[40px] sm:text-[48px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Team<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium">Join requests & athlete roster</p>
                    </div>
                </header>

                {/* Pending Requests */}
                <section className="space-y-5">
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
                        <Card className="p-10 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[28px] flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                                <UserCheck size={28} />
                            </div>
                            <h3 className="text-[18px] font-[700] text-[#0f172a] tracking-tight">All caught up!</h3>
                            <p className="text-[14px] text-[#64748b] max-w-sm">New athletes requesting to join will appear here.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map((req: any) => (
                                <Card key={req.id} className="bg-white border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-[28px] overflow-hidden group transition-all hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]">
                                    <div className="p-6 space-y-5">
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
                                            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[12px] font-bold">
                                                <Clock size={12} />
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {req.note && (
                                            <div className="bg-[#fffbeb] border border-[#fef3c7] p-4 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
                                                <p className="text-[14px] text-[#92400e] leading-relaxed italic font-medium">
                                                    &quot;{req.note}&quot;
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
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

                {/* Team Athletes */}
                <section className="space-y-5">
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-orange-50 text-[#fc4c02] p-2.5 rounded-xl">
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-[22px] font-[800] text-[#0f172a] tracking-tight">Athletes</h2>
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
