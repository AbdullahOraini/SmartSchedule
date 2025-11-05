import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

/**
 * Register a new fingerprint/authenticator for the current user
 */
export async function registerFingerprint(deviceName?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Get registration options from server
    const optionsResponse = await fetch(`${API_BASE_URL}/webauthn/register/start`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!optionsResponse.ok) {
      const error = await optionsResponse.json()
      return { success: false, error: error.message || 'Failed to start registration' }
    }

    const { options, challengeKey } = await optionsResponse.json()

    // Step 2: Start WebAuthn registration in browser
    let credential
    try {
      credential = await startRegistration(options as PublicKeyCredentialCreationOptionsJSON)
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        return { success: false, error: 'This device is already registered' }
      }
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Registration was cancelled or not allowed. Please try again.' }
      }
      return { success: false, error: error.message || 'Registration cancelled or failed' }
    }

    // Validate credential before sending
    if (!credential || !credential.id) {
      return { success: false, error: 'Failed to get credential from device. Please try again.' }
    }

    if (!credential.response || !credential.response.clientDataJSON || !credential.response.attestationObject) {
      return { success: false, error: 'Invalid credential data received. Please try again.' }
    }

    // Step 3: Send credential to server for verification
    const verifyResponse = await fetch(`${API_BASE_URL}/webauthn/register/finish`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        challengeKey,
        credential,
        deviceName: deviceName || 'My Device',
      }),
    })

    const result = await verifyResponse.json()

    if (!verifyResponse.ok || !result.success) {
      return { success: false, error: result.message || result.error || 'Registration failed' }
    }

    return { success: true }
  } catch (error) {
    console.error('Fingerprint registration error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    }
  }
}

/**
 * Authenticate using fingerprint
 */
export async function authenticateWithFingerprint(email: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Step 1: Get authentication options from server
    const optionsResponse = await fetch(`${API_BASE_URL}/webauthn/authenticate/start`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!optionsResponse.ok) {
      const error = await optionsResponse.json()
      const errorMessage = error.message || error.error || 'Failed to start authentication'
      
      // Check if user has no fingerprint registered
      if (errorMessage.includes('No fingerprint registered') || errorMessage.includes('not found')) {
        return { 
          success: false, 
          error: 'No fingerprint registered for this account. Please register a fingerprint first in Settings after logging in with your password.' 
        }
      }
      
      return { success: false, error: errorMessage }
    }

    const { options, challengeKey } = await optionsResponse.json()

    // Step 2: Start WebAuthn authentication in browser
    let credential
    try {
      credential = await startAuthentication(options as PublicKeyCredentialRequestOptionsJSON)
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Authentication cancelled or not allowed' }
      }
      return { success: false, error: error.message || 'Authentication failed' }
    }

    // Step 3: Send credential to server for verification
    const verifyResponse = await fetch(`${API_BASE_URL}/webauthn/authenticate/finish`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        challengeKey,
        credential,
      }),
    })

    const result = await verifyResponse.json()

    if (!verifyResponse.ok || !result.success) {
      return { success: false, error: result.message || result.error || 'Authentication failed' }
    }

    return { success: true, user: result.user }
  } catch (error) {
    console.error('Fingerprint authentication error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  }
}

/**
 * Check if WebAuthn is supported in the browser
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.PublicKeyCredential !== 'undefined' &&
         typeof navigator !== 'undefined' &&
         typeof navigator.credentials !== 'undefined'
}

/**
 * Get user's registered authenticators
 */
export async function getAuthenticators(): Promise<{ success: boolean; authenticators?: any[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/webauthn/authenticators`, {
      method: 'GET',
      credentials: 'include',
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.message || result.error || 'Failed to get authenticators' }
    }

    return { success: true, authenticators: result.authenticators }
  } catch (error) {
    console.error('Get authenticators error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get authenticators',
    }
  }
}

/**
 * Delete an authenticator
 */
export async function deleteAuthenticator(authenticatorId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/webauthn/authenticators/${authenticatorId}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      return { success: false, error: result.message || result.error || 'Failed to delete authenticator' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete authenticator error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete authenticator',
    }
  }
}

