'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'

export function Navigation() {
    const pathname = usePathname()

    // Hide navigation on auth pages and landing page
    const hideNav = pathname === '/login' || pathname === '/signup' || pathname === '/'

    if (hideNav) return null

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-[100] backdrop-blur-md bg-white/75 border-b border-slate-200/50 h-16 flex items-center px-6">
                <div className="max-w-xl mx-auto w-full flex items-center justify-between -ml-4 md:-ml-8">
                    <div className="flex items-center gap-1">
                        <Image
                            src="/logo-removebg.png"
                            alt="HUJI Run"
                            width={44}
                            height={44}
                            className="drop-shadow-sm transform -rotate-1"
                        />
                        <span className="font-[900] text-[20px] text-[#0f172a] tracking-[-0.04em] uppercase ml-[-6px]">
                            HUJI<span className="text-[#fc4c02] italic ml-0.5">RUN</span>
                        </span>
                    </div>
                    {/* Right side placeholder for future profile icon/nav */}
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                        <div className="w-1 h-1 rounded-full bg-[#fc4c02]"></div>
                    </div>
                </div>
            </nav>
            <div className="h-16" aria-hidden="true" /> {/* Spacer to prevent content jump */}
        </>
    )
}
