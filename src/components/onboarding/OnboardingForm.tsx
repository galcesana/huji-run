'use client'

import { useActionState } from 'react'
import { joinTeam } from '@/app/onboarding/actions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trophy, ArrowRight } from 'lucide-react'

export function OnboardingForm() {
    const [state, formAction, isPending] = useActionState(joinTeam, null)

    return (
        <Card className="p-8 bg-white border-0 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] rounded-[36px] overflow-hidden">
            <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[13px] font-[800] text-slate-400 uppercase tracking-widest ml-1">Team Code</label>
                    <input
                        name="code"
                        type="text"
                        required
                        placeholder="HUJI2026"
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#fc4c02] focus:ring-4 focus:ring-[#fc4c02]/5 rounded-[20px] px-6 py-5 text-center font-mono text-[22px] font-bold tracking-[0.2em] outline-none transition-all placeholder:text-slate-300 uppercase"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-[800] text-slate-400 uppercase tracking-widest ml-1">Note for Coach (Optional)</label>
                    <textarea
                        name="note"
                        placeholder="Hey, it's Gal from the Tuesday track run..."
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#fc4c02] focus:ring-4 focus:ring-[#fc4c02]/5 rounded-[20px] px-6 py-4 text-[15px] font-medium outline-none transition-all placeholder:text-slate-400 min-h-[100px] resize-none"
                    />
                </div>

                {state?.error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-[14px] font-bold animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        {state.error}
                    </div>
                )}

                <Button
                    disabled={isPending}
                    className="w-full bg-[#0f172a] hover:bg-black text-white px-8 py-7 rounded-[22px] text-[17px] font-[800] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.97] disabled:opacity-50"
                >
                    {isPending ? (
                        <>Sending Request...</>
                    ) : (
                        <>
                            Join the Team
                            <ArrowRight size={20} strokeWidth={3} />
                        </>
                    )}
                </Button>
            </form>
        </Card>
    )
}
