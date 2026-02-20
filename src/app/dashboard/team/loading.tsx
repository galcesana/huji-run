import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function TeamRosterLoading() {
    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-10 animate-pulse">
                <header className="flex flex-col items-center text-center gap-4 pt-4 relative">
                    <div className="absolute left-0 top-6 text-slate-200 bg-white p-2 md:p-3 rounded-full border border-slate-100">
                        <ArrowLeft size={24} />
                    </div>
                    <div className="space-y-2 mt-4 md:mt-0 flex flex-col items-center">
                        <div className="h-10 w-48 bg-slate-200 rounded-xl"></div>
                        <div className="h-5 w-40 bg-slate-200 rounded-md"></div>
                    </div>
                </header>

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="h-7 w-36 bg-slate-200 rounded-lg"></div>
                        <div className="h-6 w-8 bg-slate-200 rounded-full"></div>
                    </div>

                    <div className="grid gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i} className="p-4 bg-white border border-slate-100 shadow-sm rounded-[24px]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[14px] bg-slate-200 flex-shrink-0"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                                        <div className="h-4 w-48 bg-slate-200 rounded-md"></div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
