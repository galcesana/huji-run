import { Card } from '@/components/ui/Card'

export default function AdminLoading() {
    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8 font-sans">
            <div className="max-w-2xl mx-auto space-y-16 animate-pulse">
                <header className="flex flex-col items-center text-center gap-4 pt-4">
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="h-12 w-56 bg-slate-200 rounded-xl"></div>
                        <div className="h-5 w-48 bg-slate-200 rounded-md mt-2"></div>
                    </div>
                </header>

                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        <div className="h-7 w-40 bg-slate-200 rounded-lg"></div>
                        <div className="h-6 w-8 bg-slate-200 rounded-full ml-auto"></div>
                    </div>

                    <div className="grid gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Card key={`req-${i}`} className="p-5 bg-white border border-slate-100 shadow-sm rounded-[24px]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                                        <div className="h-4 w-48 bg-slate-200 rounded-md"></div>
                                        <div className="h-3 w-16 bg-slate-100 rounded-sm mt-1"></div>
                                    </div>
                                    <div className="flex md:flex-row flex-col gap-2">
                                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                                        <div className="h-10 w-24 bg-slate-200 rounded-xl"></div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        <div className="h-7 w-36 bg-slate-200 rounded-lg"></div>
                        <div className="h-6 w-8 bg-slate-200 rounded-full ml-auto"></div>
                    </div>

                    <div className="grid gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={`ath-${i}`} className="p-4 bg-white border border-slate-100 shadow-sm rounded-[24px]">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-slate-200 flex-shrink-0"></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="h-5 w-28 bg-slate-200 rounded-md"></div>
                                        <div className="h-4 w-40 bg-slate-200 rounded-md"></div>
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
