import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ShieldCheck, Dumbbell, Users, Megaphone, CalendarDays, ChevronRight, UserCheck } from 'lucide-react'

export default async function AdminPage() {
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

    // Fetch counts for badges
    const { count: pendingCount } = await adminClient
        .from('join_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')
        .eq('team_id', profile.team_id)

    const { count: athleteCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', profile.team_id)
        .eq('status', 'ACTIVE')

    const { count: planCount } = await supabase
        .from('training_plans')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', profile.team_id)
        .eq('status', 'PUBLISHED')

    const sections = [
        {
            title: 'Training Plans',
            description: 'Create and manage weekly workout plans',
            href: '/admin/training',
            icon: Dumbbell,
            color: 'bg-violet-50 text-violet-600',
            badge: planCount ? `${planCount} active` : null,
            badgeColor: 'bg-violet-100 text-violet-600',
        },
        {
            title: 'Team Management',
            description: 'Review join requests & manage roster',
            href: '/admin/team',
            icon: Users,
            color: 'bg-orange-50 text-[#fc4c02]',
            badge: pendingCount ? `${pendingCount} pending` : `${athleteCount || 0} members`,
            badgeColor: pendingCount ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-[#fc4c02]',
        },
        {
            title: 'Announcements',
            description: 'Broadcast messages to the team feed',
            href: '/admin/announce',
            icon: Megaphone,
            color: 'bg-blue-50 text-blue-600',
            badge: null,
            badgeColor: '',
        },
        {
            title: 'Events',
            description: 'Schedule practices, races & socials',
            href: '/admin/events',
            icon: CalendarDays,
            color: 'bg-emerald-50 text-emerald-600',
            badge: null,
            badgeColor: '',
        },
    ]

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-10">
                <header className="flex flex-col items-center text-center gap-4 pt-4">
                    <div className="space-y-2">
                        <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Coach Panel<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium">Team management & planning</p>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] border border-slate-100/50">
                        <p className="text-[28px] font-[900] text-[#0f172a]">{athleteCount || 0}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Athletes</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] border border-slate-100/50">
                        <p className="text-[28px] font-[900] text-[#0f172a]">{planCount || 0}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Plans Live</p>
                    </div>
                    <div className={`rounded-2xl p-4 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] border ${pendingCount ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100/50'}`}>
                        <p className={`text-[28px] font-[900] ${pendingCount ? 'text-red-600' : 'text-[#0f172a]'}`}>{pendingCount || 0}</p>
                        <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${pendingCount ? 'text-red-400' : 'text-slate-400'}`}>Pending</p>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="space-y-3">
                    {sections.map((section) => (
                        <Link key={section.href} href={section.href}>
                            <Card className="p-0 bg-white border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md rounded-[22px] transition-all group active:scale-[0.99] mb-3">
                                <div className="flex items-center gap-4 p-5">
                                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${section.color} transition-transform group-hover:scale-105`}>
                                        <section.icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-[800] text-[16px] text-[#0f172a] tracking-tight">{section.title}</h3>
                                            {section.badge && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${section.badgeColor}`}>
                                                    {section.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-slate-400 font-medium">{section.description}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
