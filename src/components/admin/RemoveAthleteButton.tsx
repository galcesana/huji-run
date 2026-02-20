'use client'

import { removeAthlete } from '@/app/admin/actions'
import { Button } from '@/components/ui/Button'
import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface RemoveAthleteButtonProps {
    athleteId: string
    athleteName: string
}

export function RemoveAthleteButton({ athleteId, athleteName }: RemoveAthleteButtonProps) {
    const [isPending, setIsPending] = useState(false)

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove ${athleteName}? This will permanently delete their account and all their data.`)) {
            return
        }

        setIsPending(true)
        try {
            await removeAthlete(athleteId)
        } catch (error) {
            console.error('Failed to remove athlete:', error)
            alert('Failed to remove athlete. Please try again.')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Button
            variant="ghost"
            onClick={handleRemove}
            disabled={isPending}
            className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
        </Button>
    )
}
