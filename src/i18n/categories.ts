/**
 * KAZI HUB — Stable Internal Identifiers & Canonical Localization Mappers
 * Provides robust, backward-compatible mappings between database/storage values
 * and localized display strings in both English (EN) and Kiswahili (SW).
 */

export type Language = 'EN' | 'SW';

export interface CategoryItem {
  id: string;
  labels: {
    EN: string;
    SW: string;
  };
  aliases: string[];
}

// -------------------------------------------------------------
// 1. CREATIVE SERVICE CATEGORIES (Stable Internal IDs)
// -------------------------------------------------------------
export const SERVICE_CATEGORY_REGISTRY: CategoryItem[] = [
  {
    id: 'photography',
    labels: {
      EN: 'Photography',
      SW: 'Upigaji Picha'
    },
    aliases: ['photography', 'upigaji picha', 'photo', 'portrait photography', 'fashion & editorial']
  },
  {
    id: 'music_recording',
    labels: {
      EN: 'Music recording',
      SW: 'Kurekodi Muziki'
    },
    aliases: ['music recording', 'kurekodi muziki', 'music_recording', 'music recording studio']
  },
  {
    id: 'video_recording',
    labels: {
      EN: 'Video recording',
      SW: 'Kurekodi Video'
    },
    aliases: ['video recording', 'kurekodi video', 'video_recording', 'urekodi wa video']
  },
  {
    id: 'videography',
    labels: {
      EN: 'Videography',
      SW: 'Upigaji Video'
    },
    aliases: ['videography', 'upigaji video', 'video shooting']
  },
  {
    id: 'audio_recording',
    labels: {
      EN: 'Audio recording',
      SW: 'Kurekodi Sauti'
    },
    aliases: ['audio recording', 'kurekodi sauti', 'audio_recording']
  },
  {
    id: 'music_production',
    labels: {
      EN: 'Music production',
      SW: 'Uzalishaji wa Muziki'
    },
    aliases: ['music production', 'uzalishaji wa muziki', 'music_production', 'beat making']
  },
  {
    id: 'video_editing',
    labels: {
      EN: 'Video editing',
      SW: 'Uhariri wa Video'
    },
    aliases: ['editing', 'video editing', 'video & film editing', 'uhariri wa video', 'video_editing']
  },
  {
    id: 'documentary_production',
    labels: {
      EN: 'Documentary production',
      SW: 'Uandaaji wa Makala'
    },
    aliases: ['documentary production', 'uzalishaji wa makala', 'uandaaji wa makala', 'documentary_production', 'short doc']
  },
  {
    id: 'drone_services',
    labels: {
      EN: 'Drone services',
      SW: 'Huduma za Droni'
    },
    aliases: ['drone work', 'drone services', 'huduma za droni', 'huduma za drone', 'drone_services', 'aerial cinematography']
  },
  {
    id: 'sound_engineering',
    labels: {
      EN: 'Sound engineering',
      SW: 'Uhandisi wa Sauti'
    },
    aliases: ['sound engineering', 'uhandisi wa sauti', 'sound_engineering', 'mixing & mastering', 'audio production']
  },
  {
    id: 'lighting_grip',
    labels: {
      EN: 'Lighting & grip',
      SW: 'Taa na Vifaa vya Seti'
    },
    aliases: ['lighting & grip', 'lighting and grip', 'taa na vifaa vya seti', 'taa na vifaa vya kushikilia', 'lighting_grip']
  },
  {
    id: 'live_broadcast',
    labels: {
      EN: 'Live broadcast',
      SW: 'Utangazaji wa Moja kwa Moja'
    },
    aliases: ['live broadcast', 'live-streaming and broadcast', 'utangazaji wa moja kwa moja', 'live_broadcast', 'broadcasting']
  },
  {
    id: 'color_grading',
    labels: {
      EN: 'Color grading',
      SW: 'Upangaji wa Rangi (Color Grading)'
    },
    aliases: ['color grading', 'usawazishaji wa rangi', 'upangaji wa rangi', 'color_grading', 'davinci resolve']
  },
  {
    id: 'audio_production',
    labels: {
      EN: 'Audio production',
      SW: 'Uzalishaji wa Sauti'
    },
    aliases: ['audio production', 'uzalishaji wa sauti', 'audio_production']
  },
  {
    id: 'other',
    labels: {
      EN: 'Other creative service',
      SW: 'Huduma Nyingine za Ubunifu'
    },
    aliases: ['other creative service', 'other', 'huduma nyingine ya sanaa', 'huduma nyinginezo']
  }
];

export const CANONICAL_SERVICE_CATEGORY_IDS = [
  'photography',
  'videography',
  'music_recording',
  'video_recording',
  'audio_recording',
  'music_production',
  'video_editing',
  'documentary_production',
  'drone_services',
  'sound_engineering',
  'lighting_grip',
  'live_broadcast',
  'color_grading',
  'other'
] as const;

/**
 * Normalizes any category string (raw database value, English label, or Kiswahili label)
 * to the canonical stable identifier.
 */
export function normalizeServiceCategoryId(rawString?: string | null): string {
  if (!rawString) return 'other';
  const clean = rawString.trim().toLowerCase();

  for (const cat of SERVICE_CATEGORY_REGISTRY) {
    if (cat.id === clean) return cat.id;
    if (cat.labels.EN.toLowerCase() === clean) return cat.id;
    if (cat.labels.SW.toLowerCase() === clean) return cat.id;
    if (cat.aliases.some(a => a.toLowerCase() === clean)) return cat.id;
  }

  // Substring fallback
  for (const cat of SERVICE_CATEGORY_REGISTRY) {
    if (cat.aliases.some(a => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean))) {
      return cat.id;
    }
  }

  return clean;
}

/**
 * Returns the localized label for a service category given either its stable ID or raw database string.
 */
export function getServiceCategoryLabel(idOrRaw: string, lang: Language): string {
  if (!idOrRaw || idOrRaw === 'ALL') {
    return lang === 'SW' ? 'Kategoria Zote' : 'All Disciplines';
  }

  const id = normalizeServiceCategoryId(idOrRaw);
  const found = SERVICE_CATEGORY_REGISTRY.find(c => c.id === id);
  if (found) {
    return found.labels[lang];
  }

  // Capitalize fallback if unknown
  return idOrRaw;
}

// -------------------------------------------------------------
// 2. EQUIPMENT 15 CATEGORIES (Stable Internal IDs)
// -------------------------------------------------------------
export const EQUIPMENT_CATEGORY_REGISTRY: CategoryItem[] = [
  {
    id: 'cameras_lenses',
    labels: {
      EN: 'Cameras and Lenses',
      SW: 'Kamera na Lenzi'
    },
    aliases: ['cameras and lenses', 'kamera na lenzi', 'cameras_lenses', 'camera & lenses']
  },
  {
    id: 'lighting_grip',
    labels: {
      EN: 'Lighting and Grip',
      SW: 'Taa na Vifaa vya Kushikilia Kamera'
    },
    aliases: ['lighting and grip', 'lighting & grip', 'taa na vifaa vya kushikilia kamera', 'taa na vifaa vya seti']
  },
  {
    id: 'audio_sound',
    labels: {
      EN: 'Audio and Sound Equipment',
      SW: 'Vifaa vya Sauti'
    },
    aliases: ['audio and sound equipment', 'audio and sound', 'vifaa vya sauti', 'audio equipment']
  },
  {
    id: 'drones',
    labels: {
      EN: 'Drones & Aerial Systems',
      SW: 'Droni na Mifumo ya Angani'
    },
    aliases: ['drones', 'drones & aerial systems', 'droni na mifumo ya angani', 'drone']
  },
  {
    id: 'commercial_displays',
    labels: {
      EN: 'TV Screens, Displays & LED Walls',
      SW: 'Skrini za TV, Maonyesho & Kuta za LED'
    },
    aliases: ['tv screens, commercial displays, and led walls', 'skrini za tv, maonyesho & kuta za led', 'led walls', 'tv screens']
  },
  {
    id: 'projectors_screens',
    labels: {
      EN: 'Projectors and Screens',
      SW: 'Projekta na Skrini'
    },
    aliases: ['projectors and screens', 'projekta na skrini', 'projector']
  },
  {
    id: 'tripods_rigs',
    labels: {
      EN: 'Tripods, Rigs, Stabilizers & Gimbals',
      SW: 'Tripodi, Rigi, Vidhibiti & Gimbali'
    },
    aliases: ['tripods, rigs, stabilizers, and gimbals', 'tripodi, rigi, vidhibiti & gimbali', 'stabilizers', 'gimbals']
  },
  {
    id: 'broadcast_equipment',
    labels: {
      EN: 'Live-Streaming & Broadcast Equipment',
      SW: 'Vifaa vya Matangazo ya Moja kwa Moja'
    },
    aliases: ['live-streaming and broadcast equipment', 'vifaa vya matangazo ya moja kwa moja', 'broadcast']
  },
  {
    id: 'studio_equipment',
    labels: {
      EN: 'Studio Equipment',
      SW: 'Vifaa vya Studio'
    },
    aliases: ['studio equipment', 'vifaa vya studio']
  },
  {
    id: 'power_connectivity',
    labels: {
      EN: 'Batteries, Power & Connectivity',
      SW: 'Betri, Umeme & Miunganisho'
    },
    aliases: ['batteries, power, and connectivity', 'betri, umeme & miunganisho', 'power']
  },
  {
    id: 'editing_workstations',
    labels: {
      EN: 'Editing Computers & Workstations',
      SW: 'Kompyuta za Uhariri & Vituo vya Kazi'
    },
    aliases: ['editing computers and workstations', 'kompyuta za uhariri & vituo vya kazi', 'workstations']
  },
  {
    id: 'stage_production',
    labels: {
      EN: 'Event & Stage Production Equipment',
      SW: 'Vifaa vya Uzalishaji wa Matukio na Jukwaa'
    },
    aliases: ['event and stage production equipment', 'vifaa vya uzalishaji wa matukio na jukwaa']
  },
  {
    id: 'teleprompters_intercom',
    labels: {
      EN: 'Teleprompters & Intercom Systems',
      SW: 'Teleprompters & Mifumo ya Mawasiliano ya Ndani'
    },
    aliases: ['teleprompters and intercom systems', 'teleprompters & mifumo ya mawasiliano ya ndani']
  },
  {
    id: 'production_accessories',
    labels: {
      EN: 'Production Accessories',
      SW: 'Vifaa Vidogo vya Uzalishaji'
    },
    aliases: ['production accessories', 'vifaa vidogo vya uzalishaji']
  },
  {
    id: 'other_equipment',
    labels: {
      EN: 'Other Equipment',
      SW: 'Vifaa Vinginevyo'
    },
    aliases: ['other equipment', 'vifaa vinginevyo', 'other']
  }
];

export const CANONICAL_EQUIPMENT_CATEGORY_IDS = [
  'cameras_lenses',
  'lighting_grip',
  'audio_sound',
  'drones',
  'commercial_displays',
  'projectors_screens',
  'tripods_rigs',
  'broadcast_equipment',
  'studio_equipment',
  'power_connectivity',
  'editing_workstations',
  'stage_production',
  'teleprompters_intercom',
  'production_accessories',
  'other_equipment'
] as const;

export function normalizeEquipmentCategoryId(rawString?: string | null): string {
  if (!rawString) return 'other_equipment';
  const clean = rawString.trim().toLowerCase();

  for (const cat of EQUIPMENT_CATEGORY_REGISTRY) {
    if (cat.id === clean) return cat.id;
    if (cat.labels.EN.toLowerCase() === clean) return cat.id;
    if (cat.labels.SW.toLowerCase() === clean) return cat.id;
    if (cat.aliases.some(a => a.toLowerCase() === clean)) return cat.id;
  }

  for (const cat of EQUIPMENT_CATEGORY_REGISTRY) {
    if (cat.aliases.some(a => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean))) {
      return cat.id;
    }
  }

  return clean;
}

export function getEquipmentCategoryLabel(idOrRaw: string, lang: Language): string {
  if (!idOrRaw || idOrRaw === 'ALL') {
    return lang === 'SW' ? 'Kategoria Zote' : 'All Categories';
  }

  const id = normalizeEquipmentCategoryId(idOrRaw);
  const found = EQUIPMENT_CATEGORY_REGISTRY.find(c => c.id === id);
  if (found) {
    return found.labels[lang];
  }

  return idOrRaw;
}

// -------------------------------------------------------------
// 3. PROVIDER TYPES
// -------------------------------------------------------------
export function getProviderTypeLabel(type: string, lang: Language): string {
  if (!type || type === 'ALL') {
    return lang === 'SW' ? 'Aina Zote za Watoa Huduma' : 'All Provider Types';
  }
  const clean = type.toUpperCase();
  if (clean === 'FREELANCER') {
    return lang === 'SW' ? 'Wataalamu Huru' : 'Freelance Pros';
  }
  if (clean === 'PRODUCTION_COMPANY') {
    return lang === 'SW' ? 'Studio & Kampuni za Uzalishaji' : 'Studios & Production Companies';
  }
  return type;
}

// -------------------------------------------------------------
// 4. AVAILABILITY
// -------------------------------------------------------------
export function getAvailabilityLabel(avail: string, lang: Language): string {
  if (!avail || avail === 'ALL') {
    return lang === 'SW' ? 'Upatikanaji Wote' : 'All Availability';
  }
  const clean = avail.toUpperCase();
  if (clean === 'AVAILABLE_NOW' || clean === 'AVAILABLE') {
    return lang === 'SW' ? 'Inapatikana Sasa' : 'Available Now';
  }
  if (clean === 'AVAILABLE_THIS_WEEK') {
    return lang === 'SW' ? 'Wiki Hii' : 'This Week';
  }
  if (clean === 'RENTED') {
    return lang === 'SW' ? 'Kimekodishwa Sasa' : 'Currently Rented';
  }
  if (clean === 'MAINTENANCE') {
    return lang === 'SW' ? 'Kwenye Matengenezo' : 'Under Maintenance';
  }
  return avail;
}

// -------------------------------------------------------------
// 5. CONDITIONS
// -------------------------------------------------------------
export function getConditionLabel(condition: string, lang: Language): string {
  if (!condition || condition === 'ALL') {
    return lang === 'SW' ? 'Hali Zote' : 'All Conditions';
  }
  const clean = condition.toLowerCase();
  if (clean.includes('brand new')) {
    return lang === 'SW' ? 'Mpya Kabisa' : 'Brand New';
  }
  if (clean.includes('mint')) {
    return lang === 'SW' ? 'Hali Nzuri Zaidi (Mint)' : 'Mint Condition';
  }
  if (clean.includes('excellent')) {
    return lang === 'SW' ? 'Bora Kabisa' : 'Excellent';
  }
  if (clean.includes('good')) {
    return lang === 'SW' ? 'Nzuri' : 'Good';
  }
  if (clean.includes('fair')) {
    return lang === 'SW' ? 'Ya Kuridhisha' : 'Fair';
  }
  return condition;
}

// -------------------------------------------------------------
// 6. COUNTRIES
// -------------------------------------------------------------
export function getCountryLabel(country: string, lang: Language): string {
  if (!country || country === 'ALL') {
    return lang === 'SW' ? 'Nchi Zote' : 'All Countries';
  }
  const clean = country.toUpperCase();
  if (clean === 'TANZANIA') return '🇹🇿 Tanzania';
  if (clean === 'KENYA') return '🇰🇪 Kenya';
  if (clean === 'UGANDA') return '🇺🇬 Uganda';
  if (clean === 'RWANDA') return '🇷🇼 Rwanda';
  return country;
}

// -------------------------------------------------------------
// 7. BOOKING STATUS
// -------------------------------------------------------------
export function getBookingStatusLabel(status: string, lang: Language): string {
  const clean = status ? status.toUpperCase() : '';
  if (clean === 'PENDING') {
    return lang === 'SW' ? 'Inasubiri Uhakiki' : 'Pending Review';
  }
  if (clean === 'QUOTATION_SUBMITTED') {
    return lang === 'SW' ? 'Makadirio Yamewasilishwa' : 'Quotation Submitted';
  }
  if (clean === 'CONFIRMED') {
    return lang === 'SW' ? 'Imethibitishwa na Escrow Imelipwa' : 'Confirmed & Escrow Funded';
  }
  if (clean === 'IN_PROGRESS') {
    return lang === 'SW' ? 'Inatekelezwa Seti' : 'In Progress on Set';
  }
  if (clean === 'AWAITING_COMPLETION') {
    return lang === 'SW' ? 'Inasubiri Idhini ya Ukamilishaji' : 'Awaiting Delivery Sign-Off';
  }
  if (clean === 'COMPLETED') {
    return lang === 'SW' ? 'Imekamilika na Malipo Yametolewa' : 'Completed & Payout Released';
  }
  if (clean === 'DISPUTED') {
    return lang === 'SW' ? 'Mgogoro Umewasilishwa' : 'Dispute Escalated';
  }
  return status;
}

// -------------------------------------------------------------
// 8. LOCALIZED PLURALIZATION HELPERS
// -------------------------------------------------------------
export function formatPluralProfessionals(count: number, lang: Language): string {
  if (lang === 'SW') {
    return count === 1 ? 'Mtaalamu 1' : `${count} Wataalamu`;
  }
  return count === 1 ? '1 Professional' : `${count} Professionals`;
}

export function formatPluralListings(count: number, lang: Language): string {
  if (lang === 'SW') {
    return count === 1 ? 'Kifaa 1 Kilichowekwa Sokoni' : `Vifaa ${count} Vilivyowekwa Sokoni`;
  }
  return count === 1 ? '1 Published Listing' : `${count} Published Listings`;
}
