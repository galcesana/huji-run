import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Dumbbell, ArrowRight } from 'lucide-react'

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TYPE_STYLE: Record<string, { label: string; bg: string; text: string; emoji: string }> = {
    EASY: { label: 'Easy', bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '🟢' },
    WORKOUT: { label: 'Workout', bg: 'bg-orange-50', text: 'text-orange-700', emoji: '🔥' },
    LONG_RUN: { label: 'Long Run', bg: 'bg-blue-50', text: 'text-blue-700', emoji: '🏃' },
    REST: { label: 'Rest', bg: 'bg-slate-50', text: 'text-slate-500', emoji: '😴' },
}

interface Workout {
    title: string
    description: string | null
    type: string
    distance_km: number | null
    duration_min: number | null
    target_pace: string | null
    day_of_week: number
}

interface ThisWeekPlanProps {
    plan: {
        title: string
        workouts: Workout[]
    } | null
}

export function ThisWeekPlan({ plan }: ThisWeekPlanProps) {
    const todayDow = new Date().getDay()

    if (!plan) {
        return (
            <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden">
                <div className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
                    <div>
                        <h3 className="font-[800] text-[18px] text-[#0f172a] tracking-tight mb-1">This Week's Training</h3>
                        <p className="text-[14px] text-slate-400 font-medium">No plan published for this week yet.</p>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden">
            {/* Header */}
            <div className="p-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="font-[800] text-[17px] text-[#0f172a] tracking-tight">{plan.title}</h3>
                        <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider">This Week</p>
                    </div>
                </div>
                <Link
                    href="/dashboard/schedule"
                    className="flex items-center gap-1 text-[12px] font-bold text-slate-400 hover:text-violet-600 transition-colors"
                >
                    Full Schedule <ArrowRight size={12} />
                </Link>
            </div>

            {/* Compact Day Grid */}
            <div className="px-4 pb-4 space-y-1">
                {DAY_SHORT.map((dayLabel, dayIdx) => {
                    const workout = plan.workouts.find(w => w.day_of_week === dayIdx)
                    const isToday = dayIdx === todayDow
                    const style = workout ? TYPE_STYLE[workout.type] || TYPE_STYLE.EASY : null

                    return (
                        <div
                            key={dayIdx}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                                ${isToday
                                    ? 'bg-violet-50 ring-1 ring-violet-200'
                                    : 'bg-slate-50/50 hover:bg-slate-50'
                                }
                            `}
                        >
                            <div className="w-9 flex flex-col items-center">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${isToday ? 'text-violet-600' : 'text-slate-400'}`}>
                                    {dayLabel}
                                </span>
                                {isToday && (
                                    <span className="text-[7px] font-black text-violet-500 uppercase mt-0.5">NOW</span>
                                )}
                            </div>

                            {workout ? (
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-sm">{style!.emoji}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style!.bg} ${style!.text}`}>
                                        {style!.label}
                                    </span>
                                    <span className={`text-[13px] font-[600] truncate ${isToday ? 'text-[#0f172a]' : 'text-slate-600'}`}>
                                        {workout.title}
                                    </span>
                                    {workout.distance_km && (
                                        <span className="text-[11px] text-slate-400 font-bold ml-auto flex-shrink-0 hidden sm:block">{workout.distance_km}km</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[12px] text-slate-300 italic">—</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
