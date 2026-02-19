import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Activity, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import NextImage from 'next/image'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user has connected Strava
    const { data: stravaAccount } = await supabase
        .from('strava_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const disconnectStrava = async () => {
        'use server'
        const sb = await createClient()
        await sb.from('strava_accounts').delete().eq('user_id', user.id)
        revalidatePath('/dashboard')
        redirect('/dashboard')
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] px-6 pb-6 pt-4 md:px-10 md:pb-10 md:pt-8 font-sans">
            <div className="max-w-xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center gap-4 mb-10 pt-4">
                    <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none mt-1">
                        Settings<span className="text-[#fc4c02]">.</span>
                    </h1>
                </header>

                <div className="flex flex-col gap-6">
                    <Card className="p-7 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px]">
                        <h2 className="text-[20px] font-[700] text-[#0f172a] tracking-tight mb-6">Connected Apps</h2>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[16px] border border-slate-100 bg-[#f8fafc]/50">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#fff3eb] w-12 h-12 flex items-center justify-center rounded-[12px] text-[#fc4c02]">
                                    <Activity size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-[700] text-[#0f172a] text-[16px]">Strava</h3>
                                    <p className="text-[14px] text-slate-500">
                                        {stravaAccount ? 'Connected' : 'Not connected'}
                                    </p>
                                </div>
                            </div>

                            {stravaAccount ? (
                                <form action={disconnectStrava}>
                                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 font-[600] rounded-[12px] h-10 px-4 w-full sm:w-auto flex items-center justify-center gap-2">
                                        <Trash2 size={16} />
                                        Disconnect
                                    </Button>
                                </form>
                            ) : (
                                <form action="/api/auth/strava" method="GET">
                                    <Button className="bg-[#fc4c02] hover:bg-[#e34402] text-white font-[600] rounded-[12px] h-10 px-5 w-full sm:w-auto">
                                        Connect
                                    </Button>
                                </form>
                            )}
                        </div>
                    </Card>

                    <Card className="p-7 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px]">
                        <h2 className="text-[20px] font-[700] text-[#0f172a] tracking-tight mb-6">Account</h2>
                        <form action={async () => {
                            'use server'
                            const sb = await createClient()
                            await sb.auth.signOut()
                            redirect('/login')
                        }}>
                            <Button variant="outline" className="w-full sm:w-auto text-slate-700 font-[600] rounded-[12px] h-11 px-6 border-slate-200 hover:bg-slate-50">
                                Log out
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </main>
    )
}
