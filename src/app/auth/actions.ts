
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('full_name') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/verify-email')
}



export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const adminClient = await createAdminClient()

    // 1. Log out the user first (clear cookies)
    await supabase.auth.signOut()

    // 2. Cascading Delete Dependent Data
    console.log('Cleanup: Deleting posts...')
    await adminClient.from('posts').delete().eq('user_id', user.id)

    console.log('Cleanup: Deleting activities...')
    await adminClient.from('activities').delete().eq('user_id', user.id)

    console.log('Cleanup: Deleting join requests...')
    await adminClient.from('join_requests').delete().eq('user_id', user.id)

    console.log('Cleanup: Deleting strava accounts...')
    await adminClient.from('strava_accounts').delete().eq('user_id', user.id)

    // 3. Delete the auth record & profile
    console.log('Final Delete: Removing auth user...')
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id)

    if (authError) {
        console.error('Failed to delete user from auth:', authError)
        return { error: `Auth Error: ${authError.message}` }
    }

    // 4. Explicitly delete profile (last step)
    console.log('Final Delete: Removing profile...')
    await adminClient.from('profiles').delete().eq('id', user.id)

    redirect('/login')
}
