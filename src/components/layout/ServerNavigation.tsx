import { Navigation } from './Navigation'
import { getProfile } from '@/lib/supabase/data'

export async function ServerNavigation() {
    // 1. Fetch profile precisely here on the server so the root layout doesn't block.
    const profile = await getProfile()
    const role = profile?.role || null

    // 2. Pass the fetched data down to the client component shell
    return <Navigation role={role} />
}
