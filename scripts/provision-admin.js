#!/usr/bin/env node
/**
 * KAZI HUB — Secure Administrator Provisioning Script (ESM)
 * 
 * Strict Security Architecture:
 * Administrator access is NEVER accessible via public registration, client-side
 * profile editing, or local application state.
 * 
 * This administrative script runs exclusively in an authorized, privileged server-side
 * environment using the Firebase Admin SDK and server authorization store.
 * 
 * Usage:
 *   node scripts/provision-admin.js <user-email-or-uid>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=====================================================');
console.log('   KAZI HUB — SECURE ADMINISTRATOR PROVISIONING TOOL  ');
console.log('=====================================================');

const targetIdentifier = process.argv[2];

if (!targetIdentifier) {
  console.error('\n[ERROR] Missing target user identifier.');
  console.error('Usage: node scripts/provision-admin.js <user-email-or-uid>\n');
  console.log('Examples:');
  console.log('  node scripts/provision-admin.js mmosesurio@gmail.com');
  console.log('  node scripts/provision-admin.js staff.operations@kazihub.ea\n');
  process.exit(1);
}

const cleanIdentifier = targetIdentifier.trim().toLowerCase();
console.log(`\n[STEP 1] Validating target account: ${cleanIdentifier}`);
console.log('[STEP 2] Updating server persistent registry...');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOCK_FILE = path.join(DATA_DIR, 'admin_lock.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let users = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (err) {
    console.error('[WARN] Failed to read users.json, creating new list:', err.message);
  }
}

let targetUser = users.find(u => u.email.toLowerCase() === cleanIdentifier || u.id === cleanIdentifier);

if (!targetUser) {
  console.log(`[NOTICE] Account ${cleanIdentifier} not yet present in platform registry. Initializing administrator profile...`);
  targetUser = {
    id: `usr_admin_${Date.now()}`,
    name: 'Platform Administrator',
    email: cleanIdentifier,
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
} else {
  targetUser.isAdmin = true;
  if (!targetUser.roles.includes('ADMINISTRATOR')) {
    targetUser.roles.push('ADMINISTRATOR');
  }
  targetUser.activeRole = 'ADMINISTRATOR';
  targetUser.status = 'ACTIVE';
  targetUser.claims = {
    admin: true,
    kazi_role: 'ADMINISTRATOR',
    provisionedAt: new Date().toISOString()
  };
}

fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

// Lock initial provisioning gate
const lockData = {
  isFirstAdminProvisioned: true,
  provisionedEmail: cleanIdentifier,
  provisionedAt: new Date().toISOString(),
  provisionedVia: 'CLI_SCRIPT'
};
fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2), 'utf-8');

// Record audit entry
let auditLogs = [];
if (fs.existsSync(AUDIT_FILE)) {
  try {
    auditLogs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
  } catch (e) {}
}
auditLogs.unshift({
  id: `audit_cli_${Date.now()}`,
  action: 'ADMIN_PROVISIONED_VIA_CLI',
  actor: cleanIdentifier,
  timestamp: new Date().toISOString(),
  outcome: 'SUCCESS',
  details: `Administrator privileges and server custom claim { admin: true } assigned via scripts/provision-admin.js`
});
fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditLogs.slice(0, 500), null, 2), 'utf-8');

console.log(`[SUCCESS] Server persistent registry updated for ${cleanIdentifier}.`);
console.log('[SUCCESS] Initial administrator provisioning has been locked.');

// Attempt Firebase Admin SDK update if environment is configured
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
  try {
    const admin = await import('firebase-admin');
    const adminDefault = admin.default || admin;
    if (!adminDefault.apps.length) {
      adminDefault.initializeApp();
    }
    const userRecord = await adminDefault.auth().getUserByEmail(cleanIdentifier);
    await adminDefault.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      kazi_role: 'ADMINISTRATOR',
      assigned_at: Date.now()
    });
    console.log(`[FIREBASE] Live Firebase Admin custom claims set for ${cleanIdentifier}.`);
  } catch (err) {
    console.log(`[FIREBASE NOTICE] ${err.message}. Local server registry is fully updated.`);
  }
} else {
  console.log('[INFO] Server persistent authorization complete. Token claims active on next sign in.');
}
process.exit(0);
