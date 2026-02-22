'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createTrainingPlan } from '@/app/admin/actions'
import { Dumbbell, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WORKOUT_TYPES = [
    { value: 'EASY', label: 'Easy', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'WORKOUT', label: 'Workout', color: 'bg-orange-100 text-orange-700' },
    { value: 'LONG_RUN', label: 'Long Run', color: 'bg-blue-100 text-blue-700' },
    { value: 'REST', label: 'Rest', color: 'bg-slate-100 text-slate-500' },
] as const

type WorkoutType = 'EASY' | 'WORKOUT' | 'LONG_RUN' | 'REST'

interface WorkoutEntry {
    dayOfWeek: number
    title: string
    description: string
    type: WorkoutType
    distanceKm: string
    durationMin: string
    targetPace: string
}

function getThisSunday(): string {
    const today = new Date()
    const day = today.getDay()
    const sun = new Date(today)
    sun.setDate(today.getDate() - day)
    const year = sun.getFullYear()
    const month = String(sun.getMonth() + 1).padStart(2, '0')
    const d = String(sun.getDate()).padStart(2, '0')
    return `${year}-${month}-${d}`
}

function emptyWorkout(dayOfWeek: number): WorkoutEntry {
    return {
        dayOfWeek,
        title: dayOfWeek === 5 ? 'Rest' : '', // Default Friday to rest
        description: '',
        type: dayOfWeek === 5 ? 'REST' : 'EASY',
        distanceKm: '',
        durationMin: '',
        targetPace: '',
    }
}

export function TrainingPlanBuilder() {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [title, setTitle] = useState('')
    const [weekStart, setWeekStart] = useState(getThisSunday())
    const [workouts, setWorkouts] = useState<WorkoutEntry[]>(
        DAY_LABELS.map((_, i) => emptyWorkout(i))
    )
    const [expandedDay, setExpandedDay] = useState<number | null>(null)

    const updateWorkout = (dayIndex: number, field: keyof WorkoutEntry, value: string) => {
        setWorkouts(prev => prev.map((w, i) =>
            i === dayIndex ? { ...w, [field]: value } : w
        ))
    }

    const handleSubmit = async () => {
        if (!title.trim()) return alert('Please enter a plan title')
        if (!weekStart) return alert('Please select a week start date')

        setIsSubmitting(true)
        const res = await createTrainingPlan({
            title: title.trim(),
            weekStartDate: weekStart,
            workouts: workouts.map(w => ({
                dayOfWeek: w.dayOfWeek,
                title: w.title,
                description: w.description || undefined,
                type: w.type,
                distanceKm: w.distanceKm ? parseFloat(w.distanceKm) : undefined,
                durationMin: w.durationMin ? parseFloat(w.durationMin) : undefined,
                targetPace: w.targetPace || undefined,
            })),
        })
        setIsSubmitting(false)

        if (res?.success) {
            alert('Training plan created as Draft! You can publish it from the plans list.')
            // Reset form
            setTitle('')
            setWeekStart(getThisSunday())
            setWorkouts(DAY_LABELS.map((_, i) => emptyWorkout(i)))
            setIsOpen(false)
            setExpandedDay(null)
        } else {
            alert(res?.error || 'Failed to create plan')
        }
    }

    const getTypeStyle = (type: WorkoutType) => {
        return WORKOUT_TYPES.find(t => t.value === type)?.color || ''
    }

    const filledDays = workouts.filter(w => w.title.trim() !== '').length

    return (
        <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[28px] overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-violet-50 border-b border-violet-100/60 p-4 px-6 flex items-center gap-3 hover:bg-violet-100/50 transition-colors"
            >
                <div className="bg-violet-100/80 text-violet-600 p-2 rounded-lg">
                    <Dumbbell size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-[800] text-[#0f172a] text-[17px] tracking-tight flex-1 text-left">Create Training Plan</h3>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            {isOpen && (
                <div className="p-6 space-y-5">
                    {/* Plan Metadata */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Plan Title (e.g. Week 12 — Speed Focus)"
                            className="w-full bg-slate-50 border-0 text-[#0f172a] font-bold text-[16px] px-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
                        />
                        <div className="flex items-center gap-3">
                            <label className="text-[13px] font-bold text-slate-500 whitespace-nowrap">Week of:</label>
                            <input
                                type="date"
                                value={weekStart}
                                onChange={(e) => setWeekStart(e.target.value)}
                                className="flex-1 bg-slate-50 border-0 text-[#0f172a] text-[14px] font-medium px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Day-by-Day Workout Cards */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Daily Workouts</h4>
                            <span className="text-[12px] font-bold text-violet-500">{filledDays}/7 days</span>
                        </div>

                        {workouts.map((workout, dayIndex) => {
                            const isExpanded = expandedDay === dayIndex
                            const hasContent = workout.title.trim() !== ''

                            return (
                                <div
                                    key={dayIndex}
                                    className={`rounded-2xl border transition-all ${isExpanded
                                        ? 'border-violet-200 bg-violet-50/30 shadow-sm'
                                        : hasContent
                                            ? 'border-slate-200/60 bg-white hover:border-slate-300'
                                            : 'border-dashed border-slate-200 bg-slate-50/50 hover:border-slate-300'
                                        }`}
                                >
                                    {/* Day Header (always visible) */}
                                    <button
                                        type="button"
                                        onClick={() => setExpandedDay(isExpanded ? null : dayIndex)}
                                        className="w-full flex items-center gap-3 p-3 px-4"
                                    >
                                        <span className="w-10 text-[12px] font-black text-slate-400 uppercase tracking-wider">{DAY_SHORT[dayIndex]}</span>
                                        <div className="flex-1 text-left">
                                            {hasContent ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getTypeStyle(workout.type)}`}>
                                                        {workout.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-[14px] font-[600] text-slate-700 truncate">{workout.title}</span>
                                                    {workout.distanceKm && (
                                                        <span className="text-[11px] font-bold text-slate-400 ml-auto hidden sm:block">{workout.distanceKm}km</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[13px] text-slate-400 italic">Tap to add workout</span>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <Plus size={16} className="text-slate-300" />}
                                    </button>

                                    {/* Expanded Editor */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 animate-in slide-in-from-top-1 duration-150">
                                            {/* Type Selector */}
                                            <div className="flex gap-1.5 flex-wrap">
                                                {WORKOUT_TYPES.map(wt => (
                                                    <button
                                                        key={wt.value}
                                                        type="button"
                                                        onClick={() => {
                                                            updateWorkout(dayIndex, 'type', wt.value)
                                                            if (wt.value === 'REST') {
                                                                updateWorkout(dayIndex, 'title', 'Rest')
                                                                updateWorkout(dayIndex, 'distanceKm', '')
                                                                updateWorkout(dayIndex, 'durationMin', '')
                                                            }
                                                        }}
                                                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${workout.type === wt.value ? wt.color + ' ring-2 ring-offset-1 ring-current/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {wt.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {workout.type !== 'REST' && (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={workout.title}
                                                        onChange={(e) => updateWorkout(dayIndex, 'title', e.target.value)}
                                                        placeholder="Workout title (e.g. Easy + Strides)"
                                                        className="w-full bg-white border border-slate-200 text-[#0f172a] text-[14px] font-[600] px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
                                                    />
                                                    <textarea
                                                        value={workout.description}
                                                        onChange={(e) => updateWorkout(dayIndex, 'description', e.target.value)}
                                                        placeholder="Description — paces, intervals, notes..."
                                                        rows={2}
                                                        className="w-full bg-white border border-slate-200 text-[#0f172a] text-[13px] px-3 py-2.5 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
                                                    />
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 px-1">Distance (km)</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                value={workout.distanceKm}
                                                                onChange={(e) => updateWorkout(dayIndex, 'distanceKm', e.target.value)}
                                                                placeholder="—"
                                                                className="w-full bg-white border border-slate-200 text-[#0f172a] text-[14px] font-[600] px-3 py-2 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 px-1">Duration (min)</label>
                                                            <input
                                                                type="number"
                                                                value={workout.durationMin}
                                                                onChange={(e) => updateWorkout(dayIndex, 'durationMin', e.target.value)}
                                                                placeholder="—"
                                                                className="w-full bg-white border border-slate-200 text-[#0f172a] text-[14px] font-[600] px-3 py-2 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 px-1">Target Pace</label>
                                                            <input
                                                                type="text"
                                                                value={workout.targetPace}
                                                                onChange={(e) => updateWorkout(dayIndex, 'targetPace', e.target.value)}
                                                                placeholder="5:30"
                                                                className="w-full bg-white border border-slate-200 text-[#0f172a] text-[14px] font-[600] px-3 py-2 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center placeholder:text-slate-300"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Quick clear button */}
                                            {hasContent && workout.type !== 'REST' && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setWorkouts(prev => prev.map((w, i) =>
                                                            i === dayIndex ? emptyWorkout(dayIndex) : w
                                                        ))
                                                    }}
                                                    className="text-[12px] font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                                                >
                                                    <X size={12} /> Clear day
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title.trim() || filledDays === 0}
                            className="w-full text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-violet-600 hover:bg-violet-700 shadow-violet-500/20 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            <Dumbbell size={20} strokeWidth={2.5} />
                            {isSubmitting ? 'Creating Plan...' : 'Save as Draft'}
                        </Button>
                        <p className="text-[12px] text-center text-slate-400 mt-3 font-medium">You can publish the plan after reviewing it in the plans list below.</p>
                    </div>
                </div>
            )}
        </Card>
    )
}
