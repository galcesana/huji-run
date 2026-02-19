'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md space-y-8 text-center">
                {/* Branding Lockup */}
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 transform -rotate-2">
                        <Image
                            src="/logo-removebg.png"
                            alt="HUJI Run"
                            width={48}
                            height={48}
                            className="drop-shadow-sm"
                        />
                    </div>
                    <h2 className="font-[900] text-[24px] text-[#0f172a] tracking-[-0.04em] uppercase mt-2">
                        HUJI<span className="text-[#fc4c02] italic ml-0.5">RUN</span>
                    </h2>
                </div>

                <Card className="p-8 md:p-10 rounded-[32px] border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white relative overflow-hidden flex flex-col items-center">
                    <div className="relative z-10 w-full">
                        <div className="bg-[#eff6ff] w-20 h-20 flex items-center justify-center rounded-[24px] text-[#2563eb] mb-8 mx-auto">
                            <Mail size={40} strokeWidth={2} />
                        </div>

                        <h1 className="text-[32px] font-[800] text-[#0f172a] tracking-tight leading-none mb-4">
                            Check your inbox<span className="text-[#fc4c02]">.</span>
                        </h1>

                        <p className="text-[#475569] leading-[1.6] text-[16px] mb-10 max-w-sm mx-auto">
                            We've sent a verification link to your email. Please click the link to activate your account and join the team.
                        </p>

                        <div className="space-y-4 w-full">
                            <Link href="/login" className="block w-full">
                                <Button className="w-full h-[60px] bg-[#0f172a] hover:bg-black text-white rounded-2xl text-[16px] font-[700] shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2">
                                    Continue to Login
                                    <ArrowRight size={20} />
                                </Button>
                            </Link>

                            <p className="text-[14px] font-medium text-slate-400">
                                Didn't receive an email? Check your spam folder.
                            </p>
                        </div>
                    </div>

                    {/* Subtle aesthetic accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563eb]/5 rounded-bl-[100px] -z-0 blur-2xl" />
                </Card>

                <p className="text-[15px] font-medium text-slate-500">
                    Need help? <a href="mailto:support@huji.ac.il" className="text-[#0f172a] font-bold underline decoration-[#fc4c02]/30 decoration-2 underline-offset-4">Contact Support</a>
                </p>
            </div>
        </main>
    )
}
