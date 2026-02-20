import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export default function FeedLoading() {
    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-xl mx-auto space-y-8 animate-pulse">
                <header className="flex flex-col items-center text-center gap-4 pt-4 relative">
                    <div className="absolute left-0 top-6 text-slate-200 bg-white p-2 md:p-3 rounded-full border border-slate-100">
                        <ArrowLeft size={24} />
                    </div>
                    <div className="space-y-2 mt-4 md:mt-0 flex flex-col items-center">
                        <div className="h-10 w-40 bg-slate-200 rounded-xl"></div>
                        <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-6 bg-white border border-slate-100 shadow-sm rounded-[28px] flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
                                    <div className="h-3 w-20 bg-slate-100 rounded-sm"></div>
                                </div>
                            </div>

                            <div className="h-[200px] w-full bg-slate-200 rounded-[20px]"></div>

                            <div className="flex gap-4">
                                <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
                                <div className="h-8 w-24 bg-slate-200 rounded-full"></div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    )
}
