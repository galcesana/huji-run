import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TrainingPlanBuilder } from '@/components/admin/TrainingPlanBuilder'
import { PlansList } from '@/components/admin/PlansList'

export default async function TrainingPage() {
    const profile = await getProfile()
    if (!profile) redirect('/login')
    if (profile.role !== 'COACH' && profile.role !== 'CO_COACH') redirect('/dashboard')

    const supabase = await createClient()

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
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center gap-4 pt-4">
                    <Link
                        href="/admin"
                        className="self-start text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 text-[13px] font-bold shadow-sm hover:shadow"
                    >
                        <ArrowLeft size={16} /> Coach Panel
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-[40px] sm:text-[48px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Training Plans<span className="text-violet-500">.</span>
                        </h1>
                        <p className="text-[18px] text-[#64748b] font-medium">Create & manage weekly workout plans</p>
                    </div>
                </header>

                <TrainingPlanBuilder />
                <PlansList plans={trainingPlans || []} />
            </div>
        </main>
    )
}
