'use client'

import { deleteAccount } from '@/app/auth/actions'
import { Button } from '@/components/ui/Button'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function DeleteAccountButton() {
    const [isPending, setIsPending] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setIsPending(true)
        try {
            const result = await deleteAccount()
            if (result?.error) {
                console.error('Deletion error:', result.error)
                alert(`Error: ${result.error}`)
                setIsPending(false)
                setShowConfirm(false)
            }
        } catch (error: any) {
            // Next.js redirects throw a specific error that should not be caught as a failure
            if (error.message === 'NEXT_REDIRECT' || error.digest?.includes('NEXT_REDIRECT')) {
                return
            }
            console.error('Failed to delete account:', error)
            alert('Failed to delete account. Please try again.')
            setIsPending(false)
            setShowConfirm(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-800">
                    <AlertTriangle className="shrink-0" size={20} />
                    <p className="text-[13px] font-medium leading-relaxed">
                        This action is permanent and cannot be undone. All your activity data, settings, and profile information will be deleted immediately.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setShowConfirm(false)}
                        disabled={isPending}
                        className="flex-1 rounded-[12px] h-11 font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-[12px] h-11 font-semibold flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
                        Delete Forever
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="ghost"
            onClick={() => setShowConfirm(true)}
            className="w-full sm:w-auto text-red-500 hover:bg-red-50 hover:text-red-600 font-[600] rounded-[12px] h-11 px-6 border border-red-100 flex items-center justify-center gap-2"
        >
            <Trash2 size={18} />
            Delete My Account
        </Button>
    )
}
