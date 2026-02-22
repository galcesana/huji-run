'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Settings, Menu as MenuIcon, X, LayoutDashboard, Rss, ShieldCheck, ChevronDown, CalendarDays } from 'lucide-react'

export function Navigation({ role }: { role?: string | null }) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Hide navigation on auth pages, landing page, and onboarding flow
    const hideNav = pathname === '/login' || pathname === '/signup' || pathname === '/' || pathname === '/verify-email' || pathname === '/onboarding' || pathname === '/pending'

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (hideNav) return null

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Team Feed', href: '/dashboard/feed', icon: Rss },
        { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    ]

    if (role === 'COACH' || role === 'CO_COACH') {
        navLinks.push({ name: 'Coach Panel', href: '/admin', icon: ShieldCheck })
    }

    return (
        <>
            <nav
                ref={menuRef}
                className="fixed top-0 left-0 w-full z-[100] backdrop-blur-md bg-white/75 border-b border-slate-200/50 h-16 flex items-center px-4 md:px-6"
            >
                <div className="max-w-xl mx-auto w-full flex items-center justify-between">
                    {/* Brand Lockup */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 -ml-2 rounded-2xl transition-all duration-100 active:scale-[0.92] active:bg-slate-100 flex-shrink-0 group border border-transparent hover:border-slate-100 select-none touch-manipulation"
                    >
                        <Image
                            src="/logo-removebg.png"
                            alt="HUJI Run"
                            width={38}
                            height={38}
                            className="drop-shadow-sm transform -rotate-1 group-active:rotate-0 transition-transform duration-200"
                        />
                        <span className="font-[900] text-[18px] sm:text-[20px] text-[#0f172a] tracking-[-0.04em] uppercase">
                            HUJI<span className="text-[#fc4c02] italic ml-0.5">RUN</span>
                        </span>
                    </Link>

                    {/* Desktop & Mobile Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/settings"
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-75 active:scale-[0.92] border select-none touch-manipulation ${pathname === '/dashboard/settings'
                                ? 'bg-[#0f172a] border-[#0f172a] text-white active:bg-black'
                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-[#0f172a] active:bg-slate-100'
                                }`}
                            aria-label="Settings"
                        >
                            <Settings size={20} strokeWidth={2.5} />
                        </Link>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-75 active:scale-[0.92] border sm:hidden select-none touch-manipulation ${isOpen
                                ? 'bg-[#fc4c02] border-[#fc4c02] text-white active:bg-[#e64502]'
                                : 'bg-white border-slate-200 text-slate-600 active:bg-slate-100'
                                }`}
                        >
                            {isOpen ? <X size={20} strokeWidth={2.5} /> : <MenuIcon size={20} strokeWidth={2.5} />}
                        </button>

                        {/* Desktop Links (Visible on bigger mobile/tablet) */}
                        <div className="hidden sm:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 ml-2">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-4 py-2 text-[13px] font-[700] rounded-lg transition-all duration-75 active:scale-95 ${isActive
                                            ? 'bg-white text-[#fc4c02] shadow-sm active:bg-slate-50'
                                            : 'text-slate-500 hover:text-[#0f172a] hover:bg-white/50 active:bg-white/80'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-[72px] right-4 left-4 sm:hidden z-[110]">
                        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[28px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
                            <div className="p-3 space-y-1">
                                {navLinks.map((link) => {
                                    const Icon = link.icon
                                    const isActive = pathname === link.href
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-75 active:scale-[0.96] select-none touch-manipulation ${isActive
                                                ? 'bg-[#fff3eb] text-[#fc4c02] active:bg-[#ffe6d4]'
                                                : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100'
                                                }`}>
                                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                            </div>
                                            <span className="font-[700] text-[16px] tracking-tight">{link.name}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                            <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Team HUJI RUN</p>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <div className="h-16" aria-hidden="true" />
        </>
    )
}
