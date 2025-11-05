import {
  generateRegistrationOptions,
  verifyRegistrationResponse as verifyRegistrationResponseLib,
  generateAuthenticationOptions,
  verifyAuthenticationResponse as verifyAuthenticationResponseLib,
} from '@simplewebauthn/server'
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  AuthenticatorDevice,
} from '@simplewebauthn/server'

// Relying Party (RP) information
const rpName = 'SmartSchedule'
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost'
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'

// Convert base64url to buffer
function base64URLStringToBuffer(base64URL: string | undefined | null): Buffer {
  if (!base64URL) {
    throw new Error('Cannot convert undefined or null to Buffer. Base64URL string is required.')
  }
  
  if (typeof base64URL !== 'string') {
    throw new Error(`Expected string but received ${typeof base64URL}. Received value: ${JSON.stringify(base64URL)}`)
  }

  if (base64URL.trim() === '') {
    throw new Error('Cannot convert empty string to Buffer')
  }
  
  // Convert base64url to base64
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if needed
  const pad = base64.length % 4
  const padded = base64 + (pad ? '='.repeat(4 - pad) : '')
  
  try {
    return Buffer.from(padded, 'base64')
  } catch (error) {
    throw new Error(`Failed to convert base64URL to Buffer: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Convert buffer to base64url
function bufferToBase64URLString(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generate registration options for WebAuthn
 */
export async function generateRegistrationOptionsForUser(
  userId: string,
  userName: string,
  userEmail: string,
  existingAuthenticators: Array<{
    credentialID: string
    counter: number
    deviceName?: string | null
  }>
) {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a string')
  }
  if (!userEmail || typeof userEmail !== 'string') {
    throw new Error('User email is required and must be a string')
  }
  if (!userName || typeof userName !== 'string') {
    throw new Error('User name is required and must be a string')
  }

  // Filter out invalid authenticators
  const validAuthenticators = existingAuthenticators.filter(auth => 
    auth && auth.credentialID && typeof auth.credentialID === 'string' && auth.credentialID.trim() !== ''
  )

  const opts: GenerateRegistrationOptionsOpts = {
    rpName,
    rpID,
    userID: base64URLStringToBuffer(userId),
    userName: userEmail,
    userDisplayName: userName,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: validAuthenticators.map(authenticator => ({
      id: base64URLStringToBuffer(authenticator.credentialID),
      type: 'public-key',
      transports: ['internal', 'usb', 'ble', 'nfc'],
    })),
    authenticatorSelection: {
      userVerification: 'preferred',
      authenticatorAttachment: 'platform', // For fingerprint/face recognition
      requireResidentKey: false,
    },
    supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
  }

  return await generateRegistrationOptions(opts)
}

/**
 * Verify registration response
 */
export async function verifyRegistrationResponseFunction(
  userId: string,
  response: any,
  expectedChallenge: string,
  expectedOrigin: string = origin
): Promise<{ verified: boolean; credentialID: string; publicKey: string; counter: number }> {
  // Validate inputs before processing
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required and must be a string')
  }

  if (!response || typeof response !== 'object') {
    throw new Error('Response is required and must be an object')
  }

  if (!response.id) {
    throw new Error('Response credential ID is required')
  }

  if (!response.response || typeof response.response !== 'object') {
    throw new Error('Response data is required')
  }

  if (!response.response.clientDataJSON) {
    throw new Error('Response clientDataJSON is required')
  }

  if (!response.response.attestationObject) {
    throw new Error('Response attestationObject is required')
  }

  if (!expectedChallenge || typeof expectedChallenge !== 'string' || expectedChallenge.trim() === '') {
    throw new Error('Expected challenge is required and must be a non-empty string')
  }

  if (!expectedOrigin || typeof expectedOrigin !== 'string') {
    throw new Error('Expected origin is required and must be a string')
  }

  console.log('🔐 Verifying registration:', {
    hasResponse: !!response,
    hasResponseId: !!response?.id,
    hasClientDataJSON: !!response?.response?.clientDataJSON,
    hasAttestationObject: !!response?.response?.attestationObject,
    hasChallenge: !!expectedChallenge,
    challengeLength: expectedChallenge?.length
  })

  const opts: VerifyRegistrationResponseOpts = {
    response,
    expectedChallenge,
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: true,
  }

  const verification = await verifyRegistrationResponseLib(opts)

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed')
  }

  return {
    verified: true,
    credentialID: bufferToBase64URLString(Buffer.from(verification.registrationInfo.credentialID)),
    publicKey: bufferToBase64URLString(Buffer.from(verification.registrationInfo.credentialPublicKey)),
    counter: verification.registrationInfo.counter,
  }
}

/**
 * Generate authentication options
 */
export async function generateAuthenticationOptions(
  authenticators: Array<{
    credentialID: string
    counter: number
  }>
) {
  // Validate authenticators
  if (!Array.isArray(authenticators)) {
    throw new Error('Authenticators must be an array')
  }

  const validAuthenticators = authenticators.filter(auth => 
    auth && auth.credentialID && typeof auth.credentialID === 'string'
  )

  if (validAuthenticators.length === 0) {
    throw new Error('No valid authenticators provided')
  }

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: validAuthenticators.map(authenticator => {
      if (!authenticator.credentialID) {
        throw new Error('Credential ID is required for each authenticator')
      }
      return {
        id: base64URLStringToBuffer(authenticator.credentialID),
        type: 'public-key',
        transports: ['internal', 'usb', 'ble', 'nfc'],
      }
    }),
    userVerification: 'preferred',
    rpID,
  }

  return await generateAuthenticationOptions(opts)
}

/**
 * Verify authentication response
 */
export async function verifyAuthenticationResponse(
  userId: string,
  response: any,
  authenticator: {
    credentialID: string
    publicKey: string
    counter: number
  },
  expectedChallenge: string,
  expectedOrigin: string = origin
): Promise<{ verified: boolean; newCounter: number }> {
  // Validate inputs
  if (!authenticator.credentialID) {
    throw new Error('Authenticator credentialID is required')
  }
  if (!authenticator.publicKey) {
    throw new Error('Authenticator publicKey is required')
  }
  if (!expectedChallenge) {
    throw new Error('Expected challenge is required')
  }
  if (!response || !response.id) {
    throw new Error('Invalid authentication response: missing credential ID')
  }

  try {
    // Debug logging
    console.log('🔐 Verifying authentication:', {
      hasResponse: !!response,
      hasResponseId: !!response?.id,
      hasCredentialID: !!authenticator.credentialID,
      hasPublicKey: !!authenticator.publicKey,
      hasChallenge: !!expectedChallenge,
      credentialIDType: typeof authenticator.credentialID,
      publicKeyType: typeof authenticator.publicKey
    })

    // Additional validation with detailed errors
    if (!authenticator.credentialID) {
      throw new Error('Authenticator credentialID is missing or undefined')
    }
    if (!authenticator.publicKey) {
      throw new Error('Authenticator publicKey is missing or undefined')
    }
    if (!expectedChallenge || expectedChallenge.trim() === '') {
      throw new Error('Expected challenge is missing or empty')
    }
    if (!response || !response.id) {
      throw new Error('Authentication response is missing credential ID')
    }

    const opts: VerifyAuthenticationResponseOpts = {
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: base64URLStringToBuffer(authenticator.credentialID),
        credentialPublicKey: base64URLStringToBuffer(authenticator.publicKey),
        counter: authenticator.counter || 0,
      },
      requireUserVerification: true,
    }

    const verification = await verifyAuthenticationResponseLib(opts)

    if (!verification.verified) {
      throw new Error('Authentication verification failed')
    }

    return {
      verified: true,
      newCounter: verification.authenticationInfo.newCounter,
    }
  } catch (error: any) {
    // Provide better error messages
    if (error.message && error.message.includes('undefined')) {
      throw new Error('Invalid authenticator data. Please register your fingerprint again.')
    }
    throw error
  }
}

// Export alias for backward compatibility
export const verifyRegistrationResponse = verifyRegistrationResponseFunction
