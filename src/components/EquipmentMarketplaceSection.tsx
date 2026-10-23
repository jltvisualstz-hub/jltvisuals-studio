import React, { useState, useMemo } from 'react';
import { Search, MapPin, DollarSign, Video, Plus, Shield, Package, Truck, CheckCircle2, AlertCircle, X, ArrowRight, Tag, Layers } from 'lucide-react';
import type { EquipmentItem } from './RentGearModal';
import type { UserProfileData } from './ClientProfileSection';
import {
  type Language,
  t,
  normalizeEquipmentCategoryId,
  getEquipmentCategoryLabel,
  getConditionLabel,
  getAvailabilityLabel,
  getCountryLabel,
  formatPluralListings,
  CANONICAL_EQUIPMENT_CATEGORY_IDS
} from '../i18n/translations';
import { useI18n } from '../i18n/LanguageContext';

interface EquipmentMarketplaceSectionProps {
  equipmentList: EquipmentItem[];
  currentUser: UserProfileData;
  onSelectGearForRental: (item: EquipmentItem) => void;
  onOpenAddGearModal: () => void;
  lang?: Language;
}

export const EquipmentMarketplaceSection: React.FC<EquipmentMarketplaceSectionProps> = ({
  equipmentList,
  currentUser,
  onSelectGearForRental,
  onOpenAddGearModal,
  lang: propLang
}) => {
  const i18n = useI18n();
  const effectiveLang: Language = propLang || i18n.lang || 'EN';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState<'ALL' | 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA'>('ALL');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Filtered equipment items using canonical category matching
  const filteredGear = useMemo(() => {
    return equipmentList.filter(item => {
      // Category filter
      if (selectedCatId !== 'ALL') {
        const itemCatId = normalizeEquipmentCategoryId(item.category);
        if (itemCatId !== selectedCatId) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== 'ALL' && item.country !== countryFilter) {
        return false;
      }

      // Condition filter
      if (conditionFilter !== 'ALL') {
        const normCond = getConditionLabel(item.condition || '', 'EN').toLowerCase();
        if (!normCond.includes(conditionFilter.toLowerCase())) {
          return false;
        }
      }

      // Availability filter
      if (availabilityFilter !== 'ALL' && item.availability !== availabilityFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const localizedCat = getEquipmentCategoryLabel(item.category, effectiveLang).toLowerCase();
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          localizedCat.includes(q) ||
          (item.modelSpecs && item.modelSpecs.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.ownerName && item.ownerName.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [equipmentList, selectedCatId, countryFilter, conditionFilter, availabilityFilter, searchQuery, effectiveLang]);

  return (
    <div className="space-y-4 py-1 text-xs">
      {/* HEADER & LIST GEAR ACTION */}
      <div className="flex justify-between items-center gap-2">
        <div>
          <h2 className="text-base font-bold text-[#F5F3EE]">
            {t(effectiveLang, 'equipment.title')}
          </h2>
          <p className="text-[11px] text-[#A6ADBB]">
            {t(effectiveLang, 'equipment.subtitle')}
          </p>
        </div>
        <button
          onClick={onOpenAddGearModal}
          className="bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow active:scale-95"
        >
          <Plus size={14} />
          <span>{t(effectiveLang, 'equipment.listGear')}</span>
        </button>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6ADBB]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t(effectiveLang, 'equipment.searchPlaceholder')}
          className="w-full bg-[#111827] border border-[#262C3D] focus:border-[#D6AD62] rounded-xl pl-9 pr-8 py-2.5 text-[#F5F3EE] outline-none text-xs transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6ADBB] hover:text-[#F5F3EE]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 15 CONFIGURED CANONICAL CATEGORIES FILTER TABS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#A6ADBB]">
          <span className="font-semibold text-[#F5F3EE]/80">
            {t(effectiveLang, 'equipment.categories')}
          </span>
          <span className="font-semibold text-[#D6AD62]">
            {formatPluralListings(filteredGear.length, effectiveLang)}
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => setSelectedCatId('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-semibold cursor-pointer ${
              selectedCatId === 'ALL'
                ? 'bg-[#D6AD62] text-[#080B14] shadow'
                : 'bg-[#171A24] text-[#A6ADBB] border border-[#262C3D] hover:text-[#F5F3EE]'
            }`}
          >
            {t(effectiveLang, 'equipment.allCategories')}
          </button>
          {CANONICAL_EQUIPMENT_CATEGORY_IDS.map(catId => {
            const isSelected = selectedCatId === catId;
            const label = getEquipmentCategoryLabel(catId, effectiveLang);

            return (
              <button
                key={catId}
                onClick={() => setSelectedCatId(catId)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition text-xs font-semibold cursor-pointer ${
                  isSelected
                    ? 'bg-[#D6AD62] text-[#080B14] shadow'
                    : 'bg-[#171A24] text-[#A6ADBB] border border-[#262C3D] hover:text-[#F5F3EE]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECONDARY FILTER CONTROLS */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        {/* Country Filter */}
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value as any)}
          className="bg-[#171A24] border border-[#262C3D] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
        >
          <option value="ALL">{getCountryLabel('ALL', effectiveLang)}</option>
          <option value="TANZANIA">{getCountryLabel('TANZANIA', effectiveLang)}</option>
          <option value="KENYA">{getCountryLabel('KENYA', effectiveLang)}</option>
          <option value="UGANDA">{getCountryLabel('UGANDA', effectiveLang)}</option>
          <option value="RWANDA">{getCountryLabel('RWANDA', effectiveLang)}</option>
        </select>

        {/* Condition Filter */}
        <select
          value={conditionFilter}
          onChange={e => setConditionFilter(e.target.value)}
          className="bg-[#171A24] border border-[#262C3D] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
        >
          <option value="ALL">{getConditionLabel('ALL', effectiveLang)}</option>
          <option value="Brand New">{getConditionLabel('Brand New', effectiveLang)}</option>
          <option value="Mint">{getConditionLabel('Mint', effectiveLang)}</option>
          <option value="Excellent">{getConditionLabel('Excellent', effectiveLang)}</option>
          <option value="Good">{getConditionLabel('Good', effectiveLang)}</option>
        </select>

        {/* Availability */}
        <select
          value={availabilityFilter}
          onChange={e => setAvailabilityFilter(e.target.value)}
          className="bg-[#171A24] border border-[#262C3D] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
        >
          <option value="ALL">{getAvailabilityLabel('ALL', effectiveLang)}</option>
          <option value="AVAILABLE">{getAvailabilityLabel('AVAILABLE', effectiveLang)}</option>
          <option value="RENTED">{getAvailabilityLabel('RENTED', effectiveLang)}</option>
        </select>
      </div>

      {/* EQUIPMENT LISTINGS GRID / LIST */}
      {filteredGear.length === 0 ? (
        <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-3">
          <Video size={36} className="mx-auto text-[#A6ADBB]" />
          <h4 className="text-sm font-bold text-[#F5F3EE]">
            {selectedCatId !== 'ALL'
              ? t(effectiveLang, 'equipment.noListingsCategory', { category: getEquipmentCategoryLabel(selectedCatId, effectiveLang) })
              : t(effectiveLang, 'equipment.noEquipmentFound')}
          </h4>
          <p className="text-xs text-[#A6ADBB] max-w-sm mx-auto">
            {t(effectiveLang, 'equipment.emptyStateDesc')}
          </p>
          <div className="flex gap-2 justify-center pt-1">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCatId('ALL');
                setCountryFilter('ALL');
                setConditionFilter('ALL');
                setAvailabilityFilter('ALL');
              }}
              className="bg-[#171A24] border border-[#262C3D] text-[#D6AD62] font-semibold px-4 py-2 rounded-xl text-xs hover:border-[#D6AD62] cursor-pointer"
            >
              {t(effectiveLang, 'equipment.exploreAll')}
            </button>
            <button
              onClick={onOpenAddGearModal}
              className="bg-[#D6AD62] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#e0bc75] cursor-pointer"
            >
              {t(effectiveLang, 'equipment.listGearNow')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGear.map(item => {
            const localizedCategory = getEquipmentCategoryLabel(item.category, effectiveLang);
            const localizedCondition = getConditionLabel(item.condition || 'Excellent', effectiveLang);
            const localizedAvailability = getAvailabilityLabel(item.availability, effectiveLang);

            return (
              <div
                key={item.id}
                className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62]/60 rounded-2xl p-4 space-y-3 transition shadow-lg"
              >
                {/* TOP ROW: IMAGE, TITLE, OWNER, AVAILABILITY */}
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#080B14] border border-[#262C3D] shrink-0">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-[#F5F3EE] text-xs leading-snug line-clamp-1">{item.title}</h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          item.availability === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {localizedAvailability}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#D6AD62] font-semibold mt-0.5">{localizedCategory}</p>

                    {/* Model Specs */}
                    {item.modelSpecs && (
                      <p className="text-[11px] text-[#F5F3EE]/90 line-clamp-1 mt-0.5 font-mono text-[10px]">
                        {item.modelSpecs}
                      </p>
                    )}

                    {/* Unboxed Metadata: Condition, Location, Owner */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#A6ADBB] mt-1">
                      <span>{t(effectiveLang, 'equipment.condition')}: {localizedCondition}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{t(effectiveLang, 'equipment.owner')}: {item.ownerName}</span>
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {item.description && (
                  <p className="text-xs text-[#A6ADBB] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* INCLUDED ACCESSORIES */}
                {item.includedAccessories && item.includedAccessories.length > 0 && (
                  <div className="p-2 bg-[#111827] rounded-xl border border-[#262C3D] text-[10px] space-y-1">
                    <span className="text-[#A6ADBB] font-semibold block">
                      {t(effectiveLang, 'equipment.includedAccessories')}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.includedAccessories.map((acc, aIdx) => (
                        <span key={aIdx} className="bg-[#171A24] px-1.5 py-0.5 rounded text-[#F5F3EE]">
                          ✓ {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* PICKUP & DELIVERY TERMS */}
                {item.pickupDeliveryTerms && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#A97943]">
                    <Truck size={12} className="shrink-0" />
                    <span className="truncate">{item.pickupDeliveryTerms}</span>
                  </div>
                )}

                {/* PRICING & RENTAL TRIGGER */}
                <div className="pt-2 border-t border-[#232838] flex justify-between items-center">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-[#D6AD62] text-sm">
                        {item.currency} {item.dailyRate.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#A6ADBB]">
                        / {item.rateUnit === 'day' ? t(effectiveLang, 'equipment.day') : (item.rateUnit || t(effectiveLang, 'equipment.day'))}
                      </span>
                    </div>
                    {item.depositAmount && item.depositAmount > 0 ? (
                      <span className="text-[10px] text-[#A6ADBB] block">
                        {t(effectiveLang, 'equipment.refundableDeposit')}: {item.currency} {item.depositAmount.toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectGearForRental(item)}
                    className="bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                  >
                    <Video size={13} />
                    <span>{t(effectiveLang, 'equipment.rentNow')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
