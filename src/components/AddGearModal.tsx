import React, { useState } from 'react';
import { X, Plus, Video, DollarSign, MapPin, CheckCircle2, AlertCircle, Camera, Shield, Tag } from 'lucide-react';
import type { UserProfileData } from './ClientProfileSection';
import {
  type Language,
  t,
  getEquipmentCategoryLabel,
  getConditionLabel,
  getCountryLabel
} from '../i18n/translations';

interface AddGearModalProps {
  currentUser: UserProfileData;
  isOpen: boolean;
  onClose: () => void;
  onEquipmentCreated: (equipment: any) => void;
  lang?: Language;
}

export const EQUIPMENT_CATEGORIES_15 = [
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

const SAMPLE_GEAR_PHOTOS = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
];

export const AddGearModal: React.FC<AddGearModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onEquipmentCreated,
  lang = 'EN'
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EQUIPMENT_CATEGORIES_15[0]);
  const [modelSpecs, setModelSpecs] = useState('');
  const [condition, setCondition] = useState<'Brand New' | 'Mint' | 'Excellent' | 'Good'>('Excellent');
  const [dailyRate, setDailyRate] = useState('250000');
  const [currency, setCurrency] = useState(
    currentUser.country === 'KENYA' ? 'KES' : currentUser.country === 'UGANDA' ? 'UGX' : currentUser.country === 'RWANDA' ? 'RWF' : 'TZS'
  );
  const [rateUnit, setRateUnit] = useState('day');
  const [depositAmount, setDepositAmount] = useState('300000');
  const [country, setCountry] = useState(currentUser.country || 'TANZANIA');
  const [location, setLocation] = useState(currentUser.city || 'Arusha Central Hub');
  const [pickupDeliveryTerms, setPickupDeliveryTerms] = useState('Studio pickup in Arusha or technician delivery to shoot location');
  const [includedAccessories, setIncludedAccessories] = useState('Hard flight case, 2x batteries, dual charger, mounting brackets');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(SAMPLE_GEAR_PHOTOS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali weka jina la kifaa.' : 'Equipment title is required.');
      return;
    }

    if (!dailyRate || Number(dailyRate) <= 0) {
      setErrorMessage(lang === 'SW' ? 'Tafadhali weka bei halali ya ukodishaji.' : 'Please enter a valid rental rate.');
      return;
    }

    setIsSubmitting(true);
    try {
      const accList = includedAccessories
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          ownerContact: currentUser.phoneNumber ? `${currentUser.callingCode || ''} ${currentUser.phoneNumber}` : currentUser.email,
          title: title.trim(),
          category,
          modelSpecs: modelSpecs.trim(),
          condition,
          dailyRate: Number(dailyRate),
          currency,
          rateUnit,
          depositAmount: Number(depositAmount) || 0,
          country,
          location: location.trim(),
          pickupDeliveryTerms: pickupDeliveryTerms.trim(),
          includedAccessories: accList,
          description: description.trim(),
          images: [imageUrl]
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || (lang === 'SW' ? 'Imeshindwa kuongeza kifaa.' : 'Failed to publish equipment'));
      }

      setSuccessMessage(
        lang === 'SW'
          ? `Kifaa "${data.equipment.title}" kimewekwa sokoni kikamilifu!`
          : `Equipment "${data.equipment.title}" published successfully to marketplace!`
      );

      onEquipmentCreated(data.equipment);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'SW' ? 'Hitilafu imetokea wakati wa kuweka kifaa sokoni.' : 'An error occurred while creating equipment listing.'));
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
              {lang === 'SW' ? 'Weka Kifaa Kipya Sokoni' : 'Add New Equipment Listing'}
            </h3>
            <p className="text-[11px] text-[#A6ADBB]">
              {lang === 'SW'
                ? 'Tangaza vifaa vyako vya sinema kwenye soko la KAZI HUB kwa wapiga picha na watengeneza filamu'
                : 'Publish cinema-grade gear into the regional rental marketplace'}
            </p>
          </div>
          <button onClick={onClose} className="text-[#A6ADBB] hover:text-[#F5F3EE] p-1 cursor-pointer">
            <X size={18} />
          </button>
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Jina la Kifaa *' : 'Equipment Title *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={lang === 'SW' ? 'mf. Sony FX6 Cinema Line Full Frame Kit' : 'e.g. Sony FX6 Cinema Line Full Frame Kit'}
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Aina ya Kifaa (Kategoria 15) *' : 'Equipment Category (15 Configured) *'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              >
                {EQUIPMENT_CATEGORIES_15.map(cat => (
                  <option key={cat} value={cat}>
                    {getEquipmentCategoryLabel(cat, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model / Specs & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Muundo & Vipimo vya Kiufundi' : 'Model & Specifications'}
              </label>
              <input
                type="text"
                value={modelSpecs}
                onChange={e => setModelSpecs(e.target.value)}
                placeholder="e.g. 4K 120fps, Dual ISO 800/12800, RAW out"
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Hali ya Kifaa' : 'Physical Condition'}
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              >
                <option value="Brand New">{getConditionLabel('Brand New', lang)}</option>
                <option value="Mint">{getConditionLabel('Mint', lang)}</option>
                <option value="Excellent">{getConditionLabel('Excellent', lang)}</option>
                <option value="Good">{getConditionLabel('Good', lang)}</option>
              </select>
            </div>
          </div>

          {/* Rate, Currency & Security Deposit */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Bei kwa Siku *' : 'Daily Rental Rate *'}
              </label>
              <input
                type="number"
                value={dailyRate}
                onChange={e => setDailyRate(e.target.value)}
                placeholder="250000"
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
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
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Dhamana ya Usalama' : 'Security Deposit'}
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="300000"
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
          </div>

          {/* Location / Dispatch Hub & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Mji / Eneo la Kuchukua Vifaa *' : 'Dispatch Hub / Operational City *'}
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder={lang === 'SW' ? 'mf. Njiro, Arusha au Masaki, Dar es Salaam' : 'e.g. Njiro, Arusha or Masaki, Dar es Salaam'}
                required
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[#A6ADBB] text-[11px] mb-1">
                {lang === 'SW' ? 'Nchi' : 'Country'}
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value as 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA')}
                className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-2.5 py-2 text-[#F5F3EE] outline-none text-xs"
              >
                <option value="TANZANIA">{getCountryLabel('TANZANIA', lang)}</option>
                <option value="KENYA">{getCountryLabel('KENYA', lang)}</option>
                <option value="UGANDA">{getCountryLabel('UGANDA', lang)}</option>
                <option value="RWANDA">{getCountryLabel('RWANDA', lang)}</option>
              </select>
            </div>
          </div>

          {/* Pickup & Delivery Terms */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Masharti ya Kuchukua / Kusafirisha' : 'Pickup / Delivery Terms'}
            </label>
            <input
              type="text"
              value={pickupDeliveryTerms}
              onChange={e => setPickupDeliveryTerms(e.target.value)}
              placeholder={
                lang === 'SW'
                  ? 'mf. Kuchukua studio Arusha au usafirishaji wa fundi hadi eneo la kazi'
                  : 'e.g. Studio pickup in Arusha; courier or on-set technician available'
              }
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
            />
          </div>

          {/* Included Accessories */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Vifaa Vidogo Vilivyojumuishwa (Tenganisha kwa koma)' : 'Included Accessories (comma separated)'}
            </label>
            <input
              type="text"
              value={includedAccessories}
              onChange={e => setIncludedAccessories(e.target.value)}
              placeholder="e.g. Flight case, 2x CFexpress cards, 3x batteries, top handle"
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Maelezo Kamili ya Kifaa & Hali Yake' : 'Description & Condition Details'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                lang === 'SW'
                  ? 'Eleza uwezo wa kifaa, historia ya matunzo, na utumiaji bora...'
                  : 'Describe gear capabilities, maintenance history, and best production use cases...'
              }
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs resize-none"
            />
          </div>

          {/* Listing Image Selector */}
          <div>
            <label className="block text-[#A6ADBB] text-[11px] mb-1">
              {lang === 'SW' ? 'Picha ya Kifaa (Chagua kiolezo au weka kiungo)' : 'Listing Photo URL'}
            </label>
            <div className="flex gap-2 mb-2">
              {SAMPLE_GEAR_PHOTOS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Preset ${idx}`}
                  onClick={() => setImageUrl(url)}
                  className={`w-14 h-12 rounded-lg object-cover cursor-pointer border-2 transition ${
                    imageUrl === url ? 'border-[#D6AD62] scale-105' : 'border-[#262C3D] opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl px-3 py-2 text-[#F5F3EE] outline-none text-xs"
            />
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="pt-2 border-t border-[#262C3D] flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer shadow"
            >
              <Plus size={14} />
              {isSubmitting
                ? (lang === 'SW' ? 'Inaweka Kifaa Sokoni...' : 'Publishing Gear...')
                : (lang === 'SW' ? 'Weka Kifaa Sokoni' : 'Publish Equipment Listing')}
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
