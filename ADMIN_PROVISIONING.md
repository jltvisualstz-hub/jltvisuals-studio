# KAZI HUB — SECURE ADMINISTRATOR PROVISIONING SPECIFICATION

## Critical Security Architecture

Administrator access in KAZI HUB is protected by strict zero-trust rules:

1. **Zero Public Exposure**: The role `ADMINISTRATOR` is never presented in public registration, onboarding forms, or client-side profile role pickers.
2. **Server-Enforced Authorization**: The Android client and Web applications do not trust client-supplied boolean flags or local storage. Administrative capabilities are gated by Firebase Authentication Custom User Claims (`{ admin: true }`) and enforced in `firestore.rules`.
3. **No Default/Hard-Coded Admins**: All fictional seeded administrator sessions have been permanently removed.

---

## Step-by-Step Provisioning Procedure

To grant administrator access to a trusted staff member:

### Step 1: User Registration
The staff member must first create a standard user account through normal registration (e.g. `staff.operations@kazihub.ea`) and complete initial email verification.

### Step 2: Server-Side Custom Claim Assignment
In a trusted backend environment (Cloud Functions, Cloud Run, or secure operations terminal with service account credentials):

```bash
# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="/secrets/firebase-service-account.json"

# Execute the provisioning CLI
node scripts/provision-admin.js staff.operations@kazihub.ea
```

Or via Node.js script using the Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

async function grantAdmin(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, {
    admin: true,
    kazi_role: 'ADMINISTRATOR',
    granted_at: new Date().toISOString()
  });
  console.log(`Administrator privileges granted to ${email}`);
}

grantAdmin('staff.operations@kazihub.ea');
```

### Step 3: Token Refresh
On their next authentication or token refresh (`getIdTokenResult(true)`), the user receives the `{ admin: true }` claim in their JWT payload.

### Step 4: Firestore Security Rules Enforcement
All administrative collections (`/admin_audit_logs`, `/disputes`, `/support_tickets`, system settings) enforce the claim:

```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

Any unauthorized request by a standard user is rejected with HTTP 403 / Permission Denied.
