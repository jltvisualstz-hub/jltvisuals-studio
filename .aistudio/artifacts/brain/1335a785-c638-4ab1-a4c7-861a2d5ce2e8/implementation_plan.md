# KAZI HUB — Phase 1.4 & Marketplace Expansion Implementation Plan

This implementation plan details the architecture and execution steps to expand KAZI HUB into a full creative services and cinema equipment rental marketplace rooted in Arusha, Tanzania, with complete bilingual (English/Kiswahili) localization, country phone codes, role-specific workflows, and zero-trust administrator access.

---

## 1. Architecture & Core Data Models

### 1.1 Four Distinct Public Account Types & Role Dashboards
- **CLIENT**: Project posting, discovery of talent & gear, quotation requests, booking checkout, handover sign-off, reviews.
- **FREELANCER**: Personal creative profile, photo upload, specific craft rate (e.g., DoP, Sound Mixer), service catalogue, booking acceptance, completion reports, net earnings summary.
- **PRODUCTION COMPANY**: Registered business profile, company logo, tax identification (TIN), team leads, full-service production packages, multi-crew bookings, corporate invoicing.
- **EQUIPMENT OWNER**: Rental inventory management (cameras, lighting, audio systems, LED walls, generators, workstations), availability calendars, replacement values, damage terms, security deposits, rental inspection logs.

### 1.2 Creative Services Catalogue
- Explicitly partition creative crafts so **Music Recording & Audio Production** is distinct from **Video Recording & Cinematography**:
  - `MUSIC_RECORDING`: Studio recording, music tracking, vocal production, mixing, mastering, beat production.
  - `VIDEO_RECORDING`: Multi-camera event recording, documentary coverage, commercial shoots, corporate interviews.
  - `PHOTOGRAPHY`: Studio, commercial, fashion, editorial, weddings.
  - `SOUND_ENGINEERING`: Location audio recording, boom operation, wireless multi-mic mixing.
  - `DRONE_AERIAL`: KCAA/TCAA certified aerial filming, site mapping.
  - `LIGHTING_GRIP`: Gaffer packages, rigging, continuous lighting.
  - `POST_PRODUCTION`: Colour grading, VFX, video editing, motion graphics.
  - `STUDIO_HIRE`: Soundproof stages, cyclorama studios, audio live rooms.

### 1.3 Equipment Rental Marketplace (Beyond Cameras)
- Support 15+ dedicated equipment categories:
  - Cinema Cameras & Lenses, Lighting & Grip, Audio Systems & Microphones, Drones & Aerial Rigs, Commercial LED Displays & TV Walls, Projectors & Screens, Stabilizers & Gimbals, Broadcast & Live Streaming Kits, Studio Equipment, Power Stations & Generators, Edit Workstations & Production Laptops, Staging & Event Rigging, Teleprompters & Intercoms, Accessories & Cables.
- Distinguish **Refundable Security Deposit** from rental fee: deposits are held in custody, returned upon clean inspection, and **never treated as commission revenue**.
- Concurrent availability check logic to prevent double bookings across overlapping dates.

### 1.4 10% Configurable Platform Commission & Auditable Ledger
- Commission rate stored in platform settings (default `10%`).
- Transaction record structure:
  - `grossAmount`: Total project or rental cost.
  - `commissionRate`: Percentage (0.10).
  - `commissionAmount`: `grossAmount * commissionRate`.
  - `providerNetAmount`: `grossAmount - commissionAmount`.
  - `depositAmount`: Non-commissionable refundable bond.
  - `settlementStatus`: `PENDING_SETTLEMENT`, `SETTLED`, `DISPUTED`.
- Detailed completion report requirement before commission triggers: deliverables summary, cloud drive links, delivery date, client sign-off.

### 1.5 Territory & Launch Focus: Arusha, Tanzania
- Primary default hub: **Arusha, Tanzania** (CBD, Njiro, Sakina, Themi, Ilboru, Mount Meru production zone).
- Extensible schema for Dar es Salaam, Zanzibar, Nairobi, Mombasa, Kampala, Kigali.
- Currency handling: Tanzanian Shilling (`TZS` / `TSh`) default, with explicit conversion guards for `KES`, `UGX`, `RWF`.

### 1.6 Unified Admin & Customer Care Contact
- Centralized phone number setting managed in Admin Platform Settings, dynamically bound across all contact and support interfaces.

---

## 2. Localization & Country Phone Codes

### 2.1 Complete English & Kiswahili Localization
- Centralize all strings in `res/values/strings.xml` (EN) and `res/values-sw/strings.xml` (SW).
- Ensure 100% translation of every user-facing string across:
  - Welcome, Onboarding, Login, Registration, Forgot Password.
  - Form field labels, placeholders, and inline validation messages.
  - Role-specific dashboard widgets and headers.
  - Service categories, subcategories, equipment categories.
  - Booking statuses (Pending / Imesubiri, Confirmed / Imethibitishwa, In Progress / Inaendelea, Completed / Imekamilika, Disputed / Inalalamikiwa).
  - Empty states, retry dialogs, and error messages.
- Persist language preference in persistent local storage (`KaziLanguageStore`) so the app respects explicit in-app selection independently of device OS locale.

### 2.2 Country Phone Code Binding
- Operational country dropdown dynamically updates calling code and input formatting:
  - **Tanzania**: `+255` (formatting: `+255 7XX XXX XXX` / `+255 6XX XXX XXX`)
  - **Kenya**: `+254` (formatting: `+254 7XX XXX XXX` / `+254 1XX XXX XXX`)
  - **Uganda**: `+256` (formatting: `+256 7XX XXX XXX`)
  - **Rwanda**: `+250` (formatting: `+250 7XX XXX XXX`)
- Input logic automatically strips redundant leading zeros or accidental duplicate calling codes (`+255` followed by `255`).
- Preserves local number during country switching without corrupting user input.

---

## 3. Secure Administrator Access & First Admin Bootstrap

### 3.1 Discreet Administrator Entry Point & Dedicated Sign-In
- A discreet yet accessible "Administrator Sign In" trigger on the Welcome and Login screens.
- Dedicated Admin Authentication screen with email, password, authentication state, and immediate server-claim authorization verification.

### 3.2 Bootstrap Provisioning for `mmosesurio@gmail.com`
- Dedicated secure backend bootstrap function and CLI utility to assign the Firebase custom claim `{ admin: true }` to `mmosesurio@gmail.com`.
- Hardened zero-trust checks: Ordinary users (even with modified client memory) are denied access at both the UI guard layer and Cloud Firestore Security Rules (`request.auth.token.admin == true`).

---

## 4. Implementation Steps & File Modifications

1. **Strings & Localization Resources**:
   - Populate `app/src/main/res/values/strings.xml` and `app/src/main/res/values-sw/strings.xml` with all necessary keys.
   - Synchronize interactive web companion localization dictionary in `src/App.tsx`.
2. **Data Models (`app/src/main/java/com/kazihub/app/model/`)**:
   - Expand `UserRole` and `UserProfile` with company registration attributes (TIN, legal business name, team leads).
   - Expand `CreativeCategory` to strictly distinguish `MUSIC_RECORDING` vs `VIDEO_RECORDING`.
   - Expand `EquipmentCategory` to include LED walls, audio systems, generators, staging, and edit workstations.
   - Add `CommissionLedgerRecord`, `PlatformSettings`, and `EquipmentBundle`.
3. **Repositories & ViewModel (`app/src/main/java/com/kazihub/app/ui/viewmodel/`)**:
   - Add country calling code validation helper (`PhoneCodeValidator`).
   - Implement `language` state persistence and switcher.
   - Add commission ledger calculations (10% fee calculation on eligible completed jobs).
   - Implement role-specific dashboard data streams.
   - Implement admin login and authorization check for `mmosesurio@gmail.com`.
4. **Composables & Screens (`app/src/main/java/com/kazihub/app/ui/screens/`)**:
   - Update `AuthScreens.kt`: Country phone code binding, 4 distinct registration forms, discreet Admin Sign-In entry point.
   - Update `AdminScreens.kt`: Configurable commission rate (10%), unified contact management (phone/email), user verification, and ledger audit.
   - Update `BookingCenterScreens.kt`: Completion report flow with deliverables and client sign-off, deposit separation.
   - Update `KaziScreensRemaining.kt`: Full bilingual rendering, Arusha-centric empty states with quick publish actions.
   - Update `App.tsx` (web companion): Match the native Android features for unified testing.
5. **Security Rules (`firestore.rules`) & Deployment**:
   - Ensure `request.auth.token.admin == true` protects `/admin_audit_logs/`, `/platform_settings/`, and role escalation.
6. **Verification & Testing**:
   - Run compilation and TypeScript checks.
   - Verify English/Kiswahili switching across all screens.
   - Test phone code switching across Tanzania, Kenya, Uganda, and Rwanda.
   - Verify ordinary user denial vs. authorized admin sign-in.
