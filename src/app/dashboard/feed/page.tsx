import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PostCard } from '@/components/feed/PostCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Get the current user's team_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single()

    if (!profile?.team_id) {
        return (
            <main className="min-h-screen bg-[#f8fafc] font-sans">
                <div className="max-w-xl mx-auto p-4 md:p-8 space-y-8">
                    <header className="flex flex-col items-center text-center gap-4 mb-4 pt-4">
                        <Link href="/dashboard" className="text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 mb-2 transition-all font-[600] text-[14px] px-4 py-2.5 rounded-xl w-fit shadow-sm self-start">
                            <ArrowLeft size={16} strokeWidth={2.5} />
                            Back to Dashboard
                        </Link>
                    </header>
                    <div className="text-center p-12 bg-white rounded-[24px] border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col items-center gap-4">
                        <h3 className="text-[20px] font-[700] text-[#0f172a] tracking-tight">You are not part of a team yet.</h3>
                        <p className="text-[#64748b] leading-[1.6]">An admin needs to approve your team request before you can see this feed.</p>
                    </div>
                </div>
            </main>
        )
    }

    // 2. Fetch posts belonging to this team, including the activity and profile data
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            activities (*),
            profiles:profiles!posts_user_id_fkey (full_name, avatar_url)
        `)
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error("Error fetching feed:", error)
        return <div className="p-8 text-center text-red-500">Failed to load team feed.</div>
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] font-sans">
            <div className="max-w-xl mx-auto p-4 md:p-8 space-y-8">
                <header className="flex flex-col items-center text-center gap-4 mb-10 pt-4">
                    <Link href="/dashboard" className="text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 mb-2 transition-all font-[600] text-[14px] px-4 py-2.5 rounded-xl w-fit shadow-sm self-start">
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none mt-2">
                        Team Feed<span className="text-[#2563eb]">.</span>
                    </h1>
                    <p className="text-[18px] text-[#64748b] font-medium">See what your team is up to</p>
                </header>

                <div className="flex flex-col gap-6">
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center p-12 bg-white rounded-[24px] border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            </div>
                            <h3 className="text-[20px] font-[700] text-[#0f172a] tracking-tight">No activities yet</h3>
                            <p className="text-[#64748b] leading-[1.6] max-w-sm">When team members record runs on Strava, they will appear here automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
