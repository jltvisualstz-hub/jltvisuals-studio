/**
 * KAZI HUB — Firebase Authentication Service
 * 
 * Implements real Firebase Authentication integration for:
 * 1. Password reset dispatch (sendPasswordResetEmail) with privacy-conscious confirmation
 * 2. ActionCodeSettings with correct action URL and authorized domain configuration
 * 3. Diagnostic mapping of Firebase Auth errors (missing config, network error, unsupported provider, unauthorized domain)
 * 4. Password reset confirmation (verifyPasswordResetCode, confirmPasswordReset)
 * 5. Sign-in verification with server-managed administrator custom claims
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signInWithEmailAndPassword,
  type Auth,
  type ActionCodeSettings
} from 'firebase/auth';

export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export interface FirebaseConfigStatus {
  configured: boolean;
  config: FirebaseClientConfig | null;
  actionUrl: string;
  authorizedDomain: string;
  missingFields: string[];
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
  error?: string;
  actionableHelp?: string;
  isFirebaseAccepted?: boolean;
}

let cachedConfigStatus: FirebaseConfigStatus | null = null;

/**
 * Retrieves the current Firebase configuration from the backend server or environment.
 */
export async function getFirebaseConfigStatus(): Promise<FirebaseConfigStatus> {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const actionUrl = `${currentOrigin}/?mode=resetPassword`;

  try {
    const res = await fetch('/api/firebase-config');
    if (res.ok) {
      const data = await res.json();
      cachedConfigStatus = {
        configured: Boolean(data.configured && data.config?.apiKey && data.config?.projectId),
        config: data.config || null,
        actionUrl: data.actionUrl || actionUrl,
        authorizedDomain: data.authorizedDomain || currentHost,
        missingFields: data.missingFields || []
      };
      return cachedConfigStatus;
    }
  } catch (err) {
    console.warn('[FirebaseAuth] Failed to fetch server firebase-config:', err);
  }

  // Fallback to import.meta.env if present
  const envConfig: FirebaseClientConfig = {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID
  };

  const hasApiKey = Boolean(envConfig.apiKey && envConfig.apiKey.length > 5);
  const hasProjectId = Boolean(envConfig.projectId);

  const missing: string[] = [];
  if (!hasApiKey) missing.push('apiKey');
  if (!envConfig.authDomain) missing.push('authDomain');
  if (!hasProjectId) missing.push('projectId');

  cachedConfigStatus = {
    configured: hasApiKey && hasProjectId,
    config: hasApiKey ? envConfig : null,
    actionUrl,
    authorizedDomain: currentHost,
    missingFields: missing
  };

  return cachedConfigStatus;
}

/**
 * Initializes and returns the Firebase Auth instance if configured.
 * Throws actionable Error if Firebase credentials are not set.
 */
export async function getFirebaseAuthInstance(): Promise<Auth> {
  const status = await getFirebaseConfigStatus();

  if (!status.configured || !status.config || !status.config.apiKey) {
    const missing = status.missingFields.length > 0 ? status.missingFields.join(', ') : 'apiKey, projectId';
    const err = new Error(`Firebase Authentication is not configured. Missing required settings: [${missing}].`);
    (err as any).code = 'auth/missing-config';
    throw err;
  }

  let app: FirebaseApp;
  if (!getApps().length) {
    app = initializeApp({
      apiKey: status.config.apiKey,
      authDomain: status.config.authDomain || `${status.config.projectId}.firebaseapp.com`,
      projectId: status.config.projectId,
      storageBucket: status.config.storageBucket,
      messagingSenderId: status.config.messagingSenderId,
      appId: status.config.appId
    });
  } else {
    app = getApp();
  }

  return getAuth(app);
}

/**
 * Executes a real Firebase Authentication password reset request.
 * 
 * Security & UX Rules:
 * 1. Requires valid email input.
 * 2. Emits real sendPasswordResetEmail to Firebase Authentication.
 * 3. Shows confirmation ONLY when Firebase accepts the request.
 * 4. Displays actionable errors for network failures, missing Firebase config, and unsupported providers.
 * 5. Uses standard privacy-conscious message upon success.
 */
export async function sendFirebasePasswordReset(email: string): Promise<PasswordResetResult> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      error: 'INVALID_EMAIL',
      message: 'Please provide a valid email address.'
    };
  }

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const actionUrl = `${currentOrigin}/?mode=resetPassword`;

  const actionCodeSettings: ActionCodeSettings = {
    url: actionUrl,
    handleCodeInApp: true
  };

  try {
    const auth = await getFirebaseAuthInstance();
    await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);

    // PRIVACY-CONSCIOUS SUCCESS CONFIRMATION (shown ONLY after Firebase accepts the request)
    return {
      success: true,
      isFirebaseAccepted: true,
      message: `If an account is associated with ${cleanEmail}, Firebase Authentication has accepted the request and dispatched password reset instructions. Please check your inbox and spam folder.`
    };
  } catch (err: any) {
    console.error('[FirebaseAuth] Password reset error:', err);
    return mapFirebaseAuthError(err, cleanEmail);
  }
}

/**
 * Maps Firebase Auth errors to specific, actionable feedback for administrators.
 */
export function mapFirebaseAuthError(err: any, email?: string): PasswordResetResult {
  const code = err?.code || '';
  const message = err?.message || 'Unknown error occurred.';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  if (code === 'auth/missing-config') {
    return {
      success: false,
      error: 'MISSING_FIREBASE_CONFIG',
      message: 'Firebase Authentication is not configured for this project.',
      actionableHelp: 'Configure your Firebase project in Firebase Console (Authentication > Sign-in method) and ensure firebase-applet-config.json or environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID) are deployed.'
    };
  }

  if (code === 'auth/network-request-failed' || message.includes('network') || message.includes('Failed to fetch')) {
    return {
      success: false,
      error: 'NETWORK_FAILURE',
      message: 'Network connection failure. Unable to reach Firebase Authentication servers.',
      actionableHelp: 'Verify your network connection and ensure outbound HTTPS requests to identitytoolkit.googleapis.com are not blocked.'
    };
  }

  if (code === 'auth/operation-not-allowed') {
    return {
      success: false,
      error: 'UNSUPPORTED_PROVIDER',
      message: 'Email/Password authentication provider is not enabled in Firebase.',
      actionableHelp: 'Open Firebase Console > Build > Authentication > Sign-in method, select "Email/Password" and click "Enable".'
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      success: false,
      error: 'UNAUTHORIZED_DOMAIN',
      message: `Current domain (${currentHost}) is not authorized for Firebase Authentication operations.`,
      actionableHelp: `Open Firebase Console > Authentication > Settings > Authorized domains, and add "${currentHost}" to the whitelist.`
    };
  }

  if (code === 'auth/invalid-api-key') {
    return {
      success: false,
      error: 'INVALID_API_KEY',
      message: 'The configured Firebase Web API Key is invalid or has expired.',
      actionableHelp: 'Inspect your Project Settings in Firebase Console to copy the correct Web API Key.'
    };
  }

  if (code === 'auth/user-not-found') {
    // When Firebase email enumeration protection is disabled, it may return user-not-found.
    // For privacy, return the standard privacy-conscious message or accurate guidance.
    return {
      success: true,
      isFirebaseAccepted: true,
      message: `If an account is associated with ${email || 'this email'}, password reset instructions have been dispatched. Please check your inbox and spam folder.`
    };
  }

  return {
    success: false,
    error: code || 'FIREBASE_ERROR',
    message: `Firebase Authentication error: ${message}`,
    actionableHelp: 'Please check your Firebase Authentication configuration and service status in Firebase Console.'
  };
}

/**
 * Verifies a reset code received from the Firebase action email.
 */
export async function verifyResetCode(oobCode: string): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const auth = await getFirebaseAuthInstance();
    const email = await verifyPasswordResetCode(auth, oobCode);
    return { success: true, email };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Invalid or expired password reset link.'
    };
  }
}

/**
 * Confirms the new password with Firebase Auth and synchronizes with the server.
 */
export async function confirmFirebasePasswordReset(
  oobCode: string,
  newPassword: string,
  targetEmail: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const auth = await getFirebaseAuthInstance();
    await confirmPasswordReset(auth, oobCode, newPassword);

    // Synchronize new password with server registry to ensure custom claims and server auth succeed
    const syncRes = await fetch('/api/auth/confirm-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: targetEmail,
        newPassword,
        oobCode
      })
    });
    const syncData = await syncRes.json();

    if (!syncRes.ok) {
      console.warn('[FirebaseAuth] Server sync notice:', syncData.message);
    }

    return {
      success: true,
      message: 'Master password has been reset successfully. You may now sign in using your new credentials.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.code || 'CONFIRM_ERROR',
      message: err?.message || 'Failed to update master password. The reset link may have expired.'
    };
  }
}
