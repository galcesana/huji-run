import React from 'react'

export function NavigationSkeleton() {
    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-[100] bg-white/75 border-b border-slate-200/50 h-16 flex items-center px-4 md:px-6">
                <div className="max-w-xl mx-auto w-full flex items-center justify-between animate-pulse">
                    {/* Brand Lockup Skeleton */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5">
                        <div className="w-[38px] h-[38px] rounded-full bg-slate-200" />
                        <div className="w-24 h-6 bg-slate-200 rounded-md" />
                    </div>

                    {/* Actions Skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-200" />
                        <div className="w-10 h-10 rounded-xl bg-slate-200 sm:hidden" />
                        {/* Desktop Links Skeleton */}
                        <div className="hidden sm:flex items-center gap-2 ml-2">
                            <div className="w-24 h-9 bg-slate-200 rounded-lg" />
                            <div className="w-24 h-9 bg-slate-200 rounded-lg" />
                        </div>
                    </div>
                </div>
            </nav>
            <div className="h-16" aria-hidden="true" />
        </>
    )
}
