import { createClient } from '@supabase/supabase-js'

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supaUrl, supaKey)

async function main() {
    // Get first team
    let { data: team } = await supabase.from('teams').select('*').limit(1).single()

    if (!team) {
        console.log("No team found, creating 'HUJI Runners' team...")
        const { data: newTeam, error } = await supabase.from('teams').insert({ name: 'HUJI Runners', code: 'HUJI' }).select().single()
        if (error) throw error
        team = newTeam
    }

    console.log("Using team:", team.name, team.id)

    // Assign all users without a team to this team
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id, full_name, team_id')
    if (pError) throw pError

    let updated = 0;
    for (const profile of profiles) {
        if (!profile.team_id) {
            console.log(`Assigning ${profile.full_name || profile.id} to team...`)
            await supabase.from('profiles').update({ team_id: team.id }).eq('id', profile.id)
            updated++;
        }
    }
    console.log(`Assigned team to ${updated} users.`)
}

main().catch(console.error)
