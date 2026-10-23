import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, DollarSign, MapPin, Send, CheckCircle2, AlertCircle, Shield, Truck, AlertTriangle, Package } from 'lucide-react';
import type { UserProfileData } from './ClientProfileSection';
import { type Language, t, getEquipmentCategoryLabel } from '../i18n/translations';

export interface EquipmentItem {
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
}

interface RentGearModalProps {
  equipment: EquipmentItem;
  currentUser: UserProfileData;
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: any) => void;
  onNavigateToProfile: () => void;
  lang?: Language;
}

export const RentGearModal: React.FC<RentGearModalProps> = ({
  equipment,
  currentUser,
  isOpen,
  onClose,
  onBookingCreated,
  onNavigateToProfile,
  lang = 'EN'
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [deliveryOption, setDeliveryOption] = useState<'STUDIO_PICKUP' | 'COURIER_DELIVERY' | 'TECHNICIAN_DELIVERY'>('STUDIO_PICKUP');
  const [deliveryLocation, setDeliveryLocation] = useState(
    currentUser.city ? `${currentUser.city}, ${currentUser.country}` : equipment.location
  );
  const [rentalBrief, setRentalBrief] = useState('');
  const [agreeDepositTerms, setAgreeDepositTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate rental days
  const rentalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [startDate, endDate]);

  const subtotalRental = rentalDays * equipment.dailyRate;
  const deposit = equipment.depositAmount || 0;
  const totalHold = subtotalRental + deposit;

  const handleSubmitRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!agreeDepositTerms) {
      setErrorMessage(
        lang === 'SW'
          ? 'Tafadhali kubali masharti ya dhamana ya usalama na uhifadhi wa vifaa.'
          : 'Please accept the refundable security deposit and equipment care terms.'
      );
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali chagua tarehe za kukodisha.' : 'Please select valid rental start and return dates.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EQUIPMENT_RENTAL',
          title: `Rental: ${equipment.title}`,
          serviceCategory: equipment.category,
          clientId: currentUser.id,
          clientName: currentUser.name,
          clientEmail: currentUser.email,
          clientPhone: currentUser.phoneNumber || '',
          clientType: currentUser.clientType || 'INDIVIDUAL',
          clientOrgName: currentUser.organizationName || '',
          providerId: equipment.ownerId,
          providerName: equipment.ownerName,
          providerRole: 'Equipment Owner',
          projectBrief: rentalBrief.trim() || `Equipment rental for ${rentalDays} day(s)`,
          serviceDate: startDate,
          duration: `${rentalDays} Day(s)`,
          projectLocation: deliveryLocation,
          agreedAmount: subtotalRental,
          depositAmount: deposit,
          currency: equipment.currency,
          rentalDetails: {
            equipmentId: equipment.id,
            equipmentTitle: equipment.title,
            startDate,
            endDate,
            days: rentalDays,
            deposit,
            deliveryOption
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || (lang === 'SW' ? 'Imeshindwa kuunda ombi la kukodisha.' : 'Failed to submit rental request'));
      }

      setSuccessMessage(
        lang === 'SW'
          ? `Ombi la kukodisha limetumwa kwa mmiliki! Namba ya kumbukumbu: ${data.booking.reference}`
          : `Rental booking requested! Reference: ${data.booking.reference}`
      );

      onBookingCreated(data.booking);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'SW' ? 'Hitilafu imetokea wakati wa kutuma ombi.' : 'An error occurred while submitting your rental request.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const localizedCategory = getEquipmentCategoryLabel(equipment.category, lang);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto">
      <div className="bg-[#171A24] border border-[#262C3D] rounded-2xl max-w-lg w-full p-5 space-y-4 text-xs my-auto shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-[#262C3D] pb-3">
          <div>
            <h3 className="font-bold text-[#F5F3EE] text-sm">
              {lang === 'SW' ? 'Omba Kukodisha Vifaa vya Sinema' : 'Rent Cinema Equipment Package'}
            </h3>
            <p className="text-[11px] text-[#A6ADBB]">
              {lang === 'SW'
                ? 'Ukodishaji wa vifaa uliolindwa na Escrow ya KAZI HUB'
                : 'Verified equipment rental protected by KAZI HUB Escrow'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#A6ADBB] hover:text-[#F5F3EE] p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* EQUIPMENT OVERVIEW */}
        <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-3 flex gap-3 items-center">
          <img
            src={equipment.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'}
            alt={equipment.title}
            className="w-16 h-16 rounded-xl object-cover border border-[#D6AD62]/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#F5F3EE] text-xs truncate">{equipment.title}</h4>
            <p className="text-[11px] text-[#D6AD62] font-semibold">{localizedCategory}</p>
            <p className="text-[10px] text-[#A6ADBB]">
              {lang === 'SW' ? 'Mmiliki:' : 'Owner:'} {equipment.ownerName} • {equipment.location}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="font-bold text-[#F5F3EE]">
                {equipment.currency} {equipment.dailyRate.toLocaleString()} / {lang === 'SW' ? 'kwa siku' : 'day'}
              </span>
              {deposit > 0 && (
                <span className="text-[#A6ADBB]">
                  ({lang === 'SW' ? 'Dhamana:' : 'Deposit:'} {equipment.currency} {deposit.toLocaleString()})
                </span>
              )}
            </div>
          </div>
        </div>

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

        {/* RENTAL FORM */}
        <form onSubmit={handleSubmitRental} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Dates Selection */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Tarehe ya Kuanza (Kuchukua) *' : 'Pickup / Start Date *'}
              </label>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Tarehe ya Kurejesha *' : 'Return / End Date *'}
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
          </div>

          {/* Delivery & Dispatch Method */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Chaguo la Uchukuaji au Usafirishaji' : 'Pickup or Dispatch Option'}
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setDeliveryOption('STUDIO_PICKUP')}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  deliveryOption === 'STUDIO_PICKUP'
                    ? 'bg-[#D6AD62] text-[#080B14] font-bold border-[#D6AD62]'
                    : 'bg-[#111827] text-[#A6ADBB] border-[#262C3D]'
                }`}
              >
                {lang === 'SW' ? 'Kuchukua Studio' : 'Studio Pickup'}
              </button>
              <button
                type="button"
                onClick={() => setDeliveryOption('COURIER_DELIVERY')}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  deliveryOption === 'COURIER_DELIVERY'
                    ? 'bg-[#D6AD62] text-[#080B14] font-bold border-[#D6AD62]'
                    : 'bg-[#111827] text-[#A6ADBB] border-[#262C3D]'
                }`}
              >
                {lang === 'SW' ? 'Usafirishaji Seti' : 'Courier Delivery'}
              </button>
              <button
                type="button"
                onClick={() => setDeliveryOption('TECHNICIAN_DELIVERY')}
                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                  deliveryOption === 'TECHNICIAN_DELIVERY'
                    ? 'bg-[#D6AD62] text-[#080B14] font-bold border-[#D6AD62]'
                    : 'bg-[#111827] text-[#A6ADBB] border-[#262C3D]'
                }`}
              >
                {lang === 'SW' ? 'Fundi Kukabidhi' : 'On-Set Technician'}
              </button>
            </div>
          </div>

          {/* Project Location / Delivery Address */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Eneo la Kazi / Anwani ya Kupokelea *' : 'Production Location / Delivery Address *'}
            </label>
            <input
              type="text"
              value={deliveryLocation}
              onChange={e => setDeliveryLocation(e.target.value)}
              placeholder={lang === 'SW' ? 'mf. Arusha Safari Lodge au Njiro Production House' : 'e.g. Arusha Safari Lodge / Njiro Production House'}
              required
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
            />
          </div>

          {/* Rental Brief / Use Case */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Maelezo ya Kazi / Matumizi ya Kifaa' : 'Rental Scope / Shoot Purpose'}
            </label>
            <textarea
              rows={2}
              value={rentalBrief}
              onChange={e => setRentalBrief(e.target.value)}
              placeholder={
                lang === 'SW'
                  ? 'mf. Upigaji picha wa filamu ya wanyamapori Tarangire kwa siku 3...'
                  : 'e.g. 3-day exterior wildlife commercial shoot in Tarangire...'
              }
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs resize-none"
            />
          </div>

          {/* PRICING BREAKDOWN CARD */}
          <div className="bg-[#111827] border border-[#262C3D] rounded-xl p-3 space-y-1.5 text-xs">
            <span className="font-bold text-[#D6AD62] text-[11px] block uppercase tracking-wider">
              {lang === 'SW' ? 'Mchanganuo Wazi wa Gharama' : 'Transparent Cost Breakdown'}
            </span>
            <div className="flex justify-between text-[#A6ADBB]">
              <span>{lang === 'SW' ? 'Muda wa Kukodisha:' : 'Rental Duration:'}</span>
              <span className="text-[#F5F3EE] font-semibold">
                {rentalDays} {lang === 'SW' ? (rentalDays === 1 ? 'Siku' : 'Siku') : (rentalDays === 1 ? 'Day' : 'Days')}
              </span>
            </div>
            <div className="flex justify-between text-[#A6ADBB]">
              <span>{lang === 'SW' ? 'Bei kwa Siku:' : 'Daily Rate:'}</span>
              <span className="text-[#F5F3EE] font-semibold">{equipment.currency} {equipment.dailyRate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#A6ADBB]">
              <span>{lang === 'SW' ? 'Gharama ya Kukodisha:' : 'Equipment Rental Subtotal:'}</span>
              <span className="text-[#F5F3EE] font-semibold">{equipment.currency} {subtotalRental.toLocaleString()}</span>
            </div>
            {deposit > 0 && (
              <div className="flex justify-between text-amber-300">
                <span>{lang === 'SW' ? 'Dhamana Inayorejeshwa:' : 'Refundable Security Deposit:'}</span>
                <span className="font-semibold">{equipment.currency} {deposit.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-[#232838] flex justify-between font-bold text-sm">
              <span className="text-[#F5F3EE]">{lang === 'SW' ? 'Jumla ya Escrow:' : 'Total Escrow Hold:'}</span>
              <span className="text-[#D6AD62]">{equipment.currency} {totalHold.toLocaleString()}</span>
            </div>
          </div>

          {/* SECURITY DEPOSIT ACKNOWLEDGMENT */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeDepositTerms}
              onChange={e => setAgreeDepositTerms(e.target.checked)}
              className="mt-0.5 rounded border-[#262C3D] text-[#D6AD62] focus:ring-0"
            />
            <span className="text-[11px] text-[#A6ADBB]">
              {lang === 'SW'
                ? 'Nakubali masharti ya ukodishaji, naahidi kurejesha kifaa kikiwa katika hali nzuri pamoja na vifaa vyote, na ninakubali kushikiliwa kwa dhamana ya usalama kupitia escrow ya KAZI HUB.'
                : 'I acknowledge the rental terms, promise to return gear in agreed condition with all accessories, and agree to the refundable security deposit hold via KAZI HUB escrow.'}
            </span>
          </label>

          {/* FORM ACTIONS */}
          <div className="pt-2 border-t border-[#262C3D] flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer shadow"
            >
              <Send size={14} />
              {isSubmitting
                ? (lang === 'SW' ? 'Inatuma Mkataba...' : 'Submitting Contract...')
                : (lang === 'SW' ? 'Wasilisha Ombi la Kukodisha' : 'Submit Rental Booking')}
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
