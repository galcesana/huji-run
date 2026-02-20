import React from 'react'
import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { OnboardingForm } from '@/components/onboarding/OnboardingForm'

export default async function OnboardingPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getProfile()
    if (profile?.status === 'ACTIVE') {
        redirect('/dashboard')
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background branding elements */}
            <div className="absolute top-10 left-10 opacity-10 blur-2xl flex items-center gap-3 select-none pointer-events-none">
                <div className="w-24 h-24 bg-[#fc4c02] rounded-full"></div>
                <div className="w-16 h-16 bg-[#2563eb] rounded-full mt-10"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <header className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px] flex items-center justify-center mx-auto border border-slate-100 ring-4 ring-slate-50">
                        <Trophy className="text-[#fc4c02]" size={36} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-[44px] font-[900] text-[#0f172a] tracking-tight leading-none">
                            Join Team<span className="text-[#fc4c02]">.</span>
                        </h1>
                        <p className="text-[17px] text-[#64748b] font-medium leading-relaxed max-w-xs mx-auto">
                            Enter your team's access code to join the squad and start tracking.
                        </p>
                    </div>
                </header>

                <OnboardingForm />

                <p className="text-center text-slate-400 text-[13px] font-medium">
                    Questions? Ask your coach for the team join code.
                </p>
            </div>
        </main>
    )
}
