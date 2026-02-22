'use client'

import { useState } from 'react'
import { PostCard } from '@/components/feed/PostCard'
import { Megaphone, Image as ImageIcon, Calendar, LayoutList } from 'lucide-react'

interface FeedListProps {
    posts: any[];
    currentUserId: string;
}

type FilterType = 'ALL' | 'UPDATE' | 'IMAGE' | 'TRAINING_PLAN'

export function FeedList({ posts, currentUserId }: FeedListProps) {
    const [filter, setFilter] = useState<FilterType>('ALL')

    const filteredPosts = posts.filter(post => {
        if (filter === 'ALL') return true;
        // Strava activities usually don't have a post_type, or we might classify them as 'ACTIVITY'. 
        // For now, if the user explicitly clicks UPDATE/IMAGE/PLAN, we hide raw Strava activities 
        // unless we want 'UPDATE' to include Strava, but usually filtering means strict matches.
        return post.post_type === filter;
    })

    return (
        <div className="flex flex-col gap-6">

            {/* Filter Controls */}
            <div className="flex bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] p-1.5 rounded-2xl gap-1 sticky top-4 z-10 mx-auto max-w-fit mb-2 border border-slate-100/50">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <LayoutList size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">All</span>
                </button>
                <div className="w-[1px] bg-slate-100 my-2 mx-1"></div>
                <button
                    onClick={() => setFilter('UPDATE')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'UPDATE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                    <Megaphone size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">Updates</span>
                </button>
                <button
                    onClick={() => setFilter('IMAGE')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'IMAGE' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'}`}
                >
                    <ImageIcon size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">Media</span>
                </button>
                <button
                    onClick={() => setFilter('TRAINING_PLAN')}
                    className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${filter === 'TRAINING_PLAN' ? 'bg-[#fc4c02] text-white shadow-sm' : 'text-slate-500 hover:text-[#fc4c02] hover:bg-[#fff3eb]'}`}
                >
                    <Calendar size={16} strokeWidth={2.5} /> <span className="hidden sm:inline">Plans</span>
                </button>
            </div>

            {/* Post Rendering */}
            {filteredPosts.length > 0 ? (
                <div className="space-y-6">
                    {filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white rounded-[24px] border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] flex flex-col items-center gap-4 border border-slate-100/50">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-2">
                        <LayoutList size={32} strokeWidth={2} />
                    </div>
                    <h3 className="text-[20px] font-[700] text-[#0f172a] tracking-tight">No posts found</h3>
                    <p className="text-[#64748b] leading-[1.6] max-w-sm">There are no posts matching the current filter.</p>
                </div>
            )}
        </div>
    )
}
