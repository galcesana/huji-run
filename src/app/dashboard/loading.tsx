export default function DashboardLoading() {
    return (
        <main className="min-h-screen bg-[#f8fafc] px-6 pb-6 pt-4 md:px-10 md:pb-10 md:pt-8 font-sans">
            <div className="max-w-xl mx-auto space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <header className="flex flex-col items-center text-center gap-2 mb-10">
                    <div className="h-12 w-48 bg-slate-200 rounded-xl"></div>
                    <div className="h-5 w-32 bg-slate-200 rounded-md mt-2"></div>
                </header>

                <div className="flex flex-col gap-6">
                    {/* Primary Card Skeleton */}
                    <div className="p-8 bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.05)] rounded-[28px] flex flex-col items-center text-center h-[340px]">
                        <div className="w-16 h-16 bg-slate-200 rounded-[18px] mb-5 mt-2"></div>
                        <div className="h-8 w-40 bg-slate-200 rounded-xl mb-4"></div>
                        <div className="h-4 w-64 bg-slate-200 rounded-md mb-2"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded-md mb-8"></div>
                        <div className="w-full max-w-[320px] h-16 bg-slate-200 rounded-[100px] mt-auto"></div>
                    </div>

                    {/* Secondary Card Skeleton */}
                    <div className="p-7 bg-white border border-slate-100 shadow-sm rounded-[24px] flex flex-col items-center text-center h-[300px]">
                        <div className="w-12 h-12 bg-slate-200 rounded-[14px] mb-4"></div>
                        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-3"></div>
                        <div className="h-4 w-56 bg-slate-200 rounded-md mb-2"></div>
                        <div className="h-4 w-40 bg-slate-200 rounded-md mb-6"></div>
                        <div className="w-full max-w-[280px] h-14 bg-slate-200 rounded-[100px] mt-auto"></div>
                    </div>
                </div>
            </div>
        </main>
    )
}
