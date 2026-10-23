import React, { useState, useMemo } from 'react';
import { Search, MapPin, DollarSign, Star, CheckCircle2, ExternalLink, Calendar, Plus, Filter, Users, X, ArrowRight } from 'lucide-react';
import type { CreativeProfessional } from './BookServiceModal';
import type { UserProfileData } from './ClientProfileSection';
import {
  type Language,
  t,
  normalizeServiceCategoryId,
  getServiceCategoryLabel,
  getCountryLabel,
  getProviderTypeLabel,
  getAvailabilityLabel,
  formatPluralProfessionals
} from '../i18n/translations';
import { useI18n } from '../i18n/LanguageContext';

interface CreativeDiscoverySectionProps {
  creatives: CreativeProfessional[];
  currentUser: UserProfileData;
  onSelectCreativeForBooking: (creative: CreativeProfessional) => void;
  lang?: Language;
}

const CATEGORY_FILTER_IDS = [
  'ALL',
  'photography',
  'music_recording',
  'video_recording',
  'videography',
  'video_editing',
  'documentary_production',
  'drone_services',
  'sound_engineering',
  'lighting_grip',
  'live_broadcast',
  'color_grading',
  'audio_production'
];

export const CreativeDiscoverySection: React.FC<CreativeDiscoverySectionProps> = ({
  creatives,
  currentUser,
  onSelectCreativeForBooking,
  lang: propLang
}) => {
  const i18n = useI18n();
  // Support either prop or context for absolute reactivity
  const effectiveLang: Language = propLang || i18n.lang || 'EN';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('ALL');
  const [countryFilter, setCountryFilter] = useState<'ALL' | 'TANZANIA' | 'KENYA' | 'UGANDA' | 'RWANDA'>('ALL');
  const [providerTypeFilter, setProviderTypeFilter] = useState<'ALL' | 'FREELANCER' | 'PRODUCTION_COMPANY'>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE_NOW' | 'AVAILABLE_THIS_WEEK'>('ALL');
  const [priceMaxFilter, setPriceMaxFilter] = useState<number | null>(null);

  // Filtered creatives using normalized stable category IDs and resilient matching
  const filteredCreatives = useMemo(() => {
    return creatives.filter(c => {
      // Stable Category Filter
      if (selectedCatId !== 'ALL') {
        const itemCatId = normalizeServiceCategoryId(c.category);
        const matchesCategory = itemCatId === selectedCatId;
        const matchesSkills = c.skills && c.skills.some(s => normalizeServiceCategoryId(s) === selectedCatId);

        if (!matchesCategory && !matchesSkills) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== 'ALL' && c.country !== countryFilter) {
        return false;
      }

      // Provider type
      if (providerTypeFilter !== 'ALL' && c.providerType !== providerTypeFilter) {
        return false;
      }

      // Availability
      if (availabilityFilter !== 'ALL' && c.availability !== availabilityFilter) {
        return false;
      }

      // Max price
      if (priceMaxFilter !== null && c.rate > priceMaxFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const localizedCat = getServiceCategoryLabel(c.category, effectiveLang).toLowerCase();
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          localizedCat.includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.companyName && c.companyName.toLowerCase().includes(q)) ||
          (c.bio && c.bio.toLowerCase().includes(q)) ||
          (c.skills && c.skills.some(s => s.toLowerCase().includes(q)));
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [creatives, selectedCatId, countryFilter, providerTypeFilter, availabilityFilter, priceMaxFilter, searchQuery, effectiveLang]);

  return (
    <div className="space-y-4 py-1 text-xs">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#F5F3EE]">
            {t(effectiveLang, 'pros.title')}
          </h2>
          <p className="text-[11px] text-[#A6ADBB]">
            {t(effectiveLang, 'pros.subtitle')}
          </p>
        </div>
      </div>

      {/* SEARCH INPUT */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6ADBB]" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t(effectiveLang, 'pros.searchPlaceholder')}
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

      {/* HORIZONTAL CATEGORY SELECTOR WITH LOCALIZED STABLE LABELS */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-[#A6ADBB]">
          <span className="font-semibold text-[#F5F3EE]/80">
            {t(effectiveLang, 'pros.serviceCategories')}
          </span>
          <span className="font-semibold text-[#D6AD62]">
            {formatPluralProfessionals(filteredCreatives.length, effectiveLang)}
          </span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {CATEGORY_FILTER_IDS.map(catId => {
            const isSelected = selectedCatId === catId;
            const label = catId === 'ALL'
              ? t(effectiveLang, 'pros.allDisciplines')
              : getServiceCategoryLabel(catId, effectiveLang);

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

        {/* Provider Type */}
        <select
          value={providerTypeFilter}
          onChange={e => setProviderTypeFilter(e.target.value as any)}
          className="bg-[#171A24] border border-[#262C3D] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
        >
          <option value="ALL">{getProviderTypeLabel('ALL', effectiveLang)}</option>
          <option value="FREELANCER">{getProviderTypeLabel('FREELANCER', effectiveLang)}</option>
          <option value="PRODUCTION_COMPANY">{getProviderTypeLabel('PRODUCTION_COMPANY', effectiveLang)}</option>
        </select>

        {/* Availability */}
        <select
          value={availabilityFilter}
          onChange={e => setAvailabilityFilter(e.target.value as any)}
          className="bg-[#171A24] border border-[#262C3D] rounded-xl px-2.5 py-1.5 text-[#F5F3EE] outline-none focus:border-[#D6AD62]"
        >
          <option value="ALL">{getAvailabilityLabel('ALL', effectiveLang)}</option>
          <option value="AVAILABLE_NOW">{getAvailabilityLabel('AVAILABLE_NOW', effectiveLang)}</option>
          <option value="AVAILABLE_THIS_WEEK">{getAvailabilityLabel('AVAILABLE_THIS_WEEK', effectiveLang)}</option>
        </select>
      </div>

      {/* TALENT DIRECTORY LIST */}
      {filteredCreatives.length === 0 ? (
        <div className="bg-[#111827] border border-[#262C3D] rounded-2xl p-8 text-center space-y-3">
          <Users size={36} className="mx-auto text-[#A6ADBB]" />
          <h4 className="text-sm font-bold text-[#F5F3EE]">
            {t(effectiveLang, 'pros.noMatchTitle')}
          </h4>
          <p className="text-xs text-[#A6ADBB] max-w-sm mx-auto">
            {t(effectiveLang, 'pros.noMatchDesc')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCatId('ALL');
              setCountryFilter('ALL');
              setProviderTypeFilter('ALL');
              setAvailabilityFilter('ALL');
              setPriceMaxFilter(null);
            }}
            className="bg-[#171A24] border border-[#262C3D] text-[#D6AD62] font-semibold px-4 py-2 rounded-xl text-xs hover:border-[#D6AD62] cursor-pointer"
          >
            {t(effectiveLang, 'pros.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCreatives.map(c => {
            const localizedCategory = getServiceCategoryLabel(c.category, effectiveLang);

            return (
              <div
                key={c.id}
                className="bg-[#171A24] border border-[#262C3D] hover:border-[#D6AD62]/60 rounded-2xl p-4 space-y-3 transition shadow-lg"
              >
                {/* TOP ROW: AVATAR, NAME, RATING & PRICING */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={c.avatarUrl}
                        alt={c.name}
                        className="w-13 h-13 rounded-full object-cover border-2 border-[#D6AD62]"
                      />
                      {c.isVerified && (
                        <span
                          className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5"
                          title={t(effectiveLang, 'pros.verified')}
                        >
                          <CheckCircle2 size={12} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-[#F5F3EE] text-sm">{c.name}</h4>
                        {c.providerType === 'PRODUCTION_COMPANY' && (
                          <span className="text-[10px] text-[#A6ADBB]">
                            · {t(effectiveLang, 'pros.studioEntity')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#D6AD62] font-semibold mt-0.5">
                        {c.title}
                      </p>
                      
                      {/* Unboxed Metadata: category, location, country, rating */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#A6ADBB] mt-1">
                        <span className="text-[#F5F3EE]/90 font-medium">{localizedCategory}</span>
                        <span aria-hidden="true">·</span>
                        <span>{c.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{getCountryLabel(c.country, effectiveLang)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 flex items-center gap-0.5 font-medium">
                          <Star size={11} fill="currentColor" /> {c.rating} ({c.reviewCount} {t(effectiveLang, 'pros.reviews')})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#A6ADBB] block">
                      {t(effectiveLang, 'pros.standardRate')}
                    </span>
                    <span className="font-bold text-[#D6AD62] text-sm block">
                      {c.currency} {c.rate.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#A6ADBB]">
                      {t(effectiveLang, 'pros.perDay')}
                    </span>
                  </div>
                </div>

                {/* BIO SNIPPET */}
                {c.bio && (
                  <p className="text-xs text-[#A6ADBB] leading-relaxed line-clamp-2">
                    {c.bio}
                  </p>
                )}

                {/* SKILLS TAGS */}
                {c.skills && c.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-[#111827] border border-[#262C3D] text-[#A6ADBB] px-2 py-0.5 rounded text-[10px]"
                      >
                        {getServiceCategoryLabel(skill, effectiveLang)}
                      </span>
                    ))}
                  </div>
                )}

                {/* PORTFOLIO SAMPLES */}
                {c.portfolio && c.portfolio.length > 0 && (
                  <div className="pt-2 border-t border-[#232838] flex items-center justify-between text-[11px]">
                    <span className="text-[#A6ADBB]">
                      {t(effectiveLang, 'pros.verifiedPastWork')}
                    </span>
                    <div className="flex gap-2">
                      {c.portfolio.slice(0, 2).map((item, pIdx) => (
                        <a
                          key={pIdx}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#D6AD62] hover:underline flex items-center gap-1 truncate max-w-[150px]"
                          title={item.title}
                        >
                          <span className="truncate">{item.title}</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTON */}
                <div className="pt-2 border-t border-[#232838] flex justify-between items-center">
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {c.availability === 'AVAILABLE_NOW'
                      ? `● ${t(effectiveLang, 'pros.availableForShoots')}`
                      : `● ${t(effectiveLang, 'pros.inquiredThisWeek')}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectCreativeForBooking(c)}
                    className="bg-[#D6AD62] hover:bg-[#e0bc75] text-[#080B14] font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                  >
                    <Calendar size={13} />
                    <span>{t(effectiveLang, 'pros.requestQuoteOrBook')}</span>
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
