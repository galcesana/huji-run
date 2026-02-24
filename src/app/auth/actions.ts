
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

    // Log out the user first (clear cookies)
    await supabase.auth.signOut()

    // Delete auth user — ON DELETE CASCADE on profiles(id) → auth.users
    // handles all child tables (posts, activities, strava_accounts, join_requests, etc.)
    const { error: authError } = await adminClient.auth.admin.deleteUser(user.id)

    if (authError) {
        console.error('Failed to delete user from auth:', authError)
        return { error: `Failed to delete account: ${authError.message}` }
    }

    redirect('/login')
}
