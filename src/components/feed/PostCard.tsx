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
        <Card className="overflow-hidden mb-6 bg-white hover:shadow-md transition-shadow">
            {/* Header: User Info */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-[#fc4c02]/10">
                                {profile?.full_name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{profile?.full_name || 'Unknown Runner'}</h3>
                        <p className="text-xs text-gray-500">{formatRelativeTime(post.created_at)}</p>
                    </div>
                </div>
            </div>

            {/* Body: Activity Stats */}
            <div className="p-4">
                <h4 className="font-semibold text-lg mb-4">{activity?.name || 'Afternoon Run'}</h4>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Distance</span>
                        <span className="font-medium text-xl">{formatDistance(activity?.distance || 0)}</span>
                    </div>
                    <div className="flex flex-col border-l border-r border-gray-100">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Pace</span>
                        <span className="font-medium text-xl">{formatPace(activity?.average_speed || 0)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Time</span>
                        <span className="font-medium text-xl">{formatDuration(activity?.moving_time || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Placeholder for Map - Just a visual block for V1 if no map/polyline rendering is ready */}
            <div className="bg-gray-50 h-32 w-full flex items-center justify-center border-y border-gray-100 text-gray-400">
                <MapPin className="mr-2 opacity-50" />
                <span className="text-sm font-medium opacity-50">Map visualization coming soon</span>
            </div>

            {/* Footer: Interactions */}
            <div className="p-3 bg-gray-50/50 flex gap-4">
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#fc4c02] transition-colors text-sm font-medium p-2 rounded-lg hover:bg-[#fc4c02]/10">
                    <Heart size={18} />
                    <span>Like</span>
                </button>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium p-2 rounded-lg hover:bg-blue-50">
                    <MessageCircle size={18} />
                    <span>Comment</span>
                </button>
            </div>
        </Card>
    )
}
