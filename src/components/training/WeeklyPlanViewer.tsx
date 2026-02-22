'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ChevronLeft, ChevronRight, Dumbbell, Route, Clock, Zap } from 'lucide-react'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TYPE_STYLE: Record<string, { label: string; bg: string; text: string; border: string; emoji: string }> = {
    EASY: { label: 'Easy', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', emoji: '🟢' },
    WORKOUT: { label: 'Workout', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', emoji: '🔥' },
    LONG_RUN: { label: 'Long Run', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', emoji: '🏃' },
    REST: { label: 'Rest', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', emoji: '😴' },
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

interface Plan {
    id: string
    title: string
    week_start_date: string
    workouts: Workout[]
}

function getMondayDate(d: Date): Date {
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const mon = new Date(d)
    mon.setDate(d.getDate() + diff)
    mon.setHours(0, 0, 0, 0)
    return mon
}

function formatWeekRange(mondayStr: string): string {
    const mon = new Date(mondayStr + 'T00:00:00')
    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${mon.toLocaleDateString('en-US', opts)} — ${sun.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function shiftWeek(dateStr: string, weeks: number): string {
    const d = new Date(dateStr + 'T00:00:00')
    d.setDate(d.getDate() + weeks * 7)
    return d.toISOString().split('T')[0]
}

export function WeeklyPlanViewer({ plans }: { plans: Plan[] }) {
    // Find current week's Monday
    const currentMonday = getMondayDate(new Date()).toISOString().split('T')[0]
    const [selectedWeek, setSelectedWeek] = useState(currentMonday)

    const todayDow = new Date().getDay()
    const isCurrentWeek = selectedWeek === currentMonday

    // Find the plan for the selected week
    const activePlan = plans.find(p => p.week_start_date === selectedWeek)

    // Build a map of available weeks for quick lookup
    const availableWeeks = new Set(plans.map(p => p.week_start_date))

    // Navigate weeks
    const goBack = () => setSelectedWeek(prev => shiftWeek(prev, -1))
    const goForward = () => setSelectedWeek(prev => shiftWeek(prev, 1))
    const goToThisWeek = () => setSelectedWeek(currentMonday)

    return (
        <div className="space-y-6">
            {/* Week Navigator */}
            <div className="flex items-center justify-between bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-2xl p-3 px-4 border border-slate-100/50">
                <button
                    onClick={goBack}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>

                <div className="text-center flex-1 px-2">
                    <p className="text-[15px] font-[800] text-[#0f172a] tracking-tight">
                        {formatWeekRange(selectedWeek)}
                    </p>
                    {isCurrentWeek ? (
                        <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mt-0.5">This Week</p>
                    ) : (
                        <button
                            onClick={goToThisWeek}
                            className="text-[11px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-wider mt-0.5 transition-colors"
                        >
                            ← Back to this week
                        </button>
                    )}
                </div>

                <button
                    onClick={goForward}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95"
                >
                    <ChevronRight size={20} className="text-slate-600" />
                </button>
            </div>

            {/* Plan Content */}
            {activePlan ? (
                <div className="space-y-4">
                    {/* Plan Title */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Dumbbell size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="font-[800] text-[18px] text-[#0f172a] tracking-tight">{activePlan.title}</h2>
                            <p className="text-[12px] font-bold text-violet-500 uppercase tracking-wider">{activePlan.workouts.length} workouts this week</p>
                        </div>
                    </div>

                    {/* Day Cards */}
                    <div className="space-y-3">
                        {DAY_LABELS.map((dayName, dayIdx) => {
                            const workout = activePlan.workouts.find(w => w.day_of_week === dayIdx)
                            const isToday = isCurrentWeek && dayIdx === todayDow
                            const style = workout ? TYPE_STYLE[workout.type] || TYPE_STYLE.EASY : null

                            return (
                                <Card
                                    key={dayIdx}
                                    className={`overflow-hidden border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.06)] rounded-[20px] transition-all duration-200
                                        ${isToday ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[#f8fafc] shadow-[0_4px_20px_-4px_rgba(139,92,246,0.15)]' : ''}
                                    `}
                                >
                                    {workout ? (
                                        <div className="flex">
                                            {/* Day Indicator */}
                                            <div className={`w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center p-3 ${style!.bg} border-r ${style!.border}`}>
                                                <span className="text-xl mb-1">{style!.emoji}</span>
                                                <span className={`text-[11px] font-black uppercase tracking-wider ${style!.text}`}>{DAY_SHORT[dayIdx]}</span>
                                                {isToday && (
                                                    <span className="text-[8px] font-black text-violet-500 uppercase mt-1 bg-violet-100 px-1.5 py-0.5 rounded-full">TODAY</span>
                                                )}
                                            </div>

                                            {/* Workout Details */}
                                            <div className="flex-1 p-4 bg-white">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-[700] text-[16px] text-[#0f172a] tracking-tight leading-tight">{workout.title}</h4>
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${style!.bg} ${style!.text}`}>
                                                        {style!.label}
                                                    </span>
                                                </div>

                                                {workout.description && workout.type !== 'REST' && (
                                                    <p className="text-[13px] text-slate-500 leading-relaxed mb-3 whitespace-pre-wrap">{workout.description}</p>
                                                )}

                                                {workout.type !== 'REST' && (workout.distance_km || workout.duration_min || workout.target_pace) && (
                                                    <div className="flex gap-4 flex-wrap">
                                                        {workout.distance_km && (
                                                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                                                <Route size={13} className="text-slate-400" />
                                                                <span>{workout.distance_km} km</span>
                                                            </div>
                                                        )}
                                                        {workout.duration_min && (
                                                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                                                <Clock size={13} className="text-slate-400" />
                                                                <span>{workout.duration_min} min</span>
                                                            </div>
                                                        )}
                                                        {workout.target_pace && (
                                                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                                                <Zap size={13} className="text-slate-400" />
                                                                <span>{workout.target_pace}/km</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {workout.type === 'REST' && (
                                                    <p className="text-[13px] text-slate-400 italic">Recovery day — take it easy! 💤</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center p-4 bg-white">
                                            <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center">
                                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">{DAY_SHORT[dayIdx]}</span>
                                                {isToday && (
                                                    <span className="text-[8px] font-black text-violet-500 uppercase mt-1 bg-violet-100 px-1.5 py-0.5 rounded-full">TODAY</span>
                                                )}
                                            </div>
                                            <span className="text-[13px] text-slate-300 italic ml-3">No workout assigned</span>
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                </div>
            ) : (
                /* No Plan for this week */
                <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden">
                    <div className="p-10 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-3xl">
                            📋
                        </div>
                        <h3 className="font-[700] text-[18px] text-[#0f172a] tracking-tight">No plan for this week</h3>
                        <p className="text-[14px] text-slate-400 font-medium max-w-sm leading-relaxed">
                            {availableWeeks.size > 0
                                ? 'Your coach hasn\'t published a plan for this week yet. Try browsing other weeks using the arrows above.'
                                : 'Your coach hasn\'t published any training plans yet. Check back soon!'}
                        </p>
                    </div>
                </Card>
            )}
        </div>
    )
}
