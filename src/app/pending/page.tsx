
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
            <div className="glass-panel max-w-md p-10 rounded-3xl flex flex-col items-center">
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold mb-2">Request Sent</h1>
                <p className="text-gray-600 opacity-80 mb-6">
                    Your request is waiting for coach approval. You'll get access to the feed and meetups once approved.
                </p>

                <button className="px-6 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-500 cursor-not-allowed">
                    Connect Strava (Locked)
                </button>

                <form action="/auth/signout" method="post" className="mt-8">
                    <button className="text-xs text-red-500 hover:underline">
                        Log Out
                    </button>
                </form>
            </div>
        </main>
    )
}
