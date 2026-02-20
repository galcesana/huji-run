
import NextImage from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Activity, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
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
    // Check if user has connected Strava
    const { data: stravaAccount } = await supabase
        .from('strava_accounts')
        .select('updated_at')
        .eq('user_id', user.id)
        .single()

    const isConnected = !!stravaAccount

    return (
        <main className="min-h-screen bg-[#f8fafc] px-6 pb-6 pt-4 md:px-10 md:pb-10 md:pt-8 font-sans">
            <div className="max-w-xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center gap-2 mb-10">
                    <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none">
                        Dashboard<span className="text-[#fc4c02]">.</span>
                    </h1>
                    <p className="text-[18px] text-[#64748b] font-medium">Welcome back, Runner!</p>

                    {!isConnected && (
                        <div className="mt-6 bg-orange-50 border border-orange-200 text-orange-800 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm inline-flex w-fit max-w-full">
                            <AlertCircle size={20} className="text-[#fc4c02]" />
                            <span>Action Required: Connect Strava to see your runs.</span>
                        </div>
                    )}
                </header>

                <div className="flex flex-col gap-6">
                    {!isConnected ? (
                        <>
                            {/* Action Required: Connection Status Card */}
                            <Card className="p-7 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] flex flex-col items-center text-center ring-2 ring-orange-500 ring-offset-4 ring-offset-[#f8fafc]">
                                <div className="flex flex-col items-center gap-3 mb-4">
                                    <div className="bg-[#fff3eb] w-14 h-14 flex items-center justify-center rounded-[14px] text-[#fc4c02]">
                                        <Activity size={28} strokeWidth={2} />
                                    </div>
                                    <h2 className="text-[22px] font-[700] text-[#0f172a] tracking-tight">Strava Connection</h2>
                                </div>

                                <p className="text-[#475569] leading-[1.6] text-[15.5px] mb-6 max-w-sm">
                                    Connect your Strava account to automatically import your runs and participate in the team leaderboard.
                                </p>

                                <form action="/api/auth/strava" method="GET" className="pt-1 w-full max-w-[280px] flex justify-center">
                                    <Button className="bg-[#fc4c02] hover:bg-[#e34402] text-white px-8 py-6 rounded-[16px] text-[16px] font-bold shadow-md shadow-orange-500/20 w-full transition-transform active:scale-95">
                                        Connect with Strava
                                    </Button>
                                </form>
                            </Card>

                            {/* Team Feed Link Card (Secondary when disconnected) */}
                            <Card className="p-7 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] flex flex-col items-center text-center opacity-70 grayscale-[20%] transition-opacity hover:opacity-100 hover:grayscale-0">
                                <div className="flex flex-col items-center gap-3 mb-4">
                                    <div className="bg-[#eff6ff] w-14 h-14 flex items-center justify-center rounded-[14px] text-[#2563eb]">
                                        <Activity size={28} strokeWidth={2} />
                                    </div>
                                    <h2 className="text-[22px] font-[700] text-[#0f172a] tracking-tight">Team Feed</h2>
                                </div>

                                <p className="text-[#475569] leading-[1.6] text-[15.5px] mb-6 max-w-sm">
                                    Check out your team's latest runs, give kudos, and stay motivated together.
                                </p>

                                <div className="pt-1 w-full max-w-[280px] flex justify-center">
                                    <a href="/dashboard/feed" className="block relative z-10 w-full">
                                        <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-10 py-6 rounded-[100px] text-[16px] font-[600] items-center flex justify-center w-full">
                                            View Team Feed
                                        </Button>
                                    </a>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Primary Action: Team Feed Link Card */}
                            <Card className="p-8 bg-white border-0 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] rounded-[28px] flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-[#1d4ed8]"></div>
                                <div className="flex flex-col items-center gap-3 mb-5 mt-2">
                                    <div className="bg-[#eff6ff] w-16 h-16 flex items-center justify-center rounded-[18px] text-[#2563eb]">
                                        <Activity size={32} strokeWidth={2} />
                                    </div>
                                    <h2 className="text-[26px] font-[800] text-[#0f172a] tracking-tight mt-1">Team Feed</h2>
                                </div>

                                <p className="text-[#475569] leading-[1.6] text-[16px] mb-8 max-w-md">
                                    Check out your team's latest runs, give kudos, and stay motivated together.
                                </p>

                                <div className="w-full max-w-[320px] flex justify-center pb-2">
                                    <a href="/dashboard/feed" className="block relative z-10 w-full">
                                        <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-10 py-6 rounded-[100px] text-[17px] font-[700] items-center flex justify-center w-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                                            Open Team Feed
                                        </Button>
                                    </a>
                                </div>
                            </Card>

                            {/* Secondary Info: Compact Strava Status */}
                            <div className="flex items-center justify-between bg-white border border-slate-200/60 shadow-sm rounded-[20px] px-5 py-4 w-full">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#fff3eb] w-12 h-12 flex items-center justify-center rounded-full text-[#fc4c02]">
                                        <Activity size={22} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-[700] text-[#0f172a] text-[15px] tracking-tight leading-none mt-0.5">Strava Connected</p>
                                            <CheckCircle className="text-[#16a34a]" size={15} strokeWidth={3} />
                                        </div>
                                        <p className="text-[13px] font-medium text-slate-500 leading-none">Last synced: {new Date(stravaAccount.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <a href="/dashboard/settings" className="flex">
                                    <Button variant="ghost" className="text-slate-500 hover:text-[#0f172a] hover:bg-slate-100 h-9 text-[13px] font-[600] rounded-[10px] px-4 w-full">
                                        Manage
                                    </Button>
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}
