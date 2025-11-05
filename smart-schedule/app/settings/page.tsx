'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { registerFingerprint, getAuthenticators, deleteAuthenticator, isWebAuthnSupported } from '../../lib/webauthn'

export default function SettingsPage() {
  const { authState, isAuthenticated } = useAuth()
  const router = useRouter()
  const [authenticators, setAuthenticators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [deviceName, setDeviceName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [webauthnSupported, setWebauthnSupported] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    setWebauthnSupported(isWebAuthnSupported())
    loadAuthenticators()
  }, [authState])

  const loadAuthenticators = async () => {
    setIsLoading(true)
    try {
      const result = await getAuthenticators()
      if (result.success && result.authenticators) {
        setAuthenticators(result.authenticators)
      }
    } catch (err) {
      console.error('Failed to load authenticators:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterFingerprint = async () => {
    setIsRegistering(true)
    setError('')
    setSuccess('')

    try {
      const result = await registerFingerprint(deviceName || undefined)
      if (result.success) {
        setSuccess('Fingerprint registered successfully!')
        setDeviceName('')
        await loadAuthenticators()
      } else {
        setError(result.error || 'Failed to register fingerprint')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDeleteAuthenticator = async (id: string) => {
    if (!confirm('Are you sure you want to remove this fingerprint?')) {
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await deleteAuthenticator(id)
      if (result.success) {
        setSuccess('Fingerprint removed successfully')
        await loadAuthenticators()
      } else {
        setError(result.error || 'Failed to remove fingerprint')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Settings</h1>

          {/* WebAuthn Support Check */}
          {!webauthnSupported && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Fingerprint authentication is not supported in your browser. Please use a modern browser that supports WebAuthn (Chrome, Firefox, Safari, Edge).
              </p>
            </div>
          )}

          {/* Register New Fingerprint */}
          {webauthnSupported && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Register New Fingerprint</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g., My Laptop, iPhone, etc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleRegisterFingerprint}
                  disabled={isRegistering}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04c.655-1.18 1.179-2.433 1.554-3.737.136-.503.198-1.05.198-1.594 0-1.345-.538-2.57-1.415-3.464L3 12c0-5 4-9 9-9s9 4 9 9c0 1.657-.672 3.157-1.753 4.25l-.247.247c-.724.724-1.561 1.297-2.469 1.697" />
                      </svg>
                      Register Fingerprint
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Registered Fingerprints */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Fingerprints</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : authenticators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No fingerprints registered yet.</p>
                <p className="text-sm mt-2">Register a fingerprint above to enable passwordless login.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {authenticators.map((auth) => (
                  <div
                    key={auth.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04c.655-1.18 1.179-2.433 1.554-3.737.136-.503.198-1.05.198-1.594 0-1.345-.538-2.57-1.415-3.464L3 12c0-5 4-9 9-9s9 4 9 9c0 1.657-.672 3.157-1.753 4.25l-.247.247c-.724.724-1.561 1.297-2.469 1.697" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{auth.deviceName || 'Unknown Device'}</p>
                        <p className="text-sm text-gray-500">
                          Registered: {new Date(auth.createdAt).toLocaleDateString()}
                          {auth.lastUsed && ` • Last used: ${new Date(auth.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAuthenticator(auth.id)}
                      disabled={isLoading}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

