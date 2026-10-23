import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, MapPin, Send, CheckCircle2, AlertCircle, FileText, Phone, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import type { UserProfileData } from './ClientProfileSection';
import { type Language, t, getServiceCategoryLabel } from '../i18n/translations';

export interface CreativeProfessional {
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

interface BookServiceModalProps {
  creative: CreativeProfessional;
  currentUser: UserProfileData;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: any) => void;
  onNavigateToProfile: () => void;
  lang?: Language;
}

const SERVICE_CATEGORIES = [
  'Documentary production',
  'Photography',
  'Music recording',
  'Video recording',
  'Videography',
  'Audio production',
  'Editing',
  'Drone work',
  'Sound engineering',
  'Lighting & grip',
  'Live broadcast',
  'Color grading'
];

export const BookServiceModal: React.FC<BookServiceModalProps> = ({
  creative,
  currentUser,
  isOpen,
  onClose,
  onBookingCreated,
  onNavigateToProfile,
  lang = 'EN'
}) => {
  if (!isOpen) return null;

  // Form states
  const [projectTitle, setProjectTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState(creative.category || 'Documentary production');
  const [projectBrief, setProjectBrief] = useState('');
  const [serviceDate, setServiceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [serviceTime, setServiceTime] = useState('09:00 AM');
  const [duration, setDuration] = useState('1 Full Day (10 hours)');
  const [projectLocation, setProjectLocation] = useState(currentUser.city ? `${currentUser.city}, ${currentUser.country}` : 'Arusha, Tanzania');
  const [budget, setBudget] = useState(String(creative.rate || 500000));
  const [currency, setCurrency] = useState(creative.currency || 'TZS');
  const [deliverables, setDeliverables] = useState('Final master 4K edit, RAW project drive, 2 rounds of client revisions');
  const [contactPreference, setContactPreference] = useState<'In-App Message' | 'WhatsApp' | 'Phone Call' | 'Email'>('In-App Message');

  // Submit and feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if client profile is incomplete
  const hasIncompletePhone = !currentUser.phoneNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!projectTitle.trim()) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali weka jina la mradi.' : 'Project title is required.');
      return;
    }

    if (!projectBrief.trim() || projectBrief.trim().length < 15) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali toa muhtasari wa kina wa mradi (angalau herufi 15).' : 'Detailed project brief is required (minimum 15 characters).');
      return;
    }

    if (!serviceDate) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali chagua tarehe ya kazi.' : 'Service date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CREATIVE_SERVICE',
          title: projectTitle.trim(),
          serviceCategory,
          clientId: currentUser.id,
          clientName: currentUser.name,
          clientEmail: currentUser.email,
          clientPhone: currentUser.phoneNumber || '',
          clientType: currentUser.clientType || 'INDIVIDUAL',
          clientOrgName: currentUser.organizationName || '',
          providerId: creative.userId,
          providerName: creative.name,
          providerRole: creative.title,
          projectBrief: projectBrief.trim(),
          serviceDate,
          serviceTime,
          duration,
          projectLocation,
          budget: Number(budget) || 0,
          currency,
          deliverables,
          contactPreference,
          agreedAmount: 0 // Awaiting formal quotation
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || (lang === 'SW' ? 'Imeshindwa kuunda ombi la nafasi.' : 'Failed to create booking request.'));
      }

      setSuccessMessage(
        lang === 'SW'
          ? `Ombi la nafasi limewasilishwa kwa mafanikio! Nambari ya kumbukumbu: ${data.booking.reference}`
          : `Booking request successfully created! Reference: ${data.booking.reference}`
      );

      onBookingCreated(data.booking);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'SW' ? 'Hitilafu imetokea wakati wa kutuma ombi.' : 'An error occurred while creating booking request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl max-w-lg w-full p-5 space-y-4 text-xs my-auto shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#262C3D] pb-3">
          <div>
            <h3 className="font-bold text-[#F5F3EE] text-sm">
              {lang === 'SW' ? 'Agiza Huduma ya Sanaa' : 'Book Creative Professional'}
            </h3>
            <p className="text-[11px] text-[#A6ADBB]">
              {lang === 'SW'
                ? 'Mkataba rasmi na ulinzi wa malipo ya Escrow ya KAZI HUB'
                : 'Direct contract protected by KAZI HUB Escrow'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#A6ADBB] hover:text-[#F5F3EE] p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* CREATIVE SUMMARY CARD */}
        <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <img
              src={creative.avatarUrl}
              alt={creative.name}
              className="w-11 h-11 rounded-full object-cover border border-[#D6AD62]"
            />
            <div>
              <span className="font-bold text-[#F5F3EE] block text-xs">{creative.name}</span>
              <p className="text-[11px] text-[#A6ADBB]">{creative.title}</p>
              <p className="text-[10px] text-[#A97943]">{creative.location} ({creative.country})</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#A6ADBB] block">
              {t(lang, 'pros.standardRate')}
            </span>
            <span className="font-bold text-[#D6AD62] text-xs">
              {creative.currency} {creative.rate.toLocaleString()} / {t(lang, 'pros.perDay')}
            </span>
          </div>
        </div>

        {/* INCOMPLETE PROFILE WARNING */}
        {hasIncompletePhone && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <span>
                {lang === 'SW'
                  ? 'Wasifu wako hauna namba ya simu ya mawasiliano ya kazi.'
                  : 'Your profile is missing a phone number for shoot coordination.'}
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="text-[#D6AD62] font-bold underline hover:text-[#e0bc75] whitespace-nowrap ml-2 cursor-pointer"
            >
              {lang === 'SW' ? 'Weka Simu →' : 'Add Phone →'}
            </button>
          </div>
        )}

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="p-2.5 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* BOOKING FORM */}
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Project Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Jina la Mradi / Aina ya Kazi *' : 'Project Title / Type *'}
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                placeholder={lang === 'SW' ? 'mf. Kurekodi Albamu au Upigaji Picha' : 'e.g. Serengeti Wildlife Mini-Doc'}
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Kategoria ya Huduma' : 'Service Category'}
              </label>
              <select
                value={serviceCategory}
                onChange={e => setServiceCategory(e.target.value)}
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {getServiceCategoryLabel(cat, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project Brief */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Muhtasari wa Kina wa Mradi (Brief) *' : 'Detailed Project Brief *'}
            </label>
            <textarea
              rows={3}
              value={projectBrief}
              onChange={e => setProjectBrief(e.target.value)}
              placeholder={
                lang === 'SW'
                  ? 'Eleza malengo ya mradi, matarajio ya kisanaa, mandhari, na matarajio ya kiufundi...'
                  : 'Describe the project scope, artistic vision, key scenes, target delivery date, and technical expectations...'
              }
              required
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs resize-none"
            />
          </div>

          {/* Schedule: Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Tarehe ya Kazi *' : 'Shoot Date *'}
              </label>
              <input
                type="date"
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2 py-2 text-[#F5F3EE] outline-none text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Muda wa Kuanza' : 'Call Time'}
              </label>
              <input
                type="text"
                value={serviceTime}
                onChange={e => setServiceTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Muda wa Kazi' : 'Expected Duration'}
              </label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-1.5 py-2 text-[#F5F3EE] outline-none text-[11px]"
              >
                <option value="Half-day (4-5 hours)">{lang === 'SW' ? 'Nusu siku (masaa 4-5)' : 'Half-day (4h)'}</option>
                <option value="1 Full Day (10 hours)">{lang === 'SW' ? 'Siku 1 Kamili (masaa 10)' : '1 Full Day (10h)'}</option>
                <option value="2 Consecutive Days">{lang === 'SW' ? 'Siku 2 Mfululizo' : '2 Days'}</option>
                <option value="3 Days Package">{lang === 'SW' ? 'Kifurushi cha Siku 3' : '3 Days'}</option>
                <option value="1 Week Production">{lang === 'SW' ? 'Wiki 1 ya Uzalishaji' : '1 Week'}</option>
                <option value="Multi-week Campaign">{lang === 'SW' ? 'Wiki Nyingi' : 'Multi-week'}</option>
              </select>
            </div>
          </div>

          {/* Project Location / Venue */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Eneo la Kazi / Studio *' : 'Project Location / Shoot Venue *'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={projectLocation}
                onChange={e => setProjectLocation(e.target.value)}
                placeholder="e.g. Mount Meru Foothills, Arusha or Njiro Studios"
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Makadirio ya Bajeti' : 'Estimated Budget Amount'}
              </label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="500000"
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Sarafu' : 'Currency'}
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2 py-2 text-[#F5F3EE] outline-none text-xs"
              >
                <option value="TZS">TZS (Tanzania)</option>
                <option value="KES">KES (Kenya)</option>
                <option value="UGX">UGX (Uganda)</option>
                <option value="RWF">RWF (Rwanda)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Deliverables & Special Requirements */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Matokeo Yanayotarajiwa & Muundo *' : 'Deliverables & Special Requirements'}
            </label>
            <input
              type="text"
              value={deliverables}
              onChange={e => setDeliverables(e.target.value)}
              placeholder="e.g. 4K ProRes files, multitrack audio stems, color LUTs"
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
            />
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Njia Inayopendekezwa ya Mawasiliano' : 'Preferred Coordination Channel'}
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              {(['In-App Message', 'WhatsApp', 'Phone Call', 'Email'] as const).map(pref => {
                const label = pref === 'In-App Message'
                  ? (lang === 'SW' ? 'Gumzo la Ndani' : 'In-App Chat')
                  : pref === 'Phone Call'
                  ? (lang === 'SW' ? 'Simu' : 'Phone Call')
                  : pref === 'Email'
                  ? (lang === 'SW' ? 'Barua Pepe' : 'Email')
                  : pref;

                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setContactPreference(pref)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition cursor-pointer ${
                      contactPreference === pref
                        ? 'bg-[#D6AD62] text-[#080B14] font-bold border-[#D6AD62]'
                        : 'bg-[#111827] text-[#A6ADBB] border-[#262C3D]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 border-t border-[#262C3D] flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer shadow"
            >
              <Send size={14} />
              {isSubmitting
                ? (lang === 'SW' ? 'Inatuma kwa Mtoa Huduma...' : 'Submitting to Provider...')
                : (lang === 'SW' ? 'Tuma Ombi la Huduma' : 'Send Booking Request')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 bg-[#111827] hover:bg-[#232838] border border-[#262C3D] text-[#A6ADBB] font-semibold py-2.5 rounded-xl transition cursor-pointer"
            >
              {t(lang, 'common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
