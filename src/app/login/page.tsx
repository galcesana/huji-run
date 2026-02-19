'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { login, signInWithGoogle } from '../auth/actions'

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null)
    const [googleState, googleAction, isGooglePending] = useActionState(signInWithGoogle, null)

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl">
                <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>

                <form action={formAction} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="input-field"
                            placeholder="runner@huji.ac.il"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm text-center">{state.error}</p>
                    )}

                    <button disabled={isPending} className="primary-btn w-full mt-2">
                        {isPending ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-2 opacity-50">
                    <div className="h-px bg-current flex-1" />
                    <span className="text-sm">OR</span>
                    <div className="h-px bg-current flex-1" />
                </div>

                <form action={googleAction}>
                    {googleState?.error && (
                        <p className="text-red-500 text-sm text-center mb-2">{googleState.error}</p>
                    )}
                    <button disabled={isGooglePending} className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        {isGooglePending ? 'Directing...' : 'Sign in with Google'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    )
}
