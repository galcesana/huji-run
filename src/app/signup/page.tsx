'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signup } from '../auth/actions'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signup, null)

    return (
        <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md space-y-8">
                {/* Branding Lockup */}
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 transform -rotate-2">
                        <Image
                            src="/logo-removebg.png"
                            alt="HUJI Run"
                            width={48}
                            height={48}
                            className="drop-shadow-sm"
                            priority
                        />
                    </div>
                    <h2 className="font-[900] text-[24px] text-[#0f172a] tracking-[-0.04em] uppercase mt-2">
                        HUJI<span className="text-[#fc4c02] italic ml-0.5">RUN</span>
                    </h2>
                </div>

                <Card className="p-8 md:p-10 rounded-[32px] border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-center mb-10">
                            <h1 className="text-[32px] font-[800] text-[#0f172a] tracking-tight leading-none mb-3">
                                Join the Team<span className="text-[#fc4c02]">.</span>
                            </h1>
                            <p className="text-slate-500 font-medium">Start tracking your journey today.</p>
                        </div>

                        <form action={formAction} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[14px] font-[700] text-[#0f172a] ml-1">Full Name</label>
                                <input
                                    name="full_name"
                                    type="text"
                                    required
                                    className="w-full bg-[#f8fafc] border-0 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-[#fc4c02]/20 transition-all outline-none placeholder-slate-400"
                                    placeholder="Eliud Kipchoge"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[14px] font-[700] text-[#0f172a] ml-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-[#f8fafc] border-0 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-[#fc4c02]/20 transition-all outline-none placeholder-slate-400"
                                    placeholder="maru.teferi@mail.huji.ac.il"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[14px] font-[700] text-[#0f172a] ml-1">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-[#f8fafc] border-0 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-[#fc4c02]/20 transition-all outline-none placeholder-slate-400"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            {state?.error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold text-center border border-red-100">
                                    {state.error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-[60px] bg-[#0f172a] hover:bg-black text-white rounded-2xl text-[16px] font-[700] shadow-lg shadow-slate-200 transition-all active:scale-[0.98] mt-4"
                            >
                                {isPending ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </form>
                    </div>

                    {/* Subtle aesthetic accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#fc4c02]/5 rounded-bl-[100px] -z-0 blur-2xl" />
                </Card>

                <p className="text-center text-slate-500 font-medium text-[15px]">
                    Already a member?{' '}
                    <Link href="/login" className="text-[#0f172a] font-[800] underline decoration-[#fc4c02] decoration-2 underline-offset-4 hover:text-[#fc4c02] transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    )
}
