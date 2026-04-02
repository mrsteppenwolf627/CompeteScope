'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const router = useRouter()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Email and password required' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error.message)
        setMessage({ type: 'error', text: error.message || 'Login failed' })
        setLoading(false)
        return
      }

      if (!data.user) {
        setMessage({ type: 'error', text: 'No user returned from login' })
        setLoading(false)
        return
      }

      setMessage({ type: 'success', text: 'Login successful! Redirecting...' })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push('/dashboard')
    } catch (err) {
      console.error('Unexpected error:', err)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
            ⊕
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in to CompeteScope</h1>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-900 text-green-100'
                : 'bg-red-900 text-red-100'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 outline-none disabled:opacity-50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-400 hover:text-blue-300">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
