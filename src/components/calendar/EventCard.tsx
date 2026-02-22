'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { submitRsvp } from '@/app/dashboard/calendar/actions'
import { MapPin, Clock, Users, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'

interface EventCardProps {
    event: any;
    currentUserId: string;
}

export function EventCard({ event, currentUserId }: EventCardProps) {
    const [isPending, startTransition] = useTransition()
    const [showAttendees, setShowAttendees] = useState(false)

    // Find my current RSVP from the array
    const myRsvp = event.event_rsvps?.find((r: any) => r.user_id === currentUserId)?.status
    const [optimisticRsvp, setOptimisticRsvp] = useState<'GOING' | 'NOT_GOING' | undefined>(myRsvp)

    const goingCount = event.event_rsvps?.filter((r: any) => r.status === 'GOING').length || 0
    // Optimistically calculate if we just toggled it
    const displayGoingCount = myRsvp !== 'GOING' && optimisticRsvp === 'GOING' ? goingCount + 1
        : myRsvp === 'GOING' && optimisticRsvp !== 'GOING' ? Math.max(0, goingCount - 1)
            : goingCount

    const startDate = new Date(event.starts_at)

    const handleRsvp = (status: 'GOING' | 'NOT_GOING') => {
        if (optimisticRsvp === status || isPending) return
        setOptimisticRsvp(status)

        startTransition(async () => {
            await submitRsvp(event.id, status)
        })
    }

    return (
        <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
            {/* Header / Date Block */}
            <div className="flex">
                <div className={`w-24 shrink-0 flex flex-col items-center justify-center p-4 text-white
                    ${event.type === 'PRACTICE' ? 'bg-emerald-600' :
                        event.type === 'RACE' ? 'bg-orange-600' : 'bg-blue-600'}
                `}>
                    <span className="text-[12px] font-bold uppercase tracking-widest opacity-90 mb-1">{format(startDate, 'MMM')}</span>
                    <span className="text-[32px] font-black leading-none mb-1">{format(startDate, 'd')}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">{format(startDate, 'EEE')}</span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border
                             ${event.type === 'PRACTICE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                                event.type === 'RACE' ? 'bg-orange-50 text-orange-600 border-orange-100/50' :
                                    'bg-blue-50 text-blue-600 border-blue-100/50'}
                        `}>
                            {event.type}
                        </span>
                        {event.repeat_weekly && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <RepeatIcon /> Weekly
                            </span>
                        )}
                    </div>
                    <h3 className="font-[800] text-[20px] text-[#0f172a] tracking-tight leading-tight mb-2">{event.title}</h3>

                    <div className="flex flex-col gap-1.5 text-[13px] font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" />
                            <span>{format(startDate, 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description (If exists) */}
            {event.description && (
                <div className="px-6 pb-4 pt-2">
                    <div className="bg-slate-50 rounded-xl p-3 flex gap-3 text-sm text-slate-600">
                        <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{event.description}</p>
                    </div>
                </div>
            )}

            {/* Interactions Footer */}
            <div className="border-t border-slate-100/60 p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <div className="flex -space-x-2 mr-2">
                        {/* We could map user avatars here, but counting is fine for MVP */}
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                            <Users size={14} />
                        </div>
                    </div>
                    <span><strong className="text-slate-700">{displayGoingCount}</strong> going</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => handleRsvp('GOING')}
                        disabled={isPending}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                            ${optimisticRsvp === 'GOING'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}
                        `}
                    >
                        <CheckCircle2 size={18} strokeWidth={optimisticRsvp === 'GOING' ? 3 : 2} />
                        I'm In
                    </button>
                    <button
                        onClick={() => handleRsvp('NOT_GOING')}
                        disabled={isPending}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                            ${optimisticRsvp === 'NOT_GOING'
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}
                        `}
                    >
                        <XCircle size={18} strokeWidth={optimisticRsvp === 'NOT_GOING' ? 3 : 2} />
                        Can't Make It
                    </button>
                </div>
            </div>
        </Card>
    )
}

function RepeatIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
    )
}
