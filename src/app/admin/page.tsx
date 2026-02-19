
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveRequest, rejectRequest } from './actions'

export default async function AdminPage() {
    const supabase = await createClient()

    // 1. Verify Coach Access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'COACH' && profile?.role !== 'CO_COACH') {
        return (
            <div className="flex min-h-screen items-center justify-center p-8">
                <div className="glass-panel p-8 rounded-2xl text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
                    <p>You must be a coach to view this page.</p>
                </div>
            </div>
        )
    }

    // 2. Fetch Pending Requests
    const { data: requests } = await supabase
        .from('join_requests')
        .select(`
      id,
      created_at,
      note,
      user:profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                        {requests?.length || 0} Pending Requests
                    </span>
                </header>

                <section className="space-y-4">
                    {requests?.length === 0 ? (
                        <div className="glass-panel p-12 text-center rounded-2xl text-gray-500">
                            <p>No pending join requests.</p>
                        </div>
                    ) : (
                        requests?.map((req: any) => (
                            <div key={req.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl overflow-hidden">
                                        {req.user.avatar_url ? (
                                            <img src={req.user.avatar_url} alt={req.user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{req.user.full_name?.[0] || '?'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{req.user.full_name}</h3>
                                        <p className="text-sm text-gray-500">{req.user.email}</p>
                                        {req.note && (
                                            <div className="mt-2 text-sm bg-yellow-50 text-yellow-800 p-2 rounded-lg inline-block">
                                                "{req.note}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <form action={rejectRequest.bind(null, req.id)}>
                                        <button className="px-6 py-2 rounded-full border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors w-full md:w-auto">
                                            Reject
                                        </button>
                                    </form>
                                    <form action={approveRequest.bind(null, req.id, req.user.id)}>
                                        <button className="primary-btn w-full md:w-auto">
                                            Approve
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </main>
    )
}
