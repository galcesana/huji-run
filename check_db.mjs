import { createClient } from '@supabase/supabase-js'

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supaUrl, supaKey)

async function main() {
    const { data: posts } = await supabase.from('posts').select('*').limit(5)
    console.log("Posts count:", posts?.length || 0)

    const { data: activities } = await supabase.from('activities').select('*').limit(5)
    console.log("Activities count:", activities?.length || 0)
}

main().catch(console.error)
