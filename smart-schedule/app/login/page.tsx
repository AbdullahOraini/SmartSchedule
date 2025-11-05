'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import Link from 'next/link'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { authenticateWithFingerprint, isWebAuthnSupported } from '../../lib/webauthn'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFingerprintLoading, setIsFingerprintLoading] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [webauthnSupported, setWebauthnSupported] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setWebauthnSupported(isWebAuthnSupported())

    // Check if user just registered
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('registered') === 'true') {
      setRegistered(true)
      // Clear the query parameter
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Login form submitted')
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Calling login with:', { email, password })
      const result = await login(email, password)
      console.log('🔐 Login result:', result)

      if (result.success) {
        console.log('🔐 Login successful, redirecting based on user role')
        // Get the user role from auth state after successful login
        const authState = JSON.parse(localStorage.getItem('smartSchedule_user') || '{}')
        const userRole = authState.role

        // Redirect based on actual user role from backend
        if (userRole === 'student') {
          console.log('🔐 Redirecting to student dashboard')
          router.push('/student/dashboard')
        } else if (userRole === 'faculty') {
          console.log('🔐 Redirecting to faculty dashboard')
          router.push('/faculty/dashboard')
        } else if (userRole === 'committee') {
          console.log('🔐 Redirecting to committee dashboard')
          router.push('/committee/dashboard')
        } else {
          // Fallback to home page
          router.push('/')
        }
      } else {
        console.log('🔐 Login failed:', result.error)
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      console.error('🔐 Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFingerprintLogin = async () => {
    if (!email) {
      setError('Please enter your email first')
      return
    }

    setIsFingerprintLoading(true)
    setError('')

    try {
      console.log('🔐 Starting fingerprint authentication for:', email)
      const result = await authenticateWithFingerprint(email)
      console.log('🔐 Fingerprint authentication result:', result)

      if (result.success && result.user) {
        console.log('🔐 Fingerprint authentication successful')
        // Store user in localStorage
        localStorage.setItem('smartSchedule_user', JSON.stringify(result.user))
        localStorage.setItem('smartSchedule_auth', 'true')

        // Redirect based on role
        const userRole = result.user.role.toLowerCase()
        if (userRole === 'student') {
          router.push('/student/dashboard')
        } else if (userRole === 'faculty') {
          router.push('/faculty/dashboard')
        } else if (userRole === 'committee') {
          router.push('/committee/dashboard')
        } else {
          router.push('/')
        }
      } else {
        // Show detailed error message
        const errorMsg = result.error || 'Fingerprint authentication failed'
        console.error('🔐 Fingerprint authentication failed:', errorMsg)
        setError(errorMsg)
      }
    } catch (err: any) {
      console.error('🔐 Fingerprint login error:', err)
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage.includes('No fingerprint') 
        ? errorMessage 
        : `${errorMessage}. Make sure you have registered a fingerprint first.`)
    } finally {
      setIsFingerprintLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">Smart Schedule</h1>
            <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">University Scheduling System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234567@student.ksu.edu.sa"
            />
            <p className="mt-1 text-xs text-gray-500">Format: (ID)@student.ksu.edu.sa or (ID/name)@ksu.edu.sa</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isFingerprintLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {webauthnSupported && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
          )}

          {webauthnSupported && (
            <button
              type="button"
              onClick={handleFingerprintLogin}
              disabled={isLoading || isFingerprintLoading || !email}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFingerprintLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04c.655-1.18 1.179-2.433 1.554-3.737.136-.503.198-1.05.198-1.594 0-1.345-.538-2.57-1.415-3.464L3 12c0-5 4-9 9-9s9 4 9 9c0 1.657-.672 3.157-1.753 4.25l-.247.247c-.724.724-1.561 1.297-2.469 1.697" />
                  </svg>
                  Sign in with Fingerprint
                </>
              )}
            </button>
          )}

          {registered && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">Registration successful! Please log in with your new account.</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              {error.includes('No fingerprint registered') && (
                <div className="mt-2 text-xs text-red-500">
                  <p className="font-semibold">💡 How to register a fingerprint:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Log in with your email and password first</li>
                    <li>Go to Settings page (link in the top right or in your dashboard sidebar)</li>
                    <li>Click "Register Fingerprint" button</li>
                    <li>Follow your device's biometric prompt (Touch ID/Face ID/Windows Hello)</li>
                  </ol>
                  <p className="mt-2 text-blue-600">
                    <Link href="/settings" className="underline">Go to Settings now →</Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
