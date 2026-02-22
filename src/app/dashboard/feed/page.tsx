import { createClient } from '@/lib/supabase/server'
import { getUser, getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import { FeedList } from '@/components/feed/FeedList'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NextImage from 'next/image'

export default async function FeedPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    const profile = await getProfile()

    // 1. Join Flow Redirections
    if (!profile?.team_id) {
        redirect('/onboarding')
    }
    if (profile?.status === 'PENDING') {
        redirect('/pending')
    }

    const supabase = await createClient()

    // 2. Fetch posts belonging to this team (Team-wide fetch)
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id,
            created_at,
            content,
            title,
            image_url,
            post_type,
            status,
            activities (
                name,
                distance,
                moving_time,
                average_speed,
                map_polyline
            ),
            profiles:profiles!posts_user_id_fkey (
                full_name,
                avatar_url
            ),
            likes (
                user_id,
                profiles (
                    full_name,
                    avatar_url
                )
            ),
            comments (
                id,
                content,
                created_at,
                user_id,
                profiles (
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false })
        .limit(20)

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-4 md:px-8 md:pb-8 pt-4 md:pt-8 font-sans">
            <div className="max-w-xl mx-auto space-y-8">
                <header className="flex flex-col items-center text-center gap-4 mb-10 pt-4">
                    <h1 className="text-[44px] sm:text-[52px] font-[900] text-[#0f172a] tracking-tight leading-none mt-1">
                        Team Feed<span className="text-[#2563eb]">.</span>
                    </h1>
                    <p className="text-[18px] text-[#64748b] font-medium">See what your team is up to</p>
                </header>

                <div className="flex flex-col gap-6">
                    {posts && posts.length > 0 ? (
                        <FeedList posts={posts} currentUserId={user.id} />
                    ) : (
                        <div className="text-center p-12 bg-white rounded-[24px] border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                            </div>
                            <h3 className="text-[20px] font-[700] text-[#0f172a] tracking-tight">No posts yet</h3>
                            <p className="text-[#64748b] leading-[1.6] max-w-sm">When team members record runs on Strava or coaches broadcast updates, they will appear here automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
