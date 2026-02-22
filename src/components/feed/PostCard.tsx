'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from '@/lib/utils/format'
import { MapPin, Heart, MessageCircle, Calendar, Send } from 'lucide-react'
import { toggleLike, addComment } from '@/app/dashboard/feed/actions'

interface PostCardProps {
    post: any;
    currentUserId: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
    const activity = post.activities
    const profile = post.profiles

    // Optimistic Like State
    const initialLikes = post.likes || []
    const [likesCount, setLikesCount] = useState(initialLikes.length)
    const [isLiked, setIsLiked] = useState<boolean>(initialLikes.some((l: any) => l.user_id === currentUserId))
    const [isPending, startTransition] = useTransition()
    const [showLikes, setShowLikes] = useState(false)

    // Comments State
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Sort initial comments safely
    const sortedComments = [...(post.comments || [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Handlers
    const handleToggleLike = () => {
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikesCount((prev: number) => newIsLiked ? prev + 1 : prev - 1)

        startTransition(async () => {
            await toggleLike(post.id, !newIsLiked) // pass whether it WAS liked before the toggle
        })
    }

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim() || isSubmitting) return

        setIsSubmitting(true)
        await addComment(post.id, commentText)
        setCommentText('')
        setIsSubmitting(false)
    }

    return (
        <Card className="overflow-hidden mb-6 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
            {/* Header: User Info */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100/60">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm relative">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.full_name || 'Runner'}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#fc4c02] font-bold bg-[#fff3eb]">
                                {profile?.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-[800] text-[17px] text-[#0f172a] tracking-tight leading-none">{profile?.full_name || 'Unknown Runner'}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] font-medium leading-none">
                            <span className="text-slate-400">{formatRelativeTime(post.created_at)}</span>

                            {/* Type Badges */}
                            {post.post_type === 'UPDATE' && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100/50">Update</span>
                            )}
                            {post.post_type === 'IMAGE' && (
                                <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-purple-100/50">Media</span>
                            )}
                            {post.post_type === 'TRAINING_PLAN' && (
                                <span className="bg-[#fff3eb] text-[#fc4c02] px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-[#fc4c02]/10">Plan Link</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body: Activity Stats OR Custom Content */}
            <div className="p-6">
                {(post.post_type === 'UPDATE' || post.post_type === 'IMAGE' || post.post_type === 'TRAINING_PLAN') ? (
                    <div className="space-y-4">
                        {post.title && <h4 className="font-[800] text-[20px] text-[#0f172a] tracking-tight">{post.title}</h4>}
                        <p className="text-[15px] text-[#334155] leading-relaxed whitespace-pre-wrap">{post.content}</p>

                        {post.image_url && post.post_type === 'IMAGE' && (
                            <div className="mt-4 rounded-[16px] overflow-hidden bg-slate-100 border border-slate-200/50">
                                <img src={post.image_url} alt={post.title || "Post media"} className="w-full h-auto max-h-[400px] object-cover" />
                            </div>
                        )}

                        {post.post_type === 'TRAINING_PLAN' && (
                            <div className="mt-5 p-4 border-2 border-[#fc4c02]/20 bg-[#fff3eb] rounded-2xl flex items-center gap-4 text-[#fc4c02] font-semibold cursor-pointer hover:bg-[#ffeade] transition-colors group">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm text-[#fc4c02] group-hover:scale-105 transition-transform">
                                    <Calendar size={22} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-[15px] font-[800]">View Training Plan</span>
                                    <span className="block text-[13px] font-medium text-[#c43a00]/80">Click to expand schedule</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : activity ? (
                    <>
                        <h4 className="font-[700] text-[20px] text-[#0f172a] mb-6 tracking-tight">{activity?.name || 'Afternoon Run'}</h4>

                        <div className="grid grid-cols-3 gap-0 bg-[#f8fafc] rounded-[16px] p-4 border border-slate-100">
                            <div className="flex flex-col items-center justify-center">
                                <span className="font-[900] text-[24px] text-[#0f172a] tracking-tighter leading-none mb-1.5">{formatDistance(activity?.distance || 0)}</span>
                                <span className="text-[10px] font-[700] text-slate-500 uppercase tracking-widest">Distance</span>
                            </div>
                            <div className="flex flex-col items-center justify-center border-l border-r border-slate-200/60 px-2">
                                <span className="font-[900] text-[24px] text-[#0f172a] tracking-tighter leading-none mb-1.5">{formatPace(activity?.average_speed || 0)}</span>
                                <span className="text-[10px] font-[700] text-slate-500 uppercase tracking-widest">Pace</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <span className="font-[900] text-[24px] text-[#0f172a] tracking-tighter leading-none mb-1.5">{formatDuration(activity?.moving_time || 0)}</span>
                                <span className="text-[10px] font-[700] text-slate-500 uppercase tracking-widest">Time</span>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Placeholder for Map (Only for Strava Activities) */}
            {activity && !activity.map_polyline && (
                <div className="bg-slate-50 h-36 w-full flex items-center justify-center border-y border-slate-100/60">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-slate-400">
                        <MapPin size={16} strokeWidth={2.5} />
                        <span className="text-[13px] font-[600]">Map visualization coming soon</span>
                    </div>
                </div>
            )}

            {/* Footer: Interactions */}
            <div className="p-4 bg-white flex flex-col border-t border-slate-100">

                {/* Information Row */}
                {(likesCount > 0) && (
                    <div className="flex items-center px-2 pb-3 pt-1">
                        <button
                            onClick={() => setShowLikes(!showLikes)}
                            className="text-[13px] font-[600] text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </button>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleToggleLike}
                        className={`flex items-center justify-center gap-2 transition-colors text-[14px] font-[600] py-2.5 px-4 rounded-[12px] flex-1 ${isLiked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                    >
                        <Heart size={20} strokeWidth={isLiked ? 3 : 2.5} className={isLiked ? 'fill-red-500' : ''} />
                        <span>Like</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowComments(!showComments)
                            setShowLikes(false)
                        }}
                        className={`flex items-center justify-center gap-2 transition-colors text-[14px] font-[600] py-2.5 px-4 rounded-[12px] flex-1 ${showComments ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                    >
                        <MessageCircle size={20} strokeWidth={2.5} />
                        <span>{sortedComments.length > 0 ? `${sortedComments.length} Comments` : 'Comment'}</span>
                    </button>
                </div>

                {/* Expandable Likes Section */}
                {showLikes && likesCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        <h5 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest px-2">Liked by</h5>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                            {initialLikes.map((like: any) => (
                                <div key={like.user_id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden relative">
                                        {like.profiles?.avatar_url ? (
                                            <Image src={like.profiles.avatar_url} alt="User" fill className="object-cover" sizes="32px" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 capitalize">
                                                {like.profiles?.full_name?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-[600] text-[14px] text-slate-700">
                                        {like.profiles?.full_name || 'Anonymous User'}
                                    </span>
                                </div>
                            ))}
                            {/* Optimistic addition placeholder if user liked but not in initial fetch */}
                            {isLiked && !initialLikes.some((l: any) => l.user_id === currentUserId) && (
                                <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden relative flex items-center justify-center">
                                        <Heart size={14} className="fill-red-500 text-red-500" />
                                    </div>
                                    <span className="font-[600] text-[14px] text-slate-700 italic">
                                        You (Just liked)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Expandable Comments Section */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {sortedComments.length > 0 ? (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                {sortedComments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-200">
                                            {comment.profiles?.avatar_url ? (
                                                <Image src={comment.profiles.avatar_url} alt="User" fill className="object-cover" sizes="32px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    {comment.profiles?.full_name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-3 px-4 relative group">
                                            <span className="block font-[700] text-[13px] text-slate-700 leading-none mb-1">
                                                {comment.profiles?.full_name || 'User'}
                                            </span>
                                            <p className="text-[14px] text-slate-600 leading-snug break-words">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-slate-400 text-sm font-medium">
                                No comments yet. Be the first!
                            </div>
                        )}

                        <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-slate-50 border-0 text-[#0f172a] text-[14px] px-4 py-2.5 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || isSubmitting}
                                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-200 transition-colors"
                            >
                                <Send size={16} strokeWidth={2.5} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </Card>
    )
}
