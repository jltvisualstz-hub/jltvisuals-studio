/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  fetchAdminStatus,
  adminSignIn,
  provisionInitialAdmin,
  requestPasswordReset,
  confirmPasswordResetService,
  type AdminStatus
} from './services/adminAuthService';
import {
  getFirebaseConfigStatus,
  type FirebaseConfigStatus
} from './services/firebaseAuth';
import {
  Compass,
  Users,
  Video,
  MessageSquare,
  LayoutDashboard,
  User,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  Globe,
  ArrowRight,
  ShieldCheck,
  Shield,
  Terminal,
  Briefcase,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  Send,
  Code2,
  Smartphone,
  ExternalLink,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
  LifeBuoy,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Layers,
  Lock,
  Check,
  X,
  Gavel,
  ShieldAlert,
  Headphones,
  Settings,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Cloud,
  LogOut,
  Plus,
  FileEdit,
  BadgeAlert,
  FolderPlus,
  Tag,
  MapPin,
  Building,
  Package
} from 'lucide-react';

import { ClientProfileSection, type UserProfileData } from './components/ClientProfileSection';
import { CreativeDiscoverySection } from './components/CreativeDiscoverySection';
import { BookServiceModal, type CreativeProfessional } from './components/BookServiceModal';
import { EquipmentMarketplaceSection } from './components/EquipmentMarketplaceSection';
import { RentGearModal, type EquipmentItem } from './components/RentGearModal';
import { AddGearModal, EQUIPMENT_CATEGORIES_15 } from './components/AddGearModal';
import { EquipmentOwnerDashboard } from './components/EquipmentOwnerDashboard';
import { CreateBookingModal } from './components/CreateBookingModal';
import {
  type Language,
  t,
  getBookingStatusLabel,
  getServiceCategoryLabel,
  getEquipmentCategoryLabel,
  getCountryLabel,
  getProviderTypeLabel,
  getAvailabilityLabel
} from './i18n/translations';
import { LanguageProvider, useI18n } from './i18n/LanguageContext';

// --- ROLES & PERMISSIONS ---
// STRICT ZERO-TRUST SECURITY: ADMINISTRATOR is NEVER in Public Registration or Public Role Switcher
type PublicRole = 'CLIENT' | 'FREELANCER' | 'EQUIPMENT_OWNER' | 'PRODUCTION_COMPANY';
type Role = PublicRole | 'ADMINISTRATOR';

type Country = 'ALL' | 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA';

type BookingStatus =
  | 'PENDING'
  | 'QUOTATION_SUBMITTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'AWAITING_COMPLETION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

interface Booking {
  id: string;
  reference: string;
  type: 'CREATIVE_SERVICE' | 'EQUIPMENT_RENTAL';
  title: string;
  clientName: string;
  clientId: string;
  providerName: string;
  providerId: string;
  providerRole: string;
  scope: string;
  country: 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA';
  location: string;
  startDate: string;
  endDate: string;
  agreedAmount: number;
  currency: string;
  depositAmount: number;
  status: BookingStatus;
  history: { status: string; time: string; note: string; actor: string }[];
  equipmentId?: string;
  quotation?: {
    items: string[];
    total: number;
    notes: string;
    validUntil: string;
    isAccepted?: boolean;
    revisionNotes?: string;
  };
  dispute?: {
    reason: string;
    raisedBy: string;
    time: string;
    evidence: string[];
    assignedStaff: string;
    resolutionNotes?: string;
  };
  handoverReport?: {
    checklistNotes: string;
    time: string;
  };
  completionReport?: {
    deliverablesSummary: string;
    driveRef: string;
    time: string;
  };
}

interface SupportTicket {
  id: string;
  reference: string;
  category: string;
  subject: string;
  description: string;
  relatedBookingRef?: string;
  status: TicketStatus;
  user: string;
  createdAt: string;
  responses: { id: string; author: string; isStaff: boolean; text: string; time: string }[];
}

interface CreativeRecord {
  id: string;
  userId: string;
  name: string;
  title: string;
  category: string;
  providerType?: 'FREELANCER' | 'PRODUCTION_COMPANY';
  companyName?: string;
  skills?: string[];
  secondarySkills?: string;
  country: 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA';
  location: string;
  rate: number;
  currency: string;
  rateType?: string;
  bio: string;
  avatarUrl: string;
  portfolioLinks?: string[];
  portfolio?: { title: string; type: string; url: string; client?: string }[];
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  availability?: 'AVAILABLE_NOW' | 'AVAILABLE_THIS_WEEK' | 'BOOKED';
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
  country: 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA';
  location: string;
  dailyRate: number;
  currency: string;
  rateUnit?: string;
  depositAmount?: number;
  availability?: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  pickupDeliveryTerms?: string;
  includedAccessories?: string[];
  description?: string;
  images?: string[];
  rentalTerms?: string;
  imageUrl?: string;
  isPublished?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA';
  city?: string;
  phoneNumber?: string;
  callingCode?: string;
  roles: PublicRole[];
  isAdmin: boolean; // Server-granted claim only
  activeRole: PublicRole;
  profileImageUrl?: string;
  bio: string;
  clientType?: 'INDIVIDUAL' | 'ORGANIZATION';
  organizationName?: string;
  preferredLanguage?: 'EN' | 'SW';
  additionalNotes?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_PROFILE_COMPLETION';
  suspensionReason?: string;
  isIdentityVerified: boolean;
  claims?: {
    admin?: boolean;
    kazi_role?: string;
    provisionedAt?: string;
  };
  // Role-specific attributes
  tradingName?: string;
  creativeCategory?: string;
  dayRate?: number;
  currency?: string;
  gearCategories?: string;
  rentalTerms?: string;
  companyName?: string;
  tinNumber?: string;
  servicesOffered?: string;
}

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  outcome: 'SUCCESS' | 'REJECTED';
  details: string;
}

export default function App() {
  // --- AUTHENTICATION STATE ---
  // Mandatory Auth Flow: Starts unauthenticated (null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authScreen, setAuthScreen] = useState<'WELCOME' | 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'LEGAL_TERMS' | 'PROFILE_COMPLETION' | 'ADMIN_PORTAL'>('WELCOME');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Sign In inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Role Selection for Registration (Section 4)
  const [regRoleTab, setRegRoleTab] = useState<PublicRole>('CLIENT');

  // Shared Registration inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCountry, setRegCountry] = useState<'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA'>('TANZANIA');
  const [regCity, setRegCity] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Role-Specific Registration inputs
  // Client specific
  const [regClientBrand, setRegClientBrand] = useState('');

  // Freelancer specific
  const [regTradingName, setRegTradingName] = useState('');
  const [regCreativeCategory, setRegCreativeCategory] = useState('Director of Photography / Cinematographer');
  const [regSecondarySkills, setRegSecondarySkills] = useState('');
  const [regDayRate, setRegDayRate] = useState('1500000');
  const [regCurrency, setRegCurrency] = useState('TZS');
  const [regFreelancerBio, setRegFreelancerBio] = useState('');
  const [regPortfolioLink, setRegPortfolioLink] = useState('');

  // Equipment Owner specific
  const [regDispatchAddress, setRegDispatchAddress] = useState('');
  const [regGearTypes, setRegGearTypes] = useState('Cinema Cameras, Prime Lenses, Gimbals');
  const [regRentalTerms, setRegRentalTerms] = useState('Standard equipment hire agreement, 10% refundable security deposit required.');

  // Production Company specific
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regTinNumber, setRegTinNumber] = useState('');
  const [regContactPersonRole, setRegContactPersonRole] = useState('Head of Production');
  const [regCompanyServices, setRegCompanyServices] = useState('Full commercial video production, equipment rental packages, crew coordination');
  const [regCompanyBio, setRegCompanyBio] = useState('');

  // Profile Photo Manager State (Section 3)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [pendingPhoto, setPendingPhoto] = useState<{
    file: File;
    previewUrl: string;
    base64: string;
    sizeKb: number;
    name: string;
  } | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // App Navigation (Authenticated)
  const [currentScreen, setCurrentScreen] = useState<string>('HOME');
  const [countryFilter, setCountryFilter] = useState<Country>('ALL');
  // Persistent Language Preference (Directly synchronized from shared LanguageContext)
  const { lang, setLang, toggleLanguage } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  // Platform Real Stores (Zero Demo Data — Starts completely clean)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({});
  const [creatives, setCreatives] = useState<CreativeRecord[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modals & Sub-Flows
  const [bookingFilterTab, setBookingFilterTab] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Quotation Builder Modal
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [quoteItem1, setQuoteItem1] = useState('Camera package & DoP Day Rate');
  const [quoteCost1, setQuoteCost1] = useState('1800000');
  const [quoteItem2, setQuoteItem2] = useState('Aerial 8K ProRes Raw Scout');
  const [quoteCost2, setQuoteCost2] = useState('950000');
  const [quoteNotes, setQuoteNotes] = useState('Requires 4x4 location vehicle. Escrow held prior to dispatch.');
  const [quoteValidDate, setQuoteValidDate] = useState('2025-06-30');

  // Revision Request Dialog
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Dispute Filing Modal
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('Time-stamped set photos, gear return receipt');

  // Dedicated Booking & Gear Modals
  const [selectedCreativeForBooking, setSelectedCreativeForBooking] = useState<CreativeProfessional | null>(null);
  const [showBookCreativeModal, setShowBookCreativeModal] = useState(false);
  const [selectedGearForRental, setSelectedGearForRental] = useState<EquipmentItem | null>(null);
  const [showRentGearModal, setShowRentGearModal] = useState(false);
  const [showAddGearModal, setShowAddGearModal] = useState(false);
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
  const [createBookingInitialType, setCreateBookingInitialType] = useState<'CREATIVE_SERVICE' | 'EQUIPMENT_RENTAL'>('CREATIVE_SERVICE');

  // New Support Ticket Modal
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Marketplace Inquiry');
  const [ticketDesc, setTicketDesc] = useState('');

  // Support Ticket Detail Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyInput, setTicketReplyInput] = useState('');

  // Role Switch Dialog
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Administrator Portal & Admin Workspace State
  const [adminTab, setAdminTab] = useState<string>('OVERVIEW');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminPortalTab, setAdminPortalTab] = useState<'LOGIN' | 'PROVISIONING_GUIDE' | 'RESET_PASSWORD'>('LOGIN');
  const [adminLoginEmail, setAdminLoginEmail] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminPortalError, setAdminPortalError] = useState<string | null>(null);
  const [adminPortalSuccess, setAdminPortalSuccess] = useState<string | null>(null);
  const [adminResetActionableHelp, setAdminResetActionableHelp] = useState<string | null>(null);
  const [adminProvisionEmailInput, setAdminProvisionEmailInput] = useState('');
  const [adminProvisionPasswordInput, setAdminProvisionPasswordInput] = useState('');
  const [adminProvisionFullNameInput, setAdminProvisionFullNameInput] = useState('');
  const [adminResetEmailInput, setAdminResetEmailInput] = useState('');
  const [adminNewPasswordInput, setAdminNewPasswordInput] = useState('');
  const [adminConfirmPasswordInput, setAdminConfirmPasswordInput] = useState('');
  const [adminResetOobCode, setAdminResetOobCode] = useState('');
  const [adminResetModeTab, setAdminResetModeTab] = useState<'DISPATCH' | 'SET_NEW_PASSWORD'>('DISPATCH');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotActionableHelp, setForgotActionableHelp] = useState<string | null>(null);
  const [canProvisionAsInitial, setCanProvisionAsInitial] = useState(false);
  const [firebaseConfigStatus, setFirebaseConfigStatus] = useState<FirebaseConfigStatus | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isFirstAdminProvisioned: false,
    provisionedAdminEmail: null,
    designatedInitialAdminEmail: 'mmosesurio@gmail.com',
    firebaseProjectConfigured: false
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Synchronize Administrator Status, Database Collections & Firebase Config with Server Backend
  useEffect(() => {
    fetchAdminStatus().then(status => {
      setAdminStatus(status);
      if (status.designatedInitialAdminEmail) {
        if (!adminLoginEmail) setAdminLoginEmail(status.designatedInitialAdminEmail);
        if (!adminProvisionEmailInput) setAdminProvisionEmailInput(status.designatedInitialAdminEmail);
        if (!adminResetEmailInput) setAdminResetEmailInput(status.designatedInitialAdminEmail);
      }
    });

    getFirebaseConfigStatus().then(status => {
      setFirebaseConfigStatus(status);
    });

    // Fetch persistent marketplace collections from database
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setEquipmentList(data);
      })
      .catch(err => console.warn('Failed to load equipment from database:', err));

    fetch('/api/creatives')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCreatives(data);
      })
      .catch(err => console.warn('Failed to load creatives from database:', err));

    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(err => console.warn('Failed to load bookings from database:', err));

    // Handle password recovery action link (?mode=resetPassword&oobCode=...)
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');
        const oobCode = params.get('oobCode');
        if (mode === 'resetPassword') {
          setAuthScreen('ADMIN_PORTAL');
          setAdminPortalTab('RESET_PASSWORD');
          setAdminResetModeTab('SET_NEW_PASSWORD');
          if (oobCode) setAdminResetOobCode(oobCode);
        }
      }
    } catch {}

    // Restore authenticated sessions (Admin or Standard Marketplace Member)
    try {
      const savedAdminToken = localStorage.getItem('kazihub_admin_token');
      const savedAdminUserStr = localStorage.getItem('kazihub_admin_user');
      if (savedAdminToken && savedAdminUserStr) {
        const parsed = JSON.parse(savedAdminUserStr);
        if (parsed && (parsed.isAdmin || parsed.claims?.admin)) {
          setCurrentUser(parsed);
          setProfilePhotoUrl(parsed.profileImageUrl || null);
          return;
        }
      }

      const savedUserStr = localStorage.getItem('kazihub_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed) {
          setCurrentUser(parsed);
          setProfilePhotoUrl(parsed.profileImageUrl || null);
          // Refresh latest profile from backend database
          fetch(`/api/user/profile/${parsed.id || parsed.email}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.user) {
                setCurrentUser(data.user);
                setProfilePhotoUrl(data.user.profileImageUrl || null);
                localStorage.setItem('kazihub_user', JSON.stringify(data.user));
              }
            })
            .catch(() => {});
        }
      }
    } catch {}
  }, []);

  // Code Inspector Modal
  const [showInspector, setShowInspector] = useState(false);
  const [inspectorFile, setInspectorFile] = useState('RealUserRepository.kt');

  // --- AUTHENTICATION HANDLERS ---
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    const emailClean = loginEmail.trim().toLowerCase();

    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAuthError('Please provide a valid email address.');
      return;
    }
    if (loginPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Authentication failed. Please verify credentials.');
        return;
      }

      const user = data.user;
      setCurrentUser(user);
      setProfilePhotoUrl(user.profileImageUrl || null);
      try {
        localStorage.setItem('kazihub_user', JSON.stringify(user));
      } catch {}

      if (user.status === 'PENDING_PROFILE_COMPLETION' && !user.phoneNumber) {
        setCurrentScreen('PROFILE_SETTINGS');
      } else {
        setCurrentScreen('HOME');
      }
    } catch (err: any) {
      setAuthError('Network error connecting to login service. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = regEmail.trim().toLowerCase();
    const fullNameClean = regFullName.trim();

    if (!fullNameClean) {
      setAuthError('Full name / Representative name is required.');
      return;
    }
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please re-type password.');
      return;
    }
    if (registeredUsers.some(u => u.email.toLowerCase() === emailClean)) {
      setAuthError('An account with this email address already exists. Please sign in.');
      return;
    }

    // Role-specific validation
    if (regRoleTab === 'FREELANCER' && !regFreelancerBio.trim()) {
      setAuthError('Please provide a brief professional bio describing your creative experience.');
      return;
    }
    if (regRoleTab === 'EQUIPMENT_OWNER' && !regDispatchAddress.trim()) {
      setAuthError('Please provide a physical gear dispatch city/neighborhood address.');
      return;
    }
    if (regRoleTab === 'PRODUCTION_COMPANY' && !regCompanyName.trim()) {
      setAuthError('Registered Company / Studio Name is required for production entities.');
      return;
    }

    const newUserId = `usr_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: regRoleTab === 'PRODUCTION_COMPANY' ? regCompanyName : fullNameClean,
      email: emailClean,
      country: regCountry,
      city: regCity.trim() || `${regCountry} Hub`,
      phoneNumber: regPhone.trim(),
      roles: [regRoleTab],
      isAdmin: false, // STRICT ZERO-TRUST: Never administrator via registration
      activeRole: regRoleTab,
      bio:
        regRoleTab === 'FREELANCER'
          ? regFreelancerBio
          : regRoleTab === 'PRODUCTION_COMPANY'
          ? regCompanyBio || regCompanyServices
          : regRoleTab === 'EQUIPMENT_OWNER'
          ? `Equipment owner dispatching from ${regDispatchAddress || regCity}`
          : `Client organization: ${regClientBrand || fullNameClean}`,
      status: 'PENDING_PROFILE_COMPLETION',
      isIdentityVerified: false,
      // Metadata
      tradingName: regTradingName,
      creativeCategory: regCreativeCategory,
      dayRate: parseInt(regDayRate) || 0,
      currency: regCurrency,
      gearCategories: regGearTypes,
      rentalTerms: regRentalTerms,
      companyName: regCompanyName,
      tinNumber: regTinNumber,
      servicesOffered: regCompanyServices
    };

    // Persist new user to server database
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regRoleTab === 'PRODUCTION_COMPANY' ? regCompanyName : fullNameClean,
          email: emailClean,
          password: regPassword,
          role: regRoleTab,
          country: regCountry,
          city: regCity.trim() || `${regCountry} Hub`,
          phoneNumber: regPhone.trim()
        })
      });
      const data = await res.json();
      if (!res.ok && data.error === 'EMAIL_EXISTS') {
        setAuthError('An account with this email address already exists. Please sign in.');
        return;
      }
    } catch {}

    // Store credentials and user
    setUserCredentials(prev => ({ ...prev, [emailClean]: regPassword }));
    setRegisteredUsers(prev => [newUser, ...prev]);

    // Record audit log
    const audit: AuditLog = {
      id: `log_${Date.now()}`,
      action: 'USER_REGISTRATION',
      actor: emailClean,
      timestamp: new Date().toLocaleTimeString(),
      outcome: 'SUCCESS',
      details: `Registered as ${regRoleTab} from ${regCountry}`
    };
    setAuditLogs(prev => [audit, ...prev]);

    // Advance to mandatory photo completion
    setCurrentUser(newUser);
    try {
      localStorage.setItem('kazihub_user', JSON.stringify(newUser));
    } catch {}
    setProfilePhotoUrl(null);
    setAuthScreen('PROFILE_COMPLETION');
  };

  const handleCompleteProfileAndActivate = () => {
    if (!profilePhotoUrl) {
      setPhotoUploadError('Profile photo is mandatory before entering the KAZI HUB marketplace.');
      return;
    }
    if (!currentUser) return;

    const activatedUser: UserProfile = {
      ...currentUser,
      profileImageUrl: profilePhotoUrl,
      status: 'ACTIVE'
    };

    setCurrentUser(activatedUser);
    setRegisteredUsers(prev => prev.map(u => (u.id === activatedUser.id ? activatedUser : u)));
    try {
      localStorage.setItem('kazihub_user', JSON.stringify(activatedUser));
    } catch {}

    // Persist activated photo to server
    fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: activatedUser.id,
        email: activatedUser.email,
        name: activatedUser.name,
        profileImageUrl: profilePhotoUrl,
        country: activatedUser.country,
        city: activatedUser.city,
        phoneNumber: activatedUser.phoneNumber
      })
    }).catch(() => {});

    // If registered as Freelancer, register into creative directory
    if (activatedUser.roles.includes('FREELANCER')) {
      const creativeRec: CreativeRecord = {
        id: `cr_${activatedUser.id}`,
        userId: activatedUser.id,
        name: activatedUser.name,
        title: activatedUser.tradingName || activatedUser.creativeCategory || 'Creative Professional',
        category: activatedUser.creativeCategory || 'Cinematography',
        secondarySkills: activatedUser.servicesOffered,
        country: activatedUser.country,
        location: activatedUser.city || `${activatedUser.country} Hub`,
        rate: activatedUser.dayRate || 1200000,
        currency: activatedUser.currency || (activatedUser.country === 'KENYA' ? 'KES' : 'TZS'),
        bio: activatedUser.bio,
        avatarUrl: profilePhotoUrl,
        portfolioLinks: regPortfolioLink ? [regPortfolioLink] : [],
        isVerified: false
      };
      setCreatives(prev => [creativeRec, ...prev]);

      fetch('/api/creatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activatedUser.id,
          name: activatedUser.name,
          title: activatedUser.tradingName || activatedUser.creativeCategory || 'Creative Professional',
          category: activatedUser.creativeCategory || 'Cinematography',
          skills: [activatedUser.creativeCategory || 'Cinematography'],
          location: activatedUser.city || 'Arusha',
          country: activatedUser.country,
          rate: activatedUser.dayRate || 1200000,
          currency: activatedUser.currency || 'TZS',
          bio: activatedUser.bio,
          avatarUrl: profilePhotoUrl
        })
      }).catch(() => {});
    }

    setCurrentScreen('HOME');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfilePhotoUrl(null);
    try {
      localStorage.removeItem('kazihub_user');
      localStorage.removeItem('kazihub_admin_token');
      localStorage.removeItem('kazihub_admin_user');
    } catch {}
    setAuthScreen('WELCOME');
    setCurrentScreen('HOME');
  };

  // --- REAL PROFILE PHOTO SELECTION & PERSISTENT UPLOAD ---
  const handleSelectSamplePhoto = (url: string) => {
    setProfilePhotoUrl(url);
    setPendingPhoto(null);
    setPhotoUploadError(null);
    setPhotoUploadSuccess('Preset creative headshot selected! Click "Complete Activation" below to save.');
    if (currentUser) {
      setCurrentUser({ ...currentUser, profileImageUrl: url });
    }
  };

  const handleDeviceFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoUploadError(null);
    setPhotoUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type: JPEG, PNG, WebP
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setPhotoUploadError('Unsupported format. Please select a valid JPEG, PNG, or WebP photograph.');
      if (e.target) e.target.value = '';
      return;
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPhotoUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5MB.`);
      if (e.target) e.target.value = '';
      return;
    }

    // Read file as base64 data URL for preview & upload
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPendingPhoto({
        file,
        previewUrl: result,
        base64: result,
        sizeKb: Math.round(file.size / 1024),
        name: file.name
      });
      setPhotoUploadSuccess(`Selected: "${file.name}" (${Math.round(file.size / 1024)} KB). Tap "Save & Upload to Profile" to store persistently.`);
    };
    reader.onerror = () => {
      setPhotoUploadError('Could not read image file. Please try selecting again.');
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleUploadPendingPhoto = async () => {
    if (!pendingPhoto) return;
    if (!currentUser) {
      setPhotoUploadError('User authentication required before uploading profile photo.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadError(null);
    try {
      const response = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          imageBase64: pendingPhoto.base64,
          fileName: pendingPhoto.name,
          fileType: pendingPhoto.file.type
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Server failed to save photo.');
      }

      const persistentUrl = data.profileImageUrl;
      setProfilePhotoUrl(persistentUrl);
      const updatedUser: UserProfile = { ...currentUser, profileImageUrl: persistentUrl };
      setCurrentUser(updatedUser);
      setRegisteredUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      try {
        localStorage.setItem('kazihub_user', JSON.stringify(updatedUser));
      } catch {}

      setPendingPhoto(null);
      setPhotoUploadSuccess(`Profile photo uploaded & verified in persistent storage! (${(data.fileSize / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      setPhotoUploadError(err.message || 'Failed to upload photo. Please verify network and try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPendingPhoto = () => {
    setPendingPhoto(null);
    setPhotoUploadSuccess(null);
    setPhotoUploadError(null);
  };

  const handleRemovePhoto = () => {
    setProfilePhotoUrl(null);
    setPendingPhoto(null);
    if (currentUser) {
      const updatedUser = { ...currentUser, profileImageUrl: undefined };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('kazihub_user', JSON.stringify(updatedUser));
      } catch {}
    }
    setPhotoUploadSuccess(null);
    setPhotoUploadError('Profile picture removed. You must provide a valid photo to maintain an active profile.');
  };

  // --- GEAR & BOOKING ACTIONS ---
  const handleInitiateBooking = (title: string, providerName: string, providerId: string, type: 'CREATIVE_SERVICE' | 'EQUIPMENT_RENTAL', amount: number, cur: string) => {
    if (!currentUser) return;

    const ref = `KB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      reference: ref,
      type,
      title,
      clientName: currentUser.name,
      clientId: currentUser.id,
      providerName,
      providerId,
      providerRole: type === 'CREATIVE_SERVICE' ? 'Creative Professional' : 'Equipment Owner',
      scope: `Official contract for ${title}. Initiated through KAZI HUB marketplace.`,
      country: currentUser.country,
      location: currentUser.city || 'East Africa Hub',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      agreedAmount: amount,
      currency: cur,
      depositAmount: 0,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          time: new Date().toLocaleTimeString(),
          note: 'Booking requested by client. Waiting for line-item quotation.',
          actor: currentUser.name
        }
      ]
    };

    setBookings(prev => [newBooking, ...prev]);
    setSelectedBooking(newBooking);
    setCurrentScreen('BOOKING_CENTER');
  };

  // --- BOOKING LIFECYCLE HANDLERS ---
  const handleSendQuotation = () => {
    if (!selectedBooking) return;
    const c1 = parseInt(quoteCost1) || 0;
    const c2 = parseInt(quoteCost2) || 0;
    const total = c1 + c2;

    const newQuote = {
      items: [`${quoteItem1} (${selectedBooking.currency} ${quoteCost1})`, `${quoteItem2} (${selectedBooking.currency} ${quoteCost2})`],
      total,
      notes: quoteNotes,
      validUntil: quoteValidDate,
      isAccepted: false
    };

    const updated: Booking = {
      ...selectedBooking,
      status: 'QUOTATION_SUBMITTED',
      agreedAmount: total,
      quotation: newQuote,
      history: [
        ...selectedBooking.history,
        {
          status: 'QUOTATION_SUBMITTED',
          time: 'Just now',
          note: `Official line-item quotation sent: ${selectedBooking.currency} ${total.toLocaleString()}`,
          actor: currentUser?.name || 'Service Provider'
        }
      ]
    };

    setBookings(bookings.map(b => (b.id === updated.id ? updated : b)));
    setSelectedBooking(updated);
    setShowQuoteBuilder(false);
  };

  const handleAcceptQuote = (bId: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bId) {
          return {
            ...b,
            status: 'CONFIRMED',
            quotation: b.quotation ? { ...b.quotation, isAccepted: true } : undefined,
            history: [
              ...b.history,
              { status: 'CONFIRMED', time: 'Just now', note: 'Quotation accepted. Escrow hold scheduled.', actor: currentUser?.name || 'Client' }
            ]
          };
        }
        return b;
      })
    );
    if (selectedBooking && selectedBooking.id === bId) {
      setSelectedBooking(prev => prev ? ({
        ...prev,
        status: 'CONFIRMED',
        quotation: prev.quotation ? { ...prev.quotation, isAccepted: true } : undefined,
        history: [
          ...prev.history,
          { status: 'CONFIRMED', time: 'Just now', note: 'Quotation accepted. Escrow hold scheduled.', actor: currentUser?.name || 'Client' }
        ]
      }) : null);
    }
  };

  const handleRequestRevisions = () => {
    if (!selectedBooking || !revisionNotes.trim()) return;
    const updated: Booking = {
      ...selectedBooking,
      status: 'PENDING',
      quotation: selectedBooking.quotation ? { ...selectedBooking.quotation, revisionNotes } : undefined,
      history: [
        ...selectedBooking.history,
        { status: 'PENDING', time: 'Just now', note: `Client requested revisions: "${revisionNotes}"`, actor: currentUser?.name || 'Client' }
      ]
    };
    setBookings(bookings.map(b => (b.id === updated.id ? updated : b)));
    setSelectedBooking(updated);
    setShowRevisionModal(false);
    setRevisionNotes('');
  };

  const handleConfirmHandover = (bId: string) => {
    if (!selectedBooking) return;
    const updated: Booking = {
      ...selectedBooking,
      status: 'IN_PROGRESS',
      handoverReport: { checklistNotes: 'Pre-shoot optical & functional inspection signed off.', time: 'Just now' },
      history: [
        ...selectedBooking.history,
        { status: 'IN_PROGRESS', time: 'Just now', note: 'Pre-shoot gear check-in complete. Production active on set.', actor: currentUser?.name || 'Operator' }
      ]
    };
    setBookings(bookings.map(b => (b.id === bId ? updated : b)));
    setSelectedBooking(updated);
  };

  const handleMarkDelivered = (bId: string) => {
    if (!selectedBooking) return;
    const updated: Booking = {
      ...selectedBooking,
      status: 'AWAITING_COMPLETION',
      completionReport: { deliverablesSummary: 'All camera media offloaded & gear returned in mint condition.', driveRef: 'SSD-WRAP-01', time: 'Just now' },
      history: [
        ...selectedBooking.history,
        { status: 'AWAITING_COMPLETION', time: 'Just now', note: 'Work delivered / Gear returned. Awaiting client final sign-off.', actor: currentUser?.name || 'Provider' }
      ]
    };
    setBookings(bookings.map(b => (b.id === bId ? updated : b)));
    setSelectedBooking(updated);
  };

  const handleFinalSignOff = (bId: string) => {
    if (!selectedBooking) return;
    const updated: Booking = {
      ...selectedBooking,
      status: 'COMPLETED',
      history: [
        ...selectedBooking.history,
        { status: 'COMPLETED', time: 'Just now', note: 'Client verified deliverables. Escrow funds released.', actor: currentUser?.name || 'Client' }
      ]
    };
    setBookings(bookings.map(b => (b.id === bId ? updated : b)));
    setSelectedBooking(updated);
  };

  const handleRaiseDispute = () => {
    if (!selectedBooking || !disputeReason.trim()) return;
    const updated: Booking = {
      ...selectedBooking,
      status: 'DISPUTED',
      dispute: {
        reason: disputeReason,
        raisedBy: currentUser?.name || 'Party',
        time: 'Just now',
        evidence: [disputeEvidence, 'In-app chat transcripts'],
        assignedStaff: 'KAZI Hub East Africa Legal Mediation Desk'
      },
      history: [
        ...selectedBooking.history,
        { status: 'DISPUTED', time: 'Just now', note: `Formal dispute raised: ${disputeReason}. Escrow frozen.`, actor: currentUser?.name || 'Party' }
      ]
    };
    setBookings(bookings.map(b => (b.id === updated.id ? updated : b)));
    setSelectedBooking(updated);
    setShowDisputeModal(false);
    setDisputeReason('');
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string, note: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note,
          actor: currentUser?.name || 'Equipment Owner / Provider',
          actorId: currentUser?.id,
          actorRole: currentUser?.activeRole
        })
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings(prev => prev.map(b => (b.id === bookingId ? data.booking : b)));
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking(data.booking);
        }
        return;
      }
    } catch (err) {
      console.warn('Server status update fallback:', err);
    }

    // Fallback local update
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const updated = {
            ...b,
            status: newStatus as any,
            history: [
              ...(b.history || []),
              {
                status: newStatus,
                time: new Date().toLocaleTimeString(),
                note,
                actor: currentUser?.name || 'Equipment Owner'
              }
            ]
          };
          if (selectedBooking?.id === bookingId) {
            setSelectedBooking(updated as any);
          }
          return updated as any;
        }
        return b;
      })
    );
  };

  // --- SUPPORT TICKETS ---
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !currentUser) return;

    const ref = `TK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      reference: ref,
      category: ticketCategory,
      subject: ticketSubject,
      description: ticketDesc,
      status: 'OPEN',
      user: currentUser.name,
      createdAt: 'Just now',
      responses: [
        {
          id: '1',
          author: currentUser.name,
          isStaff: false,
          text: ticketDesc,
          time: 'Just now'
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setShowAddTicketModal(false);
    setTicketSubject('');
    setTicketDesc('');
  };

  const handleAddTicketReply = () => {
    if (!selectedTicket || !ticketReplyInput.trim() || !currentUser) return;
    const newReply = {
      id: `rep_${Date.now()}`,
      author: currentUser.name,
      isStaff: currentUser.isAdmin,
      text: ticketReplyInput,
      time: 'Just now'
    };

    const updated = {
      ...selectedTicket,
      responses: [...selectedTicket.responses, newReply],
      status: currentUser.isAdmin ? ('WAITING_FOR_USER' as TicketStatus) : ('IN_PROGRESS' as TicketStatus)
    };

    setTickets(tickets.map(t => (t.id === updated.id ? updated : t)));
    setSelectedTicket(updated);
    setTicketReplyInput('');
  };

  // --- ADMINISTRATOR PORTAL & SERVER CLAIMS HANDLERS ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPortalError(null);
    setAdminPortalSuccess(null);
    setCanProvisionAsInitial(false);

    const emailClean = adminLoginEmail.trim().toLowerCase();
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAdminPortalError('Please enter a valid administrator email address.');
      return;
    }
    if (adminLoginPassword.length < 6) {
      setAdminPortalError('Master password must be at least 6 characters.');
      return;
    }

    setIsAdminLoading(true);

    try {
      const result = await adminSignIn(emailClean, adminLoginPassword);
      setIsAdminLoading(false);

      if (result.success && result.user) {
        // Successful Administrator Sign In
        setCurrentUser(result.user);
        setProfilePhotoUrl(result.user.profileImageUrl || null);
        setCurrentScreen('ADMIN_WORKSPACE');
        setAdminTab('OVERVIEW');
        setAdminStatus(prev => ({
          ...prev,
          isFirstAdminProvisioned: true,
          provisionedAdminEmail: result.user.email
        }));
        try {
          localStorage.setItem('kazihub_admin_token', result.token || '');
          localStorage.setItem('kazihub_admin_user', JSON.stringify(result.user));
        } catch {}

        const audit: AuditLog = {
          id: `log_${Date.now()}`,
          action: 'ADMIN_SIGN_IN',
          actor: result.user.email,
          timestamp: new Date().toLocaleTimeString(),
          outcome: 'SUCCESS',
          details: 'Administrator authenticated with server-managed Firebase Admin custom claims ({ admin: true })'
        };
        setAuditLogs(prev => [audit, ...prev]);
        return;
      }

      // Handle specific diagnostic error categories
      if (result.error === 'ADMIN_CLAIM_MISSING') {
        // EXACT PROMPT REQUIREMENT:
        setAdminPortalError('Authentication successful, but administrator access has not been provisioned. Follow the secure initial administrator setup instructions.');
        if (result.canProvisionAsInitial) {
          setCanProvisionAsInitial(true);
        }
      } else if (result.error === 'EMAIL_NOT_FOUND') {
        setAdminPortalError(`Authentication failed: No registered account found for "${emailClean}". Administrator accounts must be registered before server claims can be verified.`);
        if (result.canProvisionAsInitial) {
          setCanProvisionAsInitial(true);
        }
      } else if (result.error === 'INVALID_PASSWORD') {
        setAdminPortalError('Authentication failed: Incorrect password for this administrator account. Please verify your credentials or use the password reset link below.');
      } else {
        setAdminPortalError(result.message || 'Administrator authorization failed.');
      }
    } catch (err: any) {
      setIsAdminLoading(false);
      setAdminPortalError('Unable to connect to authorization server. Please try again.');
    }
  };

  const handleProvisionInitialAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPortalError(null);
    setAdminPortalSuccess(null);

    const emailClean = adminProvisionEmailInput.trim().toLowerCase();
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAdminPortalError('Please enter a valid administrator email address.');
      return;
    }
    if (adminProvisionPasswordInput.length < 6) {
      setAdminPortalError('Master password must be at least 6 characters.');
      return;
    }

    setIsAdminLoading(true);

    try {
      const result = await provisionInitialAdmin(
        emailClean,
        adminProvisionPasswordInput,
        adminProvisionFullNameInput || 'Platform Administrator'
      );
      setIsAdminLoading(false);

      if (result.success && result.user) {
        setAdminStatus(prev => ({
          ...prev,
          isFirstAdminProvisioned: true,
          provisionedAdminEmail: result.user.email
        }));
        setAdminPortalSuccess(`Success: Initial administrator "${emailClean}" has been provisioned with server custom claims ({ admin: true }). Initial bootstrap is now permanently locked.`);
        
        // Authorize and navigate to admin workspace directly
        setCurrentUser(result.user);
        setProfilePhotoUrl(result.user.profileImageUrl || null);
        setCurrentScreen('ADMIN_WORKSPACE');
        setAdminTab('OVERVIEW');

        try {
          localStorage.setItem('kazihub_admin_token', result.token || '');
          localStorage.setItem('kazihub_admin_user', JSON.stringify(result.user));
        } catch {}

        const audit: AuditLog = {
          id: `log_${Date.now()}`,
          action: 'INITIAL_ADMIN_PROVISIONED',
          actor: result.user.email,
          timestamp: new Date().toLocaleTimeString(),
          outcome: 'SUCCESS',
          details: 'Initial administrator provisioned via secure server endpoint and claims locked'
        };
        setAuditLogs(prev => [audit, ...prev]);
        return;
      }

      setAdminPortalError(result.message || 'Provisioning failed.');
    } catch (err: any) {
      setIsAdminLoading(false);
      setAdminPortalError('Unable to complete provisioning. Server communication failed.');
    }
  };

  const handleAdminPasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPortalError(null);
    setAdminPortalSuccess(null);
    setAdminResetActionableHelp(null);

    const emailClean = (adminResetEmailInput || adminLoginEmail).trim().toLowerCase();
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAdminPortalError('Please provide a valid administrator email address.');
      return;
    }

    setIsAdminLoading(true);
    const result = await requestPasswordReset(emailClean);
    setIsAdminLoading(false);

    if (result.success) {
      setAdminPortalSuccess(result.message);
      setAdminResetActionableHelp(null);
    } else {
      setAdminPortalError(result.message);
      if (result.actionableHelp) {
        setAdminResetActionableHelp(result.actionableHelp);
      }
    }
  };

  const handleAdminConfirmNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPortalError(null);
    setAdminPortalSuccess(null);
    setAdminResetActionableHelp(null);

    const emailClean = (adminResetEmailInput || adminLoginEmail).trim().toLowerCase();
    if (adminNewPasswordInput.length < 6) {
      setAdminPortalError('New master password must be at least 6 characters.');
      return;
    }
    if (adminNewPasswordInput !== adminConfirmPasswordInput) {
      setAdminPortalError('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsAdminLoading(true);
    const result = await confirmPasswordResetService(emailClean, adminNewPasswordInput, adminResetOobCode);
    setIsAdminLoading(false);

    if (result.success) {
      setAdminPortalSuccess(`${result.message} Please proceed with administrator sign-in.`);
      setAdminLoginPassword(adminNewPasswordInput);
      setAdminLoginEmail(emailClean);
      setAdminNewPasswordInput('');
      setAdminConfirmPasswordInput('');
      setAdminResetModeTab('DISPATCH');
      setAdminPortalTab('LOGIN');
    } else {
      setAdminPortalError(result.message);
    }
  };

  const handleGeneralForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setForgotActionableHelp(null);

    const emailClean = loginEmail.trim().toLowerCase();
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsForgotLoading(true);
    const result = await requestPasswordReset(emailClean);
    setIsForgotLoading(false);

    if (result.success) {
      setAuthSuccessMsg(result.message);
    } else {
      setAuthError(result.message);
      if (result.actionableHelp) {
        setForgotActionableHelp(result.actionableHelp);
      }
    }
  };

  const handleSuspendUser = (userId: string, reason: string) => {
    setRegisteredUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'SUSPENDED', suspensionReason: reason };
        }
        return u;
      })
    );
    const audit: AuditLog = {
      id: `log_${Date.now()}`,
      action: 'USER_SUSPENDED',
      actor: currentUser?.email || 'admin',
      timestamp: new Date().toLocaleTimeString(),
      outcome: 'SUCCESS',
      details: `Suspended user ${userId}: ${reason}`
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const handleReactivateUser = (userId: string) => {
    setRegisteredUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          return { ...u, status: 'ACTIVE', suspensionReason: undefined };
        }
        return u;
      })
    );
    const audit: AuditLog = {
      id: `log_${Date.now()}`,
      action: 'USER_REACTIVATED',
      actor: currentUser?.email || 'admin',
      timestamp: new Date().toLocaleTimeString(),
      outcome: 'SUCCESS',
      details: `Reactivated user ${userId}`
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (bookingFilterTab === 'ALL') return true;
    return b.status === bookingFilterTab;
  });

  return (
    <div className="flex h-screen w-screen bg-[#080B14] text-[#F5F3EE] font-sans overflow-hidden">
      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Device Frame */}
        <div className="relative w-full max-w-[430px] h-full max-h-[920px] bg-[#080B14] border border-[#262C3D] rounded-[36px] shadow-2xl flex flex-col overflow-hidden">
          
          {/* Top Status Bar */}
          <div className="h-8 bg-[#080B14] border-b border-[#171A24] px-6 flex items-center justify-between text-xs text-[#A6ADBB] select-none shrink-0">
            <span className="font-semibold text-xs tracking-wider">09:41</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[#D6AD62] font-semibold">5G • EA-NET</span>
              <span>100%</span>
            </div>
          </div>

          {/* APP HEADER */}
          <div className="bg-[#111827] border-b border-[#232838] px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {currentUser && currentScreen !== 'HOME' && (
                <button
                  onClick={() => setCurrentScreen('HOME')}
                  className="p-1 hover:bg-[#171A24] rounded-lg text-[#D6AD62]"
                  title="Back to Home"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#D6AD62] tracking-wider text-base">KAZI HUB</span>
                  {currentUser && (
                    <button
                      onClick={() => setShowRoleDialog(true)}
                      className="bg-[#171A24] hover:bg-[#232838] border border-[#D6AD62]/40 text-[#D6AD62] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                      title="Switch Authorized Public Role"
                    >
                      <span>{currentUser.activeRole}</span>
                      <span className="text-[8px]">▾</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#A6ADBB]">
                  {currentUser ? `${currentUser.name} • ${currentUser.country}` : 'East Africa Cinema & Talent Marketplace'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleLanguage}
                className="bg-[#171A24] hover:bg-[#232838] border border-[#262C3D] px-2 py-1 rounded text-xs font-bold text-[#D6AD62] flex items-center gap-1"
                title={lang === 'SW' ? 'Badili Lugha (EN / SW)' : 'Toggle Language (EN / SW)'}
              >
                <Globe size={11} />
                {lang}
              </button>
              {currentUser && (
                <>
                  <button
                    onClick={() => setCurrentScreen('CUSTOMER_CARE')}
                    className={`p-1.5 bg-[#171A24] border border-[#262C3D] hover:bg-[#232838] rounded-full ${currentScreen === 'CUSTOMER_CARE' ? 'text-[#D6AD62] border-[#D6AD62]' : 'text-[#F5F3EE]'}`}
                    title="Help & Customer Care"
                  >
                    <Headphones size={13} />
                  </button>
                  <button
                    onClick={() => setCurrentScreen('NOTIFICATIONS')}
                    className="p-1.5 bg-[#171A24] border border-[#262C3D] hover:bg-[#232838] rounded-full text-[#F5F3EE] relative"
                    title="Notifications"
                  >
                    <Bell size={13} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 bg-[#171A24] border border-red-500/30 hover:bg-red-950/40 rounded-full text-red-400"
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SCREEN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

            {/* ========================================================= */}
            {/* 1. UNAUTHENTICATED FLOW (Section 1) */}
            {/* ========================================================= */}
            {!currentUser && (
              <div className="space-y-4">
                {/* WELCOME / ONBOARDING */}
                {authScreen === 'WELCOME' && (
                  <div className="py-4 space-y-5 flex flex-col justify-between min-h-[580px]">
                    <div className="space-y-3">
                      <div className="inline-block bg-[#171A24] border border-[#D6AD62]/40 px-2.5 py-1 rounded-full text-[10px] text-[#D6AD62] font-bold">
                        EAST AFRICA CINEMA &amp; CREATIVE NETWORK
                      </div>
                      <h1 className="text-2xl font-bold text-[#F5F3EE] leading-tight">
                        {lang === 'SW' ? 'Kuinua Kiwango cha Sinema na Vifaa Afrika Mashariki' : 'The Premier Creative & Cinema Gear Network'}
                      </h1>
                      <p className="text-xs text-[#A6ADBB] leading-relaxed">
                        Directly hire vetted Directors of Photography, drone pilots, sound recordists, and cinema packages across Tanzania, Kenya, Uganda, and Rwanda.
                      </p>
                      
                      <div className="flex gap-2 pt-2">
                        {['TZ • TZS', 'KE • KES', 'UG • UGX', 'RW • RWF'].map(hub => (
                          <span key={hub} className="bg-[#171A24] border border-[#262C3D] text-[10px] text-[#D6AD62] px-2 py-1 rounded font-semibold">
                            {hub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Backend Status Card */}
                    <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Cloud size={14} className="text-[#D6AD62]" />
                        <span className="font-bold text-[#D6AD62] text-[11px]">Backend Infrastructure Status</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-[#A6ADBB]">
                        <div className="flex justify-between">
                          <span>Firebase Auth:</span>
                          <span className="text-amber-400 font-medium">Ready (Pending Cloud Setup)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Firestore Blueprint:</span>
                          <span className="text-emerald-400 font-medium">Configured (firestore.rules)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage (Avatars):</span>
                          <span className="text-[#D6AD62] font-medium">Local Device Caching</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <button
                        onClick={() => {
                          setAuthError(null);
                          setAuthScreen('SIGNUP');
                        }}
                        className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                      >
                        Create Account / Register <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setAuthError(null);
                          setAuthScreen('LOGIN');
                        }}
                        className="w-full bg-[#171A24] hover:bg-[#232838] border border-[#D6AD62]/40 text-[#D6AD62] font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                      >
                        Sign In to Existing Account
                      </button>

                      {/* ADMINISTRATOR PORTAL SECTION */}
                      <div className="bg-[#101420]/90 border border-[#D6AD62]/40 rounded-xl p-3.5 space-y-2.5 shadow-md">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#D6AD62]/15 border border-[#D6AD62]/30 flex items-center justify-center text-[#D6AD62] shrink-0 mt-0.5">
                            <Shield size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-[#F5F3EE]">Administrator Portal</h3>
                              <span className="text-[9px] bg-[#D6AD62]/20 text-[#D6AD62] border border-[#D6AD62]/30 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">RESTRICTED</span>
                            </div>
                            <p className="text-[11px] text-[#A6ADBB] mt-0.5 leading-snug">
                              Authorized platform administrators only.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAuthError(null);
                            setAdminAuthError(null);
                            setAdminPortalError(null);
                            setAdminPortalSuccess(null);
                            setAuthScreen('ADMIN_PORTAL');
                          }}
                          className="w-full bg-[#171A24] hover:bg-[#202534] border border-[#D6AD62]/50 hover:border-[#D6AD62] text-[#F5F3EE] font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
                        >
                          <ShieldCheck size={14} className="text-[#D6AD62]" />
                          <span>Admin Sign In / Setup</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setAuthScreen('LEGAL_TERMS')}
                        className="w-full text-center text-[11px] text-[#A6ADBB] hover:text-[#D6AD62] pt-2"
                      >
                        Legal Terms, Escrow Policy &amp; Platform Guidelines
                      </button>
                    </div>
                  </div>
                )}

                {/* SIGN IN */}
                {authScreen === 'LOGIN' && (
                  <div className="space-y-4 py-2">
                    <button
                      onClick={() => setAuthScreen('WELCOME')}
                      className="text-xs text-[#D6AD62] flex items-center gap-1 font-semibold"
                    >
                      ← Back
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-[#F5F3EE]">Sign In to KAZI HUB</h2>
                      <p className="text-xs text-[#A6ADBB]">Enter your registered credentials to access your marketplace workspace.</p>
                    </div>

                    {authError && (
                      <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-300">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authSuccessMsg && (
                      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-300">
                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                        <span>{authSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[#A6ADBB] mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="e.g. director@swahilicine.tz"
                          required
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2.5 text-[#F5F3EE] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[#A6ADBB] mb-1">Password *</label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2.5 text-[#F5F3EE] outline-none"
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError(null);
                            setAuthScreen('FORGOT_PASSWORD');
                          }}
                          className="text-[#D6AD62] hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-3 rounded-xl transition"
                      >
                        Sign In
                      </button>
                    </form>

                    <div className="text-center pt-2">
                      <span className="text-xs text-[#A6ADBB]">Don't have an account yet? </span>
                      <button
                        onClick={() => {
                          setAuthError(null);
                          setAuthScreen('SIGNUP');
                        }}
                        className="text-xs text-[#D6AD62] font-bold hover:underline"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}

                {/* SIGN UP (Role-Specific Onboarding — Section 4) */}
                {authScreen === 'SIGNUP' && (
                  <div className="space-y-3 py-2">
                    <button
                      onClick={() => setAuthScreen('WELCOME')}
                      className="text-xs text-[#D6AD62] flex items-center gap-1 font-semibold"
                    >
                      ← Back
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-[#F5F3EE]">Create KAZI HUB Account</h2>
                      <p className="text-xs text-[#A6ADBB]">Select your role to complete customized marketplace onboarding.</p>
                    </div>

                    {/* Role Tabs Selector */}
                    <div className="grid grid-cols-2 gap-1.5 bg-[#171A24] p-1.5 rounded-xl border border-[#262C3D] text-[11px]">
                      <button
                        type="button"
                        onClick={() => setRegRoleTab('CLIENT')}
                        className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                          regRoleTab === 'CLIENT' ? 'bg-[#D6AD62] text-[#080B14]' : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                        }`}
                      >
                        <Briefcase size={12} /> Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRoleTab('FREELANCER')}
                        className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                          regRoleTab === 'FREELANCER' ? 'bg-[#D6AD62] text-[#080B14]' : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                        }`}
                      >
                        <Video size={12} /> Freelancer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRoleTab('EQUIPMENT_OWNER')}
                        className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                          regRoleTab === 'EQUIPMENT_OWNER' ? 'bg-[#D6AD62] text-[#080B14]' : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                        }`}
                      >
                        <Sliders size={12} /> Gear Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRoleTab('PRODUCTION_COMPANY')}
                        className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                          regRoleTab === 'PRODUCTION_COMPANY' ? 'bg-[#D6AD62] text-[#080B14]' : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                        }`}
                      >
                        <Building size={12} /> Production Co
                      </button>
                    </div>

                    {authError && (
                      <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-300">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-2.5 text-xs">
                      {/* Common: Country */}
                      <div>
                        <label className="block text-[#A6ADBB] mb-1">Primary Operational Country *</label>
                        <select
                          value={regCountry}
                          onChange={e => setRegCountry(e.target.value as any)}
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                        >
                          <option value="TANZANIA">Tanzania (TZS - Shilingi)</option>
                          <option value="KENYA">Kenya (KES - Shilling)</option>
                          <option value="UGANDA">Uganda (UGX - Shilling)</option>
                          <option value="RWANDA">Rwanda (RWF - Franc)</option>
                        </select>
                      </div>

                      {/* Common: Full Name / Rep Name */}
                      <div>
                        <label className="block text-[#A6ADBB] mb-1">
                          {regRoleTab === 'PRODUCTION_COMPANY' ? 'Authorized Representative Name *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          value={regFullName}
                          onChange={e => setRegFullName(e.target.value)}
                          placeholder="e.g. Kelvin Mugisha"
                          required
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                        />
                      </div>

                      {/* Common: Email & Phone */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#A6ADBB] mb-1">Email *</label>
                          <input
                            type="email"
                            value={regEmail}
                            onChange={e => setRegEmail(e.target.value)}
                            placeholder="user@network.ea"
                            required
                            className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[#A6ADBB] mb-1">
                            {lang === 'SW' ? 'Nambari ya Simu *' : 'Phone Number *'}
                          </label>
                          <div className="flex">
                            <span className="bg-[#111827] border border-r-0 border-[#262C3D] px-2.5 py-2 rounded-l-xl text-[#D6AD62] font-bold text-xs flex items-center">
                              {regCountry === 'TANZANIA' ? '+255' : regCountry === 'KENYA' ? '+254' : regCountry === 'UGANDA' ? '+256' : '+250'}
                            </span>
                            <input
                              type="tel"
                              value={regPhone}
                              onChange={e => setRegPhone(e.target.value)}
                              placeholder={regCountry === 'RWANDA' ? '782 345 678' : '712 345 678'}
                              className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-r-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Common: City / Territory */}
                      <div>
                        <label className="block text-[#A6ADBB] mb-1">Primary City / Hub *</label>
                        <input
                          type="text"
                          value={regCity}
                          onChange={e => setRegCity(e.target.value)}
                          placeholder="e.g. Dar es Salaam, Nairobi, Kampala, or Kigali"
                          required
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                        />
                      </div>

                      {/* ROLE-SPECIFIC FIELDS */}
                      {regRoleTab === 'CLIENT' && (
                        <div className="bg-[#111827] p-2.5 rounded-xl border border-[#262C3D] space-y-2">
                          <span className="font-bold text-[#D6AD62] text-[11px] block">Client Organization Details</span>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Brand or Company Name (Optional)</label>
                            <input
                              type="text"
                              value={regClientBrand}
                              onChange={e => setRegClientBrand(e.target.value)}
                              placeholder="e.g. Serengeti Media Agency"
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {regRoleTab === 'FREELANCER' && (
                        <div className="bg-[#111827] p-2.5 rounded-xl border border-[#262C3D] space-y-2">
                          <span className="font-bold text-[#D6AD62] text-[11px] block">Creative Professional Details</span>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Professional / Trading Name</label>
                            <input
                              type="text"
                              value={regTradingName}
                              onChange={e => setRegTradingName(e.target.value)}
                              placeholder="e.g. Swahili Coast Cinematics"
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Primary Creative Category *</label>
                            <select
                              value={regCreativeCategory}
                              onChange={e => setRegCreativeCategory(e.target.value)}
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            >
                              <option value="Cinematographer / DoP">Cinematographer / DoP</option>
                              <option value="Commercial & Editorial Photographer">Commercial Photographer</option>
                              <option value="Certified Drone Pilot / Aerial">Certified Drone Pilot / Aerial</option>
                              <option value="Location Sound Recordist">Location Sound Recordist</option>
                              <option value="Director & Storyteller">Director &amp; Storyteller</option>
                              <option value="Colorist & Post-Production">Colorist &amp; Post-Production</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#A6ADBB] mb-1">Indicative Day Rate</label>
                              <input
                                type="number"
                                value={regDayRate}
                                onChange={e => setRegDayRate(e.target.value)}
                                placeholder="1500000"
                                className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A6ADBB] mb-1">Currency</label>
                              <select
                                value={regCurrency}
                                onChange={e => setRegCurrency(e.target.value)}
                                className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                              >
                                <option value="TZS">TZS</option>
                                <option value="KES">KES</option>
                                <option value="UGX">UGX</option>
                                <option value="RWF">RWF</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Professional Bio *</label>
                            <textarea
                              value={regFreelancerBio}
                              onChange={e => setRegFreelancerBio(e.target.value)}
                              placeholder="Describe your camera sensors, gear packages, and years on set..."
                              rows={2}
                              required
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Portfolio Link / Showreel URL</label>
                            <input
                              type="url"
                              value={regPortfolioLink}
                              onChange={e => setRegPortfolioLink(e.target.value)}
                              placeholder="https://vimeo.com/... or https://instagram.com/..."
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {regRoleTab === 'EQUIPMENT_OWNER' && (
                        <div className="bg-[#111827] p-2.5 rounded-xl border border-[#262C3D] space-y-2">
                          <span className="font-bold text-[#D6AD62] text-[11px] block">Gear Owner &amp; Dispatch Details</span>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Dispatch / Studio Location *</label>
                            <input
                              type="text"
                              value={regDispatchAddress}
                              onChange={e => setRegDispatchAddress(e.target.value)}
                              placeholder="e.g. Westlands Commercial Center, Nairobi"
                              required
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Gear Categories Available</label>
                            <input
                              type="text"
                              value={regGearTypes}
                              onChange={e => setRegGearTypes(e.target.value)}
                              placeholder="e.g. RED, ARRI, Cooke Primes, Wireless Transmitters"
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Rental Terms &amp; Security Deposit Overview</label>
                            <input
                              type="text"
                              value={regRentalTerms}
                              onChange={e => setRegRentalTerms(e.target.value)}
                              placeholder="e.g. Pre-checkout optical check, passport hold, deposit required"
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {regRoleTab === 'PRODUCTION_COMPANY' && (
                        <div className="bg-[#111827] p-2.5 rounded-xl border border-[#262C3D] space-y-2">
                          <span className="font-bold text-[#D6AD62] text-[11px] block">Company &amp; Legal Entity Information</span>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Registered Company Name *</label>
                            <input
                              type="text"
                              value={regCompanyName}
                              onChange={e => setRegCompanyName(e.target.value)}
                              placeholder="e.g. Great Lakes Cinema Studios Ltd"
                              required
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[#A6ADBB] mb-1">TIN / Reg Number</label>
                              <input
                                type="text"
                                value={regTinNumber}
                                onChange={e => setRegTinNumber(e.target.value)}
                                placeholder="104-992-881"
                                className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[#A6ADBB] mb-1">Contact Role</label>
                              <input
                                type="text"
                                value={regContactPersonRole}
                                onChange={e => setRegContactPersonRole(e.target.value)}
                                placeholder="Executive Producer"
                                className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[#A6ADBB] mb-1">Services Offered</label>
                            <input
                              type="text"
                              value={regCompanyServices}
                              onChange={e => setRegCompanyServices(e.target.value)}
                              placeholder="e.g. Turnkey commercials, fixer services, film permits"
                              className="w-full bg-[#171A24] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Password & Confirm */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#A6ADBB] mb-1">Password (Min 6) *</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[#A6ADBB] mb-1">Confirm Password *</label>
                          <input
                            type="password"
                            value={regConfirmPassword}
                            onChange={e => setRegConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-2 bg-[#171A24] border border-[#262C3D] rounded-xl text-[10px] text-[#A6ADBB]">
                        <span className="text-[#D6AD62] font-bold block mb-0.5">Mandatory Profile Verification Notice:</span>
                        A valid profile picture is required in Step 2 before entering the marketplace. Administrator privileges cannot be requested through registration.
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        Proceed to Profile Photo Upload <ArrowRight size={14} />
                      </button>
                    </form>
                  </div>
                )}

                {/* FORGOT PASSWORD */}
                {authScreen === 'FORGOT_PASSWORD' && (
                  <div className="space-y-4 py-4">
                    <button
                      onClick={() => {
                        setAuthScreen('LOGIN');
                        setAuthError(null);
                        setAuthSuccessMsg(null);
                        setForgotActionableHelp(null);
                      }}
                      className="text-xs text-[#D6AD62] flex items-center gap-1 font-semibold"
                    >
                      ← Back to Login
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-[#F5F3EE]">Password Recovery</h2>
                      <p className="text-xs text-[#A6ADBB]">Enter your email to receive password reset instructions via Firebase Authentication.</p>
                    </div>

                    {authSuccessMsg && (
                      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>{authSuccessMsg}</div>
                      </div>
                    )}

                    {authError && (
                      <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-xs text-red-300 space-y-1.5">
                        <div className="flex items-start gap-2 font-semibold">
                          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
                          <span>{authError}</span>
                        </div>
                        {forgotActionableHelp && (
                          <div className="text-[11px] text-zinc-300 bg-[#0B0F19] p-2.5 rounded border border-red-900/50 mt-1">
                            <span className="font-bold text-[#D6AD62] block mb-0.5">Recommended Configuration:</span>
                            {forgotActionableHelp}
                          </div>
                        )}
                      </div>
                    )}

                    <form onSubmit={handleGeneralForgotPasswordSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#A6ADBB] mb-1">Registered Email *</label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="your.email@domain.com"
                          required
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2.5 text-[#F5F3EE] outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isForgotLoading}
                        className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        <span>{isForgotLoading ? 'Dispatching Instructions...' : 'Send Reset Instructions'}</span>
                      </button>
                    </form>

                    <div className="bg-[#111827] border border-[#232838] rounded-xl p-3 text-[11px] text-[#A6ADBB] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-400">Action URL:</span>
                        <code className="text-[#D6AD62]">{typeof window !== 'undefined' ? `${window.location.origin}/?mode=resetPassword` : '/?mode=resetPassword'}</code>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-400">Authorized Domain:</span>
                        <code className="text-zinc-300">{typeof window !== 'undefined' ? window.location.hostname : 'localhost'}</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* LEGAL TERMS */}
                {authScreen === 'LEGAL_TERMS' && (
                  <div className="space-y-4 py-2">
                    <button
                      onClick={() => setAuthScreen('WELCOME')}
                      className="text-xs text-[#D6AD62] flex items-center gap-1 font-semibold"
                    >
                      ← Back
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-[#F5F3EE]">Legal Terms &amp; Escrow Guidelines</h2>
                      <p className="text-[11px] text-[#A6ADBB]">East Africa creative marketplace operating standards.</p>
                    </div>
                    <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-3 text-xs text-[#A6ADBB] space-y-2 leading-relaxed max-h-[420px] overflow-y-auto">
                      <p className="font-bold text-[#D6AD62]">1. Escrow Protection</p>
                      <p>All agreed booking payments are held securely in the regional escrow vault until final deliverables are approved or rental gear is returned without incident.</p>
                      <p className="font-bold text-[#D6AD62]">2. Zero-Trust Administration</p>
                      <p>Administrator privileges cannot be obtained through client interfaces. All administrative functions require server-side claims.</p>
                      <p className="font-bold text-[#D6AD62]">3. Equipment Rental Security</p>
                      <p>Lessees must sign off on pre-dispatch inspection reports. Any disputes are routed directly to the mediation desk.</p>
                    </div>
                  </div>
                )}

                {/* ADMINISTRATOR PORTAL & PROVISIONING WORKFLOW */}
                {authScreen === 'ADMIN_PORTAL' && (
                  <div className="space-y-4 py-2">
                    <button
                      onClick={() => {
                        setAuthScreen('WELCOME');
                        setAdminPortalError(null);
                        setAdminPortalSuccess(null);
                      }}
                      className="text-xs text-[#D6AD62] flex items-center gap-1 font-semibold"
                    >
                      ← Back to Welcome
                    </button>

                    <div className="bg-[#121622] border border-[#D6AD62]/40 rounded-2xl p-4 space-y-3.5 shadow-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#D6AD62]/15 border border-[#D6AD62]/35 flex items-center justify-center text-[#D6AD62] shrink-0">
                          <Shield size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#F5F3EE]">Administrator Portal</h2>
                            <span className="text-[9px] bg-red-950/80 border border-red-500/50 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">RESTRICTED</span>
                          </div>
                          <p className="text-xs text-[#A6ADBB]">Authorized platform administrators only.</p>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#080B14] rounded-xl border border-[#232838] text-[11px] text-[#A6ADBB] space-y-1">
                        <span className="text-[#D6AD62] font-semibold flex items-center gap-1">
                          <Lock size={12} /> Zero-Trust Security Standard
                        </span>
                        <p className="text-[10px] leading-relaxed">
                          Administrative access is strictly governed by server-managed Firebase Admin custom claims (<code className="text-[#D6AD62]">&#123; admin: true &#125;</code>). Registration through public forms never grants administrator privileges.
                        </p>
                      </div>

                      {/* Tab Navigation */}
                      <div className="flex rounded-xl bg-[#080B14] p-1 border border-[#232838]">
                        <button
                          onClick={() => {
                            setAdminPortalTab('LOGIN');
                            setAdminPortalError(null);
                            setAdminPortalSuccess(null);
                          }}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                            adminPortalTab === 'LOGIN'
                              ? 'bg-[#D6AD62] text-[#080B14] shadow'
                              : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                          }`}
                        >
                          <ShieldCheck size={14} />
                          <span>Admin Sign In</span>
                        </button>
                        <button
                          onClick={() => {
                            setAdminPortalTab('PROVISIONING_GUIDE');
                            setAdminPortalError(null);
                            setAdminPortalSuccess(null);
                          }}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                            adminPortalTab === 'PROVISIONING_GUIDE'
                              ? 'bg-[#D6AD62] text-[#080B14] shadow'
                              : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                          }`}
                        >
                          <Terminal size={14} />
                          <span>Initial Setup &amp; Guide</span>
                        </button>
                        <button
                          onClick={() => {
                            setAdminPortalTab('RESET_PASSWORD');
                            setAdminPortalError(null);
                            setAdminPortalSuccess(null);
                          }}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                            adminPortalTab === 'RESET_PASSWORD'
                              ? 'bg-[#D6AD62] text-[#080B14] shadow'
                              : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                          }`}
                        >
                          <RotateCcw size={13} />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Alerts */}
                      {adminPortalError && (
                        <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3 flex items-start gap-2 text-xs text-red-300">
                          <ShieldAlert size={16} className="shrink-0 mt-0.5 text-red-400" />
                          <div className="flex-1 space-y-1.5">
                            <span className="font-bold text-red-200 block">Access Denied / Authentication Notice</span>
                            <span className="text-[11px] leading-relaxed block">{adminPortalError}</span>
                            {canProvisionAsInitial && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminPortalTab('PROVISIONING_GUIDE');
                                  setAdminPortalError(null);
                                  setAdminProvisionEmailInput(adminLoginEmail);
                                }}
                                className="mt-1 bg-[#D6AD62] text-[#080B14] font-bold px-3 py-1 rounded-lg text-[10px] inline-flex items-center gap-1"
                              >
                                Initialize Platform Administrator for {adminLoginEmail} →
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {adminPortalSuccess && (
                        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-300">
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                          <div className="flex-1 space-y-1">
                            <span className="font-bold text-emerald-200 block">Operation Verified</span>
                            <span className="text-[11px] leading-relaxed">{adminPortalSuccess}</span>
                          </div>
                        </div>
                      )}

                      {/* TAB 1: ADMIN SIGN IN */}
                      {adminPortalTab === 'LOGIN' && (
                        <div className="space-y-3 pt-1">
                          {!adminStatus.isFirstAdminProvisioned ? (
                            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-300 space-y-1">
                              <span className="font-bold text-amber-200 flex items-center gap-1">
                                <AlertTriangle size={14} /> Initial Administrator Not Yet Provisioned
                              </span>
                              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                                No administrator account is currently provisioned. Initial setup is reserved for the designated administrator (<strong>{adminStatus.designatedInitialAdminEmail}</strong>). Switch to the <strong>Initial Setup &amp; Guide</strong> tab to initialize your credentials.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-[#171A24] border border-[#D6AD62]/30 rounded-xl p-2.5 text-xs text-[#A6ADBB] flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[#D6AD62]" />
                                <span className="text-[11px]">Primary Administrator Established: <strong className="text-[#F5F3EE]">{adminStatus.provisionedAdminEmail || adminStatus.designatedInitialAdminEmail}</strong></span>
                              </div>
                              <span className="text-[9px] bg-[#D6AD62]/20 text-[#D6AD62] px-1.5 py-0.5 rounded font-mono font-bold">LOCKED</span>
                            </div>
                          )}

                          <form onSubmit={handleAdminLogin} className="space-y-3">
                            <div>
                              <label className="block text-xs font-semibold text-[#A6ADBB] mb-1">
                                Administrator Work Email *
                              </label>
                              <input
                                type="email"
                                value={adminLoginEmail}
                                onChange={e => setAdminLoginEmail(e.target.value)}
                                placeholder="mmosesurio@gmail.com"
                                required
                                className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2.5 text-xs text-[#F5F3EE] outline-none"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-[#A6ADBB]">
                                  Master Password *
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminPortalTab('RESET_PASSWORD');
                                    setAdminResetEmailInput(adminLoginEmail);
                                    setAdminPortalError(null);
                                  }}
                                  className="text-[10px] text-[#D6AD62] hover:underline"
                                >
                                  Forgot Password?
                                </button>
                              </div>
                              <input
                                type="password"
                                value={adminLoginPassword}
                                onChange={e => setAdminLoginPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                                className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2.5 text-xs text-[#F5F3EE] outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isAdminLoading}
                              className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm mt-1 disabled:opacity-50"
                            >
                              <ShieldCheck size={14} />
                              <span>{isAdminLoading ? 'Verifying Server Authorization...' : 'Authenticate Administrator'}</span>
                            </button>
                          </form>

                          {!adminStatus.isFirstAdminProvisioned && (
                            <div className="text-center pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminPortalTab('PROVISIONING_GUIDE');
                                  setAdminPortalError(null);
                                }}
                                className="text-[11px] text-[#A6ADBB] hover:text-[#D6AD62] underline"
                              >
                                First time setting up? Complete Initial Provisioning →
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: INITIAL SETUP & CLI GUIDE */}
                      {adminPortalTab === 'PROVISIONING_GUIDE' && (
                        <div className="space-y-3 pt-1 text-xs">
                          {!adminStatus.isFirstAdminProvisioned ? (
                            <div className="bg-[#171A24] border border-[#D6AD62]/40 rounded-xl p-3.5 space-y-2.5">
                              <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-[#D6AD62]" />
                                <h3 className="font-bold text-[#F5F3EE] text-xs">
                                  Initial Administrator Provisioning (One-Time Setup)
                                </h3>
                              </div>
                              <p className="text-[11px] text-[#A6ADBB] leading-relaxed">
                                Authorize the designated project owner (<strong>{adminStatus.designatedInitialAdminEmail}</strong>) with server-managed Firebase Admin custom claims (<code className="text-[#D6AD62]">&#123; admin: true &#125;</code>). This action locks after completion.
                              </p>

                              <form onSubmit={handleProvisionInitialAdminSubmit} className="space-y-2.5 pt-1">
                                <div>
                                  <label className="block text-[11px] text-[#A6ADBB] mb-1">Administrator Email *</label>
                                  <input
                                    type="email"
                                    value={adminProvisionEmailInput}
                                    onChange={e => setAdminProvisionEmailInput(e.target.value)}
                                    placeholder="mmosesurio@gmail.com"
                                    required
                                    className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-xs text-[#F5F3EE] outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] text-[#A6ADBB] mb-1">Full Name / Organization</label>
                                  <input
                                    type="text"
                                    value={adminProvisionFullNameInput}
                                    onChange={e => setAdminProvisionFullNameInput(e.target.value)}
                                    placeholder="e.g. Platform Administrator"
                                    className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-xs text-[#F5F3EE] outline-none"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] text-[#A6ADBB] mb-1">Set Master Password (min 6 characters) *</label>
                                  <input
                                    type="password"
                                    value={adminProvisionPasswordInput}
                                    onChange={e => setAdminProvisionPasswordInput(e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                    className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-xs text-[#F5F3EE] outline-none"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  disabled={isAdminLoading}
                                  className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                                >
                                  <ShieldCheck size={14} />
                                  <span>{isAdminLoading ? 'Provisioning Initial Administrator...' : 'Provision Initial Administrator & Lock'}</span>
                                </button>
                              </form>
                            </div>
                          ) : (
                            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-1.5">
                              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                                <CheckCircle2 size={16} /> Initial Administrator Established &amp; Locked
                              </span>
                              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                                Primary Administrator: <strong>{adminStatus.provisionedAdminEmail || adminStatus.designatedInitialAdminEmail}</strong> has been provisioned with server custom claims. The one-time bootstrap setup is locked to prevent unauthorized privilege escalation.
                              </p>
                            </div>
                          )}

                          <div className="space-y-2 bg-[#080B14] border border-[#262C3D] rounded-xl p-3 text-[11px] text-[#A6ADBB]">
                            <div className="space-y-1">
                              <span className="font-bold text-[#D6AD62] block">Backend CLI Procedure (Additional Staff)</span>
                              <p>To grant administrator privileges to additional staff in a trusted backend environment:</p>
                              <div className="bg-[#111827] p-2 rounded border border-[#232838] font-mono text-[10px] text-[#D6AD62] overflow-x-auto">
                                <div># Set Service Account credentials (if using live Firebase)</div>
                                <div>export GOOGLE_APPLICATION_CREDENTIALS="/secrets/firebase-sa.json"</div>
                                <div className="mt-1"># Run provisioning script</div>
                                <div>node scripts/provision-admin.js staff.operations@kazihub.ea</div>
                              </div>
                            </div>

                            <div className="space-y-1 pt-1.5 border-t border-[#1C2230]">
                              <span className="font-bold text-[#D6AD62] block">Firebase Admin SDK Claims Snippet</span>
                              <div className="bg-[#111827] p-2 rounded border border-[#232838] font-mono text-[10px] text-zinc-300 overflow-x-auto">
                                <span className="text-[#A6ADBB]">// Server-side privileged script</span><br/>
                                <span className="text-[#D6AD62]">const</span> admin = require('firebase-admin');<br/>
                                admin.initializeApp();<br/>
                                <span className="text-[#D6AD62]">const</span> user = <span className="text-[#D6AD62]">await</span> admin.auth().getUserByEmail(email);<br/>
                                <span className="text-[#D6AD62]">await</span> admin.auth().setCustomUserClaims(user.uid, &#123;<br/>
                                &nbsp;&nbsp;admin: <span className="text-amber-400">true</span>,<br/>
                                &nbsp;&nbsp;kazi_role: <span className="text-emerald-400">'ADMINISTRATOR'</span><br/>
                                &#125;);
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: RESET PASSWORD */}
                      {adminPortalTab === 'RESET_PASSWORD' && (
                        <div className="space-y-3.5 pt-1 text-xs">
                          <div>
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-[#F5F3EE] text-xs flex items-center gap-1.5">
                                <RotateCcw size={14} className="text-[#D6AD62]" />
                                Reset Administrator Credentials
                              </h3>
                              <span className="text-[10px] bg-[#D6AD62]/15 text-[#D6AD62] border border-[#D6AD62]/30 px-2 py-0.5 rounded font-mono font-semibold">
                                {adminStatus.designatedInitialAdminEmail}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#A6ADBB] mt-1 leading-relaxed">
                              Recover master credentials for established primary administrator (<strong>{adminStatus.designatedInitialAdminEmail}</strong>) via Firebase Authentication. Server-managed claims and initial provisioning locks remain strictly intact.
                            </p>
                          </div>

                          {/* Mode Selector: Dispatch Recovery vs Set New Password */}
                          <div className="grid grid-cols-2 gap-1.5 bg-[#080B14] p-1 rounded-xl border border-[#262C3D]">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminResetModeTab('DISPATCH');
                                setAdminPortalError(null);
                                setAdminResetActionableHelp(null);
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition ${
                                adminResetModeTab === 'DISPATCH'
                                  ? 'bg-[#171A24] text-[#D6AD62] shadow-sm border border-[#D6AD62]/30'
                                  : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                              }`}
                            >
                              1. Dispatch Recovery Email
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminResetModeTab('SET_NEW_PASSWORD');
                                setAdminPortalError(null);
                                setAdminResetActionableHelp(null);
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition ${
                                adminResetModeTab === 'SET_NEW_PASSWORD'
                                  ? 'bg-[#171A24] text-[#D6AD62] shadow-sm border border-[#D6AD62]/30'
                                  : 'text-[#A6ADBB] hover:text-[#F5F3EE]'
                              }`}
                            >
                              2. Set New Master Password
                            </button>
                          </div>

                          {/* Firebase Auth & Action URL Diagnostics */}
                          <div className="bg-[#0B0F19] border border-[#232838] rounded-xl p-3 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between pb-1 border-b border-[#1A2234]">
                              <span className="text-[#A6ADBB] font-medium flex items-center gap-1.5">
                                <Shield size={12} className="text-[#D6AD62]" />
                                Firebase Auth Service Status:
                              </span>
                              {adminStatus.firebaseProjectConfigured || firebaseConfigStatus?.configured ? (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Active
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-400 bg-amber-950/50 border border-amber-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <AlertTriangle size={10} /> Configuration Required
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 gap-1 text-[10px] text-[#A6ADBB] pt-0.5">
                              <div className="flex justify-between items-center">
                                <span>Action URL (Continue URL):</span>
                                <code className="text-[#D6AD62] font-mono text-[9px] truncate max-w-[200px]" title={typeof window !== 'undefined' ? `${window.location.origin}/?mode=resetPassword` : ''}>
                                  {typeof window !== 'undefined' ? `${window.location.origin}/?mode=resetPassword` : '/?mode=resetPassword'}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Authorized Domain:</span>
                                <code className="text-zinc-300 font-mono text-[9px]">
                                  {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
                                </code>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Primary Administrator:</span>
                                <span className="text-zinc-200 font-mono text-[9px]">{adminStatus.designatedInitialAdminEmail}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actionable Help Banner when Error Occurs */}
                          {adminResetActionableHelp && (
                            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                                <AlertTriangle size={14} className="shrink-0" />
                                <span>Actionable Remediation Guide:</span>
                              </div>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                {adminResetActionableHelp}
                              </p>
                              <div className="text-[10px] text-amber-300/80 pt-1 border-t border-amber-800/40">
                                • Firebase Console &gt; Authentication &gt; Sign-in method &gt; Enable Email/Password<br/>
                                • Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains &gt; Add domain
                              </div>
                            </div>
                          )}

                          {/* MODE 1: DISPATCH RECOVERY EMAIL */}
                          {adminResetModeTab === 'DISPATCH' && (
                            <form onSubmit={handleAdminPasswordResetSubmit} className="space-y-3">
                              <div>
                                <label className="block text-[11px] text-[#A6ADBB] mb-1 font-semibold">
                                  Administrator Email *
                                </label>
                                <input
                                  type="email"
                                  value={adminResetEmailInput || adminLoginEmail}
                                  onChange={e => setAdminResetEmailInput(e.target.value)}
                                  placeholder="mmosesurio@gmail.com"
                                  required
                                  className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2.5 text-xs text-[#F5F3EE] outline-none"
                                />
                                <span className="text-[10px] text-[#A6ADBB] mt-1 block">
                                  Password recovery instructions will be dispatched using Firebase Authentication's action URL configuration.
                                </span>
                              </div>

                              <button
                                type="submit"
                                disabled={isAdminLoading}
                                className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                              >
                                <RotateCcw size={14} />
                                <span>{isAdminLoading ? 'Dispatching Instructions...' : 'Dispatch Password Reset via Firebase'}</span>
                              </button>
                            </form>
                          )}

                          {/* MODE 2: SET NEW MASTER PASSWORD */}
                          {adminResetModeTab === 'SET_NEW_PASSWORD' && (
                            <form onSubmit={handleAdminConfirmNewPasswordSubmit} className="space-y-2.5">
                              <div className="bg-[#171A24] border border-[#D6AD62]/30 rounded-xl p-2.5 text-[11px] text-[#A6ADBB] leading-relaxed">
                                Establish your new master password below. All server-managed administrator custom claims (<code className="text-[#D6AD62]">&#123; admin: true &#125;</code>) and initial lock provisions are securely preserved.
                              </div>

                              <div>
                                <label className="block text-[11px] text-[#A6ADBB] mb-1 font-semibold">
                                  Target Administrator Email
                                </label>
                                <input
                                  type="email"
                                  value={adminResetEmailInput || adminLoginEmail || adminStatus.designatedInitialAdminEmail}
                                  onChange={e => setAdminResetEmailInput(e.target.value)}
                                  required
                                  className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-[#A6ADBB] mb-1 font-semibold">
                                  New Master Password (min 6 characters) *
                                </label>
                                <input
                                  type="password"
                                  value={adminNewPasswordInput}
                                  onChange={e => setAdminNewPasswordInput(e.target.value)}
                                  placeholder="••••••••••••"
                                  required
                                  minLength={6}
                                  className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-[#A6ADBB] mb-1 font-semibold">
                                  Confirm New Master Password *
                                </label>
                                <input
                                  type="password"
                                  value={adminConfirmPasswordInput}
                                  onChange={e => setAdminConfirmPasswordInput(e.target.value)}
                                  placeholder="••••••••••••"
                                  required
                                  minLength={6}
                                  className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] text-[#A6ADBB] mb-1">
                                  Firebase Reset Code (Optional / from email link)
                                </label>
                                <input
                                  type="text"
                                  value={adminResetOobCode}
                                  onChange={e => setAdminResetOobCode(e.target.value)}
                                  placeholder="Optional oobCode from reset URL"
                                  className="w-full bg-[#080B14] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-xs text-[#F5F3EE] outline-none font-mono text-[11px]"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isAdminLoading}
                                className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                              >
                                <CheckCircle2 size={14} />
                                <span>{isAdminLoading ? 'Updating Master Password...' : 'Save New Master Password & Proceed to Login'}</span>
                              </button>
                            </form>
                          )}

                          <div className="text-center pt-1 border-t border-[#1C2230]">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminPortalTab('LOGIN');
                                setAdminPortalError(null);
                                setAdminResetActionableHelp(null);
                              }}
                              className="text-[11px] text-[#A6ADBB] hover:text-[#D6AD62] underline"
                            >
                              ← Return to Administrator Sign In
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. PROFILE PHOTO COMPLETION (MANDATORY IDENTIFICATION) */}
            {/* ========================================================= */}
            {currentUser && currentUser.status === 'PENDING_PROFILE_COMPLETION' && (
              <div className="space-y-4 py-2">
                <div>
                  <span className="text-[10px] bg-[#D6AD62]/20 text-[#D6AD62] px-2 py-0.5 rounded font-bold">
                    STEP 2 OF 2: MANDATORY IDENTIFICATION
                  </span>
                  <h2 className="text-xl font-bold text-[#F5F3EE] mt-1">Upload Profile Picture</h2>
                  <p className="text-xs text-[#A6ADBB]">
                    All marketplace participants ({currentUser.activeRole}) must have a verified profile photo before browsing or booking.
                  </p>
                </div>

                {photoUploadError && (
                  <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-red-300">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{photoUploadError}</span>
                  </div>
                )}

                {photoUploadSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-300">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{photoUploadSuccess}</span>
                  </div>
                )}

                {/* Preview Box */}
                <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full border-2 border-[#D6AD62] bg-[#171A24] flex items-center justify-center overflow-hidden shadow-lg relative">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#A6ADBB]">
                        <Camera size={28} className="text-[#D6AD62]" />
                        <span className="text-[9px] mt-1">No Photo</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-[#F5F3EE] block text-sm">{currentUser.name}</span>
                    <span className="text-[11px] text-[#D6AD62]">{currentUser.activeRole} • {currentUser.country}</span>
                  </div>

                  {/* Photo Upload Actions */}
                  <div className="flex flex-col w-full gap-2 pt-1">
                    {/* Hidden Native / Web File Inputs */}
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleDeviceFileSelected}
                      className="hidden"
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleDeviceFileSelected}
                      className="hidden"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="w-full bg-[#171A24] hover:bg-[#232838] border border-[#D6AD62]/40 text-[#D6AD62] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Upload size={14} /> Upload from Gallery
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-full bg-[#171A24] hover:bg-[#232838] border border-[#D6AD62]/40 text-[#D6AD62] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Camera size={14} /> Capture (Camera)
                      </button>
                    </div>

                    {/* Pending Selected Photo Preview & Confirmation */}
                    {pendingPhoto && (
                      <div className="w-full bg-[#171A24] border border-[#D6AD62]/60 rounded-xl p-3 text-left space-y-2 mt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#F5F3EE] truncate max-w-[170px]">{pendingPhoto.name}</span>
                          <span className="text-[10px] text-[#D6AD62] font-mono">{pendingPhoto.sizeKb} KB • {pendingPhoto.file.type.split('/')[1]?.toUpperCase()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleUploadPendingPhoto}
                            disabled={isUploadingPhoto}
                            className="flex-1 bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                          >
                            {isUploadingPhoto ? (
                              <span>Saving to Storage...</span>
                            ) : (
                              <>
                                <Check size={14} /> Save & Upload Photo
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelPendingPhoto}
                            disabled={isUploadingPhoto}
                            className="px-3 bg-[#262C3D] hover:bg-[#32394E] text-[#A6ADBB] hover:text-[#F5F3EE] rounded-lg text-xs font-semibold transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 justify-center text-[10px] text-[#A6ADBB] pt-1">
                      <span>Or select East African creative headshot preset:</span>
                    </div>

                    <div className="flex gap-2 justify-center">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                      ].map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="sample"
                          onClick={() => handleSelectSamplePhoto(url)}
                          className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition ${
                            profilePhotoUrl === url ? 'border-[#D6AD62] scale-105' : 'border-transparent hover:border-[#D6AD62]/60'
                          }`}
                        />
                      ))}
                    </div>

                    {profilePhotoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] text-red-400 hover:underline pt-1"
                      >
                        Remove selected photo
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteProfileAndActivate}
                  disabled={!profilePhotoUrl}
                  className={`w-full font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition ${
                    profilePhotoUrl
                      ? 'bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] cursor-pointer'
                      : 'bg-[#262C3D] text-[#A6ADBB] cursor-not-allowed opacity-60'
                  }`}
                >
                  <CheckCircle2 size={16} /> Complete Activation &amp; Enter Marketplace
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. AUTHENTICATED CORE MARKETPLACE SCREENS */}
            {/* ========================================================= */}
            {currentUser && currentUser.status === 'ACTIVE' && (
              <>
                {/* SCREEN: HOME / EXPLORE */}
                {currentScreen === 'HOME' && (
                  <div className="space-y-4">
                    {/* Status & Security Banner */}
                    <div className="bg-[#111827] border border-[#D6AD62]/40 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#D6AD62] font-bold block text-xs">Active Session: {currentUser.name}</span>
                        <p className="text-[#A6ADBB] text-[10px] mt-0.5">{currentUser.activeRole} • {currentUser.country} • Zero Demo Data Active</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowRoleDialog(true)}
                          className="bg-[#171A24] border border-[#D6AD62]/50 hover:border-[#D6AD62] text-[#D6AD62] text-[11px] font-semibold px-2 py-1 rounded-lg"
                        >
                          Switch Role
                        </button>
                        <button
                          onClick={() => setShowInspector(true)}
                          className="bg-[#171A24] border border-[#262C3D] text-[#A6ADBB] text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Code2 size={12} /> Inspect
                        </button>
                      </div>
                    </div>

                    {/* Equipment Owner Dedicated Dashboard Access */}
                    {currentUser.activeRole === 'EQUIPMENT_OWNER' && (
                      <div
                        onClick={() => setCurrentScreen('EQUIPMENT_OWNER_DASHBOARD')}
                        className="bg-gradient-to-r from-[#171A24] via-[#1E2332] to-[#171A24] border border-[#D6AD62] rounded-xl p-3.5 cursor-pointer flex items-center justify-between shadow-md hover:border-[#e0bc75] transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#D6AD62] text-[#080B14] flex items-center justify-center font-bold">
                            <Package size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] text-[#D6AD62] font-bold uppercase tracking-wider block">Equipment Owner Mode Active</span>
                            <h4 className="text-xs font-bold text-[#F5F3EE]">Owner Dashboard &amp; Gear Manager</h4>
                            <p className="text-[11px] text-[#A6ADBB]">Manage listings, rental requests, returns &amp; deposit settings</p>
                          </div>
                        </div>
                        <span className="text-xs bg-[#D6AD62] text-[#080B14] font-bold px-3 py-1.5 rounded-lg shrink-0">Manage Gear →</span>
                      </div>
                    )}

                    {/* Core Marketplace Direct Action Cards (New Booking + Find Pro + Browse Gear) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCreateBookingInitialType('CREATIVE_SERVICE');
                          setShowCreateBookingModal(true);
                        }}
                        className="bg-gradient-to-br from-[#D6AD62] to-[#B88E3E] text-[#080B14] rounded-xl p-3 text-left transition group cursor-pointer shadow-md flex sm:flex-col justify-between items-start"
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-[#080B14] flex items-center justify-center text-[#D6AD62] group-hover:scale-105 transition">
                            <Plus size={18} className="stroke-[3]" />
                          </div>
                          <span className="text-[10px] bg-[#080B14]/20 text-[#080B14] font-bold px-1.5 py-0.5 rounded">Action</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#080B14]">{lang === 'SW' ? '+ Nafasi Mpya' : '+ New Booking'}</h4>
                          <p className="text-[10px] text-[#1E2332] mt-0.5 font-medium leading-tight">
                            {lang === 'SW' ? 'Wataalamu au kukodisha vifaa' : 'Book creative pro or rent gear'}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setCurrentScreen('FIND_PROFESSIONAL')}
                        className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] rounded-xl p-3 text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#262C3D] flex items-center justify-center text-[#D6AD62] group-hover:scale-105 transition">
                            <Users size={16} />
                          </div>
                          <span className="text-[10px] text-[#D6AD62] font-semibold">{lang === 'SW' ? 'Tafuta →' : 'Explore →'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F5F3EE]">{lang === 'SW' ? 'Tafuta Wataalamu' : 'Find a Professional'}</h4>
                        <p className="text-[10px] text-[#A6ADBB] mt-0.5">{lang === 'SW' ? 'Upigaji picha, sinema, sauti, drones, uhariri' : 'Cinematography, sound, drones, editing'}</p>
                      </button>

                      <button
                        onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                        className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] rounded-xl p-3 text-left transition group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#262C3D] flex items-center justify-center text-[#D6AD62] group-hover:scale-105 transition">
                            <Video size={16} />
                          </div>
                          <span className="text-[10px] text-[#D6AD62] font-semibold">{lang === 'SW' ? 'Tazama →' : 'Browse →'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#F5F3EE]">{lang === 'SW' ? 'Kukodisha Vifaa' : 'Browse Gear'}</h4>
                        <p className="text-[10px] text-[#A6ADBB] mt-0.5">{lang === 'SW' ? 'Kamera, lenzi, taa, sauti & kuta za LED' : 'Cameras, lenses, lights, audio & LED walls'}</p>
                      </button>
                    </div>

                    {/* Dedicated Booking Center Banner */}
                    <div
                      className="bg-gradient-to-r from-[#171A24] to-[#1E2332] border border-[#D6AD62]/40 hover:border-[#D6AD62] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                    >
                      <div
                        onClick={() => setCurrentScreen('BOOKING_CENTER')}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#080B14] border border-[#D6AD62]/40 flex items-center justify-center text-[#D6AD62] shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#F5F3EE]">
                            {lang === 'SW' ? 'Kituo cha Mikataba & Nafasi' : 'Dedicated Booking Center'}
                          </h4>
                          <p className="text-[11px] text-[#A6ADBB]">
                            {bookings.length} {lang === 'SW' ? 'Mikataba Inayoendelea' : 'Active Contracts'} • {lang === 'SW' ? 'Makadirio, Uhakiki & Escrow' : 'Quotations, Handover & Escrow'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setCreateBookingInitialType('CREATIVE_SERVICE');
                            setShowCreateBookingModal(true);
                          }}
                          className="bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition cursor-pointer"
                        >
                          <Plus size={13} className="stroke-[3]" />
                          <span>{lang === 'SW' ? 'Nafasi Mpya' : 'New Booking'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('BOOKING_CENTER')}
                          className="bg-[#111827] border border-[#262C3D] hover:border-[#D6AD62] text-[#D6AD62] font-bold px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
                        >
                          {lang === 'SW' ? 'Fungua →' : 'Open →'}
                        </button>
                      </div>
                    </div>

                    {/* Talent Discovery Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-[#F5F3EE]">
                            {lang === 'SW' ? `Wataalamu wa Ubunifu (${creatives.length})` : `Creative Professionals (${creatives.length})`}
                          </span>
                          <span className="text-[10px] text-[#A97943] ml-2">
                            {lang === 'SW' ? 'Wataalamu Walioidhinishwa' : 'Verified Talent'}
                          </span>
                        </div>
                        <button
                          onClick={() => setCurrentScreen('FIND_PROFESSIONAL')}
                          className="text-[11px] text-[#D6AD62] font-bold hover:underline"
                        >
                          {lang === 'SW' ? 'Tazama Wote & Tafuta →' : 'View All & Search →'}
                        </button>
                      </div>

                      {creatives.length === 0 ? (
                        <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-6 text-center space-y-2">
                          <Users size={32} className="mx-auto text-[#D6AD62]" />
                          <h4 className="text-xs font-bold text-[#F5F3EE]">
                            {lang === 'SW' ? 'Bado Hakuna Wataalamu Waliosajiliwa Arusha' : 'No Creatives Registered in Arusha Yet'}
                          </h4>
                          <p className="text-[11px] text-[#A6ADBB] max-w-xs mx-auto">
                            {lang === 'SW'
                              ? 'Kuwa wa kwanza! Unda wasifu wako wa kitaalamu ili kupokea maombi ya kazi za sinema na picha Arusha na kanda ya kaskazini.'
                              : 'Be the pioneer! Create your verified professional profile to receive shoot bookings in Arusha and northern Tanzania.'}
                          </p>
                          <button
                            onClick={() => {
                              if (currentUser.roles.includes('FREELANCER')) {
                                setCurrentScreen('PROFILE_SETTINGS');
                              } else {
                                setShowRoleDialog(true);
                              }
                            }}
                            className="bg-[#D6AD62] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 mt-2"
                          >
                            <Plus size={14} /> {lang === 'SW' ? 'Unda Wasifu wa Kitaalamu' : 'Create Professional Profile'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {creatives.map(c => (
                            <div key={c.id} className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62]/40 rounded-xl p-3 flex justify-between items-center text-xs transition">
                              <div
                                onClick={() => {
                                  setSelectedCreativeForBooking(c as any);
                                  setShowBookCreativeModal(true);
                                }}
                                className="flex items-center gap-2.5 cursor-pointer flex-1"
                              >
                                <img src={c.avatarUrl} alt={c.name} className="w-10 h-10 rounded-full object-cover border border-[#D6AD62]" />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#F5F3EE]">{c.name}</span>
                                    {c.isVerified && <CheckCircle2 size={12} className="text-[#D6AD62]" />}
                                  </div>
                                  <p className="text-[11px] text-[#A6ADBB]">{c.title}</p>
                                  <p className="text-[10px] text-[#A97943]">{c.location} ({c.country})</p>
                                </div>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <span className="font-bold text-[#D6AD62] block">{c.currency} {c.rate.toLocaleString()}</span>
                                <button
                                  onClick={() => {
                                    setSelectedCreativeForBooking(c as any);
                                    setShowBookCreativeModal(true);
                                  }}
                                  className="text-[10px] bg-[#D6AD62] text-[#080B14] font-bold px-2 py-1 rounded-lg mt-1 inline-block cursor-pointer hover:bg-[#E5C17D]"
                                >
                                  {lang === 'SW' ? 'Omba Huduma' : 'Book Service'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Equipment Marketplace Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-[#F5F3EE]">
                            {lang === 'SW' ? `Vifaa vya Sinema & Vifurushi (${equipmentList.length})` : `Cinema Gear & Packages (${equipmentList.length})`}
                          </span>
                          <span className="text-[10px] text-[#A97943] ml-2">
                            {lang === 'SW' ? 'Kategoria 15' : '15 Categories'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                            className="text-[11px] text-[#D6AD62] font-bold hover:underline"
                          >
                            {lang === 'SW' ? 'Tazama Vyote →' : 'View All →'}
                          </button>
                          <button
                            onClick={() => setShowAddGearModal(true)}
                            className="text-[10px] bg-[#D6AD62] text-[#080B14] font-bold px-2 py-1 rounded-lg hover:bg-[#e0bc75] flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={11} /> {lang === 'SW' ? 'Weka Kifaa' : 'List Gear'}
                          </button>
                        </div>
                      </div>

                      {equipmentList.length === 0 ? (
                        <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-6 text-center space-y-2">
                          <Video size={32} className="mx-auto text-[#D6AD62]" />
                          <h4 className="text-xs font-bold text-[#F5F3EE]">
                            {lang === 'SW' ? 'Bado Hakuna Vifaa Vilivyoorodheshwa Arusha' : 'No Cinema Gear Listed in Arusha Yet'}
                          </h4>
                          <p className="text-[11px] text-[#A6ADBB] max-w-xs mx-auto">
                            {lang === 'SW'
                              ? 'Una kamera za sinema, taa za LED, mfumo wa sauti au jenereta Arusha? Orodhesha vifaa vyako ili uanze kupata mapato ya ukodishaji.'
                              : 'Have cameras, LED walls, audio systems, or generators in Arusha? List your gear to earn rental income.'}
                          </p>
                          <button
                            onClick={() => setShowAddGearModal(true)}
                            className="bg-[#D6AD62] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 mt-2"
                          >
                            <Plus size={14} /> {lang === 'SW' ? 'Orodhesha Vifaa vya Kukodisha' : 'Add Equipment Listing'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {equipmentList.map(eq => (
                            <div key={eq.id} className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62]/40 rounded-xl p-3 flex justify-between items-center text-xs transition">
                              <div
                                onClick={() => {
                                  setSelectedGearForRental(eq as any);
                                  setShowRentGearModal(true);
                                }}
                                className="cursor-pointer flex-1"
                              >
                                <span className="font-bold text-[#F5F3EE] block">{eq.title}</span>
                                <p className="text-[11px] text-[#A6ADBB]">{getEquipmentCategoryLabel(eq.category, lang)} • {lang === 'SW' ? 'Mmiliki' : 'Owner'}: {eq.ownerName}</p>
                                <p className="text-[10px] text-[#A97943]">{eq.location} ({getCountryLabel(eq.country, lang)})</p>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <span className="font-bold text-[#D6AD62] block">{eq.currency} {eq.dailyRate.toLocaleString()} / {lang === 'SW' ? 'kwa siku' : 'day'}</span>
                                <button
                                  onClick={() => {
                                    setSelectedGearForRental(eq as any);
                                    setShowRentGearModal(true);
                                  }}
                                  className="text-[10px] bg-[#D6AD62] text-[#080B14] font-bold px-2 py-1 rounded-lg mt-1 inline-block cursor-pointer hover:bg-[#E5C17D]"
                                >
                                  {lang === 'SW' ? 'Kodisha Kifaa' : 'Rent Gear'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Administrator Oversight Trigger */}
                    <div
                      onClick={() => setCurrentScreen('ADMIN_WORKSPACE')}
                      className="bg-[#111827] border border-[#A97943]/30 rounded-xl p-3 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Lock size={16} className="text-[#A97943]" />
                        <div>
                          <span className="text-xs font-bold text-[#F5F3EE]">
                            {lang === 'SW' ? 'Tovuti ya Msimamizi Mkuu' : 'Platform Administrator Portal'}
                          </span>
                          <p className="text-[10px] text-[#A6ADBB]">
                            {lang === 'SW' ? 'Eneo lililolindwa • Inahitaji idhini ya kiutawala' : 'Protected workspace • Requires server-side claim'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-[#A97943] font-bold">
                        {lang === 'SW' ? 'Simamia →' : 'Manage →'}
                      </span>
                    </div>
                  </div>
                )}

                {/* SCREEN: DEDICATED BOOKING CENTER & STATUS PIPELINE */}
                {currentScreen === 'BOOKING_CENTER' && (
                  <div className="space-y-3">
                    {/* Responsive Header with Prominent New Booking CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                      <div>
                        <h2 className="text-base font-bold text-[#F5F3EE]">
                          {lang === 'SW' ? 'Kituo cha Mikataba & Nafasi' : 'Booking Center'}
                        </h2>
                        <p className="text-[11px] text-[#A6ADBB]">
                          {lang === 'SW' ? 'Makadirio, Uhakiki wa Vifaa & Malipo Salama ya Escrow' : 'Quotations, Handover & Escrow Pipeline'}
                        </p>
                      </div>
                      
                      {/* Responsive Action Buttons (New Booking + Find Pro + Browse Gear) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setCreateBookingInitialType('CREATIVE_SERVICE');
                            setShowCreateBookingModal(true);
                          }}
                          className="bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
                          title="Create a new creative service booking or gear rental"
                        >
                          <Plus size={14} className="stroke-[3]" />
                          <span>{lang === 'SW' ? '+ Nafasi Mpya' : '+ New Booking'}</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('FIND_PROFESSIONAL')}
                          className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] text-[#D6AD62] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition"
                        >
                          <Users size={12} /> {lang === 'SW' ? 'Wataalamu' : 'Find Pro'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                          className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] text-[#D6AD62] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition"
                        >
                          <Video size={12} /> {lang === 'SW' ? 'Kukodisha Vifaa' : 'Browse Gear'}
                        </button>
                      </div>
                    </div>

                    {/* 8 Lifecycle Filter Tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      {(['ALL', 'PENDING', 'QUOTATION_SUBMITTED', 'CONFIRMED', 'IN_PROGRESS', 'AWAITING_COMPLETION', 'COMPLETED', 'DISPUTED'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setBookingFilterTab(tab)}
                          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                            bookingFilterTab === tab ? 'bg-[#D6AD62] text-[#080B14] font-bold shadow' : 'bg-[#171A24] text-[#A6ADBB] border border-[#262C3D]'
                          }`}
                        >
                          {tab === 'ALL' ? (lang === 'SW' ? 'ZOTE' : 'ALL') : getBookingStatusLabel(tab, lang)}
                        </button>
                      ))}
                    </div>

                    {/* Bookings List or Empty State */}
                    {filteredBookings.length === 0 ? (
                      <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-3">
                        <Calendar size={36} className="mx-auto text-[#A6ADBB]" />
                        <h4 className="text-sm font-bold text-[#F5F3EE]">
                          {lang === 'SW' ? 'Huna Mikataba ya Kazi Bado' : 'You Have No Bookings Yet'}
                        </h4>
                        <p className="text-xs text-[#A6ADBB] max-w-xs mx-auto">
                          {lang === 'SW'
                            ? 'Hakuna nafasi au mikataba katika orodha hii. Anzisha mkataba mpya au chagua mtaalamu / vifaa unavyohitaji.'
                            : 'There are no active booking contracts in this view. Create a new booking request or browse talent and equipment.'}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setCreateBookingInitialType('CREATIVE_SERVICE');
                              setShowCreateBookingModal(true);
                            }}
                            className="bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                          >
                            <Plus size={14} className="stroke-[3]" />
                            <span>{lang === 'SW' ? '+ Anzisha Nafasi Mpya' : '+ Create New Booking'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentScreen('FIND_PROFESSIONAL')}
                            className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] text-[#D6AD62] font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                          >
                            <Users size={14} /> {lang === 'SW' ? 'Tafuta Wataalamu' : 'Find a Professional'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                            className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] text-[#D6AD62] font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                          >
                            <Video size={14} /> {lang === 'SW' ? 'Soko la Vifaa' : 'Browse Gear'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredBookings.map(b => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setSelectedBooking(b);
                              setCurrentScreen('BOOKING_DETAIL');
                            }}
                            className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62]/60 rounded-xl p-3 cursor-pointer space-y-2 transition"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-[#D6AD62]">{b.reference}</span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  b.status === 'CONFIRMED'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : b.status === 'IN_PROGRESS'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : b.status === 'DISPUTED'
                                    ? 'bg-red-500/20 text-red-400'
                                    : b.status === 'COMPLETED'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-[#D6AD62]/20 text-[#D6AD62]'
                                }`}
                              >
                                {getBookingStatusLabel(b.status, lang)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#F5F3EE]">{b.title}</h4>
                              <p className="text-[11px] text-[#A6ADBB]">{b.providerName} • {b.location}</p>
                            </div>
                            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-[#232838]">
                              <span className="text-[#A6ADBB]">{b.startDate} {lang === 'SW' ? 'hadi' : 'to'} {b.endDate}</span>
                              {b.agreedAmount > 0 ? (
                                <span className="font-bold text-[#D6AD62]">
                                  {b.currency} {b.agreedAmount.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-amber-400 font-semibold italic text-[10px] flex items-center gap-1">
                                  <Clock size={11} /> {lang === 'SW' ? 'Inasubiri makadirio' : 'Awaiting quotation'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SCREEN: BOOKING DETAIL & MILESTONE TIMELINE */}
                {currentScreen === 'BOOKING_DETAIL' && selectedBooking && (
                  <div className="space-y-3 py-1">
                    <button
                      onClick={() => setCurrentScreen('BOOKING_CENTER')}
                      className="text-xs text-[#D6AD62] flex items-center gap-1 font-semibold hover:underline"
                    >
                      ← {lang === 'SW' ? 'Rudi kwenye Mikataba' : 'Back to Bookings'}
                    </button>

                    <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-3.5 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-[#D6AD62]">{selectedBooking.reference}</span>
                          <h3 className="text-sm font-bold text-[#F5F3EE] mt-0.5">{selectedBooking.title}</h3>
                          <p className="text-[11px] text-[#A6ADBB]">{selectedBooking.scope}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#D6AD62]/20 text-[#D6AD62]">
                          {getBookingStatusLabel(selectedBooking.status, lang)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#111827] p-2.5 rounded-xl border border-[#232838]">
                        <div>
                          <span className="text-[#A6ADBB] block text-[10px]">{lang === 'SW' ? 'Mteja / Shirika:' : 'Client Organization:'}</span>
                          <span className="font-semibold text-[#F5F3EE]">{selectedBooking.clientName}</span>
                        </div>
                        <div>
                          <span className="text-[#A6ADBB] block text-[10px]">{lang === 'SW' ? 'Mtoa Huduma:' : 'Service Provider:'}</span>
                          <span className="font-semibold text-[#F5F3EE]">{selectedBooking.providerName}</span>
                        </div>
                        <div>
                          <span className="text-[#A6ADBB] block text-[10px]">{lang === 'SW' ? 'Eneo la Kazi:' : 'Location:'}</span>
                          <span className="font-semibold text-[#F5F3EE]">{selectedBooking.location}</span>
                        </div>
                        <div>
                          <span className="text-[#A6ADBB] block text-[10px]">{lang === 'SW' ? 'Jumla ya Mkataba:' : 'Agreed Total:'}</span>
                          {selectedBooking.agreedAmount > 0 ? (
                            <span className="font-bold text-[#D6AD62]">{selectedBooking.currency} {selectedBooking.agreedAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-amber-400 font-semibold italic text-[11px] flex items-center gap-1 mt-0.5">
                              <Clock size={12} /> {lang === 'SW' ? 'Inasubiri makadirio ya mtoa huduma' : 'Awaiting provider quotation'}
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 pt-2 border-t border-[#232838] space-y-1">
                          <span className="text-[10px] font-bold text-[#D6AD62] block">
                            {lang === 'SW' ? 'Mchanganuo wa Kamishna wa KAZI HUB (10%):' : 'Platform Commission Breakdown (10%):'}
                          </span>
                          {selectedBooking.agreedAmount > 0 ? (
                            <>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[#A6ADBB]">{lang === 'SW' ? 'Jumla ya Malipo (Gross):' : 'Gross Booking Amount:'}</span>
                                <span className="text-[#F5F3EE] font-semibold">{selectedBooking.currency} {selectedBooking.agreedAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-[#A6ADBB]">{lang === 'SW' ? 'Ada ya Jukwaa (10%):' : 'KAZI HUB Fee (10%):'}</span>
                                <span className="text-red-400 font-semibold">-{selectedBooking.currency} {(selectedBooking.agreedAmount * 0.1).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px] pt-1 border-t border-[#232838]">
                                <span className="text-[#D6AD62] font-semibold">{lang === 'SW' ? 'Malipo Halisi ya Mtoa Huduma:' : 'Net Provider Payout:'}</span>
                                <span className="text-emerald-400 font-bold">{selectedBooking.currency} {(selectedBooking.agreedAmount * 0.9).toLocaleString()}</span>
                              </div>
                            </>
                          ) : (
                            <div className="p-2 bg-[#171A24] rounded-lg text-amber-300 text-[10px] flex items-center gap-1.5">
                              <Clock size={12} className="shrink-0" />
                              <span>{lang === 'SW' ? 'Mchanganuo wa malipo na ada utaonekana baada ya mtoa huduma kuwasilisha makadirio.' : 'Exact fee & payout breakdown will be calculated once formal quotation is submitted by provider.'}</span>
                            </div>
                          )}
                          {selectedBooking.depositAmount > 0 && (
                            <div className="text-[9px] text-[#A6ADBB] pt-0.5">
                              * {lang === 'SW' ? 'Dhamana inayorejeshwa:' : 'Refundable deposit:'} {selectedBooking.currency} {selectedBooking.depositAmount.toLocaleString()} ({lang === 'SW' ? 'Bila makato ya kamishna 0%' : '0% commission'})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTION CONTROLS */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-[#D6AD62] block">
                          {lang === 'SW' ? 'HATUA ZA MKATABA:' : 'LIFECYCLE TRANSITION ACTIONS:'}
                        </span>

                        {selectedBooking.status === 'PENDING' && (
                          <div className="space-y-1.5">
                            {currentUser.id === selectedBooking.providerId || currentUser.activeRole !== 'CLIENT' ? (
                              <button
                                onClick={() => setShowQuoteBuilder(true)}
                                className="w-full bg-[#D6AD62] text-[#080B14] font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md hover:bg-[#E5C17D] transition cursor-pointer"
                              >
                                <FileEdit size={14} /> {lang === 'SW' ? 'Wasilisha Makadirio Rasmi' : 'Submit Formal Quotation'}
                              </button>
                            ) : (
                              <div className="p-2.5 bg-[#111827] border border-[#232838] rounded-xl text-center text-[11px] text-[#A6ADBB]">
                                <span className="text-amber-400 font-semibold block">{lang === 'SW' ? 'Ombi Limewasilishwa kwa Mtoa Huduma' : 'Booking Request Sent to Provider'}</span>
                                <span>{lang === 'SW' ? 'Subiri mtoa huduma ahakiki na kuwasilisha makadirio rasmi ya bei.' : 'Waiting for provider to review specifications and submit formal quotation.'}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedBooking.status === 'QUOTATION_SUBMITTED' && (
                          <div className="space-y-2 bg-[#111827] p-2.5 rounded-xl border border-[#D6AD62]/30">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#D6AD62] text-[11px]">
                                {lang === 'SW' ? 'Uhakiki wa Makadirio ya Bei:' : 'Pending Quotation Review:'}
                              </span>
                              <span className="text-[11px] font-bold text-[#F5F3EE]">{selectedBooking.currency} {selectedBooking.quotation?.total?.toLocaleString()}</span>
                            </div>
                            {currentUser.id === selectedBooking.clientId ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptQuote(selectedBooking.id)}
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition cursor-pointer"
                                >
                                  <Check size={14} /> {lang === 'SW' ? 'Kubali Makadirio & Thibitisha' : 'Accept Quotation & Confirm'}
                                </button>
                                <button
                                  onClick={() => setShowRevisionModal(true)}
                                  className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62] text-[#F5F3EE] font-semibold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                                >
                                  {lang === 'SW' ? 'Omba Marekebisho' : 'Request Revisions'}
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-[#A6ADBB]">
                                {lang === 'SW'
                                  ? 'Makadirio yamewasilishwa kwa mteja. Inasubiri uhakiki na kukubaliwa na mteja.'
                                  : 'Quotation submitted to client. Awaiting client review and acceptance.'}
                              </p>
                            )}
                          </div>
                        )}

                        {selectedBooking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleConfirmHandover(selectedBooking.id)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <FileCheck size={14} /> {lang === 'SW' ? 'Thibitisha Makabidhiano & Kusafirisha Seti' : 'Confirm Handover & Dispatch to Set'}
                          </button>
                        )}

                        {selectedBooking.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleMarkDelivered(selectedBooking.id)}
                            className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={14} /> {lang === 'SW' ? 'Weka Kazi Imewasilishwa / Kifaa Kimerudishwa' : 'Mark Work Delivered / Gear Returned'}
                          </button>
                        )}

                        {selectedBooking.status === 'AWAITING_COMPLETION' && (
                          <button
                            onClick={() => handleFinalSignOff(selectedBooking.id)}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck size={16} /> {lang === 'SW' ? 'Idhini ya Mwisho & Toa Malipo ya Escrow' : 'Final Sign-Off & Release Escrow'}
                          </button>
                        )}

                        {selectedBooking.status !== 'COMPLETED' && selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'DISPUTED' && (
                          <button
                            onClick={() => setShowDisputeModal(true)}
                            className="w-full text-center text-[11px] text-red-400 hover:text-red-300 py-1 cursor-pointer"
                          >
                            {lang === 'SW' ? 'Wasilisha Mgogoro Rasmi & Pandisha Ngazi' : 'Raise Formal Dispute & Escalate'}
                          </button>
                        )}
                      </div>

                      {/* Milestone History */}
                      <div className="pt-2 border-t border-[#232838] space-y-1.5">
                        <span className="text-[10px] font-bold text-[#A6ADBB] block">
                          {lang === 'SW' ? 'KUMBUKUMBU ZA HISTORIA YA HATUA:' : 'AUDIT TRAIL & MILESTONE HISTORY:'}
                        </span>

                        {selectedBooking.history.map((h, i) => (
                          <div key={i} className="text-[10px] bg-[#111827] p-2 rounded-lg border border-[#232838]">
                            <div className="flex justify-between text-[#A6ADBB]">
                              <span className="font-bold text-[#D6AD62]">{h.status}</span>
                              <span>{h.time}</span>
                            </div>
                            <p className="text-[#F5F3EE] mt-0.5">{h.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN: CUSTOMER CARE & SUPPORT TICKETS */}
                {currentScreen === 'CUSTOMER_CARE' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-base font-bold text-[#F5F3EE]">Customer Care &amp; Support</h2>
                        <p className="text-[11px] text-[#A6ADBB]">Regional Mediation &amp; Verification Assistance</p>
                      </div>
                      <button
                        onClick={() => setShowAddTicketModal(true)}
                        className="bg-[#D6AD62] text-[#080B14] font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1"
                      >
                        <Plus size={12} /> New Ticket
                      </button>
                    </div>

                    {tickets.length === 0 ? (
                      <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-3">
                        <Headphones size={36} className="mx-auto text-[#A6ADBB]" />
                        <h4 className="text-sm font-bold text-[#F5F3EE]">No Support Tickets Yet</h4>
                        <p className="text-xs text-[#A6ADBB] max-w-xs mx-auto">
                          Have questions regarding equipment verification, cross-border filming permits, or escrow disbursement? Our operations desk is available.
                        </p>
                        <button
                          onClick={() => setShowAddTicketModal(true)}
                          className="bg-[#D6AD62] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Submit a Support Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tickets.map(t => (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62]/60 rounded-xl p-3 cursor-pointer space-y-1.5 text-xs transition"
                          >
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-[#D6AD62]">{t.reference}</span>
                              <span className="bg-[#111827] border border-[#262C3D] px-2 py-0.5 rounded text-[#F5F3EE]">{t.status}</span>
                            </div>
                            <h4 className="font-bold text-[#F5F3EE]">{t.subject}</h4>
                            <p className="text-[11px] text-[#A6ADBB]">{t.category}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SCREEN: FIND CREATIVE PROFESSIONALS */}
                {currentScreen === 'FIND_PROFESSIONAL' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <button
                        onClick={() => setCurrentScreen('HOME')}
                        className="text-[#A6ADBB] hover:text-[#D6AD62] text-xs flex items-center gap-1 font-semibold"
                      >
                        ← {lang === 'SW' ? 'Rudi Mwanzo' : 'Back to Explore'}
                      </button>
                      <button
                        onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                        className="text-xs text-[#D6AD62] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Video size={13} /> {lang === 'SW' ? 'Tazama Vifaa' : 'Browse Gear'} →
                      </button>
                    </div>
                    <CreativeDiscoverySection
                      creatives={creatives as any}
                      currentUser={currentUser as any}
                      onSelectCreativeForBooking={(creative) => {
                        setSelectedCreativeForBooking(creative);
                        setShowBookCreativeModal(true);
                      }}
                      lang={lang}
                    />
                  </div>
                )}

                {/* SCREEN: EQUIPMENT MARKETPLACE */}
                {currentScreen === 'EQUIPMENT_MARKETPLACE' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <button
                        onClick={() => setCurrentScreen('HOME')}
                        className="text-[#A6ADBB] hover:text-[#D6AD62] text-xs flex items-center gap-1 font-semibold"
                      >
                        ← {lang === 'SW' ? 'Rudi Mwanzo' : 'Back to Explore'}
                      </button>
                      <div className="flex items-center gap-2">
                        {currentUser.activeRole === 'EQUIPMENT_OWNER' && (
                          <button
                            onClick={() => setCurrentScreen('EQUIPMENT_OWNER_DASHBOARD')}
                            className="text-xs text-[#D6AD62] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Package size={13} /> {lang === 'SW' ? 'Dawati Langu' : 'Owner Dashboard'} →
                          </button>
                        )}
                        <button
                          onClick={() => setCurrentScreen('FIND_PROFESSIONAL')}
                          className="text-xs text-[#A6ADBB] hover:text-[#D6AD62] flex items-center gap-1 font-semibold"
                        >
                          <Users size={13} /> {lang === 'SW' ? 'Wataalamu' : 'Pros'} →
                        </button>
                      </div>
                    </div>
                    <EquipmentMarketplaceSection
                      equipmentList={equipmentList as any}
                      currentUser={currentUser as any}
                      onSelectGearForRental={(item) => {
                        setSelectedGearForRental(item);
                        setShowRentGearModal(true);
                      }}
                      onOpenAddGearModal={() => setShowAddGearModal(true)}
                      lang={lang}
                    />
                  </div>
                )}

                {/* SCREEN: EQUIPMENT OWNER DASHBOARD */}
                {currentScreen === 'EQUIPMENT_OWNER_DASHBOARD' && currentUser && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <button
                        onClick={() => setCurrentScreen('HOME')}
                        className="text-[#A6ADBB] hover:text-[#D6AD62] text-xs flex items-center gap-1 font-semibold"
                      >
                        ← {lang === 'SW' ? 'Rudi Mwanzo' : 'Back to Explore'}
                      </button>
                      <button
                        onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                        className="text-xs text-[#D6AD62] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Video size={13} /> {lang === 'SW' ? 'Soko la Vifaa' : 'Public Marketplace'} →
                      </button>
                    </div>
                    <EquipmentOwnerDashboard
                      currentUser={currentUser as any}
                      equipmentList={equipmentList as any}
                      bookings={bookings}
                      onOpenAddGearModal={() => setShowAddGearModal(true)}
                      onEquipmentUpdated={(updated) => setEquipmentList(updated as any)}
                      onBookingStatusChanged={handleUpdateBookingStatus}
                      lang={lang}
                    />
                  </div>
                )}

                {/* SCREEN: CLIENT PROFILE & PERSONAL DETAILS */}
                {currentScreen === 'PROFILE_SETTINGS' && currentUser && (
                  <ClientProfileSection
                    currentUser={currentUser as any}
                    onProfileUpdated={(updated) => {
                      setCurrentUser(updated as any);
                      setProfilePhotoUrl(updated.profileImageUrl || null);
                      try {
                        localStorage.setItem('kazihub_user', JSON.stringify(updated));
                      } catch {}
                    }}
                    onLogout={handleLogout}
                    lang={lang}
                    onLanguageChange={(l) => setLang(l)}
                    onNavigateToBookingCenter={() => setCurrentScreen('BOOKING_CENTER')}
                    onOpenAdminPortal={() => {
                      setAuthScreen('ADMIN_PORTAL');
                      setAdminPortalTab('LOGIN');
                    }}
                  />
                )}

                {/* SCREEN: NOTIFICATIONS */}
                {currentScreen === 'NOTIFICATIONS' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h2 className="text-base font-bold text-[#F5F3EE]">Notifications</h2>
                    </div>
                    <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-2">
                      <Bell size={32} className="mx-auto text-[#A6ADBB]" />
                      <h4 className="text-sm font-bold text-[#F5F3EE]">No Notifications Yet</h4>
                      <p className="text-xs text-[#A6ADBB]">
                        Real-time contract alerts, escrow releases, and messages will arrive here.
                      </p>
                    </div>
                  </div>
                )}

                {/* SCREEN: ADMIN WORKSPACE (Protected Clearance Area) */}
                {currentScreen === 'ADMIN_WORKSPACE' && (
                  <div className="space-y-4 py-2">
                    {!currentUser.isAdmin ? (
                      /* STRICT UNAUTHORIZED ACCESS STATE (Section 2 & 5) */
                      <div className="min-h-[460px] flex flex-col items-center justify-center text-center p-6 space-y-3.5">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400">
                          <ShieldAlert size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-[#F5F3EE]">HTTP 403: Administrator Clearance Required</h2>
                        <p className="text-xs text-[#A6ADBB] leading-relaxed">
                          This restricted oversight workspace is reserved strictly for authorized operators. Public registration and client role toggles never grant administrator rights.
                        </p>

                        <div className="bg-[#171A24] border border-[#262C3D] p-3 rounded-xl text-left text-xs w-full space-y-1">
                          <span className="text-[#A6ADBB] block text-[10px]">Active Authenticated Account:</span>
                          <span className="font-bold text-[#F5F3EE] block">{currentUser.name} ({currentUser.email})</span>
                          <span className="text-red-400 text-[10px] block">Clearance Status: No Firebase Admin Custom Claims Found</span>
                        </div>

                        {/* Zero-Trust Server Provisioning Notice */}
                        <div className="w-full bg-[#111827] border border-[#D6AD62]/30 rounded-xl p-3.5 text-left space-y-2.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D6AD62]">
                            <Terminal size={14} />
                            <span>Server-Side Provisioning Required:</span>
                          </div>
                          <p className="text-[11px] text-[#A6ADBB] leading-relaxed">
                            Under KAZI HUB zero-trust security guidelines, administrative privileges cannot be granted through client-side tokens. Access must be provisioned via the Firebase Admin SDK on a trusted backend:
                          </p>
                          <div className="bg-[#080B14] p-2.5 rounded-lg border border-[#232838] font-mono text-[10px] text-[#D6AD62] space-y-0.5 overflow-x-auto">
                            <span className="text-[#A6ADBB] block"># Run from authorized server environment:</span>
                            <code>node scripts/provision-admin.js {currentUser.email}</code>
                          </div>
                          <span className="text-[10px] text-[#A6ADBB] block">
                            Once executed, the account receives server claim <code className="text-[#D6AD62]">&#123; admin: true &#125;</code> and can access this workspace upon sign-in.
                          </span>
                        </div>

                        <button
                          onClick={() => setCurrentScreen('HOME')}
                          className="bg-[#171A24] border border-[#262C3D] text-[#D6AD62] font-bold py-2.5 px-6 rounded-xl text-xs"
                        >
                          Return to Marketplace
                        </button>
                      </div>
                    ) : (
                      /* AUTHORIZED LIVE ADMIN DASHBOARD (Real Data Only) */
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-base font-bold text-amber-400 flex items-center gap-1.5">
                              <ShieldCheck size={16} /> Admin Oversight Center
                            </h2>
                            <p className="text-[10px] text-[#A6ADBB]">Authorized Staff: {currentUser.name}</p>
                          </div>
                        </div>

                        {/* Admin Section Tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                          {['OVERVIEW', 'USERS', 'BOOKINGS', 'DISPUTES', 'AUDIT_LOGS'].map(tab => (
                            <button
                              key={tab}
                              onClick={() => setAdminTab(tab)}
                              className={`px-2.5 py-1 rounded-lg transition ${
                                adminTab === tab ? 'bg-amber-500 text-[#080B14] font-bold' : 'bg-[#171A24] text-[#A6ADBB] border border-[#262C3D]'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Overview Stats (Zero Fabricated Metrics) */}
                        {adminTab === 'OVERVIEW' && (
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-[#171A24] p-3 rounded-xl border border-[#262C3D]">
                                <span className="text-[10px] text-[#A6ADBB]">Registered Users</span>
                                <span className="text-lg font-black text-[#D6AD62] block">{registeredUsers.length}</span>
                                <span className="text-[9px] text-[#A97943]">Live user registry</span>
                              </div>
                              <div className="bg-[#171A24] p-3 rounded-xl border border-[#262C3D]">
                                <span className="text-[10px] text-[#A6ADBB]">Active Bookings</span>
                                <span className="text-lg font-black text-emerald-400 block">{bookings.length}</span>
                                <span className="text-[9px] text-[#A97943]">Contracts in pipeline</span>
                              </div>
                              <div className="bg-[#171A24] p-3 rounded-xl border border-[#262C3D]">
                                <span className="text-[10px] text-[#A6ADBB]">Equipment Listings</span>
                                <span className="text-lg font-black text-amber-400 block">{equipmentList.length}</span>
                                <span className="text-[9px] text-[#A97943]">Gear marketplace</span>
                              </div>
                              <div className="bg-[#171A24] p-3 rounded-xl border border-[#262C3D]">
                                <span className="text-[10px] text-[#A6ADBB]">Active Disputes</span>
                                <span className="text-lg font-black text-red-400 block">
                                  {bookings.filter(b => b.status === 'DISPUTED').length}
                                </span>
                                <span className="text-[9px] text-[#A97943]">Mediation desk</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Users Tab with Real User Management */}
                        {adminTab === 'USERS' && (
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-[#D6AD62] block text-xs">Registered Accounts ({registeredUsers.length})</span>
                            {registeredUsers.length === 0 ? (
                              <p className="text-xs text-[#A6ADBB]">No users registered yet.</p>
                            ) : (
                              registeredUsers.map(u => (
                                <div key={u.id} className="bg-[#171A24] p-3 rounded-xl border border-[#262C3D] flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-[#F5F3EE] block">{u.name}</span>
                                    <span className="text-[10px] text-[#A6ADBB]">{u.email} • {u.roles.join(', ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                      {u.status}
                                    </span>
                                    {u.status === 'ACTIVE' ? (
                                      <button
                                        onClick={() => handleSuspendUser(u.id, 'Administrative suspension')}
                                        className="text-[10px] text-red-400 hover:underline"
                                      >
                                        Suspend
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleReactivateUser(u.id)}
                                        className="text-[10px] text-emerald-400 hover:underline"
                                      >
                                        Reactivate
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Disputes Tab */}
                        {adminTab === 'DISPUTES' && (
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-[#D6AD62] block text-xs">Mediation &amp; Escrow Disputes</span>
                            {bookings.filter(b => b.status === 'DISPUTED').length === 0 ? (
                              <div className="bg-[#111827] p-6 rounded-xl border border-[#262C3D] text-center text-xs text-[#A6ADBB]">
                                No active disputes recorded in the marketplace.
                              </div>
                            ) : (
                              bookings.filter(b => b.status === 'DISPUTED').map(b => (
                                <div key={b.id} className="bg-[#171A24] p-3 rounded-xl border border-red-500/40 space-y-1">
                                  <span className="font-bold text-red-400 block">{b.reference} • {b.title}</span>
                                  <p className="text-[11px] text-[#F5F3EE]">Reason: {b.dispute?.reason}</p>
                                  <span className="text-[10px] text-[#A6ADBB] block">Raised by: {b.dispute?.raisedBy} • {b.dispute?.time}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Audit Logs Tab */}
                        {adminTab === 'AUDIT_LOGS' && (
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-[#D6AD62] block text-xs">Administrative Action Audit Logs</span>
                            {auditLogs.length === 0 ? (
                              <div className="bg-[#111827] p-6 rounded-xl border border-[#262C3D] text-center text-xs text-[#A6ADBB]">
                                No administrative actions recorded in session audit log.
                              </div>
                            ) : (
                              auditLogs.map(log => (
                                <div key={log.id} className="bg-[#171A24] p-2.5 rounded-xl border border-[#262C3D] text-[11px] space-y-0.5">
                                  <div className="flex justify-between text-[#A6ADBB]">
                                    <span className="font-bold text-[#D6AD62]">{log.action}</span>
                                    <span>{log.timestamp}</span>
                                  </div>
                                  <p className="text-[#F5F3EE]">{log.details}</p>
                                  <span className="text-[9px] text-[#A97943]">Actor: {log.actor}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* APP NAVIGATION BOTTOM BAR */}
          {currentUser && (
            <div className="bg-[#111827] border-t border-[#232838] px-2 py-2 flex items-center justify-around text-xs shrink-0 select-none text-[#A6ADBB]">
              <button
                onClick={() => setCurrentScreen('HOME')}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'HOME' ? 'text-[#D6AD62] font-bold' : 'hover:text-[#F5F3EE]'}`}
              >
                <Compass size={17} />
                <span className="text-[10px]">{lang === 'SW' ? 'Mwanzo' : 'Explore'}</span>
              </button>
              <button
                onClick={() => setCurrentScreen('FIND_PROFESSIONAL')}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'FIND_PROFESSIONAL' ? 'text-[#D6AD62] font-bold' : 'hover:text-[#F5F3EE]'}`}
              >
                <Users size={17} />
                <span className="text-[10px]">{lang === 'SW' ? 'Wataalamu' : 'Pros'}</span>
              </button>
              <button
                onClick={() => setCurrentScreen('EQUIPMENT_MARKETPLACE')}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'EQUIPMENT_MARKETPLACE' ? 'text-[#D6AD62] font-bold' : 'hover:text-[#F5F3EE]'}`}
              >
                <Video size={17} />
                <span className="text-[10px]">{lang === 'SW' ? 'Vifaa' : 'Gear'}</span>
              </button>
              <button
                onClick={() => setCurrentScreen('BOOKING_CENTER')}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'BOOKING_CENTER' || currentScreen === 'BOOKING_DETAIL' ? 'text-[#D6AD62] font-bold' : 'hover:text-[#F5F3EE]'}`}
              >
                <Calendar size={17} />
                <span className="text-[10px]">{lang === 'SW' ? 'Nafasi' : 'Bookings'}</span>
              </button>
              {currentUser.activeRole === 'EQUIPMENT_OWNER' && (
                <button
                  onClick={() => setCurrentScreen('EQUIPMENT_OWNER_DASHBOARD')}
                  className={`flex flex-col items-center gap-1 ${currentScreen === 'EQUIPMENT_OWNER_DASHBOARD' ? 'text-[#D6AD62] font-bold' : 'hover:text-[#F5F3EE]'}`}
                >
                  <Package size={17} />
                  <span className="text-[10px]">{lang === 'SW' ? 'Mmiliki' : 'My Gear'}</span>
                </button>
              )}
              <button
                onClick={() => setCurrentScreen('PROFILE_SETTINGS')}
                className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE_SETTINGS' ? 'text-[#D6AD62] font-bold' : 'hover:text-[#F5F3EE]'}`}
              >
                <User size={17} />
                <span className="text-[10px]">{lang === 'SW' ? 'Wasifu' : 'Profile'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS & DIALOGS --- */}

      {/* 1. ROLE SWITCH DIALOG (Public Approved Roles Only) */}
      {showRoleDialog && currentUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-5 max-w-sm w-full space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#F5F3EE] text-sm">Switch Workspace Role</h3>
              <button onClick={() => setShowRoleDialog(false)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>
            <p className="text-[#A6ADBB] text-xs">
              Select an approved role to change your active view. Administrator is strictly isolated and server-protected:
            </p>

            <div className="space-y-2">
              {(['CLIENT', 'FREELANCER', 'EQUIPMENT_OWNER', 'PRODUCTION_COMPANY'] as PublicRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    const updated = { ...currentUser, activeRole: r };
                    setCurrentUser(updated);
                    try {
                      localStorage.setItem('kazihub_user', JSON.stringify(updated));
                    } catch {}
                    setShowRoleDialog(false);
                    if (r === 'EQUIPMENT_OWNER') {
                      setCurrentScreen('EQUIPMENT_OWNER_DASHBOARD');
                    } else if (r === 'CLIENT') {
                      setCurrentScreen('HOME');
                    } else {
                      setCurrentScreen('BOOKING_CENTER');
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition ${
                    currentUser.activeRole === r
                      ? 'bg-[#D6AD62]/20 border-[#D6AD62] text-[#D6AD62] font-bold'
                      : 'bg-[#111827] border-[#262C3D] text-[#F5F3EE] hover:border-[#D6AD62]/40'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{r.replace('_', ' ')}</span>
                    <span className="text-[10px] text-[#A6ADBB]">
                      {r === 'CLIENT'
                        ? 'Book professionals & rent cinema gear'
                        : r === 'EQUIPMENT_OWNER'
                        ? 'List cinema gear, manage calendar & rentals'
                        : r === 'FREELANCER'
                        ? 'Receive production contracts & submit quotes'
                        : 'Full production house crew & line management'}
                    </span>
                  </div>
                  {currentUser.activeRole === r && <Check size={14} className="text-[#D6AD62]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. QUOTATION BUILDER MODAL */}
      {showQuoteBuilder && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-5 max-w-md w-full space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#F5F3EE] text-sm">Build Line-Item Quotation</h3>
              <button onClick={() => setShowQuoteBuilder(false)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>
            <p className="text-[#A6ADBB]">Specify exact deliverables, line costs, and validity deadline:</p>

            <div className="space-y-3">
              <div>
                <label className="block text-[#A6ADBB] mb-1">Deliverable 1 Description</label>
                <input
                  type="text"
                  value={quoteItem1}
                  onChange={e => setQuoteItem1(e.target.value)}
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                />
                <input
                  type="number"
                  value={quoteCost1}
                  onChange={e => setQuoteCost1(e.target.value)}
                  placeholder="Cost amount"
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none mt-1"
                />
              </div>

              <div>
                <label className="block text-[#A6ADBB] mb-1">Deliverable 2 Description</label>
                <input
                  type="text"
                  value={quoteItem2}
                  onChange={e => setQuoteItem2(e.target.value)}
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                />
                <input
                  type="number"
                  value={quoteCost2}
                  onChange={e => setQuoteCost2(e.target.value)}
                  placeholder="Cost amount"
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none mt-1"
                />
              </div>

              <button
                onClick={handleSendQuotation}
                className="w-full bg-[#D6AD62] text-[#080B14] font-bold py-2.5 rounded-xl transition"
              >
                Send Official Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REVISION REQUEST MODAL */}
      {showRevisionModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#F5F3EE] text-sm">Request Scope Revisions</h3>
              <button onClick={() => setShowRevisionModal(false)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              placeholder="State line items that need adjustments..."
              rows={3}
              className="w-full bg-[#111827] border border-[#262C3D] rounded-xl p-3 text-[#F5F3EE] outline-none"
            />
            <button
              onClick={handleRequestRevisions}
              className="w-full bg-[#D6AD62] text-[#080B14] font-bold py-2 rounded-xl"
            >
              Submit Revision Request
            </button>
          </div>
        </div>
      )}

      {/* 4. DISPUTE FILING MODAL */}
      {showDisputeModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A24] border border-red-500/40 rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-red-400 text-sm">Escalate &amp; Raise Dispute</h3>
              <button onClick={() => setShowDisputeModal(false)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Provide exact reasons and violation of contract..."
              rows={3}
              className="w-full bg-[#111827] border border-[#262C3D] rounded-xl p-3 text-[#F5F3EE] outline-none"
            />
            <button
              onClick={handleRaiseDispute}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl"
            >
              Freeze Escrow &amp; Raise Dispute
            </button>
          </div>
        </div>
      )}

      {/* 5. ADD GEAR MODAL (15 CREATIVE & CINEMA EQUIPMENT CATEGORIES) */}
      {showAddGearModal && currentUser && (
        <AddGearModal
          currentUser={currentUser as any}
          isOpen={showAddGearModal}
          onClose={() => setShowAddGearModal(false)}
          onEquipmentCreated={(newGear) => {
            setEquipmentList(prev => [newGear, ...prev]);
            setShowAddGearModal(false);
            if (currentUser.activeRole === 'EQUIPMENT_OWNER') {
              setCurrentScreen('EQUIPMENT_OWNER_DASHBOARD');
            } else {
              setCurrentScreen('EQUIPMENT_MARKETPLACE');
            }
          }}
          lang={lang}
        />
      )}

      {/* 5a. DEDICATED NEW BOOKING MODAL (CREATIVE SERVICES & GEAR RENTALS) */}
      {showCreateBookingModal && currentUser && (
        <CreateBookingModal
          isOpen={showCreateBookingModal}
          onClose={() => setShowCreateBookingModal(false)}
          currentUser={currentUser as any}
          initialType={createBookingInitialType}
          onBookingCreated={(newBooking) => {
            setBookings(prev => [newBooking, ...prev]);
            setSelectedBooking(newBooking);
            setShowCreateBookingModal(false);
            setCurrentScreen('BOOKING_CENTER');
          }}
          onNavigateToProfile={() => {
            setShowCreateBookingModal(false);
            setCurrentScreen('PROFILE_SETTINGS');
          }}
          lang={lang}
        />
      )}

      {/* 5b. BOOK SERVICE / REQUEST QUOTE MODAL */}
      {showBookCreativeModal && selectedCreativeForBooking && currentUser && (
        <BookServiceModal
          creative={selectedCreativeForBooking}
          currentUser={currentUser as any}
          isOpen={showBookCreativeModal}
          onClose={() => {
            setShowBookCreativeModal(false);
            setSelectedCreativeForBooking(null);
          }}
          onBookingCreated={(newBooking) => {
            setBookings(prev => [newBooking, ...prev]);
            setShowBookCreativeModal(false);
            setSelectedCreativeForBooking(null);
            setCurrentScreen('BOOKING_CENTER');
          }}
          onNavigateToProfile={() => {
            setShowBookCreativeModal(false);
            setSelectedCreativeForBooking(null);
            setCurrentScreen('PROFILE_SETTINGS');
          }}
          lang={lang}
        />
      )}

      {/* 5c. RENT CINEMA GEAR MODAL */}
      {showRentGearModal && selectedGearForRental && currentUser && (
        <RentGearModal
          equipment={selectedGearForRental}
          currentUser={currentUser as any}
          isOpen={showRentGearModal}
          onClose={() => {
            setShowRentGearModal(false);
            setSelectedGearForRental(null);
          }}
          onBookingCreated={(newBooking) => {
            setBookings(prev => [newBooking, ...prev]);
            setShowRentGearModal(false);
            setSelectedGearForRental(null);
            setCurrentScreen('BOOKING_CENTER');
          }}
          onNavigateToProfile={() => {
            setShowRentGearModal(false);
            setSelectedGearForRental(null);
            setCurrentScreen('PROFILE_SETTINGS');
          }}
          lang={lang}
        />
      )}

      {/* 6. NEW SUPPORT TICKET MODAL */}
      {showAddTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#F5F3EE] text-sm">Submit Support Ticket</h3>
              <button onClick={() => setShowAddTicketModal(false)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-2.5">
              <div>
                <label className="block text-[#A6ADBB] mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value)}
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                >
                  <option value="Equipment Damage / Rental Dispute">Equipment Rental Issue</option>
                  <option value="Escrow Disbursement Delay">Escrow Disbursement</option>
                  <option value="Profile / ID Verification">Identity Verification</option>
                  <option value="General Platform Assistance">General Assistance</option>
                </select>
              </div>
              <div>
                <label className="block text-[#A6ADBB] mb-1">Subject *</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  placeholder="Brief summary of inquiry..."
                  required
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#A6ADBB] mb-1">Detailed Description *</label>
                <textarea
                  value={ticketDesc}
                  onChange={e => setTicketDesc(e.target.value)}
                  placeholder="Explain your issue in detail..."
                  rows={3}
                  required
                  className="w-full bg-[#111827] border border-[#262C3D] rounded-xl p-3 text-[#F5F3EE] outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D6AD62] text-[#080B14] font-bold py-2.5 rounded-xl transition"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. SUPPORT TICKET DETAIL MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-5 max-w-md w-full space-y-3 text-xs max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
              <div>
                <span className="font-bold text-[#D6AD62] text-xs">{selectedTicket.reference}</span>
                <h3 className="font-bold text-[#F5F3EE] text-sm">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {selectedTicket.responses.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs ${
                    r.isStaff
                      ? 'bg-[#111827] border-[#D6AD62]/40 text-[#F5F3EE]'
                      : 'bg-[#1E2332] border-[#262C3D] text-[#F5F3EE]'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-[#A6ADBB] mb-1">
                    <span className="font-bold text-[#D6AD62]">{r.author} {r.isStaff ? '(Support Staff)' : ''}</span>
                    <span>{r.time}</span>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>

            <div className="shrink-0 pt-2 border-t border-[#232838] flex gap-2">
              <input
                type="text"
                value={ticketReplyInput}
                onChange={e => setTicketReplyInput(e.target.value)}
                placeholder="Type reply to support desk..."
                className="flex-1 bg-[#111827] border border-[#262C3D] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none"
              />
              <button
                onClick={handleAddTicketReply}
                className="bg-[#D6AD62] text-[#080B14] font-bold px-4 py-2 rounded-xl"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. CODE INSPECTOR MODAL */}
      {showInspector && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-5 max-w-xl w-full space-y-3 text-xs max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-[#D6AD62]" />
                <span className="font-bold text-[#F5F3EE]">Native Android &amp; Backend Code Architecture</span>
              </div>
              <button onClick={() => setShowInspector(false)} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] shrink-0">
              {['RealUserRepository.kt', 'RealBookingRepository.kt', 'RealCreativeRepository.kt', 'ADMIN_PROVISIONING.md', 'firestore.rules'].map(f => (
                <button
                  key={f}
                  onClick={() => setInspectorFile(f)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    inspectorFile === f ? 'bg-[#D6AD62] text-[#080B14] font-bold' : 'bg-[#171A24] text-[#A6ADBB]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-[#080B14] p-3 rounded-xl border border-[#262C3D] font-mono text-[11px] text-[#A6ADBB] space-y-2">
              {inspectorFile === 'RealUserRepository.kt' && (
                <pre className="whitespace-pre-wrap text-[#D6AD62]">
                  {`// Phase 1.3: RealUserRepository.kt
class RealUserRepository : UserRepository {
  override val isDemoDataSource: Boolean = false
  private val allPlatformUsers = mutableListOf<UserProfile>()

  override suspend fun registerUser(fullName, email, password, country, roles): Result<UserProfile> {
    // Zero-Trust Security: Reject client attempts to grant Administrator role
    if (roles.contains(UserRole.ADMINISTRATOR)) {
      return Result.failure(SecurityException("Unauthorized: Administrator cannot be granted through registration."))
    }
    // Real persistence into platform users registry
    ...
  }
}`}
                </pre>
              )}
              {inspectorFile === 'RealBookingRepository.kt' && (
                <pre className="whitespace-pre-wrap text-[#D6AD62]">
                  {`// Phase 1.3: RealBookingRepository.kt
class RealBookingRepository : BookingRepository {
  override val isDemoDataSource: Boolean = false
  // Real bookings registry (starts clean and empty)
  private val realBookings = mutableListOf<BookingRecord>()

  override fun getAllBookings(): Flow<List<BookingRecord>> = _bookingsFlow.asStateFlow()
  // Populated exclusively by genuine client job briefs and equipment rental checkouts.
}`}
                </pre>
              )}
              {inspectorFile === 'ADMIN_PROVISIONING.md' && (
                <pre className="whitespace-pre-wrap text-[#D6AD62]">
                  {`# KAZI HUB — SECURE ADMINISTRATOR PROVISIONING
1. Public registration never exposes Administrator.
2. Server-side custom claim required: { admin: true }
3. CLI script: node scripts/provision-admin.js <email>`}
                </pre>
              )}
              {inspectorFile === 'firestore.rules' && (
                <pre className="whitespace-pre-wrap text-[#D6AD62]">
                  {`function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

match /admin_audit_logs/{logId} {
  allow read, write: if isAdmin();
}`}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
