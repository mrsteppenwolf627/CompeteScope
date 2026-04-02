'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, user is logged in immediately
    if (data.session) {
      window.location.href = '/dashboard'
      return
    }

    // Email confirmation required
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-900/40 border border-green-700/50 flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
          <p className="text-slate-400 mb-6">
            We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
            Click it to activate your account.
          </p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xl">⊕</span>
            CompeteScope
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Create your free account</p>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className={`w-full bg-[#0f172a] border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  confirm && confirm !== password
                    ? 'border-red-700/70 focus:ring-red-500/30'
                    : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
              {confirm && confirm !== password && (
                <p className="mt-1.5 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm bg-red-900/30 border border-red-700/50 text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (confirm.length > 0 && confirm !== password)}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          By signing up you agree to our{' '}
          <Link href="#" className="hover:text-slate-400 transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
