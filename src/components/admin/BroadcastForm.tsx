'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createBroadcast } from '@/app/admin/actions'
import { Megaphone, Image as ImageIcon, Calendar, SendHorizontal } from 'lucide-react'

export function BroadcastForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [postType, setPostType] = useState('UPDATE')
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('postType', postType)
        const res = await createBroadcast(formData)
        setIsSubmitting(false)
        if (res?.success) {
            formRef.current?.reset()
            setPostType('UPDATE')
        } else {
            alert(res?.error || 'Failed to broadcast.')
        }
    }

    return (
        <Card className="bg-white border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] rounded-[28px] overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100/60 p-4 px-6 flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <Megaphone size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-[800] text-[#0f172a] text-[17px] tracking-tight">Team Broadcast</h3>
            </div>

            <form ref={formRef} action={handleSubmit} className="p-6 space-y-5">
                {/* Type Selector */}
                <div className="flex bg-slate-100/50 p-1.5 rounded-xl gap-1">
                    <button
                        type="button"
                        onClick={() => setPostType('UPDATE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${postType === 'UPDATE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Megaphone size={16} /> Update
                    </button>
                    <button
                        type="button"
                        onClick={() => setPostType('IMAGE')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${postType === 'IMAGE' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ImageIcon size={16} /> Media
                    </button>
                    <button
                        type="button"
                        onClick={() => setPostType('TRAINING_PLAN')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all ${postType === 'TRAINING_PLAN' ? 'bg-white text-[#fc4c02] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Calendar size={16} /> Plan Link
                    </button>
                </div>

                {/* Optional Title */}
                <input
                    type="text"
                    name="title"
                    placeholder="Title (Optional)"
                    className="w-full bg-slate-50 border-0 text-[#0f172a] font-bold text-[18px] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-medium"
                />

                {/* Main Content */}
                <textarea
                    name="content"
                    required
                    placeholder="Write a message to your team..."
                    rows={4}
                    className="w-full bg-slate-50 border-0 text-[#0f172a] px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
                ></textarea>

                {/* Additional Media URL (If Image) */}
                {postType === 'IMAGE' && (
                    <input
                        type="url"
                        name="imageUrl"
                        placeholder="Paste image URL here..."
                        className="w-full bg-slate-50 border-0 text-[#0f172a] text-[15px] px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                )}

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${postType === 'UPDATE' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                                postType === 'IMAGE' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20' :
                                    'bg-[#fc4c02] hover:bg-[#e34402] shadow-orange-500/20'
                            }`}
                    >
                        <SendHorizontal size={20} strokeWidth={2.5} />
                        {isSubmitting ? 'Broadcasting...' : 'Publish to Feed'}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
