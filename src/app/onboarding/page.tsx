'use client'

import React, { useActionState } from 'react'
import { joinTeam } from './actions'

export default function OnboardingPage() {
    const [state, formAction, isPending] = useActionState(joinTeam, null)

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl">
                <h1 className="text-2xl font-bold text-center mb-2">Join a Team</h1>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Enter the code provided by your coach to request access.
                </p>

                <form action={formAction} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Team Code</label>
                        <input
                            name="code"
                            type="text"
                            required
                            className="input-field uppercase tracking-widest text-center font-mono"
                            placeholder="CODE123"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Note for Coach (Optional)</label>
                        <textarea
                            name="note"
                            className="input-field"
                            rows={2}
                            placeholder="Hey, it's Gal from the Tuesday run..."
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm text-center">{state.error}</p>
                    )}

                    <button disabled={isPending} className="primary-btn w-full mt-2">
                        {isPending ? 'Sending Request...' : 'Send Request'}
                    </button>
                </form>
            </div>
        </main>
    )
}
