'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { publishPlan, unpublishPlan, deletePlan } from '@/app/admin/actions'
import { Dumbbell, Eye, EyeOff, Trash2, ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react'

interface PlanWithWorkouts {
    id: string
    title: string
    week_start_date: string
    status: string
    published_at: string | null
    created_at: string
    workouts: {
        id: string
        day_of_week: number
        title: string
        description: string | null
        type: string
        distance_km: number | null
        duration_min: number | null
        target_pace: string | null
    }[]
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const TYPE_COLORS: Record<string, string> = {
    EASY: 'bg-emerald-100 text-emerald-700',
    WORKOUT: 'bg-orange-100 text-orange-700',
    LONG_RUN: 'bg-blue-100 text-blue-700',
    REST: 'bg-slate-100 text-slate-500',
}

export function PlansList({ plans }: { plans: PlanWithWorkouts[] }) {
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    if (plans.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 text-sm font-medium">
                No training plans yet. Create your first one above!
            </div>
        )
    }

    const handlePublish = (planId: string) => {
        startTransition(async () => {
            const res = await publishPlan(planId)
            if (res.error) alert(res.error)
        })
    }

    const handleUnpublish = (planId: string) => {
        startTransition(async () => {
            const res = await unpublishPlan(planId)
            if (res.error) alert(res.error)
        })
    }

    const handleDelete = (planId: string) => {
        if (!confirm('Delete this plan and all its workouts? This cannot be undone.')) return
        startTransition(async () => {
            const res = await deletePlan(planId)
            if (res.error) alert(res.error)
        })
    }

    return (
        <div className="space-y-3">
            {plans.map(plan => {
                const isExpanded = expandedPlan === plan.id
                const isPublished = plan.status === 'PUBLISHED'
                const workoutsByDay = plan.workouts?.sort((a, b) => a.day_of_week - b.day_of_week) || []

                return (
                    <div
                        key={plan.id}
                        className={`rounded-2xl border overflow-hidden transition-all ${isPublished
                            ? 'border-violet-200 bg-white'
                            : 'border-slate-200 bg-white'
                            }`}
                    >
                        {/* Plan Header */}
                        <button
                            onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                            className="w-full flex items-center gap-3 p-4 px-5 text-left hover:bg-slate-50/50 transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPublished ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                <Dumbbell size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="font-[700] text-[15px] text-slate-800 truncate">{plan.title}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${isPublished
                                        ? 'bg-violet-100 text-violet-600'
                                        : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {isPublished ? 'LIVE' : 'DRAFT'}
                                    </span>
                                </div>
                                <span className="text-[12px] text-slate-400 font-medium">
                                    Week of {new Date(plan.week_start_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {' · '}{workoutsByDay.length} workouts
                                </span>
                            </div>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="border-t border-slate-100 animate-in slide-in-from-top-1 duration-150">
                                {/* Workouts Grid */}
                                <div className="p-4 space-y-1.5">
                                    {DAY_SHORT.map((dayLabel, dayIdx) => {
                                        const workout = workoutsByDay.find(w => w.day_of_week === dayIdx)
                                        return (
                                            <div key={dayIdx} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/50">
                                                <span className="w-8 text-[11px] font-black text-slate-400 uppercase">{dayLabel}</span>
                                                {workout ? (
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[workout.type] || ''}`}>
                                                            {workout.type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[13px] font-[600] text-slate-700 truncate">{workout.title}</span>
                                                        {workout.distance_km && (
                                                            <span className="text-[11px] text-slate-400 font-bold ml-auto flex-shrink-0">{workout.distance_km}km</span>
                                                        )}
                                                        {workout.target_pace && (
                                                            <span className="text-[11px] text-slate-400 font-bold flex-shrink-0">@ {workout.target_pace}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[12px] text-slate-300 italic">—</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Actions */}
                                <div className="border-t border-slate-100 p-3 px-5 flex gap-2 bg-slate-50/50">
                                    {isPublished ? (
                                        <button
                                            onClick={() => handleUnpublish(plan.id)}
                                            disabled={isPending}
                                            className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <EyeOff size={14} /> Unpublish
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePublish(plan.id)}
                                            disabled={isPending}
                                            className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <Eye size={14} /> Publish
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(plan.id)}
                                        disabled={isPending}
                                        className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors ml-auto disabled:opacity-50"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
