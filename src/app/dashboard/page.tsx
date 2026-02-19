
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Activity, CheckCircle, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user has connected Strava
    const { data: stravaAccount } = await supabase
        .from('strava_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const isConnected = !!stravaAccount

    return (
        <main className="min-h-screen p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, Runner!</p>
                </div>

                {!isConnected && (
                    <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Action Required: Connect Strava</span>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Connection Status Card */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#fc4c02]/10 p-2 rounded-lg text-[#fc4c02]">
                            <Activity size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Strava Connection</h2>
                    </div>

                    <p className="text-gray-600 text-sm">
                        Connect your Strava account to automatically import your runs and participate in the team leaderboard.
                    </p>

                    {isConnected ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle className="text-green-600" size={24} />
                            <div>
                                <p className="font-semibold text-green-900">Connected</p>
                                <p className="text-xs text-green-700">Last synced: {new Date(stravaAccount.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ) : (
                        <form action="/api/auth/strava" method="GET">
                            <Button className="w-full bg-[#fc4c02] hover:bg-[#e34402] text-white">
                                Connect with Strava
                            </Button>
                        </form>
                    )}
                </Card>

                {/* Recent Activity Placeholder */}
                <Card className="p-6 space-y-4 opacity-50 pointer-events-none grayscale">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold">Recent Activities</h2>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Coming Soon</span>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </Card>
            </div>
        </main>
    )
}
