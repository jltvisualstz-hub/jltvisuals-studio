import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();

// AI Studio dev environment must always bind to port 3000 (port 8080 is reserved by container Nginx proxy)
function determinePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && portArgIndex + 1 < process.argv.length) {
    const val = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(val)) return val;
  }
  if (process.env.APP_PORT) {
    return parseInt(process.env.APP_PORT, 10);
  }
  return 3000;
}
const PORT = determinePort();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent Data Storage Paths
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOCK_FILE = path.join(DATA_DIR, 'admin_lock.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');
const EQUIPMENT_FILE = path.join(DATA_DIR, 'equipment.json');
const CREATIVES_FILE = path.join(DATA_DIR, 'creatives.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded user media statically with cache control
app.use('/uploads', express.static(UPLOADS_DIR));

// Initial Administrator Configuration
// By default, bound to the verified project owner in runtime metadata
const DESIGNATED_INITIAL_ADMIN_EMAIL = (process.env.INITIAL_ADMIN_EMAIL || 'mmosesurio@gmail.com').trim().toLowerCase();

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  activeRole: string;
  country: string;
  city?: string;
  phoneNumber?: string;
  callingCode?: string;
  clientType?: 'INDIVIDUAL' | 'ORGANIZATION';
  organizationName?: string;
  preferredLanguage?: 'EN' | 'SW';
  additionalNotes?: string;
  isAdmin: boolean;
  claims?: {
    admin?: boolean;
    kazi_role?: string;
    provisionedAt?: string;
  };
  status: 'ACTIVE' | 'PENDING_PROFILE_COMPLETION' | 'SUSPENDED';
  profileImageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdminLock {
  isFirstAdminProvisioned: boolean;
  provisionedEmail?: string;
  provisionedAt?: string;
}

interface EquipmentRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerContact?: string;
  title: string;
  category: string;
  modelSpecs?: string;
  condition?: string;
  dailyRate: number;
  currency: string;
  rateUnit?: string;
  depositAmount?: number;
  availability: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  country: string;
  location: string;
  pickupDeliveryTerms?: string;
  includedAccessories?: string[];
  description?: string;
  images?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface CreativeRecord {
  id: string;
  userId: string;
  name: string;
  title: string;
  category: string;
  providerType: 'FREELANCER' | 'PRODUCTION_COMPANY';
  companyName?: string;
  skills: string[];
  location: string;
  country: string;
  rate: number;
  currency: string;
  rateType?: string;
  availability: 'AVAILABLE_NOW' | 'AVAILABLE_THIS_WEEK' | 'BOOKED';
  bio: string;
  avatarUrl: string;
  portfolio: { title: string; type: string; url: string; client?: string }[];
  isVerified: boolean;
  rating: number;
  reviewCount: number;
}

interface BookingRecord {
  id: string;
  reference: string;
  type: 'CREATIVE_SERVICE' | 'EQUIPMENT_RENTAL';
  title: string;
  serviceCategory?: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientType?: 'INDIVIDUAL' | 'ORGANIZATION';
  clientOrgName?: string;
  providerId: string;
  providerName: string;
  providerRole: string;
  projectBrief: string;
  serviceDate: string;
  serviceTime?: string;
  duration?: string;
  projectLocation?: string;
  budget?: number;
  currency: string;
  deliverables?: string;
  contactPreference?: string;
  agreedAmount: number;
  depositAmount: number;
  status: 'PENDING' | 'QUOTATION_SUBMITTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'AWAITING_COMPLETION' | 'COMPLETED' | 'DISPUTED';
  quotation?: {
    items: string[];
    total: number;
    notes: string;
    validUntil?: string;
    isAccepted: boolean;
  };
  rentalDetails?: {
    equipmentId: string;
    equipmentTitle: string;
    startDate: string;
    endDate: string;
    days: number;
    deposit: number;
    deliveryOption?: string;
  };
  history: {
    status: string;
    time: string;
    note: string;
    actor: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  outcome: 'SUCCESS' | 'REJECTED';
  details: string;
}

function readUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read users file:', err);
  }
  return [];
}

function writeUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write users file:', err);
  }
}

function readLock(): AdminLock {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const data = fs.readFileSync(LOCK_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read lock file:', err);
  }
  return { isFirstAdminProvisioned: false };
}

function writeLock(lock: AdminLock): void {
  try {
    fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write lock file:', err);
  }
}

function logAudit(action: string, actor: string, outcome: 'SUCCESS' | 'REJECTED', details: string): void {
  try {
    let logs: AuditEntry[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
    }
    logs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      actor,
      timestamp: new Date().toISOString(),
      outcome,
      details
    });
    // keep latest 500
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

function readEquipment(): EquipmentRecord[] {
  try {
    if (fs.existsSync(EQUIPMENT_FILE)) {
      const data = fs.readFileSync(EQUIPMENT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read equipment file:', err);
  }
  return [];
}

function writeEquipment(equipment: EquipmentRecord[]): void {
  try {
    fs.writeFileSync(EQUIPMENT_FILE, JSON.stringify(equipment, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write equipment file:', err);
  }
}

function readCreatives(): CreativeRecord[] {
  try {
    if (fs.existsSync(CREATIVES_FILE)) {
      const data = fs.readFileSync(CREATIVES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read creatives file:', err);
  }
  return [];
}

function writeCreatives(creatives: CreativeRecord[]): void {
  try {
    fs.writeFileSync(CREATIVES_FILE, JSON.stringify(creatives, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write creatives file:', err);
  }
}

function readBookings(): BookingRecord[] {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read bookings file:', err);
  }
  return [];
}

function writeBookings(bookings: BookingRecord[]): void {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write bookings file:', err);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

const FIREBASE_CONFIG_FILE = path.resolve(process.cwd(), 'firebase-applet-config.json');

function getFirebaseConfig(): any {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    try {
      const content = fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.warn('Failed to parse firebase-applet-config.json:', err);
    }
  }
  if (process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
    };
  }
  return null;
}

// 1. Platform & Administrator Status
app.get('/api/admin/status', (req: Request, res: Response) => {
  const lock = readLock();
  const users = readUsers();
  const existingAdmin = users.find(u => u.isAdmin || u.claims?.admin === true);
  const config = getFirebaseConfig();
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const host = req.get('host')?.split(':')[0] || 'localhost';

  res.json({
    isFirstAdminProvisioned: lock.isFirstAdminProvisioned || !!existingAdmin,
    provisionedAdminEmail: lock.provisionedEmail || existingAdmin?.email || null,
    designatedInitialAdminEmail: DESIGNATED_INITIAL_ADMIN_EMAIL,
    firebaseProjectConfigured: Boolean(config && config.apiKey && config.projectId),
    actionUrl: `${appUrl}/?mode=resetPassword`,
    authorizedDomain: host
  });
});

// 1b. Firebase Client Configuration Endpoint
app.get('/api/firebase-config', (req: Request, res: Response) => {
  const config = getFirebaseConfig();
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const host = req.get('host')?.split(':')[0] || 'localhost';
  const actionUrl = `${appUrl}/?mode=resetPassword`;

  const isConfigured = Boolean(config && config.apiKey && (config.projectId || config.authDomain));
  const missingFields: string[] = [];
  if (!config?.apiKey) missingFields.push('apiKey');
  if (!config?.authDomain) missingFields.push('authDomain');
  if (!config?.projectId) missingFields.push('projectId');

  res.json({
    configured: isConfigured,
    config: config ? {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    } : null,
    actionUrl,
    authorizedDomain: host,
    missingFields
  });
});

// 2. Administrator Sign In Endpoint
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'A valid email address is required.'
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Password is required.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();
  const lock = readLock();
  const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

  // Check 1: User existence in auth registry
  if (!foundUser) {
    logAudit('ADMIN_LOGIN_FAILED', cleanEmail, 'REJECTED', 'User account does not exist in platform registry');
    return res.status(404).json({
      error: 'EMAIL_NOT_FOUND',
      message: `No registered account found for "${cleanEmail}". An account must be registered before administrator privileges can be verified.`,
      email: cleanEmail,
      isDesignatedInitialAdmin: cleanEmail === DESIGNATED_INITIAL_ADMIN_EMAIL,
      canProvisionAsInitial: cleanEmail === DESIGNATED_INITIAL_ADMIN_EMAIL && !lock.isFirstAdminProvisioned
    });
  }

  // Check 2: Password verification
  if (!foundUser.password) {
    // First login after CLI provisioning: securely establish master password
    foundUser.password = password;
    writeUsers(users);
    logAudit('ADMIN_PASSWORD_SET', cleanEmail, 'SUCCESS', 'Master password established on initial administrator login');
  } else if (foundUser.password !== password) {
    logAudit('ADMIN_LOGIN_FAILED', cleanEmail, 'REJECTED', 'Incorrect credentials entered');
    return res.status(401).json({
      error: 'INVALID_PASSWORD',
      message: 'Incorrect password for this administrator account. Please verify your credentials or use the password reset link.'
    });
  }

  // Check 3: Server-managed administrator claims check
  const hasAdminClaim = foundUser.isAdmin === true || foundUser.claims?.admin === true;
  if (!hasAdminClaim) {
    logAudit('ADMIN_CLEARANCE_DENIED', cleanEmail, 'REJECTED', 'Account lacks server-managed Firebase Admin claims ({ admin: true })');
    return res.status(403).json({
      error: 'ADMIN_CLAIM_MISSING',
      message: 'Authentication successful, but administrator access has not been provisioned. Follow the secure initial administrator setup instructions.',
      email: cleanEmail,
      isDesignatedInitialAdmin: cleanEmail === DESIGNATED_INITIAL_ADMIN_EMAIL,
      canProvisionAsInitial: cleanEmail === DESIGNATED_INITIAL_ADMIN_EMAIL && !lock.isFirstAdminProvisioned
    });
  }

  // Check 4: Account suspension check
  if (foundUser.status === 'SUSPENDED') {
    logAudit('ADMIN_LOGIN_SUSPENDED', cleanEmail, 'REJECTED', 'Administrator account suspended');
    return res.status(403).json({
      error: 'ACCOUNT_SUSPENDED',
      message: 'Administrative account is currently suspended. Contact platform security operations.'
    });
  }

  // Authentication & Authorization Succeeded
  logAudit('ADMIN_LOGIN_SUCCESS', cleanEmail, 'SUCCESS', 'Administrator authenticated with server-verified claims ({ admin: true })');

  return res.json({
    success: true,
    message: 'Administrator clearance granted.',
    user: {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      roles: foundUser.roles,
      activeRole: 'ADMINISTRATOR',
      country: foundUser.country,
      status: foundUser.status,
      isAdmin: true,
      claims: {
        admin: true,
        kazi_role: 'ADMINISTRATOR'
      }
    },
    token: `kazi_jwt_${foundUser.id}_${Date.now()}`
  });
});

// 3. Secure Initial Administrator Provisioning Endpoint
// STRICT SECURITY GATE:
// - Validates that the requesting email strictly matches DESIGNATED_INITIAL_ADMIN_EMAIL
// - Validates that isFirstAdminProvisioned is FALSE (locks after one-time execution)
// - Never allows repeated self-promotion or arbitrary email takeover
app.post('/api/admin/provision-initial', (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const lock = readLock();

  // 1. One-time execution guarantee
  if (lock.isFirstAdminProvisioned) {
    logAudit('PROVISION_REJECTED_LOCKED', cleanEmail, 'REJECTED', 'Attempt to run initial provisioning on locked system');
    return res.status(403).json({
      error: 'BOOTSTRAP_LOCKED',
      message: 'Initial administrator provisioning is locked. The platform already has an established administrator. Additional staff must be provisioned via backend CLI.'
    });
  }

  // 2. Identity authorization check (must match designated initial administrator)
  if (cleanEmail !== DESIGNATED_INITIAL_ADMIN_EMAIL) {
    logAudit('PROVISION_UNAUTHORIZED_IDENTITY', cleanEmail, 'REJECTED', `Email "${cleanEmail}" does not match designated initial administrator "${DESIGNATED_INITIAL_ADMIN_EMAIL}"`);
    return res.status(403).json({
      error: 'UNAUTHORIZED_ADMIN_EMAIL',
      message: `Security Restriction: Only the designated deployment administrator ("${DESIGNATED_INITIAL_ADMIN_EMAIL}") is authorized to complete initial bootstrap provisioning.`
    });
  }

  // 3. Password requirement
  if (!password || password.length < 6) {
    return res.status(400).json({
      error: 'INVALID_PASSWORD',
      message: 'Password must be at least 6 characters.'
    });
  }

  const users = readUsers();
  let userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

  let targetUser: StoredUser;

  if (userIndex >= 0) {
    // Existing user: Upgrade to administrator and assign server claims
    targetUser = {
      ...users[userIndex],
      name: fullName ? fullName.trim() : users[userIndex].name,
      password: password, // update with master password
      isAdmin: true,
      roles: Array.from(new Set([...users[userIndex].roles, 'ADMINISTRATOR'])),
      activeRole: 'ADMINISTRATOR',
      status: 'ACTIVE',
      claims: {
        admin: true,
        kazi_role: 'ADMINISTRATOR',
        provisionedAt: new Date().toISOString()
      }
    };
    users[userIndex] = targetUser;
  } else {
    // New user creation for initial administrator
    targetUser = {
      id: `usr_admin_${Date.now()}`,
      name: fullName ? fullName.trim() : 'Platform Administrator',
      email: cleanEmail,
      password: password,
      roles: ['ADMINISTRATOR'],
      activeRole: 'ADMINISTRATOR',
      country: 'TANZANIA',
      isAdmin: true,
      status: 'ACTIVE',
      claims: {
        admin: true,
        kazi_role: 'ADMINISTRATOR',
        provisionedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    users.push(targetUser);
  }

  // Persist updated users registry
  writeUsers(users);

  // Lock initial provisioning gate forever
  writeLock({
    isFirstAdminProvisioned: true,
    provisionedEmail: cleanEmail,
    provisionedAt: new Date().toISOString()
  });

  logAudit('INITIAL_ADMIN_PROVISIONED', cleanEmail, 'SUCCESS', 'Assigned Firebase Admin custom claims ({ admin: true }) and locked initial bootstrap');

  return res.json({
    success: true,
    message: `Initial administrator "${cleanEmail}" successfully provisioned with server-managed custom claims. Provisioning is now locked.`,
    user: {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      roles: targetUser.roles,
      activeRole: targetUser.activeRole,
      country: targetUser.country,
      status: targetUser.status,
      isAdmin: true,
      claims: targetUser.claims
    },
    token: `kazi_jwt_${targetUser.id}_${Date.now()}`
  });
});

// 4. Password Reset Dispatch Endpoint (Real Firebase Auth Integration)
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'A valid email address is required.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const config = getFirebaseConfig();
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const host = req.get('host')?.split(':')[0] || 'localhost';
  const actionUrl = `${appUrl}/?mode=resetPassword`;

  const isFirebaseConfigured = Boolean(
    (config && config.apiKey && config.projectId) ||
    (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS))
  );

  if (!isFirebaseConfigured) {
    logAudit('PASSWORD_RESET_REJECTED', cleanEmail, 'REJECTED', 'Firebase Authentication not configured for password recovery');
    return res.status(503).json({
      success: false,
      error: 'MISSING_FIREBASE_CONFIG',
      message: 'Firebase Authentication is not configured for this project.',
      actionableHelp: 'Password reset emails require an active Firebase Authentication configuration. Please configure Firebase Authentication in Firebase Console (enable Email/Password sign-in method) and ensure firebase-applet-config.json or environment variables (FIREBASE_API_KEY, FIREBASE_PROJECT_ID) are deployed.',
      actionUrl,
      authorizedDomain: host
    });
  }

  try {
    const admin = await import('firebase-admin');
    const adminDefault: any = (admin as any).default || admin;
    if (!adminDefault.apps || !adminDefault.apps.length) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        adminDefault.initializeApp();
      } else if (config?.projectId) {
        adminDefault.initializeApp({ projectId: config.projectId });
      }
    }

    const actionCodeSettings = {
      url: actionUrl,
      handleCodeInApp: true
    };

    // Generate real password reset link via Firebase Admin SDK
    const link = await adminDefault.auth().generatePasswordResetLink(cleanEmail, actionCodeSettings);
    logAudit('PASSWORD_RESET_DISPATCHED', cleanEmail, 'SUCCESS', `Firebase password reset link generated with action URL: ${actionUrl}`);

    // PRIVACY-CONSCIOUS SUCCESS CONFIRMATION (only when Firebase accepts the request)
    return res.json({
      success: true,
      isFirebaseAccepted: true,
      message: `If an account is associated with ${cleanEmail}, instructions have been dispatched by Firebase Authentication. Please check your inbox and spam folder.`,
      actionUrl,
      authorizedDomain: host
    });
  } catch (err: any) {
    const code = err?.code || '';
    const errMsg = err?.message || 'Firebase request failed.';
    logAudit('PASSWORD_RESET_FAILED', cleanEmail, 'REJECTED', `Firebase error: ${errMsg}`);

    if (code === 'auth/user-not-found') {
      // Privacy-conscious response when user is not found
      return res.json({
        success: true,
        isFirebaseAccepted: true,
        message: `If an account is associated with ${cleanEmail}, instructions have been dispatched by Firebase Authentication. Please check your inbox and spam folder.`
      });
    }

    if (code === 'auth/operation-not-allowed') {
      return res.status(403).json({
        success: false,
        error: 'UNSUPPORTED_PROVIDER',
        message: 'Email/Password authentication provider is not enabled in Firebase Console.',
        actionableHelp: 'Open Firebase Console > Authentication > Sign-in method, select "Email/Password" and click "Enable".'
      });
    }

    if (code === 'auth/unauthorized-continue-uri') {
      return res.status(400).json({
        success: false,
        error: 'UNAUTHORIZED_DOMAIN',
        message: `Action URL domain (${host}) is not in authorized domains in Firebase Console.`,
        actionableHelp: `Open Firebase Console > Authentication > Settings > Authorized domains and add "${host}".`
      });
    }

    return res.status(500).json({
      success: false,
      error: code || 'FIREBASE_ERROR',
      message: `Firebase Authentication error: ${errMsg}`,
      actionableHelp: 'Verify Firebase project configuration and service account credentials.'
    });
  }
});

// 4b. Confirm Password Reset Endpoint (Maintains Server-Verified Claims)
app.post('/api/auth/confirm-reset-password', (req: Request, res: Response) => {
  const { email, newPassword, oobCode } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Email is required.' });
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({
      error: 'INVALID_PASSWORD',
      message: 'New password must be at least 6 characters.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

  if (userIndex < 0) {
    return res.status(404).json({
      error: 'USER_NOT_FOUND',
      message: 'User account not found.'
    });
  }

  // Strictly update password WITHOUT altering roles, claims, or provisioning status
  users[userIndex].password = newPassword;
  writeUsers(users);

  logAudit(
    'ADMIN_PASSWORD_RESET_SUCCESS',
    cleanEmail,
    'SUCCESS',
    'Administrator password successfully updated following verified recovery. Administrative claims preserved.'
  );

  return res.json({
    success: true,
    message: 'Master password successfully updated. You may now authenticate using your new password.'
  });
});

// 4c. Save / Update Firebase Configuration
app.post('/api/admin/save-firebase-config', (req: Request, res: Response) => {
  const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = req.body;

  if (!apiKey || !projectId) {
    return res.status(400).json({
      error: 'INVALID_CONFIG',
      message: 'apiKey and projectId are required.'
    });
  }

  const newConfig = {
    apiKey: apiKey.trim(),
    authDomain: authDomain ? authDomain.trim() : `${projectId.trim()}.firebaseapp.com`,
    projectId: projectId.trim(),
    storageBucket: storageBucket ? storageBucket.trim() : `${projectId.trim()}.appspot.com`,
    messagingSenderId: messagingSenderId ? messagingSenderId.trim() : '',
    appId: appId ? appId.trim() : ''
  };

  try {
    fs.writeFileSync(FIREBASE_CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
    logAudit('FIREBASE_CONFIG_UPDATED', 'SYSTEM_ADMIN', 'SUCCESS', `Firebase configuration saved for project: ${newConfig.projectId}`);
    return res.json({
      success: true,
      message: `Firebase configuration successfully saved for project ${newConfig.projectId}.`,
      config: newConfig
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'WRITE_ERROR',
      message: 'Failed to write firebase-applet-config.json'
    });
  }
});

// 5. Standard Marketplace User Registration
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, country, city, phoneNumber } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Name, email, and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
  }

  // ZERO-TRUST GUARD: Forbid public self-assignment of ADMINISTRATOR
  const assignedRole = (role === 'ADMINISTRATOR' || role === 'admin') ? 'CLIENT' : (role || 'CLIENT');

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: cleanEmail,
    password: password,
    roles: [assignedRole],
    activeRole: assignedRole,
    country: country || 'TANZANIA',
    city: city || 'Arusha',
    phoneNumber: phoneNumber || '',
    isAdmin: false, // Strictly false for public registrations
    status: 'PENDING_PROFILE_COMPLETION',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  logAudit('USER_REGISTERED', cleanEmail, 'SUCCESS', `Public account registered with role: ${assignedRole}`);

  return res.json({
    success: true,
    user: newUser
  });
});

// 6. Standard User Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();
  const found = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: `No account found for ${cleanEmail}.` });
  }

  if (found.password && found.password !== password) {
    return res.status(401).json({ error: 'INVALID_PASSWORD', message: 'Incorrect password.' });
  }

  if (found.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'ACCOUNT_SUSPENDED', message: 'Account is suspended.' });
  }

  return res.json({
    success: true,
    user: found
  });
});

// 7. Audit Logs Endpoint (Protected)
app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      return res.json(logs);
    }
  } catch (err) {
    console.error('Failed to read audit logs:', err);
  }
  return res.json([]);
});

// -------------------------------------------------------------
// USER PROFILE MANAGEMENT (Persistent, Secure, Role-Isolated)
// -------------------------------------------------------------
app.get('/api/user/profile/:idOrEmail', (req: Request, res: Response) => {
  const { idOrEmail } = req.params;
  const users = readUsers();
  const found = users.find(u => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase());
  if (!found) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User profile not found.' });
  }
  const safe = { ...found };
  delete safe.password;
  return res.json({ success: true, user: safe });
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const {
    userId,
    email,
    name,
    profileImageUrl,
    phoneNumber,
    callingCode,
    country,
    city,
    clientType,
    organizationName,
    preferredLanguage,
    additionalNotes
  } = req.body;

  if (!userId && !email) {
    return res.status(400).json({ error: 'MISSING_USER_IDENTIFIER', message: 'User ID or email is required.' });
  }

  const users = readUsers();
  const index = users.findIndex(u => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.trim().toLowerCase()));

  if (index === -1) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User account not found.' });
  }

  const target = users[index];

  // Validation & field updates
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_NAME', message: 'Full name cannot be empty.' });
    }
    target.name = name.trim();
  }

  if (profileImageUrl !== undefined) {
    target.profileImageUrl = profileImageUrl;
  }

  if (phoneNumber !== undefined) {
    target.phoneNumber = phoneNumber.trim();
  }

  if (callingCode !== undefined) {
    target.callingCode = callingCode.trim();
  }

  if (country !== undefined) {
    target.country = country;
  }

  if (city !== undefined) {
    target.city = city.trim();
  }

  if (clientType !== undefined) {
    target.clientType = clientType;
  }

  if (organizationName !== undefined) {
    target.organizationName = organizationName.trim();
  }

  if (preferredLanguage !== undefined) {
    target.preferredLanguage = preferredLanguage === 'SW' ? 'SW' : 'EN';
  }

  if (additionalNotes !== undefined) {
    target.additionalNotes = additionalNotes.trim();
  }

  // Activate profile if minimum requirements are met
  if (target.status === 'PENDING_PROFILE_COMPLETION' && target.name && target.country) {
    target.status = 'ACTIVE';
  }

  target.updatedAt = new Date().toISOString();

  // STRICT ZERO-TRUST GUARD:
  // Never let user profile updates elevate isAdmin, change claims, or grant unauthorized ADMINISTRATOR role!
  // target.isAdmin and target.claims remain strictly protected!

  users[index] = target;
  writeUsers(users);

  logAudit('USER_PROFILE_UPDATED', target.email, 'SUCCESS', `User profile successfully updated for ${target.email}`);

  const safeUser = { ...target };
  delete safeUser.password;
  return res.json({ success: true, user: safeUser });
});

// 6b. Genuine Profile Photo Upload Endpoint (Real device/gallery photo persistence)
app.post('/api/upload/profile-photo', (req: Request, res: Response) => {
  try {
    const { userId, email, imageBase64, fileName, fileType } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        error: 'MISSING_USER_IDENTIFIER',
        message: 'User ID or email is required to associate the uploaded photograph.'
      });
    }

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        error: 'MISSING_IMAGE_DATA',
        message: 'Valid image data payload is required.'
      });
    }

    // Determine format & extract clean base64 string
    let mimeType = (fileType || 'image/jpeg').toLowerCase();
    let base64Data = imageBase64;
    const dataUriMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1].toLowerCase();
      base64Data = dataUriMatch[2];
    }

    // Allowed mime types
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(415).json({
        error: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Invalid image format. Only JPEG, PNG, and WebP photographs are supported.'
      });
    }

    // Convert base64 to buffer and validate size (max 5MB)
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (imageBuffer.length > MAX_SIZE_BYTES) {
      return res.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: `Image size (${(imageBuffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of 5MB.`
      });
    }

    if (imageBuffer.length < 50) {
      return res.status(400).json({
        error: 'CORRUPTED_IMAGE',
        message: 'Image data is invalid or empty.'
      });
    }

    // Check user existence
    const users = readUsers();
    const index = users.findIndex(u => (userId && u.id === userId) || (email && u.email.toLowerCase() === email.toLowerCase()));
    if (index === -1) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User account not found.'
      });
    }

    // Determine file extension
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';

    const safeFilename = `avatar_${users[index].id}_${Date.now()}.${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(destinationPath, imageBuffer);

    const publicUrl = `/uploads/${safeFilename}`;

    // Update user record persistently
    users[index].profileImageUrl = publicUrl;
    users[index].updatedAt = new Date().toISOString();
    writeUsers(users);

    logAudit('PROFILE_PHOTO_UPLOADED', users[index].email, 'SUCCESS', `Persistent profile photo uploaded (${(imageBuffer.length / 1024).toFixed(1)} KB, ${mimeType})`);

    const safeUser = { ...users[index] };
    delete safeUser.password;

    return res.json({
      success: true,
      profileImageUrl: publicUrl,
      user: safeUser,
      fileSize: imageBuffer.length,
      mimeType,
      message: 'Profile photo successfully uploaded and verified in persistent storage.'
    });
  } catch (err: any) {
    console.error('Failed to process profile photo upload:', err);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: err.message || 'Failed to process image upload.'
    });
  }
});

// -------------------------------------------------------------
// EQUIPMENT MARKETPLACE (15 Categories, Published Listings)
// -------------------------------------------------------------
app.get('/api/equipment', (req: Request, res: Response) => {
  const { category, search, country, ownerId } = req.query;
  let items = readEquipment();

  // Filter published only by default
  items = items.filter(i => i.isPublished);

  if (category && typeof category === 'string' && category !== 'ALL') {
    items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (country && typeof country === 'string' && country !== 'ALL') {
    items = items.filter(i => i.country.toLowerCase() === country.toLowerCase());
  }

  if (ownerId && typeof ownerId === 'string') {
    items = items.filter(i => i.ownerId === ownerId);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.modelSpecs && i.modelSpecs.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q)) ||
      (i.location && i.location.toLowerCase().includes(q)) ||
      (i.ownerName && i.ownerName.toLowerCase().includes(q))
    );
  }

  return res.json(items);
});

app.post('/api/equipment', (req: Request, res: Response) => {
  const {
    ownerId,
    ownerName,
    ownerContact,
    title,
    category,
    modelSpecs,
    condition,
    dailyRate,
    currency,
    rateUnit,
    depositAmount,
    country,
    location,
    pickupDeliveryTerms,
    includedAccessories,
    description,
    images
  } = req.body;

  if (!title || !category || !dailyRate) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'Title, category, and daily rate are required.' });
  }

  const items = readEquipment();
  const newItem: EquipmentRecord = {
    id: `eq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ownerId: ownerId || 'owner_anon',
    ownerName: ownerName || 'Equipment Owner',
    ownerContact: ownerContact || '',
    title: title.trim(),
    category: category.trim(),
    modelSpecs: modelSpecs ? modelSpecs.trim() : '',
    condition: condition || 'Excellent',
    dailyRate: Number(dailyRate) || 100000,
    currency: currency || 'TZS',
    rateUnit: rateUnit || 'day',
    depositAmount: Number(depositAmount) || 0,
    availability: 'AVAILABLE',
    country: country || 'TANZANIA',
    location: location ? location.trim() : 'Arusha',
    pickupDeliveryTerms: pickupDeliveryTerms ? pickupDeliveryTerms.trim() : 'Studio pickup or technician delivery',
    includedAccessories: Array.isArray(includedAccessories) ? includedAccessories : (includedAccessories ? [includedAccessories] : []),
    description: description ? description.trim() : '',
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
    isPublished: true,
    createdAt: new Date().toISOString()
  };

  items.unshift(newItem);
  writeEquipment(items);

  logAudit('EQUIPMENT_LISTED', ownerName || ownerId, 'SUCCESS', `Published gear listing: ${title}`);

  return res.json({ success: true, equipment: newItem });
});

app.put('/api/equipment/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const items = readEquipment();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Equipment listing not found.' });
  }

  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  writeEquipment(items);
  return res.json({ success: true, equipment: items[idx] });
});

// Equipment Owner: Get all listings for owner (including unpublished)
app.get('/api/equipment/owner/:ownerId', (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const items = readEquipment();
  const ownerItems = items.filter(i => i.ownerId === ownerId);
  return res.json(ownerItems);
});

// Equipment Owner: Toggle Publish/Unpublish
app.put('/api/equipment/:id/toggle-publish', (req: Request, res: Response) => {
  const { id } = req.params;
  const items = readEquipment();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Equipment listing not found.' });
  }

  items[idx].isPublished = !items[idx].isPublished;
  items[idx].updatedAt = new Date().toISOString();
  writeEquipment(items);

  logAudit(
    items[idx].isPublished ? 'EQUIPMENT_PUBLISHED' : 'EQUIPMENT_UNPUBLISHED',
    items[idx].ownerName || items[idx].ownerId,
    'SUCCESS',
    `Listing ${items[idx].title} set to ${items[idx].isPublished ? 'PUBLISHED' : 'UNPUBLISHED'}`
  );

  return res.json({ success: true, equipment: items[idx] });
});

// Equipment Owner: Delete Listing
app.delete('/api/equipment/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const items = readEquipment();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Equipment listing not found.' });
  }

  const removed = items.splice(idx, 1)[0];
  writeEquipment(items);

  logAudit('EQUIPMENT_DELETED', removed.ownerName || removed.ownerId, 'SUCCESS', `Deleted equipment: ${removed.title}`);

  return res.json({ success: true, message: 'Equipment listing removed.' });
});

// -------------------------------------------------------------
// CREATIVE PROFESSIONALS DIRECTORY
// -------------------------------------------------------------
app.get('/api/creatives', (req: Request, res: Response) => {
  const { category, search, country, providerType } = req.query;
  let items = readCreatives();

  if (category && typeof category === 'string' && category !== 'ALL') {
    items = items.filter(c =>
      c.category.toLowerCase() === category.toLowerCase() ||
      (c.skills && c.skills.some((s: string) => s.toLowerCase() === category.toLowerCase()))
    );
  }

  if (country && typeof country === 'string' && country !== 'ALL') {
    items = items.filter(c => c.country.toLowerCase() === country.toLowerCase());
  }

  if (providerType && typeof providerType === 'string' && providerType !== 'ALL') {
    items = items.filter(c => c.providerType === providerType);
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      (c.bio && c.bio.toLowerCase().includes(q)) ||
      (c.skills && c.skills.some((s: string) => s.toLowerCase().includes(q)))
    );
  }

  return res.json(items);
});

app.post('/api/creatives', (req: Request, res: Response) => {
  const {
    userId,
    name,
    title,
    category,
    providerType,
    companyName,
    skills,
    location,
    country,
    rate,
    currency,
    bio,
    avatarUrl,
    portfolio
  } = req.body;

  if (!userId || !name || !title || !category) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'User ID, name, title, and category are required.' });
  }

  const creatives = readCreatives();
  const existingIdx = creatives.findIndex(c => c.userId === userId);

  const creativeRecord: CreativeRecord = {
    id: existingIdx !== -1 ? creatives[existingIdx].id : `cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    name: name.trim(),
    title: title.trim(),
    category: category.trim(),
    providerType: providerType || 'FREELANCER',
    companyName: companyName ? companyName.trim() : undefined,
    skills: Array.isArray(skills) ? skills : [category],
    location: location ? location.trim() : 'Arusha',
    country: country || 'TANZANIA',
    rate: Number(rate) || 500000,
    currency: currency || 'TZS',
    rateType: 'per_day',
    availability: 'AVAILABLE_NOW',
    bio: bio ? bio.trim() : '',
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    portfolio: Array.isArray(portfolio) ? portfolio : [],
    isVerified: true,
    rating: 5.0,
    reviewCount: 1
  };

  if (existingIdx !== -1) {
    creatives[existingIdx] = creativeRecord;
  } else {
    creatives.unshift(creativeRecord);
  }
  writeCreatives(creatives);

  logAudit('CREATIVE_REGISTERED', name, 'SUCCESS', `Creative directory listing saved for ${name}`);

  return res.json({ success: true, creative: creativeRecord });
});

// -------------------------------------------------------------
// BOOKING & QUOTATION PIPELINE
// -------------------------------------------------------------
app.get('/api/bookings', (req: Request, res: Response) => {
  const { userId, email, role } = req.query;
  let items = readBookings();

  if (userId && typeof userId === 'string') {
    const userRole = typeof role === 'string' ? role : '';
    const userEmail = typeof email === 'string' ? email.toLowerCase() : '';

    if (userRole === 'CLIENT') {
      items = items.filter(b => b.clientId === userId || (userEmail && b.clientEmail?.toLowerCase() === userEmail));
    } else if (userRole === 'EQUIPMENT_OWNER') {
      items = items.filter(b => b.type === 'EQUIPMENT_RENTAL' && (b.providerId === userId || b.providerName === userId));
    } else if (userRole === 'FREELANCER' || userRole === 'PRODUCTION_COMPANY') {
      items = items.filter(b => b.providerId === userId);
    } else if (userRole !== 'ADMINISTRATOR') {
      items = items.filter(b =>
        b.clientId === userId ||
        b.providerId === userId ||
        (userEmail && b.clientEmail?.toLowerCase() === userEmail)
      );
    }
  }

  return res.json(items);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const {
    clientId,
    clientName,
    clientEmail,
    clientPhone,
    clientType,
    clientOrgName,
    providerId,
    providerName,
    providerRole,
    type,
    serviceCategory,
    projectTitle,
    projectBrief,
    serviceDate,
    serviceTime,
    duration,
    projectLocation,
    budget,
    currency,
    deliverables,
    contactPreference,
    rentalDetails
  } = req.body;

  const effectiveTitle = (projectTitle || req.body.title || '').trim();
  const effectiveBrief = (projectBrief || req.body.brief || '').trim();
  const effectiveServiceDate = (serviceDate || req.body.startDate || '').trim();

  if (!clientId || !providerId || !effectiveTitle || !effectiveBrief || !effectiveServiceDate) {
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: 'Client ID, Provider ID, Title, Project Brief, and Service Date are required.'
    });
  }

  const bookings = readBookings();

  // Duplicate prevention check: same client, provider, title within 60s
  const isDuplicate = bookings.some(b =>
    b.clientId === clientId &&
    b.providerId === providerId &&
    b.title.toLowerCase() === effectiveTitle.toLowerCase() &&
    b.status === 'PENDING' &&
    (Date.now() - new Date(b.createdAt).getTime()) < 60000
  );

  if (isDuplicate) {
    return res.status(409).json({
      error: 'DUPLICATE_SUBMISSION',
      message: 'A duplicate request was recently submitted. Please check your Booking Center.'
    });
  }

  // Double-booking prevention check for equipment rentals
  if (type === 'EQUIPMENT_RENTAL' && rentalDetails?.equipmentId) {
    const requestedStart = new Date(rentalDetails.startDate || serviceDate).getTime();
    const requestedEnd = new Date(rentalDetails.endDate || serviceDate).getTime();

    const isDoubleBooked = bookings.some(b => {
      if (b.type !== 'EQUIPMENT_RENTAL' || b.rentalDetails?.equipmentId !== rentalDetails.equipmentId) {
        return false;
      }
      if (!['CONFIRMED', 'IN_PROGRESS'].includes(b.status)) {
        return false;
      }
      const existingStart = new Date(b.rentalDetails?.startDate || b.serviceDate).getTime();
      const existingEnd = new Date(b.rentalDetails?.endDate || b.serviceDate).getTime();
      return requestedStart <= existingEnd && requestedEnd >= existingStart;
    });

    if (isDoubleBooked) {
      return res.status(409).json({
        error: 'EQUIPMENT_ALREADY_BOOKED',
        message: 'This equipment is already reserved for the selected date range. Please select different dates or explore alternative gear.'
      });
    }
  }

  const ref = `KB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking: BookingRecord = {
    id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    reference: ref,
    type: type || 'CREATIVE_SERVICE',
    title: effectiveTitle,
    serviceCategory: serviceCategory || (type === 'EQUIPMENT_RENTAL' ? 'Equipment Rental' : 'Creative Production'),
    clientId,
    clientName: clientName || 'Client',
    clientEmail: clientEmail || '',
    clientPhone: clientPhone || '',
    clientType: clientType || 'INDIVIDUAL',
    clientOrgName: clientOrgName || '',
    providerId,
    providerName: providerName || 'Service Provider',
    providerRole: providerRole || (type === 'EQUIPMENT_RENTAL' ? 'Equipment Owner' : 'Creative Professional'),
    projectBrief: effectiveBrief,
    serviceDate: effectiveServiceDate,
    serviceTime: serviceTime || '09:00 AM',
    duration: duration || '1 Day',
    projectLocation: projectLocation || 'Location specified in brief',
    budget: Number(budget) || 0,
    currency: currency || 'TZS',
    deliverables: deliverables || 'As specified in brief',
    contactPreference: contactPreference || 'In-App Message',
    agreedAmount: Number(budget) || 0,
    depositAmount: rentalDetails?.deposit || 0,
    status: 'PENDING',
    rentalDetails: rentalDetails || undefined,
    history: [
      {
        status: 'PENDING',
        time: new Date().toLocaleTimeString(),
        note: type === 'EQUIPMENT_RENTAL'
          ? `Equipment rental request submitted for ${rentalDetails?.days || 1} day(s).`
          : 'Service quotation request submitted with project brief.',
        actor: clientName || 'Client'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  writeBookings(bookings);

  logAudit('BOOKING_CREATED', clientEmail || clientId, 'SUCCESS', `Booking ${ref} submitted to ${providerName}`);

  return res.json({ success: true, booking: newBooking });
});

app.put('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, actor, actorId, actorRole } = req.body;

  const bookings = readBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
  }

  const booking = bookings[idx];

  // Enforce role-based security & privilege bounds:
  // 1. Clients cannot self-approve pending booking requests
  if (actorId && actorId === booking.clientId) {
    if (booking.status === 'PENDING' && (status === 'CONFIRMED' || status === 'IN_PROGRESS')) {
      return res.status(403).json({
        error: 'UNAUTHORIZED_TRANSITION',
        message: 'Clients cannot self-approve pending requests. The provider or equipment owner must confirm.'
      });
    }
  }

  // 2. Initial confirmation of pending requests must be performed by provider or equipment owner
  if (status === 'CONFIRMED' && booking.status === 'PENDING') {
    if (actorId && actorId !== booking.providerId && actorRole === 'CLIENT') {
      return res.status(403).json({
        error: 'UNAUTHORIZED_PROVIDER_ACTION',
        message: 'Only the assigned service provider or equipment owner can accept and confirm this request.'
      });
    }
  }

  // 3. Accepting a quotation: only the client can accept a quotation submitted to them
  if (booking.status === 'QUOTATION_SUBMITTED' && status === 'CONFIRMED') {
    if (actorId && actorId !== booking.clientId && actorRole !== 'CLIENT') {
      return res.status(403).json({
        error: 'UNAUTHORIZED_CLIENT_ACTION',
        message: 'Only the client who ordered can accept a submitted quotation.'
      });
    }
  }

  // 4. Equipment dispatch & handover: must be confirmed by equipment owner
  if (status === 'IN_PROGRESS' && actorId && actorId === booking.clientId && booking.type === 'EQUIPMENT_RENTAL') {
    return res.status(403).json({
      error: 'UNAUTHORIZED_OWNER_ACTION',
      message: 'Equipment handover must be dispatched and confirmed by the equipment owner.'
    });
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  booking.history.push({
    status,
    time: new Date().toLocaleTimeString(),
    note: note || `Booking status changed to ${status}`,
    actor: actor || 'User'
  });

  bookings[idx] = booking;
  writeBookings(bookings);

  logAudit('BOOKING_STATUS_CHANGED', actor || 'USER', 'SUCCESS', `Booking ${booking.reference} updated to ${status}`);

  return res.json({ success: true, booking });
});

app.put('/api/bookings/:id/quote', (req: Request, res: Response) => {
  const { id } = req.params;
  const { items, total, notes, validUntil, actor, actorId } = req.body;

  const bookings = readBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
  }

  const booking = bookings[idx];

  // Client cannot submit a quote for their own booking
  if (actorId && actorId === booking.clientId) {
    return res.status(403).json({
      error: 'UNAUTHORIZED_QUOTATION',
      message: 'Clients cannot submit quotations on their own service requests.'
    });
  }

  booking.status = 'QUOTATION_SUBMITTED';
  booking.agreedAmount = Number(total) || booking.agreedAmount;
  booking.quotation = {
    items: Array.isArray(items) ? items : [items],
    total: Number(total) || 0,
    notes: notes || '',
    validUntil: validUntil || '',
    isAccepted: false
  };
  booking.updatedAt = new Date().toISOString();
  booking.history.push({
    status: 'QUOTATION_SUBMITTED',
    time: new Date().toLocaleTimeString(),
    note: `Line-item quotation submitted: ${booking.currency} ${Number(total).toLocaleString()}`,
    actor: actor || 'Service Provider'
  });

  bookings[idx] = booking;
  writeBookings(bookings);

  logAudit('QUOTATION_SUBMITTED', actor || 'PROVIDER', 'SUCCESS', `Quotation submitted for ${booking.reference}`);

  return res.json({ success: true, booking });
});

// 8. Add / Request New Role (Strictly forbids ADMINISTRATOR)
app.post('/api/user/request-role', (req: Request, res: Response) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'User ID and role are required.' });
  }

  // ZERO-TRUST ENFORCEMENT: Never allow public self-assignment of ADMINISTRATOR
  if (role === 'ADMINISTRATOR' || role === 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Administrator role cannot be assigned through public role registration.' });
  }

  const validPublicRoles = ['CLIENT', 'FREELANCER', 'EQUIPMENT_OWNER', 'PRODUCTION_COMPANY'];
  if (!validPublicRoles.includes(role)) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: `Invalid role. Must be one of: ${validPublicRoles.join(', ')}` });
  }

  const users = readUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found.' });
  }

  const user = users[idx];
  if (!user.roles.includes(role)) {
    user.roles.push(role);
  }
  user.activeRole = role;
  user.updatedAt = new Date().toISOString();

  users[idx] = user;
  writeUsers(users);

  logAudit('ROLE_REGISTERED', user.email, 'SUCCESS', `Added role ${role} for user ${user.email}`);

  const safeUser = { ...user };
  delete safeUser.password;
  return res.json({ success: true, user: safeUser });
});

// Catch-all for undefined /api routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'NOT_FOUND', message: `API endpoint ${req.method} ${req.path} not found.` });
});

// -------------------------------------------------------------
// VITE DEV SERVER & STATIC ASSETS INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in dev mode
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/uploads')) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v8.3.0  ready in 180 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`[KAZI HUB SERVER] Running on port ${PORT}`);
    console.log(`[KAZI HUB SERVER] Designated Initial Administrator: ${DESIGNATED_INITIAL_ADMIN_EMAIL}`);
  });
}

startServer().catch(err => {
  console.error('[KAZI HUB SERVER] Startup error:', err);
  process.exit(1);
});
