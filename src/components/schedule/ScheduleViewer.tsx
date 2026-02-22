'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { submitRsvp } from '@/app/dashboard/calendar/actions'
import {
    ChevronLeft, ChevronRight, Dumbbell, MapPin, Clock, Route, Zap,
    Users, CheckCircle2, XCircle, CalendarDays, ChevronDown, ChevronUp
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────

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

interface ScheduleEvent {
    id: string
    title: string
    description: string | null
    type: string
    location: string | null
    starts_at: string
    ends_at: string | null
    repeat_weekly: boolean
    event_rsvps: {
        user_id: string
        status: string
        profiles: { full_name: string | null; avatar_url: string | null } | null
    }[]
}

// ── Constants ────────────────────────────────────────────────────

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WORKOUT_STYLE: Record<string, { label: string; bg: string; text: string; emoji: string }> = {
    EASY: { label: 'Easy Run', bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '🟢' },
    WORKOUT: { label: 'Workout', bg: 'bg-orange-50', text: 'text-orange-700', emoji: '🔥' },
    LONG_RUN: { label: 'Long Run', bg: 'bg-blue-50', text: 'text-blue-700', emoji: '🏃' },
    REST: { label: 'Rest Day', bg: 'bg-slate-50', text: 'text-slate-500', emoji: '😴' },
}

const EVENT_STYLE: Record<string, { label: string; bg: string; text: string; emoji: string }> = {
    PRACTICE: { label: 'Practice', bg: 'bg-emerald-50', text: 'text-emerald-700', emoji: '🏟️' },
    RACE: { label: 'Race', bg: 'bg-red-50', text: 'text-red-600', emoji: '🏁' },
    SOCIAL: { label: 'Social', bg: 'bg-violet-50', text: 'text-violet-600', emoji: '🎉' },
}

// ── Helpers ────────────────────────────────────────────────────

/** Format a Date to YYYY-MM-DD using LOCAL timezone (not UTC) */
function toLocalDateStr(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getSundayDate(d: Date): Date {
    const day = d.getDay()
    const sun = new Date(d)
    sun.setDate(d.getDate() - day)
    sun.setHours(0, 0, 0, 0)
    return sun
}

function formatWeekRange(sundayStr: string): string {
    const sun = new Date(sundayStr + 'T12:00:00') // noon to avoid TZ edge
    const sat = new Date(sun)
    sat.setDate(sun.getDate() + 6)
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${sun.toLocaleDateString('en-US', opts)} — ${sat.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

function shiftWeek(dateStr: string, weeks: number): string {
    const d = new Date(dateStr + 'T12:00:00') // noon to avoid TZ edge
    d.setDate(d.getDate() + weeks * 7)
    return toLocalDateStr(d)
}

function getDateForDow(sundayStr: string, dow: number): Date {
    const sun = new Date(sundayStr + 'T12:00:00') // noon to avoid TZ edge
    const d = new Date(sun)
    d.setDate(sun.getDate() + dow)
    return d
}

// ── RSVP Sub-component ───────────────────────────────────────

function RsvpSection({ event, currentUserId }: { event: ScheduleEvent; currentUserId: string }) {
    const myRsvp = event.event_rsvps?.find(r => r.user_id === currentUserId)?.status
    const [optimisticRsvp, setOptimisticRsvp] = useState<'GOING' | 'NOT_GOING' | undefined>(myRsvp as any)
    const [isPending, setIsPending] = useState(false)
    const [showAttendees, setShowAttendees] = useState(false)

    const goingCount = event.event_rsvps?.filter(r => r.status === 'GOING').length || 0
    const displayGoingCount = myRsvp !== 'GOING' && optimisticRsvp === 'GOING' ? goingCount + 1
        : myRsvp === 'GOING' && optimisticRsvp !== 'GOING' ? Math.max(0, goingCount - 1)
            : goingCount

    const handleRsvp = async (status: 'GOING' | 'NOT_GOING') => {
        if (optimisticRsvp === status || isPending) return
        setOptimisticRsvp(status)
        setIsPending(true)
        await submitRsvp(event.id, status)
        setIsPending(false)
    }

    return (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                    onClick={() => setShowAttendees(!showAttendees)}
                    className="flex items-center gap-2 text-[13px] text-slate-500 font-medium hover:text-slate-800 transition-colors"
                >
                    <Users size={14} className="text-slate-400" />
                    <span><strong className="text-slate-700">{displayGoingCount}</strong> going</span>
                    {displayGoingCount > 0 && (showAttendees ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => handleRsvp('GOING')}
                        disabled={isPending}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all
                            ${optimisticRsvp === 'GOING'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'}`}
                    >
                        <CheckCircle2 size={14} /> I'm In
                    </button>
                    <button
                        onClick={() => handleRsvp('NOT_GOING')}
                        disabled={isPending}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all
                            ${optimisticRsvp === 'NOT_GOING'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600'}`}
                    >
                        <XCircle size={14} /> Can't
                    </button>
                </div>
            </div>

            {showAttendees && displayGoingCount > 0 && (
                <div className="space-y-1 max-h-[160px] overflow-y-auto">
                    {event.event_rsvps.filter(r => r.status === 'GOING').map(rsvp => (
                        <div key={rsvp.user_id} className="flex items-center gap-2.5 p-1.5 hover:bg-white rounded-lg transition-colors">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden relative">
                                {rsvp.profiles?.avatar_url ? (
                                    <Image src={rsvp.profiles.avatar_url} alt="" fill className="object-cover" sizes="28px" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-400">
                                        {rsvp.profiles?.full_name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </div>
                            <span className="font-[600] text-[13px] text-slate-700">{rsvp.profiles?.full_name || 'Team Member'}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Main Component ───────────────────────────────────────────

interface ScheduleViewerProps {
    plans: Plan[]
    events: ScheduleEvent[]
    currentUserId: string
}

export function ScheduleViewer({ plans, events, currentUserId }: ScheduleViewerProps) {
    const currentSunday = toLocalDateStr(getSundayDate(new Date()))
    const [selectedWeek, setSelectedWeek] = useState(currentSunday)
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    const todayDow = new Date().getDay()
    const isCurrentWeek = selectedWeek === currentSunday

    // Match plan
    const activePlan = plans.find(p => p.week_start_date === selectedWeek)

    // Match events for this week (Sunday to Saturday)
    const weekStart = new Date(selectedWeek + 'T00:00:00')
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7) // exclusive end
    const weekEvents = events.filter(e => {
        const d = new Date(e.starts_at)
        return d >= weekStart && d < weekEnd
    })

    // Day order: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6)
    const dayOrder = [0, 1, 2, 3, 4, 5, 6]

    const toggle = (key: string) => setExpandedItem(prev => prev === key ? null : key)

    return (
        <div className="space-y-5">
            {/* Week Navigator */}
            <div className="flex items-center justify-between bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-2xl p-3 px-4 border border-slate-100/50">
                <button onClick={() => setSelectedWeek(prev => shiftWeek(prev, -1))}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95">
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <div className="text-center flex-1 px-2">
                    <p className="text-[15px] font-[800] text-[#0f172a] tracking-tight">{formatWeekRange(selectedWeek)}</p>
                    {isCurrentWeek ? (
                        <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mt-0.5">This Week</p>
                    ) : (
                        <button onClick={() => setSelectedWeek(currentSunday)}
                            className="text-[11px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-wider mt-0.5 transition-colors">
                            ← Back to this week
                        </button>
                    )}
                </div>
                <button onClick={() => setSelectedWeek(prev => shiftWeek(prev, 1))}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95">
                    <ChevronRight size={20} className="text-slate-600" />
                </button>
            </div>

            {/* Day-by-Day Schedule */}
            <div className="space-y-2">
                {dayOrder.map(dow => {
                    const workout = activePlan?.workouts.find(w => w.day_of_week === dow)
                    const dayDate = getDateForDow(selectedWeek, dow)
                    const dayDateStr = toLocalDateStr(dayDate)
                    const dayEvents = weekEvents.filter(e => toLocalDateStr(new Date(e.starts_at)) === dayDateStr)
                    const isToday = isCurrentWeek && dow === todayDow
                    const hasItems = !!workout || dayEvents.length > 0

                    return (
                        <div key={dow} className={`rounded-[18px] overflow-hidden border transition-all ${isToday ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[#f8fafc]' : ''} ${hasItems ? 'border-slate-200/60 bg-white' : 'border-dashed border-slate-200 bg-slate-50/30'}`}>
                            {/* Day Header */}
                            <div className={`flex items-center gap-3 px-4 py-3 ${isToday ? 'bg-violet-50/50' : ''}`}>
                                <div className="w-10 text-center">
                                    <span className={`text-[12px] font-black uppercase tracking-wider block ${isToday ? 'text-violet-600' : 'text-slate-400'}`}>{DAY_SHORT[dow]}</span>
                                    <span className={`text-[10px] font-bold ${isToday ? 'text-violet-400' : 'text-slate-300'}`}>{dayDate.getDate()}</span>
                                </div>
                                {!hasItems && <span className="text-[12px] text-slate-300 italic">No schedule</span>}
                                {isToday && <span className="text-[7px] font-black text-violet-500 uppercase bg-violet-100 px-1.5 py-0.5 rounded-full ml-auto">TODAY</span>}
                            </div>

                            {/* Workout Item */}
                            {workout && (() => {
                                const s = WORKOUT_STYLE[workout.type] || WORKOUT_STYLE.EASY
                                const key = `w-${dow}`
                                const isOpen = expandedItem === key
                                return (
                                    <div className="border-t border-slate-100/60">
                                        <button onClick={() => toggle(key)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors text-left">
                                            <span className="text-lg">{s.emoji}</span>
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${s.bg} ${s.text}`}>{s.label}</span>
                                                <span className="text-[14px] font-[600] text-slate-700 truncate">{workout.title}</span>
                                            </div>
                                            {workout.distance_km && <span className="text-[11px] text-slate-400 font-bold hidden sm:block">{workout.distance_km}km</span>}
                                            {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                        </button>

                                        {isOpen && workout.type !== 'REST' && (
                                            <div className="px-4 pb-4 pt-1 space-y-3 animate-in slide-in-from-top-1 duration-150">
                                                {workout.description && (
                                                    <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{workout.description}</p>
                                                )}
                                                {(workout.distance_km || workout.duration_min || workout.target_pace) && (
                                                    <div className="flex gap-4 flex-wrap">
                                                        {workout.distance_km && (
                                                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                                                <Route size={13} className="text-slate-400" /> {workout.distance_km} km
                                                            </div>
                                                        )}
                                                        {workout.duration_min && (
                                                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                                                <Clock size={13} className="text-slate-400" /> {workout.duration_min} min
                                                            </div>
                                                        )}
                                                        {workout.target_pace && (
                                                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500">
                                                                <Zap size={13} className="text-slate-400" /> {workout.target_pace}/km
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {isOpen && workout.type === 'REST' && (
                                            <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-1 duration-150">
                                                <p className="text-[13px] text-slate-400 italic">Recovery day — take it easy! 💤</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            {/* Event Items */}
                            {dayEvents.map(event => {
                                const es = EVENT_STYLE[event.type] || EVENT_STYLE.SOCIAL
                                const key = `e-${event.id}`
                                const isOpen = expandedItem === key
                                const startTime = new Date(event.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

                                return (
                                    <div key={event.id} className="border-t border-slate-100/60">
                                        <button onClick={() => toggle(key)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50/50 transition-colors text-left">
                                            <span className="text-lg">{es.emoji}</span>
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${es.bg} ${es.text}`}>{es.label}</span>
                                                <span className="text-[14px] font-[600] text-slate-700 truncate">{event.title}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">{startTime}</span>
                                            {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                        </button>

                                        {isOpen && (
                                            <div className="px-4 pb-4 pt-1 space-y-2 animate-in slide-in-from-top-1 duration-150">
                                                <div className="flex flex-col gap-1.5 text-[13px] text-slate-500 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={13} className="text-slate-400" /> {startTime}
                                                    </div>
                                                    {event.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={13} className="text-slate-400" /> {event.location}
                                                        </div>
                                                    )}
                                                </div>
                                                {event.description && (
                                                    <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{event.description}</p>
                                                )}
                                                <RsvpSection event={event} currentUserId={currentUserId} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>

        </div>
    )
}
