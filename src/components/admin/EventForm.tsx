'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createEvent } from '@/app/admin/actions'
import { CalendarDays, MapPin, Clock, AlignLeft, SendHorizontal, Repeat } from 'lucide-react'

export function EventForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [eventType, setEventType] = useState<'PRACTICE' | 'RACE' | 'SOCIAL'>('PRACTICE')
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('eventType', eventType)
        const res = await createEvent(formData)
        setIsSubmitting(false)
        if (res?.success) {
            formRef.current?.reset()
            setEventType('PRACTICE')
            alert('Event successfully scheduled!')
        } else {
            alert(res?.error || 'Failed to create event.')
        }
    }

    return (
        <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[28px] overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100/60 p-4 px-6 flex items-center gap-3">
                <div className="bg-emerald-100/80 text-emerald-600 p-2 rounded-lg">
                    <CalendarDays size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-[800] text-[#0f172a] text-[17px] tracking-tight">Schedule Team Event</h3>
            </div>

            <form ref={formRef} action={handleSubmit} className="p-6 space-y-5">
                {/* Event Type Selector */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-xl gap-1">
                    <button
                        type="button"
                        onClick={() => setEventType('PRACTICE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${eventType === 'PRACTICE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Practice
                    </button>
                    <button
                        type="button"
                        onClick={() => setEventType('RACE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${eventType === 'RACE' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Race
                    </button>
                    <button
                        type="button"
                        onClick={() => setEventType('SOCIAL')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${eventType === 'SOCIAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Social
                    </button>
                </div>

                {/* Event Title */}
                <div>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="Event Title (e.g. Tuesday Intervals)"
                        className="w-full bg-slate-50 border-0 text-[#0f172a] font-bold text-[16px] px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
                    />
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarDays size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="date"
                            name="startDate"
                            required
                            className="w-full bg-slate-50 border-0 text-[#0f172a] text-[14px] font-medium pl-10 pr-3 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="time"
                            name="startTime"
                            required
                            className="w-full bg-slate-50 border-0 text-[#0f172a] text-[14px] font-medium pl-10 pr-3 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 top-3.5 pointer-events-none">
                        <MapPin size={16} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        name="location"
                        required
                        placeholder="Meeting Location"
                        className="w-full bg-slate-50 border-0 text-[#0f172a] text-[14px] font-medium pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Description */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 top-3.5 pointer-events-none">
                        <AlignLeft size={16} className="text-slate-400" />
                    </div>
                    <textarea
                        name="description"
                        placeholder="Additional details (optional)"
                        rows={2}
                        className="w-full bg-slate-50 border-0 text-[#0f172a] text-[14px] font-medium pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
                    ></textarea>
                </div>

                {/* MVP Recurrence Toggle */}
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                    <div className="text-emerald-500 bg-emerald-100/50 p-1.5 rounded-lg">
                        <Repeat size={16} strokeWidth={2.5} />
                    </div>
                    <span className="flex-1 text-[14px] font-bold text-slate-700">Repeat weekly</span>
                    <input type="checkbox" name="repeatWeekly" value="true" className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                </label>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    >
                        <CalendarDays size={20} strokeWidth={2.5} />
                        {isSubmitting ? 'Scheduling...' : 'Publish to Calendar'}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
