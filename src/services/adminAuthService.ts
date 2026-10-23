/**
 * KAZI HUB — Administrator Authentication & Server Authorization Service
 * 
 * Provides:
 * 1. Diagnosis of authentication failures vs authorization (claims) failures
 * 2. Secure administrator sign-in with server-managed custom claims verification
 * 3. Initial one-time administrator provisioning for the designated project owner
 * 4. Real Firebase Authentication password recovery workflow with ActionCodeSettings
 * 5. Password reset confirmation and server claim synchronization
 */

import {
  sendFirebasePasswordReset,
  getFirebaseConfigStatus,
  type FirebaseConfigStatus,
  type PasswordResetResult
} from './firebaseAuth';

export interface AdminStatus {
  isFirstAdminProvisioned: boolean;
  provisionedAdminEmail: string | null;
  designatedInitialAdminEmail: string;
  firebaseProjectConfigured: boolean;
  actionUrl?: string;
  authorizedDomain?: string;
}

export interface AdminAuthResult {
  success: boolean;
  user?: any;
  token?: string;
  error?: string;
  message?: string;
  canProvisionAsInitial?: boolean;
  isDesignatedInitialAdmin?: boolean;
}

export async function fetchAdminStatus(): Promise<AdminStatus> {
  try {
    const res = await fetch('/api/admin/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[AdminAuthService] Status check fallback:', err);
  }
  return {
    isFirstAdminProvisioned: false,
    provisionedAdminEmail: null,
    designatedInitialAdminEmail: 'mmosesurio@gmail.com',
    firebaseProjectConfigured: false
  };
}

export async function adminSignIn(email: string, password: string): Promise<AdminAuthResult> {
  try {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message
      };
    }

    return {
      success: false,
      error: data.error || 'AUTH_ERROR',
      message: data.message || 'Authentication failed.',
      canProvisionAsInitial: data.canProvisionAsInitial,
      isDesignatedInitialAdmin: data.isDesignatedInitialAdmin
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to reach authentication server. Please verify network connectivity.'
    };
  }
}

export async function provisionInitialAdmin(email: string, password: string, fullName?: string): Promise<AdminAuthResult> {
  try {
    const res = await fetch('/api/admin/provision-initial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message
      };
    }

    return {
      success: false,
      error: data.error || 'PROVISION_ERROR',
      message: data.message || 'Initial administrator provisioning failed.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to connect to provisioning service.'
    };
  }
}

/**
 * Executes a real password reset workflow using Firebase Authentication:
 * 1. Checks Firebase client config and attempts client-side Firebase Auth dispatch.
 * 2. If client Firebase is missing credentials, queries the server Firebase Auth dispatch endpoint.
 * 3. Shows confirmation message ONLY when Firebase actually accepts the request.
 * 4. Accurately surfaces actionable errors for missing config, network failure, or provider issues.
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  actionableHelp?: string;
  isFirebaseAccepted?: boolean;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      error: 'INVALID_EMAIL',
      message: 'Please provide a valid email address.'
    };
  }

  // 1. Try client-side Firebase Auth first if credentials are present
  try {
    const configStatus = await getFirebaseConfigStatus();
    if (configStatus.configured && configStatus.config?.apiKey) {
      const clientResult = await sendFirebasePasswordReset(cleanEmail);
      if (clientResult.success || clientResult.error !== 'MISSING_FIREBASE_CONFIG') {
        return clientResult;
      }
    }
  } catch (err) {
    console.warn('[AdminAuthService] Client-side Firebase reset attempt:', err);
  }

  // 2. Query backend server Firebase Auth endpoint
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        isFirebaseAccepted: true,
        message: data.message || `If an account is associated with ${cleanEmail}, instructions have been dispatched by Firebase Authentication.`
      };
    }

    return {
      success: false,
      error: data.error || 'RESET_ERROR',
      message: data.message || 'Failed to dispatch password reset request.',
      actionableHelp: data.actionableHelp
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Network connection failure. Unable to reach authentication server.',
      actionableHelp: 'Verify internet connection and ensure outbound API requests are accessible.'
    };
  }
}

/**
 * Confirms password reset with new password, updating credentials while strictly
 * preserving administrator roles and custom claims.
 */
export async function confirmPasswordResetService(
  email: string,
  newPassword: string,
  oobCode?: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/confirm-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        newPassword,
        oobCode
      })
    });

    const data = await res.json();
    return {
      success: res.ok,
      message: data.message || (res.ok ? 'Password reset successfully.' : 'Failed to reset password.'),
      error: data.error
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Failed to communicate with password reset service.'
    };
  }
}
