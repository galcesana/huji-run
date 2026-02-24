import { getProfile } from '@/lib/supabase/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const profile = await getProfile()
    if (!profile) redirect('/login')
    if (profile.role !== 'COACH' && profile.role !== 'CO_COACH') redirect('/dashboard')

    return <>{children}</>
}
