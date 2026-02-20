import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Clock, Activity, LogOut, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function PendingPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getProfile()
    if (profile?.status === 'ACTIVE') {
        redirect('/dashboard')
    }

    const logout = async () => {
        'use server'
        const sb = await createClient()
        await sb.auth.signOut()
        redirect('/login')
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient branding background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-md w-full space-y-10 relative z-10">
                <header className="text-center space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-orange-100 rounded-[32px] rotate-6 animate-pulse"></div>
                        <div className="relative bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-[28px] w-full h-full flex items-center justify-center border border-slate-100 border-b-4">
                            <Clock className="text-[#fc4c02]" size={40} strokeWidth={2.5} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-[44px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Request Sent<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium max-w-[280px] mx-auto text-balance">
                            Waiting for coach approval to join the team.
                        </p>
                    </div>
                </header>

                <Card className="p-8 bg-white border-0 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] rounded-[40px] text-center space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 justify-center text-[14px] font-[700] text-[#16a34a] bg-green-50 px-5 py-2 rounded-full w-fit mx-auto border border-green-100/50">
                            <CheckCircle2 size={16} strokeWidth={3} />
                            Pending Coach Review
                        </div>
                        <p className="text-[#475569] leading-relaxed text-[15.5px]">
                            Your request is safely in the hands of the coach. Once approved, you'll gain full access to the team dashboard and feed.
                        </p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <form action={logout}>
                            <Button variant="ghost" className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 py-4 rounded-[18px] text-[14px] font-bold flex items-center justify-center gap-2 transition-all">
                                <LogOut size={16} strokeWidth={2.5} />
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </Card>

                <p className="text-center text-slate-400 text-[13px] font-medium max-w-[240px] mx-auto">
                    Approved users will automatically gain access to the dashboard.
                </p>
            </div>
        </main>
    )
}
