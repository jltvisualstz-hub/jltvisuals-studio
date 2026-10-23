import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  Video,
  Users,
  Sparkles,
  Package,
  Shield,
  Check,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Camera,
  Layers,
  HelpCircle,
  Truck
} from 'lucide-react';
import type { UserProfileData } from './ClientProfileSection';
import type { CreativeProfessional } from './BookServiceModal';
import type { EquipmentItem } from './RentGearModal';
import { getServiceCategoryLabel, getEquipmentCategoryLabel, t } from '../i18n/translations';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfileData;
  onBookingCreated: (booking: any) => void;
  onNavigateToProfile: () => void;
  lang: 'EN' | 'SW';
  initialType?: 'CREATIVE_SERVICE' | 'EQUIPMENT_RENTAL';
}

const CREATIVE_SERVICE_CATEGORIES = [
  'Photography',
  'Videography',
  'Music recording',
  'Video recording',
  'Audio recording',
  'Music production',
  'Video editing',
  'Documentary production',
  'Drone services',
  'Sound engineering',
  'Lighting & grip',
  'Live broadcast'
];

const EQUIPMENT_CATEGORIES = [
  'Cameras and lenses',
  'Lighting and grip',
  'Audio and sound equipment',
  'Drones',
  'TV screens, commercial displays, and LED walls',
  'Projectors and screens',
  'Tripods, rigs, stabilizers, and gimbals',
  'Live-streaming and broadcast equipment',
  'Studio equipment',
  'Batteries, power, and connectivity',
  'Editing computers and workstations',
  'Event and stage production equipment',
  'Teleprompters and intercom systems',
  'Production accessories',
  'Other equipment'
];

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onBookingCreated,
  onNavigateToProfile,
  lang,
  initialType = 'CREATIVE_SERVICE'
}) => {
  if (!isOpen) return null;

  // Primary mode: Creative Service vs Equipment Rental
  const [bookingMode, setBookingMode] = useState<'CREATIVE_SERVICE' | 'EQUIPMENT_RENTAL'>(initialType);

  // Creative discovery state
  const [creatives, setCreatives] = useState<CreativeProfessional[]>([]);
  const [isLoadingCreatives, setIsLoadingCreatives] = useState(false);
  const [creativeSearchQuery, setCreativeSearchQuery] = useState('');
  const [creativeCategoryFilter, setCreativeCategoryFilter] = useState('ALL');
  const [selectedCreative, setSelectedCreative] = useState<CreativeProfessional | null>(null);

  // Equipment marketplace state
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState('ALL');
  const [selectedGear, setSelectedGear] = useState<EquipmentItem | null>(null);

  // Form states - Creative Service
  const [projectTitle, setProjectTitle] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Photography');
  const [projectBrief, setProjectBrief] = useState('');
  const [serviceDate, setServiceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [serviceTime, setServiceTime] = useState('09:00 AM');
  const [duration, setDuration] = useState('1 Full Day (8-10 hrs)');
  const [projectLocation, setProjectLocation] = useState(
    currentUser.city ? `${currentUser.city}, ${currentUser.country}` : 'Dar es Salaam, Tanzania'
  );
  const [isQuotationRequested, setIsQuotationRequested] = useState(false);
  const [budget, setBudget] = useState('650000');
  const [currency, setCurrency] = useState(currentUser.country === 'KENYA' ? 'KES' : 'TZS');
  const [deliverables, setDeliverables] = useState('High-resolution master exports, RAW files backup, 2 revision cycles');
  const [contactPreference, setContactPreference] = useState<'In-App Message' | 'WhatsApp' | 'Phone Call' | 'Email'>('In-App Message');

  // Form states - Equipment Rental
  const todayStr = new Date().toISOString().split('T')[0];
  const returnStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [rentalStartDate, setRentalStartDate] = useState(todayStr);
  const [rentalEndDate, setRentalEndDate] = useState(returnStr);
  const [deliveryOption, setDeliveryOption] = useState<'STUDIO_PICKUP' | 'COURIER_DELIVERY' | 'TECHNICIAN_DELIVERY'>('STUDIO_PICKUP');
  const [rentalLocation, setRentalLocation] = useState(
    currentUser.city ? `${currentUser.city}, ${currentUser.country}` : 'Dar es Salaam, Tanzania'
  );
  const [rentalBrief, setRentalBrief] = useState('');
  const [agreeDepositTerms, setAgreeDepositTerms] = useState(false);

  // Submission & feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile completeness check
  const hasIncompletePhone = !currentUser.phoneNumber;

  // Load Creatives
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCreatives(true);
    fetch('/api/creatives')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setCreatives(data);
          if (data.length > 0 && !selectedCreative) {
            // Default to first verified creative if not yet picked
            setSelectedCreative(data[0]);
            setServiceCategory(data[0].category || 'Photography');
            if (data[0].rate) setBudget(String(data[0].rate));
            if (data[0].currency) setCurrency(data[0].currency);
          }
        }
      })
      .catch(err => console.error('Failed to load creatives:', err))
      .finally(() => {
        if (isMounted) setIsLoadingCreatives(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Load Equipment
  useEffect(() => {
    let isMounted = true;
    setIsLoadingEquipment(true);
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setEquipmentList(data);
          if (data.length > 0 && !selectedGear) {
            setSelectedGear(data[0]);
          }
        }
      })
      .catch(err => console.error('Failed to load equipment:', err))
      .finally(() => {
        if (isMounted) setIsLoadingEquipment(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Filtered creatives
  const filteredCreatives = useMemo(() => {
    return creatives.filter(c => {
      const matchCat = creativeCategoryFilter === 'ALL' || c.category?.toLowerCase() === creativeCategoryFilter.toLowerCase();
      const matchSearch = !creativeSearchQuery ||
        c.name.toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(creativeSearchQuery.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(creativeSearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [creatives, creativeCategoryFilter, creativeSearchQuery]);

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      const matchCat = equipmentCategoryFilter === 'ALL' || eq.category === equipmentCategoryFilter;
      const matchSearch = !equipmentSearchQuery ||
        eq.title.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
        eq.location?.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
        eq.ownerName?.toLowerCase().includes(equipmentSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [equipmentList, equipmentCategoryFilter, equipmentSearchQuery]);

  // Rental days & math
  const rentalDays = useMemo(() => {
    const s = new Date(rentalStartDate).getTime();
    const e = new Date(rentalEndDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 1;
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [rentalStartDate, rentalEndDate]);

  const gearSubtotal = selectedGear ? rentalDays * (selectedGear.dailyRate || 0) : 0;
  const gearDeposit = selectedGear ? (selectedGear.depositAmount || 0) : 0;
  const gearTotalHold = gearSubtotal + gearDeposit;

  // Handle select creative
  const handleSelectCreative = (c: CreativeProfessional) => {
    setSelectedCreative(c);
    setServiceCategory(c.category || 'Photography');
    if (c.rate) setBudget(String(c.rate));
    if (c.currency) setCurrency(c.currency);
  };

  // Submit Creative Service Booking
  const handleSubmitCreativeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedCreative) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali chagua mtaalamu wa sanaa au kampuni.' : 'Please select a creative professional or production company.');
      return;
    }

    if (!projectTitle.trim()) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali weka jina la mradi.' : 'Project title is required.');
      return;
    }

    if (!projectBrief.trim() || projectBrief.trim().length < 15) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali toa muhtasari wa mradi (angalau herufi 15).' : 'Detailed project brief is required (minimum 15 characters).');
      return;
    }

    if (!serviceDate) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali chagua tarehe ya huduma.' : 'Service date is required.');
      return;
    }

    const effectiveBudget = isQuotationRequested ? 0 : (Number(budget) || 0);

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CREATIVE_SERVICE',
          serviceCategory,
          title: projectTitle.trim(),
          projectBrief: projectBrief.trim(),
          serviceDate,
          serviceTime,
          duration,
          projectLocation: projectLocation.trim(),
          budget: effectiveBudget,
          currency,
          deliverables: deliverables.trim(),
          contactPreference,
          clientId: currentUser.id,
          clientName: currentUser.name,
          clientEmail: currentUser.email,
          clientPhone: currentUser.phoneNumber || '',
          clientType: currentUser.clientType || 'INDIVIDUAL',
          clientOrgName: currentUser.organizationName || '',
          providerId: selectedCreative.userId || selectedCreative.id,
          providerName: selectedCreative.name,
          providerRole: selectedCreative.providerType === 'PRODUCTION_COMPANY' ? 'Production Company' : 'Creative Professional'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit booking request.');
      }

      setSuccessMessage(
        lang === 'SW'
          ? `Mkataba wa kazi umetumwa kikamilifu! Rejea: ${data.booking.reference}`
          : `Booking request successfully created! Reference: ${data.booking.reference}`
      );

      setTimeout(() => {
        onBookingCreated(data.booking);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while submitting booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Equipment Rental Booking
  const handleSubmitEquipmentRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedGear) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali chagua kifaa cha kukodisha.' : 'Please select an equipment item to rent.');
      return;
    }

    if (!agreeDepositTerms) {
      setErrorMessage(
        lang === 'SW'
          ? 'Tafadhali kubali masharti ya dhamana ya usalama na ukaguzi wa vifaa.'
          : 'Please accept the refundable security deposit and equipment inspection terms.'
      );
      return;
    }

    if (!rentalStartDate || !rentalEndDate) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali chagua tarehe za kuanza na kurejesha.' : 'Please select valid rental start and return dates.');
      return;
    }

    if (new Date(rentalEndDate) < new Date(rentalStartDate)) {
      setErrorMessage(lang === 'SW' ? 'Tarehe ya kurejesha haiwezi kuwa kabla ya tarehe ya kuanza.' : 'Return date cannot be earlier than start date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EQUIPMENT_RENTAL',
          serviceCategory: selectedGear.category,
          title: `Rental: ${selectedGear.title}`,
          projectBrief: rentalBrief.trim() || `Equipment rental for ${selectedGear.title} (${rentalDays} days). Handover location: ${rentalLocation}.`,
          serviceDate: rentalStartDate,
          serviceTime: '09:00 AM',
          duration: `${rentalDays} Day${rentalDays > 1 ? 's' : ''}`,
          projectLocation: rentalLocation.trim(),
          budget: gearSubtotal,
          currency: selectedGear.currency || 'TZS',
          deliverables: `Gear inspection and handover for ${selectedGear.title}. Included accessories verified.`,
          contactPreference: 'In-App Message',
          clientId: currentUser.id,
          clientName: currentUser.name,
          clientEmail: currentUser.email,
          clientPhone: currentUser.phoneNumber || '',
          clientType: currentUser.clientType || 'INDIVIDUAL',
          clientOrgName: currentUser.organizationName || '',
          providerId: selectedGear.ownerId,
          providerName: selectedGear.ownerName,
          providerRole: 'Equipment Owner',
          rentalDetails: {
            equipmentId: selectedGear.id,
            equipmentTitle: selectedGear.title,
            startDate: rentalStartDate,
            endDate: rentalEndDate,
            rentalDays,
            dailyRate: selectedGear.dailyRate,
            depositAmount: selectedGear.depositAmount || 0,
            currency: selectedGear.currency || 'TZS',
            deliveryOption
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit equipment rental request.');
      }

      setSuccessMessage(
        lang === 'SW'
          ? `Ombi la kukodisha vifaa limethibitishwa! Rejea: ${data.booking.reference}`
          : `Equipment rental request submitted! Reference: ${data.booking.reference}`
      );

      setTimeout(() => {
        onBookingCreated(data.booking);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while submitting rental request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#111827] border border-[#D6AD62]/60 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* MODAL HEADER */}
        <div className="p-4 bg-[#171A24] border-b border-[#262C3D] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D6AD62]/20 border border-[#D6AD62] flex items-center justify-center text-[#D6AD62]">
              <Calendar size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#F5F3EE] text-sm md:text-base">
                  {lang === 'SW' ? 'Anzisha Mkataba Mpya wa Kazi' : 'Create New Booking Contract'}
                </h3>
                <span className="text-[10px] bg-[#D6AD62]/20 text-[#D6AD62] px-2 py-0.5 rounded font-bold">
                  {bookingMode === 'CREATIVE_SERVICE' ? 'PRO SERVICE' : 'GEAR RENTAL'}
                </span>
              </div>
              <p className="text-[11px] text-[#A6ADBB]">
                {lang === 'SW'
                  ? 'Fomu rasmi ya mkataba, makadirio, na uhifadhi salama wa kazi'
                  : 'Binding contract, escrow protection & East African creative coordination'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A6ADBB] hover:text-[#F5F3EE] p-1.5 rounded-lg hover:bg-[#232838] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* PROFILE COMPLETION WARNING */}
        {hasIncompletePhone && (
          <div className="mx-4 mt-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-400" />
              <span>
                {lang === 'SW'
                  ? 'Wasifu wako hauna nambari ya simu. Watoa huduma wanahitaji simu kwa ajili ya uratibu.'
                  : 'Your profile is missing a phone number. Complete it so providers can reach you.'}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToProfile();
              }}
              className="text-[#D6AD62] underline font-bold whitespace-nowrap text-[11px]"
            >
              {lang === 'SW' ? 'Weka Sasa' : 'Complete Profile'}
            </button>
          </div>
        )}

        {/* FEEDBACK BANNERS */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-4 mt-3 p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODE SELECTOR TABS */}
        <div className="p-3 bg-[#0D111A] border-b border-[#232838] shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setBookingMode('CREATIVE_SERVICE');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                bookingMode === 'CREATIVE_SERVICE'
                  ? 'bg-[#D6AD62] text-[#080B14] shadow-md'
                  : 'bg-[#171A24] text-[#A6ADBB] hover:text-[#F5F3EE] border border-[#262C3D]'
              }`}
            >
              <Users size={14} />
              <span>{lang === 'SW' ? 'A. Wataalamu wa Sanaa' : 'A. Book Creative Service'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBookingMode('EQUIPMENT_RENTAL');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                bookingMode === 'EQUIPMENT_RENTAL'
                  ? 'bg-[#D6AD62] text-[#080B14] shadow-md'
                  : 'bg-[#171A24] text-[#A6ADBB] hover:text-[#F5F3EE] border border-[#262C3D]'
              }`}
            >
              <Video size={14} />
              <span>{lang === 'SW' ? 'B. Kukodisha Vifaa' : 'B. Rent Equipment'}</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* ========================================================= */}
          {/* OPTION A: BOOK A CREATIVE SERVICE */}
          {/* ========================================================= */}
          {bookingMode === 'CREATIVE_SERVICE' && (
            <form onSubmit={handleSubmitCreativeBooking} className="space-y-4">
              
              {/* STEP 1: SELECT PROVIDER */}
              <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#D6AD62] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} /> {lang === 'SW' ? 'Hatua 1: Chagua Mtoa Huduma' : 'Step 1: Select Creative Provider'}
                  </span>
                  {selectedCreative && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check size={12} /> {selectedCreative.name}
                    </span>
                  )}
                </div>

                {/* Selected Creative Banner */}
                {selectedCreative ? (
                  <div className="bg-[#111827] border border-[#D6AD62]/40 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedCreative.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={selectedCreative.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#D6AD62]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-[#F5F3EE] text-xs">{selectedCreative.name}</h4>
                          <span className="text-[9px] bg-[#D6AD62]/20 text-[#D6AD62] px-1.5 py-0.2 rounded font-bold">
                            {selectedCreative.providerType === 'PRODUCTION_COMPANY' ? 'COMPANY' : 'PRO'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A6ADBB]">{selectedCreative.title} • {selectedCreative.location}</p>
                        <p className="text-[10px] text-[#D6AD62] font-semibold mt-0.5">
                          {lang === 'SW' ? 'Bei ya Kawaida:' : 'Standard Rate:'} {selectedCreative.currency} {selectedCreative.rate?.toLocaleString()} / {lang === 'SW' ? 'kwa siku' : 'day'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCreative(null)}
                      className="text-xs text-[#D6AD62] hover:underline font-semibold"
                    >
                      {lang === 'SW' ? 'Badili Mtoa Huduma' : 'Change Pro'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Search & Filter Controls */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-[#A6ADBB]" />
                        <input
                          type="text"
                          value={creativeSearchQuery}
                          onChange={e => setCreativeSearchQuery(e.target.value)}
                          placeholder={lang === 'SW' ? 'Tafuta kwa jina, ujuzi au eneo...' : 'Search by name, category, or city...'}
                          className="w-full bg-[#111827] border border-[#262C3D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
                        />
                      </div>
                      <select
                        value={creativeCategoryFilter}
                        onChange={e => setCreativeCategoryFilter(e.target.value)}
                        className="bg-[#111827] border border-[#262C3D] text-[#F5F3EE] text-xs rounded-xl px-2.5 py-1.5 outline-none"
                      >
                        <option value="ALL">{lang === 'SW' ? 'Kategoria Zote' : 'All Categories'}</option>
                        {CREATIVE_SERVICE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{getServiceCategoryLabel(cat, lang)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Selection List */}
                    {isLoadingCreatives ? (
                      <p className="text-center py-4 text-[#A6ADBB] text-xs">
                        {lang === 'SW' ? 'Inapakia saraka ya wataalamu...' : 'Loading talent directory...'}
                      </p>
                    ) : filteredCreatives.length === 0 ? (
                      <p className="text-center py-4 text-[#A6ADBB] text-xs">
                        {lang === 'SW' ? 'Hakuna wataalamu wanaolingana na utafutaji wako.' : 'No matching creative professionals found.'}
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {filteredCreatives.map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCreative(c)}
                            className="bg-[#111827] border border-[#232838] hover:border-[#D6AD62] rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={c.avatarUrl}
                                alt={c.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#D6AD62]/60"
                              />
                              <div>
                                <span className="font-bold text-[#F5F3EE] text-xs block">{c.name}</span>
                                <span className="text-[10px] text-[#A6ADBB]">{getServiceCategoryLabel(c.category, lang)} • {c.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-[#D6AD62] block">
                                {c.currency} {c.rate?.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-[#A6ADBB]">{c.providerType === 'PRODUCTION_COMPANY' ? 'Company' : 'Freelancer'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2: PROJECT & CONTRACT SPECIFICATIONS */}
              <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3.5 space-y-3">
                <span className="font-bold text-[#D6AD62] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} /> {lang === 'SW' ? 'Hatua 2: Maelezo ya Mradi na Mkataba' : 'Step 2: Project Specifications & Scope'}
                </span>

                {/* Service Category & Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A6ADBB] text-[11px] mb-1">
                      {lang === 'SW' ? 'Kategoria ya Huduma *' : 'Service Category *'}
                    </label>
                    <select
                      value={serviceCategory}
                      onChange={e => setServiceCategory(e.target.value)}
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
                    >
                      {CREATIVE_SERVICE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{getServiceCategoryLabel(cat, lang)}</option>
                      ))}
                      <option value="Other creative service">{getServiceCategoryLabel('other', lang)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A6ADBB] text-[11px] mb-1">
                      {lang === 'SW' ? 'Jina la Mradi / Aina ya Kazi *' : 'Project Title or Type *'}
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      placeholder={lang === 'SW' ? 'mf. Kurekodi Albamu ya Muziki' : 'e.g. Serengeti Documentary Film Shoot'}
                      required
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Detailed Brief */}
                <div>
                  <label className="block text-[#A6ADBB] text-[11px] mb-1">
                    {lang === 'SW' ? 'Muhtasari wa Kina wa Kazi (Brief) *' : 'Detailed Project Brief & Scope of Work *'}
                  </label>
                  <textarea
                    rows={3}
                    value={projectBrief}
                    onChange={e => setProjectBrief(e.target.value)}
                    placeholder={lang === 'SW' ? 'Eleza malengo ya mradi, mandhari, na matarajio ya kiufundi...' : 'Describe project objectives, style, narrative requirements, crew needed, and technical expectations...'}
                    required
                    className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] text-xs outline-none"
                  />
                </div>

                {/* Date, Time & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Tarehe ya Kazi *' : 'Service Date *'}
                    </label>
                    <input
                      type="date"
                      value={serviceDate}
                      min={todayStr}
                      onChange={e => setServiceDate(e.target.value)}
                      required
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Muda wa Kuanza' : 'Call Time'}
                    </label>
                    <select
                      value={serviceTime}
                      onChange={e => setServiceTime(e.target.value)}
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    >
                      <option value="06:00 AM">06:00 AM (Sunrise / Early)</option>
                      <option value="09:00 AM">09:00 AM (Standard Call)</option>
                      <option value="01:00 PM">01:00 PM (Afternoon Session)</option>
                      <option value="06:00 PM">06:00 PM (Golden Hour / Night)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Urefu wa Kazi' : 'Duration'}
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="e.g. 1 Full Day (10 hrs)"
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Location & Contact Preference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Eneo la Kazi / Studio *' : 'Project Location / Studio *'}
                    </label>
                    <input
                      type="text"
                      value={projectLocation}
                      onChange={e => setProjectLocation(e.target.value)}
                      placeholder="e.g. Arusha Cultural Heritage Center, Tanzania"
                      required
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Njia ya Mawasiliano' : 'Contact Preference'}
                    </label>
                    <select
                      value={contactPreference}
                      onChange={e => setContactPreference(e.target.value as any)}
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    >
                      <option value="In-App Message">{lang === 'SW' ? 'Gumzo la Ndani & Escrow' : 'In-App Chat & Escrow'}</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Phone Call">{lang === 'SW' ? 'Simu ya Moja kwa Moja' : 'Direct Phone Call'}</option>
                      <option value="Email">{lang === 'SW' ? 'Barua Pepe Rasmi' : 'Official Email'}</option>
                    </select>
                  </div>
                </div>

                {/* Budget & Currency */}
                <div className="bg-[#111827] p-3 rounded-xl border border-[#232838] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#F5F3EE] text-[11px]">
                      {lang === 'SW' ? 'Makadirio ya Bajeti au Ombi la Bei' : 'Budget & Quotation Preference'}
                    </span>
                    <label className="flex items-center gap-1.5 text-[10px] text-[#D6AD62] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isQuotationRequested}
                        onChange={e => setIsQuotationRequested(e.target.checked)}
                        className="rounded accent-[#D6AD62]"
                      />
                      <span>{lang === 'SW' ? 'Omba makadirio (Bila bajeti maalum)' : 'Request line-item quote'}</span>
                    </label>
                  </div>

                  {!isQuotationRequested ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[#A6ADBB] text-[9px] mb-0.5">Currency</label>
                        <select
                          value={currency}
                          onChange={e => setCurrency(e.target.value)}
                          className="w-full bg-[#171A24] border border-[#262C3D] text-[#D6AD62] font-bold text-xs rounded-xl px-2.5 py-1.5 outline-none"
                        >
                          <option value="TZS">TZS (Tanzania)</option>
                          <option value="KES">KES (Kenya)</option>
                          <option value="UGX">UGX (Uganda)</option>
                          <option value="RWF">RWF (Rwanda)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[#A6ADBB] text-[9px] mb-0.5">Budget Amount</label>
                        <input
                          type="number"
                          value={budget}
                          onChange={e => setBudget(e.target.value)}
                          min="0"
                          step="1000"
                          className="w-full bg-[#171A24] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-[#171A24] rounded-lg text-amber-300 text-[10px] flex items-center gap-2">
                      <HelpCircle size={14} className="shrink-0" />
                      <span>
                        {lang === 'SW'
                          ? 'Mtoa huduma ataandaa mchanganuo wa bei (line-item quotation) kulingana na muhtasari wako.'
                          : 'The provider will submit a detailed line-item quotation based on your brief before you confirm.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Deliverables */}
                <div>
                  <label className="block text-[#A6ADBB] text-[10px] mb-1">
                    {lang === 'SW' ? 'Matokeo Yanayotarajiwa (Deliverables) *' : 'Agreed Deliverables & Format Requirements *'}
                  </label>
                  <input
                    type="text"
                    value={deliverables}
                    onChange={e => setDeliverables(e.target.value)}
                    placeholder="e.g. Master ProRes 4K, 3 Social Reels, Sound Stems"
                    required
                    className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCreative}
                  className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] disabled:opacity-50 text-[#080B14] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  {isSubmitting ? (
                    <span>{lang === 'SW' ? 'Inatuma Ombi la Kazi...' : 'Submitting Booking Request...'}</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>
                        {isQuotationRequested
                          ? (lang === 'SW' ? 'Wasilisha Ombi la Makadirio ya Bei' : 'Request Official Line-Item Quotation')
                          : (lang === 'SW' ? 'Thibitisha na Tuma Ombi la Mkataba' : 'Submit & Create Booking Contract')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* OPTION B: RENT EQUIPMENT */}
          {/* ========================================================= */}
          {bookingMode === 'EQUIPMENT_RENTAL' && (
            <form onSubmit={handleSubmitEquipmentRental} className="space-y-4">
              
              {/* STEP 1: SELECT EQUIPMENT */}
              <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#D6AD62] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Video size={13} /> {lang === 'SW' ? 'Hatua 1: Chagua Kifaa cha Kukodisha' : 'Step 1: Select Equipment Item'}
                  </span>
                  {selectedGear && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check size={12} /> {selectedGear.title}
                    </span>
                  )}
                </div>

                {selectedGear ? (
                  <div className="bg-[#111827] border border-[#D6AD62]/40 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedGear.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80'}
                        alt={selectedGear.title}
                        className="w-14 h-14 rounded-xl object-cover border border-[#262C3D]"
                      />
                      <div>
                        <h4 className="font-bold text-[#F5F3EE] text-xs">{selectedGear.title}</h4>
                        <p className="text-[10px] text-[#A6ADBB]">{getEquipmentCategoryLabel(selectedGear.category, lang)} • {selectedGear.ownerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-[#D6AD62]">
                            {selectedGear.currency} {selectedGear.dailyRate?.toLocaleString()} / {lang === 'SW' ? 'kwa siku' : 'day'}
                          </span>
                          {selectedGear.depositAmount ? (
                            <span className="text-[10px] text-amber-300">
                              ({lang === 'SW' ? 'Dhamana:' : 'Deposit:'} {selectedGear.currency} {selectedGear.depositAmount.toLocaleString()})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGear(null)}
                      className="text-xs text-[#D6AD62] hover:underline font-semibold"
                    >
                      {lang === 'SW' ? 'Badili Kifaa' : 'Change Item'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-[#A6ADBB]" />
                        <input
                          type="text"
                          value={equipmentSearchQuery}
                          onChange={e => setEquipmentSearchQuery(e.target.value)}
                          placeholder={lang === 'SW' ? 'Tafuta kamera, drone, taa au audio...' : 'Search gear title, brand, or owner...'}
                          className="w-full bg-[#111827] border border-[#262C3D] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
                        />
                      </div>
                      <select
                        value={equipmentCategoryFilter}
                        onChange={e => setEquipmentCategoryFilter(e.target.value)}
                        className="bg-[#111827] border border-[#262C3D] text-[#F5F3EE] text-xs rounded-xl px-2.5 py-1.5 outline-none max-w-[150px]"
                      >
                        <option value="ALL">{lang === 'SW' ? 'Kategoria Zote' : 'All Gear'}</option>
                        {EQUIPMENT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{getEquipmentCategoryLabel(cat, lang)}</option>
                        ))}
                      </select>
                    </div>

                    {isLoadingEquipment ? (
                      <p className="text-center py-4 text-[#A6ADBB] text-xs">
                        {lang === 'SW' ? 'Inapakia orodha ya vifaa vilivyopo sokoni...' : 'Loading published equipment listings...'}
                      </p>
                    ) : filteredEquipment.length === 0 ? (
                      <p className="text-center py-4 text-[#A6ADBB] text-xs">
                        {lang === 'SW' ? 'Hakuna vifaa vinavyolingana na machaguo yako.' : 'No equipment matching your filters found.'}
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {filteredEquipment.map(item => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedGear(item)}
                            className="bg-[#111827] border border-[#232838] hover:border-[#D6AD62] rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[#262C3D]"
                              />
                              <div>
                                <span className="font-bold text-[#F5F3EE] text-xs block">{item.title}</span>
                                <span className="text-[10px] text-[#A6ADBB]">{getEquipmentCategoryLabel(item.category, lang)} • {item.location}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-[#D6AD62] block">
                                {item.currency} {item.dailyRate?.toLocaleString()} / {lang === 'SW' ? 'kwa siku' : 'day'}
                              </span>
                              <span className="text-[9px] text-[#A6ADBB]">{item.ownerName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 2: RENTAL SCHEDULE & LOGISTICS */}
              <div className="bg-[#171A24] border border-[#262C3D] rounded-xl p-3.5 space-y-3">
                <span className="font-bold text-[#D6AD62] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} /> {lang === 'SW' ? 'Hatua 2: Ratiba na Malipo ya Kukodisha' : 'Step 2: Rental Dates, Logistics & Pricing'}
                </span>

                {/* Rental Start and Return Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Tarehe ya Kuanza Kukodisha *' : 'Rental Start Date (Pickup) *'}
                    </label>
                    <input
                      type="date"
                      value={rentalStartDate}
                      min={todayStr}
                      onChange={e => setRentalStartDate(e.target.value)}
                      required
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Tarehe ya Kurejesha Vifaa *' : 'Return Date *'}
                    </label>
                    <input
                      type="date"
                      value={rentalEndDate}
                      min={rentalStartDate}
                      onChange={e => setRentalEndDate(e.target.value)}
                      required
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Logistics & Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Chaguo la Usafirishaji / Kuchukua' : 'Logistics & Handover Option'}
                    </label>
                    <select
                      value={deliveryOption}
                      onChange={e => setDeliveryOption(e.target.value as any)}
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    >
                      <option value="STUDIO_PICKUP">Studio / Gear Depot Pickup (Direct inspection)</option>
                      <option value="COURIER_DELIVERY">Secure Courier Delivery to Set</option>
                      <option value="TECHNICIAN_DELIVERY">On-Set Technician Delivery & Handover</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A6ADBB] text-[10px] mb-1">
                      {lang === 'SW' ? 'Eneo la Kuchukua / Kufikisha *' : 'Pickup / Delivery Location *'}
                    </label>
                    <input
                      type="text"
                      value={rentalLocation}
                      onChange={e => setRentalLocation(e.target.value)}
                      placeholder="e.g. Masaki Set Location, Dar es Salaam"
                      required
                      className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Brief & Notes */}
                <div>
                  <label className="block text-[#A6ADBB] text-[10px] mb-1">
                    {lang === 'SW' ? 'Matumizi ya Kifaa / Maelezo Maalum' : 'Project Shoot Brief / Special Handling Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={rentalBrief}
                    onChange={e => setRentalBrief(e.target.value)}
                    placeholder="Describe shoot conditions (studio, outdoor, drone flight plan, power availability)..."
                    className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-1.5 text-[#F5F3EE] text-xs outline-none"
                  />
                </div>

                {/* PRICING BREAKDOWN */}
                {selectedGear && (
                  <div className="bg-[#111827] border border-[#232838] rounded-xl p-3 space-y-1.5 text-[11px]">
                    <span className="font-bold text-[#D6AD62] block text-[10px] uppercase">
                      {lang === 'SW' ? 'Mchanganuo wa Gharama za Kukodisha:' : 'Rental Quote Calculation:'}
                    </span>
                    <div className="flex justify-between">
                      <span className="text-[#A6ADBB]">
                        {rentalDays} {lang === 'SW' ? 'Siku' : 'Day(s)'} @ {selectedGear.currency} {selectedGear.dailyRate?.toLocaleString()}/day:
                      </span>
                      <span className="font-semibold text-[#F5F3EE]">{selectedGear.currency} {gearSubtotal.toLocaleString()}</span>
                    </div>

                    {gearDeposit > 0 && (
                      <div className="flex justify-between text-amber-300">
                        <span>{lang === 'SW' ? 'Dhamana inayorejeshwa (0% Commission):' : 'Refundable Security Deposit (0% Commission):'}</span>
                        <span className="font-bold">+{selectedGear.currency} {gearDeposit.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-1.5 border-t border-[#232838] text-xs font-bold text-[#D6AD62]">
                      <span>{lang === 'SW' ? 'Jumla ya Mkataba na Dhamana:' : 'Total Hold / Contract Value:'}</span>
                      <span>{selectedGear.currency} {gearTotalHold.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Deposit Terms Acceptance */}
                <div className="bg-[#111827] p-2.5 rounded-xl border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
                  <input
                    type="checkbox"
                    id="agreeDepositTerms"
                    checked={agreeDepositTerms}
                    onChange={e => setAgreeDepositTerms(e.target.checked)}
                    className="mt-0.5 rounded accent-[#D6AD62]"
                  />
                  <label htmlFor="agreeDepositTerms" className="cursor-pointer leading-tight">
                    {lang === 'SW'
                      ? 'Ninakubali masharti ya ukaguzi wa vifaa wakati wa makabidhiano na uhifadhi salama wa dhamana hadi vifaa virejeshwe vikiwa salama.'
                      : 'I accept pre-rental condition inspection terms, safe operation standards, and refundable security deposit hold until equipment is returned in good condition.'}
                  </label>
                </div>
              </div>

              {/* SUBMIT RENTAL */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedGear}
                  className="w-full bg-[#D6AD62] hover:bg-[#E5C17D] disabled:opacity-50 text-[#080B14] font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                  {isSubmitting ? (
                    <span>{lang === 'SW' ? 'Inatuma Ombi la Vifaa...' : 'Submitting Rental Request...'}</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{lang === 'SW' ? 'Tuma Ombi la Kukodisha Vifaa' : 'Submit Equipment Rental Request'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
