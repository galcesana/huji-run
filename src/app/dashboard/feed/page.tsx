import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PostCard } from '@/components/feed/PostCard'

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
        return <div className="p-8 text-center text-gray-500">You are not part of a team yet.</div>
    }

    // 2. Fetch posts belonging to this team, including the activity and profile data
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            activities (*),
            profiles (full_name, avatar_url)
        `)
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error("Error fetching feed:", error)
        return <div className="p-8 text-center text-red-500">Failed to load team feed.</div>
    }

    return (
        <main className="min-h-screen bg-gray-50/50">
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Team Feed</h1>
                    <p className="text-gray-500">See what your team is up to</p>
                </header>

                <div className="space-y-6">
                    {posts && posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                            <p className="text-gray-500">When team members record runs on Strava, they will appear here automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
