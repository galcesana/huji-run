'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string, wasLiked: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (wasLiked) {
        // Unlike
        const { error } = await supabase.from('likes')
            .delete()
            .match({ post_id: postId, user_id: user.id })

        if (error) console.error("Failed to unlike", error)
    } else {
        // Like
        const { error } = await supabase.from('likes')
            .insert({ post_id: postId, user_id: user.id })

        if (error) console.error("Failed to like", error)
    }

    revalidatePath('/dashboard/feed')
    return { success: true }
}

export async function addComment(postId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    if (!content.trim()) return { error: 'Comment cannot be empty' }

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
    })

    if (error) {
        console.error('Failed to add comment', error)
        return { error: 'Failed to add comment' }
    }

    revalidatePath('/dashboard/feed')
    return { success: true }
}
