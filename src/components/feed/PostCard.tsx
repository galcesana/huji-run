'use client'

import { Card } from '@/components/ui/Card'
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from '@/lib/utils/format'
import { MapPin, Heart, MessageCircle } from 'lucide-react'

interface PostCardProps {
    post: any; // We'll type this properly later or assume joined data structure
}

export function PostCard({ post }: PostCardProps) {
    const activity = post.activities
    const profile = post.profiles

    return (
        <Card className="overflow-hidden mb-6 bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[24px] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
            {/* Header: User Info */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100/60">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#fc4c02] font-bold bg-[#fff3eb]">
                                {profile?.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-[800] text-[17px] text-[#0f172a] tracking-tight leading-none mb-1.5">{profile?.full_name || 'Unknown Runner'}</h3>
                        <p className="text-[13px] font-medium text-slate-400 leading-none">{formatRelativeTime(post.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* Body: Activity Stats */}
            <div className="p-6">
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
            </div>

            {/* Placeholder for Map */}
            <div className="bg-slate-50 h-36 w-full flex items-center justify-center border-y border-slate-100/60">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-slate-400">
                    <MapPin size={16} strokeWidth={2.5} />
                    <span className="text-[13px] font-[600]">Map visualization coming soon</span>
                </div>
            </div>

            {/* Footer: Interactions */}
            <div className="p-4 bg-white flex gap-2">
                <button className="flex items-center justify-center gap-2 text-slate-500 hover:text-[#fc4c02] hover:bg-[#fff3eb] transition-colors text-[14px] font-[600] py-2.5 px-4 rounded-[12px] flex-1">
                    <Heart size={20} strokeWidth={2.5} />
                    <span>Like</span>
                </button>
                <button className="flex items-center justify-center gap-2 text-slate-500 hover:text-[#2563eb] hover:bg-[#eff6ff] transition-colors text-[14px] font-[600] py-2.5 px-4 rounded-[12px] flex-1">
                    <MessageCircle size={20} strokeWidth={2.5} />
                    <span>Comment</span>
                </button>
            </div>
        </Card>
    )
}
