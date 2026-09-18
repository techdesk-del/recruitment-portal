export interface CountryItem {
  name: string;
  code: string;
  iso: string;
  digitLength: number;
}

export const COUNTRIES: CountryItem[] = [
  { name: 'India', code: '+91', iso: 'in', digitLength: 10 },
  { name: 'United Arab Emirates', code: '+971', iso: 'ae', digitLength: 9 },
  { name: 'United States', code: '+1', iso: 'us', digitLength: 10 },
  { name: 'United Kingdom', code: '+44', iso: 'gb', digitLength: 10 },
  { name: 'Canada', code: '+1', iso: 'ca', digitLength: 10 },
  { name: 'Australia', code: '+61', iso: 'au', digitLength: 9 },
  { name: 'Singapore', code: '+65', iso: 'sg', digitLength: 8 },
  { name: 'Saudi Arabia', code: '+966', iso: 'sa', digitLength: 9 },
  { name: 'Qatar', code: '+974', iso: 'qa', digitLength: 8 },
  { name: 'Kuwait', code: '+965', iso: 'kw', digitLength: 8 },
  { name: 'Oman', code: '+968', iso: 'om', digitLength: 8 },
  { name: 'Bahrain', code: '+973', iso: 'bh', digitLength: 8 },
  { name: 'Germany', code: '+49', iso: 'de', digitLength: 10 },
  { name: 'France', code: '+33', iso: 'fr', digitLength: 9 },
  { name: 'Italy', code: '+39', iso: 'it', digitLength: 10 },
  { name: 'Spain', code: '+34', iso: 'es', digitLength: 9 },
  { name: 'Netherlands', code: '+31', iso: 'nl', digitLength: 9 },
  { name: 'Switzerland', code: '+41', iso: 'ch', digitLength: 9 },
  { name: 'Sweden', code: '+46', iso: 'se', digitLength: 9 },
  { name: 'Norway', code: '+47', iso: 'no', digitLength: 8 },
  { name: 'Denmark', code: '+45', iso: 'dk', digitLength: 8 },
  { name: 'Ireland', code: '+353', iso: 'ie', digitLength: 9 },
  { name: 'New Zealand', code: '+64', iso: 'nz', digitLength: 9 },
  { name: 'South Africa', code: '+27', iso: 'za', digitLength: 9 },
  { name: 'Japan', code: '+81', iso: 'jp', digitLength: 10 },
  { name: 'South Korea', code: '+82', iso: 'kr', digitLength: 10 },
  { name: 'Malaysia', code: '+60', iso: 'my', digitLength: 9 },
  { name: 'Indonesia', code: '+62', iso: 'id', digitLength: 10 },
  { name: 'Thailand', code: '+66', iso: 'th', digitLength: 9 },
  { name: 'Vietnam', code: '+84', iso: 'vn', digitLength: 9 },
  { name: 'Philippines', code: '+63', iso: 'ph', digitLength: 10 },
  { name: 'Hong Kong', code: '+852', iso: 'hk', digitLength: 8 },
  { name: 'Taiwan', code: '+886', iso: 'tw', digitLength: 9 },
  { name: 'China', code: '+86', iso: 'cn', digitLength: 11 },
  { name: 'Russia', code: '+7', iso: 'ru', digitLength: 10 },
  { name: 'Turkey', code: '+90', iso: 'tr', digitLength: 10 },
  { name: 'Israel', code: '+972', iso: 'il', digitLength: 9 },
  { name: 'Egypt', code: '+20', iso: 'eg', digitLength: 10 },
  { name: 'Nigeria', code: '+234', iso: 'ng', digitLength: 10 },
  { name: 'Kenya', code: '+254', iso: 'ke', digitLength: 9 },
  { name: 'Ghana', code: '+233', iso: 'gh', digitLength: 9 },
  { name: 'Mauritius', code: '+230', iso: 'mu', digitLength: 8 },
  { name: 'Sri Lanka', code: '+94', iso: 'lk', digitLength: 9 },
  { name: 'Nepal', code: '+977', iso: 'np', digitLength: 10 },
  { name: 'Bangladesh', code: '+880', iso: 'bd', digitLength: 10 },
  { name: 'Pakistan', code: '+92', iso: 'pk', digitLength: 10 },
  { name: 'Brazil', code: '+55', iso: 'br', digitLength: 11 },
  { name: 'Mexico', code: '+52', iso: 'mx', digitLength: 10 },
  { name: 'Argentina', code: '+54', iso: 'ar', digitLength: 10 },
  { name: 'Chile', code: '+56', iso: 'cl', digitLength: 9 },
  { name: 'Colombia', code: '+57', iso: 'co', digitLength: 10 },
  { name: 'Peru', code: '+51', iso: 'pe', digitLength: 9 },
  { name: 'Poland', code: '+48', iso: 'pl', digitLength: 9 },
  { name: 'Portugal', code: '+351', iso: 'pt', digitLength: 9 },
  { name: 'Belgium', code: '+32', iso: 'be', digitLength: 9 },
  { name: 'Austria', code: '+43', iso: 'at', digitLength: 10 },
  { name: 'Czech Republic', code: '+420', iso: 'cz', digitLength: 9 },
  { name: 'Greece', code: '+30', iso: 'gr', digitLength: 10 },
  { name: 'Hungary', code: '+36', iso: 'hu', digitLength: 9 },
  { name: 'Romania', code: '+40', iso: 'ro', digitLength: 9 },
  { name: 'Finland', code: '+358', iso: 'fi', digitLength: 9 },
  { name: 'Ukraine', code: '+380', iso: 'ua', digitLength: 9 },
];

export function findCountry(query: string): CountryItem | undefined {
  if (!query) return undefined;
  const t = query.trim().toLowerCase();
  if (t === 'uae' || t === 'dubai' || t === 'abu dhabi') {
    return COUNTRIES.find((c) => c.iso === 'ae');
  }
  if (t === 'us' || t === 'usa' || t === 'america' || t === 'united states of america') {
    return COUNTRIES.find((c) => c.iso === 'us');
  }
  if (t === 'uk' || t === 'england' || t === 'great britain' || t === 'britain' || t === 'london') {
    return COUNTRIES.find((c) => c.iso === 'gb');
  }
  if (t === 'ksa' || t === 'saudi') {
    return COUNTRIES.find((c) => c.iso === 'sa');
  }
  if (t === 'in' || t === 'india' || t === 'bharat' || t === 'hindustan') {
    return COUNTRIES.find((c) => c.iso === 'in');
  }
  return (
    COUNTRIES.find((c) => c.name.toLowerCase() === t) ||
    COUNTRIES.find((c) => c.iso === t) ||
    COUNTRIES.find((c) => c.name.toLowerCase().startsWith(t)) ||
    COUNTRIES.find((c) => c.code === t || c.code.replace('+', '') === t)
  );
}
