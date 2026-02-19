
import Link from 'next/link'
import { signup } from '../auth/actions'

export default function SignupPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl">
                <h1 className="text-3xl font-bold text-center mb-6">Join the Team</h1>

                <form className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            name="full_name"
                            type="text"
                            required
                            className="input-field"
                            placeholder="Eliud Kipchoge"
                        />
                    </div>

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
                            minLength={6}
                        />
                    </div>

                    <button formAction={signup} className="primary-btn w-full mt-2">
                        Sign Up
                    </button>
                </form>

                <p className="text-center mt-6 text-sm">
                    Already a member?{' '}
                    <Link href="/login" className="font-semibold underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    )
}
