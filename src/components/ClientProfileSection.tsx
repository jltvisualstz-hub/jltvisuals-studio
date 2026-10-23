import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Building, MapPin, Globe, Shield, CheckCircle2, AlertCircle, Save, X, Camera, Lock, ArrowRight, Upload, Check } from 'lucide-react';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  country: 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA';
  city?: string;
  phoneNumber?: string;
  callingCode?: string;
  roles: string[];
  isAdmin: boolean;
  activeRole: string;
  profileImageUrl?: string;
  bio?: string;
  clientType?: 'INDIVIDUAL' | 'ORGANIZATION';
  organizationName?: string;
  preferredLanguage?: 'EN' | 'SW';
  additionalNotes?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_PROFILE_COMPLETION';
  claims?: {
    admin?: boolean;
    kazi_role?: string;
    provisionedAt?: string;
  };
}

interface ClientProfileSectionProps {
  currentUser: UserProfileData;
  onProfileUpdated: (updatedUser: UserProfileData) => void;
  onLogout: () => void;
  lang: 'EN' | 'SW';
  onLanguageChange: (lang: 'EN' | 'SW') => void;
  onNavigateToBookingCenter?: () => void;
  onOpenAdminPortal?: () => void;
}

const COUNTRY_CALLING_CODES: Record<string, { code: string; flag: string; defaultCity: string }> = {
  TANZANIA: { code: '+255', flag: '🇹🇿', defaultCity: 'Arusha' },
  KENYA: { code: '+254', flag: '🇰🇪', defaultCity: 'Nairobi' },
  UGANDA: { code: '+256', flag: '🇺🇬', defaultCity: 'Kampala' },
  RWANDA: { code: '+250', flag: '🇷🇼', defaultCity: 'Kigali' }
};

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
];

export const ClientProfileSection: React.FC<ClientProfileSectionProps> = ({
  currentUser,
  onProfileUpdated,
  onLogout,
  lang,
  onLanguageChange,
  onNavigateToBookingCenter,
  onOpenAdminPortal
}) => {
  // Form state initialized with persistent user data
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [profilePhoto, setProfilePhoto] = useState(currentUser.profileImageUrl || '');
  const [country, setCountry] = useState<'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA'>(
    currentUser.country || 'TANZANIA'
  );
  const [callingCode, setCallingCode] = useState(
    currentUser.callingCode || COUNTRY_CALLING_CODES[currentUser.country || 'TANZANIA']?.code || '+255'
  );
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [clientType, setClientType] = useState<'INDIVIDUAL' | 'ORGANIZATION'>(
    currentUser.clientType || 'INDIVIDUAL'
  );
  const [organizationName, setOrganizationName] = useState(currentUser.organizationName || '');
  const [preferredLang, setPreferredLang] = useState<'EN' | 'SW'>(
    currentUser.preferredLanguage || lang || 'EN'
  );
  const [additionalNotes, setAdditionalNotes] = useState(currentUser.additionalNotes || currentUser.bio || '');

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Device File & Camera Picker State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{
    file: File;
    previewUrl: string;
    base64: string;
    sizeKb: number;
    name: string;
  } | null>(null);

  const handleDeviceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    setPhotoSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setPhotoError(lang === 'SW' ? 'Aina ya faili haikubaliki. Tafadhali tumia JPEG, PNG au WebP.' : 'Unsupported format. Please select JPEG, PNG, or WebP.');
      if (e.target) e.target.value = '';
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPhotoError(lang === 'SW' ? `Picha ni kubwa mno (${(file.size / (1024 * 1024)).toFixed(1)} MB). Kiwango cha juu ni 5MB.` : `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max allowed is 5MB.`);
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPendingFile({
        file,
        previewUrl: result,
        base64: result,
        sizeKb: Math.round(file.size / 1024),
        name: file.name
      });
      setPhotoSuccess(lang === 'SW' ? `Picha imeteuliwa: ${file.name} (${Math.round(file.size / 1024)} KB)` : `Photo selected: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    };
    reader.onerror = () => {
      setPhotoError(lang === 'SW' ? 'Haikuweza kusoma faili ya picha.' : 'Could not read image file.');
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleUploadPhoto = async () => {
    if (!pendingFile) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const res = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          imageBase64: pendingFile.base64,
          fileName: pendingFile.name,
          fileType: pendingFile.file.type
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Upload failed');
      }
      setProfilePhoto(data.profileImageUrl);
      const updatedUser = { ...currentUser, profileImageUrl: data.profileImageUrl };
      onProfileUpdated(updatedUser);
      setPendingFile(null);
      setShowPhotoPicker(false);
      setSaveSuccess(lang === 'SW' ? 'Picha ya wasifu imehifadhiwa vizuri kwenye kumbukumbu salama!' : 'Profile photo successfully uploaded and saved to secure storage!');
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelPending = () => {
    setPendingFile(null);
    setPhotoError(null);
    setPhotoSuccess(null);
  };

  // Synchronize when currentUser changes externally
  useEffect(() => {
    setFullName(currentUser.name || '');
    setProfilePhoto(currentUser.profileImageUrl || '');
    setCountry(currentUser.country || 'TANZANIA');
    setCallingCode(currentUser.callingCode || COUNTRY_CALLING_CODES[currentUser.country || 'TANZANIA']?.code || '+255');
    setPhoneNumber(currentUser.phoneNumber || '');
    setCity(currentUser.city || '');
    setClientType(currentUser.clientType || 'INDIVIDUAL');
    setOrganizationName(currentUser.organizationName || '');
    setPreferredLang(currentUser.preferredLanguage || lang || 'EN');
    setAdditionalNotes(currentUser.additionalNotes || currentUser.bio || '');
  }, [currentUser, lang]);

  // Handle Country Change
  const handleCountrySelect = (newCountry: 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA') => {
    setCountry(newCountry);
    const code = COUNTRY_CALLING_CODES[newCountry]?.code || '+255';
    setCallingCode(code);
    if (!city) {
      setCity(COUNTRY_CALLING_CODES[newCountry]?.defaultCity || '');
    }
  };

  // Check profile completeness
  const isProfileIncomplete = !phoneNumber.trim() || !city.trim() || (clientType === 'ORGANIZATION' && !organizationName.trim());

  // Handle Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!fullName.trim()) {
      setSaveError(lang === 'SW' ? 'Jina kamili linahitajika.' : 'Full name is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      setSaveError(lang === 'SW' ? 'Nambari ya simu inahitajika kwa mawasiliano ya kazi.' : 'Phone number is required for booking coordination.');
      return;
    }

    if (clientType === 'ORGANIZATION' && !organizationName.trim()) {
      setSaveError(lang === 'SW' ? 'Tafadhali ingiza jina la shirika/kampuni.' : 'Please enter your organization or company name.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          name: fullName.trim(),
          profileImageUrl: profilePhoto,
          phoneNumber: phoneNumber.trim(),
          callingCode,
          country,
          city: city.trim(),
          clientType,
          organizationName: organizationName.trim(),
          preferredLanguage: preferredLang,
          additionalNotes: additionalNotes.trim()
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      // Propagate update to parent and persistent storage
      onProfileUpdated(data.user);
      if (preferredLang !== lang) {
        onLanguageChange(preferredLang);
      }
      try {
        localStorage.setItem('kazihub_user', JSON.stringify(data.user));
      } catch {}

      setSaveSuccess(lang === 'SW' ? 'Wasifu umesasishwa na kuhifadhiwa kikamilifu!' : 'Client profile successfully saved and persisted to database!');
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: any) {
      setSaveError(err.message || 'Error saving profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to currentUser values
    setFullName(currentUser.name || '');
    setProfilePhoto(currentUser.profileImageUrl || '');
    setCountry(currentUser.country || 'TANZANIA');
    setCallingCode(currentUser.callingCode || COUNTRY_CALLING_CODES[currentUser.country || 'TANZANIA']?.code || '+255');
    setPhoneNumber(currentUser.phoneNumber || '');
    setCity(currentUser.city || '');
    setClientType(currentUser.clientType || 'INDIVIDUAL');
    setOrganizationName(currentUser.organizationName || '');
    setPreferredLang(currentUser.preferredLanguage || lang || 'EN');
    setAdditionalNotes(currentUser.additionalNotes || currentUser.bio || '');
    setIsEditing(false);
    setSaveError(null);
  };

  return (
    <div className="space-y-4 py-1 text-xs">
      {/* HEADER & ACTIONS */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#F5F3EE]">
            {lang === 'SW' ? 'Wasifu wa Mteja & Mipangilio' : 'Client Profile & Personal Details'}
          </h2>
          <p className="text-[11px] text-[#A6ADBB]">
            {lang === 'SW' ? 'Taarifa zako za utambulisho, mawasiliano na eneo la kazi' : 'Verified contact identity and operational booking details'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold px-3 py-1.5 rounded-xl text-xs transition"
          >
            {lang === 'SW' ? 'Hariri Wasifu' : 'Edit Profile'}
          </button>
        )}
      </div>

      {/* FEEDBACK BANNERS */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{saveError}</span>
        </div>
      )}

      {/* REQUIRED FIELD INCOMPLETE PROMPT */}
      {isProfileIncomplete && (
        <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-200 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-amber-300">
                {lang === 'SW' ? 'Kamilisha Wasifu Wako wa Mteja' : 'Action Required: Complete Your Profile'}
              </p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                {lang === 'SW'
                  ? 'Nambari ya simu na mji wa huduma vinahitajika ili wataalamu na wenye vifaa waweze kuratibu na kuthibitisha maombi yako ya kazi.'
                  : 'Phone number and operational city are required so creative professionals and gear owners can coordinate booking deliveries.'}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-amber-500 hover:bg-amber-400 text-[#080B14] font-bold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5"
            >
              {lang === 'SW' ? 'Kamilisha Maelezo Sasa' : 'Complete Profile Now'} <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* OVERVIEW SUMMARY CARD */}
      <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl p-4 text-center space-y-3">
        <div className="relative w-20 h-20 rounded-full border-2 border-[#D6AD62] mx-auto overflow-hidden bg-[#080B14]">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={36} className="mx-auto mt-4 text-[#A6ADBB]" />
          )}
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowPhotoPicker(true)}
              className="absolute inset-0 bg-black/60 flex items-center justify-center text-[#D6AD62] font-semibold text-[10px]"
              title="Change Photo"
            >
              <Camera size={18} />
            </button>
          )}
        </div>

        <div>
          <h3 className="font-bold text-[#F5F3EE] text-sm">{fullName || currentUser.name}</h3>
          <p className="text-xs text-[#A6ADBB]">{currentUser.email}</p>
          <div className="flex items-center justify-center gap-2 mt-1 text-[11px]">
            <span className="text-[#D6AD62] font-semibold">
              {clientType === 'ORGANIZATION' ? `🏢 ${organizationName || 'Organization'}` : '👤 Individual Client'}
            </span>
            <span className="text-[#A6ADBB]">•</span>
            <span className="text-[#A6ADBB]">{city ? `${city}, ${country}` : country}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center pt-1 text-xs">
          {isEditing ? (
            <button
              type="button"
              onClick={() => setShowPhotoPicker(true)}
              className="bg-[#111827] border border-[#262C3D] hover:border-[#D6AD62] px-3 py-1.5 rounded-xl text-[#D6AD62] font-semibold flex items-center gap-1"
            >
              <Camera size={13} /> {lang === 'SW' ? 'Badili Picha' : 'Change Photo'}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#111827] border border-[#262C3D] hover:border-[#D6AD62] px-3 py-1.5 rounded-xl text-[#D6AD62] font-semibold"
            >
              {lang === 'SW' ? 'Badili Taarifa' : 'Edit Details'}
            </button>
          )}
          <button
            onClick={onLogout}
            className="bg-red-950/40 border border-red-500/30 hover:bg-red-900/50 px-3 py-1.5 rounded-xl text-red-400 font-semibold"
          >
            {lang === 'SW' ? 'Toka kwenye Akaunti' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* PHOTO SELECTION MODAL */}
      {showPhotoPicker && (
        <div className="p-4 bg-[#111827] border border-[#D6AD62]/60 rounded-2xl space-y-3 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#F5F3EE] text-xs">
              {lang === 'SW' ? 'Picha ya Wasifu (Chagua kutoka Kifaa au Kamera)' : 'Profile Photo (Choose from Device or Camera)'}
            </span>
            <button onClick={() => { setShowPhotoPicker(false); handleCancelPending(); }} className="text-[#A6ADBB] hover:text-[#F5F3EE]">
              <X size={15} />
            </button>
          </div>

          {photoError && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span>{photoError}</span>
            </div>
          )}

          {photoSuccess && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
              <span>{photoSuccess}</span>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleDeviceFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleDeviceFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#171A24] hover:bg-[#232838] border border-[#D6AD62]/50 text-[#D6AD62] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Upload size={14} /> {lang === 'SW' ? 'Pakia kutoka Simu' : 'Upload from Device'}
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="bg-[#171A24] hover:bg-[#232838] border border-[#D6AD62]/50 text-[#D6AD62] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Camera size={14} /> {lang === 'SW' ? 'Piga Picha (Kamera)' : 'Capture (Camera)'}
            </button>
          </div>

          {/* Pending Photo Preview & Upload Confirmation */}
          {pendingFile && (
            <div className="bg-[#171A24] border border-[#D6AD62] rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2.5">
                <img src={pendingFile.previewUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-[#D6AD62]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#F5F3EE] truncate">{pendingFile.name}</p>
                  <p className="text-[10px] text-[#D6AD62] font-mono">{pendingFile.sizeKb} KB • {pendingFile.file.type.split('/')[1]?.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={isUploadingPhoto}
                  className="flex-1 bg-[#D6AD62] hover:bg-[#E5C17D] text-[#080B14] font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {isUploadingPhoto ? (
                    <span>{lang === 'SW' ? 'Inahifadhi...' : 'Uploading...'}</span>
                  ) : (
                    <>
                      <Check size={14} /> {lang === 'SW' ? 'Hifadhi kwenye Wasifu' : 'Save to Profile'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPending}
                  disabled={isUploadingPhoto}
                  className="px-3 bg-[#262C3D] hover:bg-[#32394E] text-[#A6ADBB] hover:text-[#F5F3EE] rounded-lg text-xs font-semibold"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="pt-1">
            <label className="block text-[10px] text-[#A6ADBB] mb-1.5">
              {lang === 'SW' ? 'Au chagua picha ya kielelezo cha ubunifu:' : 'Or choose creative headshot preset:'}
            </label>
            <div className="flex gap-2">
              {SAMPLE_AVATARS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  onClick={() => {
                    setProfilePhoto(url);
                    setShowPhotoPicker(false);
                    handleCancelPending();
                  }}
                  className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition ${
                    profilePhoto === url ? 'border-[#D6AD62] scale-105' : 'border-[#262C3D] hover:border-[#A6ADBB]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-[#232838]">
            <label className="block text-[10px] text-[#A6ADBB] mb-1">
              {lang === 'SW' ? 'Au weka kiungo cha picha (URL):' : 'Or enter custom image URL:'}
            </label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={customPhotoInput}
                onChange={e => setCustomPhotoInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-[#171A24] border border-[#262C3D] rounded-lg px-2.5 py-1 text-xs text-[#F5F3EE] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (customPhotoInput.trim()) {
                    setProfilePhoto(customPhotoInput.trim());
                    setShowPhotoPicker(false);
                    setCustomPhotoInput('');
                    handleCancelPending();
                  }
                }}
                className="bg-[#D6AD62] text-[#080B14] font-bold px-3 py-1 rounded-lg text-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE FORM OR READ-ONLY DETAILS */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-[#111827] border border-[#262C3D] rounded-2xl p-4 space-y-3.5">
          <div className="flex justify-between items-center border-b border-[#232838] pb-2">
            <span className="font-bold text-[#D6AD62] text-xs uppercase tracking-wider">
              {lang === 'SW' ? 'Fomu ya Kuhariri Wasifu' : 'Edit Profile Form'}
            </span>
            <span className="text-[10px] text-[#A6ADBB]">* {lang === 'SW' ? 'Inahitajika' : 'Required'}</span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Jina Kamili *' : 'Full Name *'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Baraka Elias Mushi"
                required
                className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
              />
            </div>
          </div>

          {/* Email (Read-Only Identity) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#A6ADBB] text-[11px]">
                {lang === 'SW' ? 'Barua Pepe ya Kuingia' : 'Authentication Email'}
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Lock size={10} /> Verified Account
              </span>
            </div>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full bg-[#080B14] border border-[#262C3D] rounded-xl px-3 py-2 text-[#A6ADBB] text-xs cursor-not-allowed opacity-80"
            />
          </div>

          {/* Phone Number with Country Calling Code Selector */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Nambari ya Simu na Nchi *' : 'Phone Number & Calling Code *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={country}
                onChange={e => handleCountrySelect(e.target.value as any)}
                className="bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2 py-2 text-[#F5F3EE] text-xs outline-none"
              >
                <option value="TANZANIA">🇹🇿 TZ (+255)</option>
                <option value="KENYA">🇰🇪 KE (+254)</option>
                <option value="UGANDA">🇺🇬 UG (+256)</option>
                <option value="RWANDA">🇷🇼 RW (+250)</option>
              </select>
              <div className="col-span-2 relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 754 112 233"
                  required
                  className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
                />
              </div>
            </div>
            <span className="text-[10px] text-[#A6ADBB] mt-1 block">
              Format: {callingCode} {phoneNumber || '754XXXXXX'}
            </span>
          </div>

          {/* Operational City / Location */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Mji wa Uendeshaji / Eneo la Kazi *' : 'Operational City / Service Location *'}
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Arusha (Njiro / CBD) or Dar es Salaam"
              required
              className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
            />
          </div>

          {/* Client Type: Individual vs Organization */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Aina ya Mteja' : 'Client Classification'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClientType('INDIVIDUAL')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  clientType === 'INDIVIDUAL'
                    ? 'bg-[#D6AD62] text-[#080B14] border-[#D6AD62]'
                    : 'bg-[#171A24] text-[#A6ADBB] border-[#262C3D] hover:text-[#F5F3EE]'
                }`}
              >
                👤 Individual Client
              </button>
              <button
                type="button"
                onClick={() => setClientType('ORGANIZATION')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  clientType === 'ORGANIZATION'
                    ? 'bg-[#D6AD62] text-[#080B14] border-[#D6AD62]'
                    : 'bg-[#171A24] text-[#A6ADBB] border-[#262C3D] hover:text-[#F5F3EE]'
                }`}
              >
                🏢 Organization / Company
              </button>
            </div>
          </div>

          {/* Organization Name (If Applicable) */}
          {clientType === 'ORGANIZATION' && (
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Jina la Shirika / Kampuni *' : 'Organization Name *'}
              </label>
              <input
                type="text"
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                placeholder="e.g. Serengeti Safari Films Ltd or East Africa Media Guild"
                required
                className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
              />
            </div>
          )}

          {/* Preferred Language */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Lugha Unayopendelea' : 'Preferred Language'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPreferredLang('EN')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  preferredLang === 'EN'
                    ? 'bg-[#171A24] text-[#D6AD62] border-[#D6AD62]'
                    : 'bg-[#171A24] text-[#A6ADBB] border-[#262C3D]'
                }`}
              >
                <Globe size={13} /> English
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('SW')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  preferredLang === 'SW'
                    ? 'bg-[#171A24] text-[#D6AD62] border-[#D6AD62]'
                    : 'bg-[#171A24] text-[#A6ADBB] border-[#262C3D]'
                }`}
              >
                <Globe size={13} /> Kiswahili
              </button>
            </div>
          </div>

          {/* Optional Additional Profile Information */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Maelezo ya Ziada ya Wasifu (Hiari)' : 'Additional Booking & Billing Information (Optional)'}
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Tax PIN / TIN, billing contact, default production requirements, preferred call times..."
              className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none resize-none"
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="flex gap-2 pt-2 border-t border-[#232838]">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? (lang === 'SW' ? 'Inahifadhi...' : 'Saving Changes...') : (lang === 'SW' ? 'Hifadhi Mabadiliko' : 'Save Changes')}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-4 bg-[#171A24] hover:bg-[#232838] border border-[#262C3D] text-[#A6ADBB] font-semibold py-2.5 rounded-xl transition"
            >
              {lang === 'SW' ? 'Ghairi' : 'Cancel'}
            </button>
          </div>
        </form>
      ) : (
        /* READ-ONLY MARKETPLACE PROFILE CARD */
        <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-[#232838] pb-2">
            <span className="font-bold text-[#D6AD62] text-xs uppercase tracking-wider">
              {lang === 'SW' ? 'Taarifa za Wasifu Uliothibitishwa' : 'Persistent Account Record'}
            </span>
            <span className="text-[10px] text-[#A6ADBB]">Synced with Server</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#A6ADBB] text-[10px] block">Full Name</span>
              <span className="text-[#F5F3EE] font-semibold">{currentUser.name || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-[#A6ADBB] text-[10px] block">Email Address</span>
              <span className="text-[#F5F3EE] font-semibold">{currentUser.email}</span>
            </div>
            <div>
              <span className="text-[#A6ADBB] text-[10px] block">Phone Number</span>
              <span className="text-[#F5F3EE] font-semibold">
                {currentUser.phoneNumber ? `${currentUser.callingCode || ''} ${currentUser.phoneNumber}` : 'Pending completion'}
              </span>
            </div>
            <div>
              <span className="text-[#A6ADBB] text-[10px] block">Country & Hub</span>
              <span className="text-[#F5F3EE] font-semibold">
                {currentUser.city ? `${currentUser.city}, ${currentUser.country}` : currentUser.country}
              </span>
            </div>
            <div>
              <span className="text-[#A6ADBB] text-[10px] block">Client Classification</span>
              <span className="text-[#F5F3EE] font-semibold">
                {currentUser.clientType === 'ORGANIZATION'
                  ? `🏢 ${currentUser.organizationName || 'Organization'}`
                  : '👤 Individual Client'}
              </span>
            </div>
            <div>
              <span className="text-[#A6ADBB] text-[10px] block">Interface Language</span>
              <span className="text-[#F5F3EE] font-semibold">
                {currentUser.preferredLanguage === 'SW' ? 'Kiswahili (SW)' : 'English (EN)'}
              </span>
            </div>
          </div>

          {currentUser.additionalNotes && (
            <div className="pt-2 border-t border-[#232838]">
              <span className="text-[#A6ADBB] text-[10px] block">Billing & Booking Preferences</span>
              <p className="text-[#F5F3EE] text-xs mt-0.5 whitespace-pre-wrap">{currentUser.additionalNotes}</p>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-[#232838] flex gap-2">
            {onNavigateToBookingCenter && (
              <button
                type="button"
                onClick={onNavigateToBookingCenter}
                className="flex-1 bg-[#171A24] hover:bg-[#232838] border border-[#262C3D] text-[#D6AD62] py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
              >
                <span>View My Bookings</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ZERO-TRUST SECURITY ASSURANCE CARD */}
      <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#D6AD62]" />
          <span className="font-bold text-[#F5F3EE] text-xs">
            {lang === 'SW' ? 'Uthibitisho wa Usalama & Mamlaka' : 'Platform Security & Role Isolation'}
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-[#A6ADBB]">
          <div className="flex justify-between">
            <span>Marketplace Roles:</span>
            <span className="text-[#F5F3EE] font-semibold">{currentUser.roles.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span>Server Administrator Claim:</span>
            <span className={currentUser.isAdmin ? 'text-emerald-400 font-bold' : 'text-[#A6ADBB]'}>
              {currentUser.isAdmin ? '✓ Server Verified Admin' : 'Standard Member (No Admin Privileges)'}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-[#A6ADBB] pt-1 border-t border-[#232838]">
          Protected zero-trust architecture: profile editing cannot modify server-managed claims or grant elevated administrator access.
        </p>

        {currentUser.isAdmin && onOpenAdminPortal && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenAdminPortal}
              className="w-full bg-[#A97943]/20 border border-[#A97943]/40 hover:bg-[#A97943]/30 text-[#D6AD62] font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Lock size={13} /> Open Administrator Workspace →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
