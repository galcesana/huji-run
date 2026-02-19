import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { approveRequest, rejectRequest } from './actions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ShieldCheck, UserCheck, UserX, Mail, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

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

    const supabase = await createClient()

    // 2. Fetch Pending Requests
    const { data: requests } = await supabase
        .from('join_requests')
        .select(`
            id,
            created_at,
            note,
            user:profiles (
                id,
                full_name,
                email,
                avatar_url
            )
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-10">
                <header className="flex flex-col items-center text-center gap-4 pt-4">
                    <div className="space-y-2">
                        <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Coach Panel<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium">Manage team join requests</p>
                    </div>

                    <div className="bg-[#eff6ff] text-[#2563eb] px-5 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider border border-blue-100/50 shadow-sm mt-2">
                        {requests?.length || 0} Pending {requests?.length === 1 ? 'Request' : 'Requests'}
                    </div>
                </header>

                <section className="space-y-6">
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
                                            <form action={rejectRequest.bind(null, req.id)} className="w-full">
                                                <Button className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 py-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.96]">
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
            </div>
        </main>
    )
}
