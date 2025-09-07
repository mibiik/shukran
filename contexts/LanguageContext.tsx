import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// IP-based location detection
const detectLocationFromIP = async (): Promise<{ country?: string; timezone?: string; languages?: string[] }> => {
  try {
    // Try multiple IP geolocation services for reliability
    const services = [
      // Service 1: ipapi.co (free, reliable)
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
          const response = await fetch('https://ipapi.co/json/', { 
            signal: controller.signal,
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            return {
              country: data.country_code?.toLowerCase(),
              timezone: data.timezone?.toLowerCase(),
              languages: data.languages ? data.languages.split(',').map((l: string) => l.trim().toLowerCase()) : []
            };
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
        return null;
      },
      
      // Service 2: ip-api.com (free, good backup)  
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
          const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,timezone', { 
            signal: controller.signal,
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
              return {
                country: data.countryCode?.toLowerCase(),
                timezone: data.timezone?.toLowerCase(),
                languages: []
              };
            }
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
        return null;
      },
      
      // Service 3: ipinfo.io (reliable but limited free tier)
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        try {
          const response = await fetch('https://ipinfo.io/json', { 
            signal: controller.signal,
            cache: 'no-cache'
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            return {
              country: data.country?.toLowerCase(),
              timezone: data.timezone?.toLowerCase(),
              languages: []
            };
          }
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
        return null;
      }
    ];

    // Try services in order, return first successful result
    for (const service of services) {
      try {
        const result = await service();
        if (result && result.country) {
          console.debug('IP-based location detected:', result);
          return result;
        }
      } catch (error) {
        console.debug('IP service failed, trying next:', error);
        continue;
      }
    }
    
    return {};
  } catch (error) {
    console.debug('All IP-based location services failed:', error);
    return {};
  }
};

// Country code to language mapping
const countryToLanguage: { [key: string]: Language } = {
  // Turkish
  'tr': Language.TR,
  
  // Spanish-speaking countries
  'es': Language.ES, // Spain
  'mx': Language.ES, // Mexico
  'ar': Language.ES, // Argentina
  'co': Language.ES, // Colombia
  'pe': Language.ES, // Peru
  'cl': Language.ES, // Chile
  've': Language.ES, // Venezuela
  'ec': Language.ES, // Ecuador
  'bo': Language.ES, // Bolivia
  'py': Language.ES, // Paraguay
  'uy': Language.ES, // Uruguay
  'cu': Language.ES, // Cuba
  'do': Language.ES, // Dominican Republic
  'gt': Language.ES, // Guatemala
  'hn': Language.ES, // Honduras
  'sv': Language.ES, // El Salvador
  'ni': Language.ES, // Nicaragua
  'cr': Language.ES, // Costa Rica
  'pa': Language.ES, // Panama
  'pr': Language.ES, // Puerto Rico
  
  // French-speaking countries
  'fr': Language.FR, // France
  'be': Language.FR, // Belgium (primarily French)
  'lu': Language.FR, // Luxembourg
  'ch': Language.FR, // Switzerland (can be French)
  'mc': Language.FR, // Monaco
  'sn': Language.FR, // Senegal
  'ci': Language.FR, // Ivory Coast
  'ml': Language.FR, // Mali
  'bf': Language.FR, // Burkina Faso
  'ne': Language.FR, // Niger
  'td': Language.FR, // Chad
  'cf': Language.FR, // Central African Republic
  'cm': Language.FR, // Cameroon
  'ga': Language.FR, // Gabon
  'cg': Language.FR, // Republic of Congo
  'cd': Language.FR, // Democratic Republic of Congo
  'bi': Language.FR, // Burundi
  'rw': Language.FR, // Rwanda
  'dj': Language.FR, // Djibouti
  'km': Language.FR, // Comoros
  'mg': Language.FR, // Madagascar
  'dz': Language.FR, // Algeria
  'tn': Language.FR, // Tunisia
  'ma': Language.FR, // Morocco
  'ht': Language.FR, // Haiti
  'gf': Language.FR, // French Guiana
  'gp': Language.FR, // Guadeloupe
  'mq': Language.FR, // Martinique
  'nc': Language.FR, // New Caledonia
  'pf': Language.FR, // French Polynesia
  'pm': Language.FR, // Saint Pierre and Miquelon
  'wf': Language.FR, // Wallis and Futuna
  'yt': Language.FR, // Mayotte
  're': Language.FR, // Reunion
  'mf': Language.FR, // Saint Martin
  'bl': Language.FR, // Saint Barthélemy
  
  // English-speaking countries (default, so we don't need to list them all)
  // Will fall back to English for unlisted countries
};

// Function to detect user's language from browser with enhanced IP-based location detection
const detectUserLanguage = async (): Promise<Language> => {
  try {
    // Get all browser language preferences in order of preference
    const browserLanguages = [
      navigator.language,
      ...(navigator.languages || []),
      (navigator as any).userLanguage,
      (navigator as any).browserLanguage,
      (navigator as any).systemLanguage
    ].filter(Boolean);

    // Get IP-based location (most accurate)
    let ipLocation = { country: '', timezone: '', languages: [] as string[] };
    try {
      ipLocation = await detectLocationFromIP();
      console.debug('IP-based location result:', ipLocation);
      
      // Cache IP location info for debugging
      if (ipLocation.country) {
        localStorage.setItem('shukran-ip-country', ipLocation.country.toUpperCase());
      }
      if (ipLocation.timezone) {
        localStorage.setItem('shukran-ip-timezone', ipLocation.timezone);
      }
    } catch (e) {
      console.debug('IP-based location detection failed:', e);
    }

    // Get timezone for additional context (fallback)
    let browserTimezone = '';
    try {
      browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    } catch (e) {
      console.debug('Browser timezone detection failed:', e);
    }
    
    // Use IP timezone if available, otherwise browser timezone
    const timezone = ipLocation.timezone || browserTimezone;

    // Enhanced language mapping with location context
    const languageMap: { [key: string]: Language } = {
      'tr': Language.TR,
      'es': Language.ES,
      'fr': Language.FR,
      'en': Language.EN,
    };

    // Location-based language hints from timezone (comprehensive list)
    const locationLanguageHints: { [key: string]: Language } = {
      // Turkey
      'europe/istanbul': Language.TR,
      'asia/istanbul': Language.TR,
      
      // Spain and Spanish-speaking regions
      'europe/madrid': Language.ES,
      'europe/andorra': Language.ES,
      'atlantic/canary': Language.ES,
      
      // Spanish-speaking Americas (comprehensive)
      'america/mexico_city': Language.ES,
      'america/cancun': Language.ES,
      'america/merida': Language.ES,
      'america/monterrey': Language.ES,
      'america/tijuana': Language.ES,
      'america/chihuahua': Language.ES,
      'america/hermosillo': Language.ES,
      'america/mazatlan': Language.ES,
      'america/bogota': Language.ES,
      'america/lima': Language.ES,
      'america/santiago': Language.ES,
      'america/buenos_aires': Language.ES,
      'america/cordoba': Language.ES,
      'america/mendoza': Language.ES,
      'america/caracas': Language.ES,
      'america/havana': Language.ES,
      'america/guatemala': Language.ES,
      'america/tegucigalpa': Language.ES,
      'america/managua': Language.ES,
      'america/san_jose': Language.ES,
      'america/panama': Language.ES,
      'america/santo_domingo': Language.ES,
      'america/puerto_rico': Language.ES,
      'america/asuncion': Language.ES,
      'america/montevideo': Language.ES,
      'america/la_paz': Language.ES,
      'america/ecuador': Language.ES,
      'america/guayaquil': Language.ES,
      'pacific/galapagos': Language.ES,
      'america/el_salvador': Language.ES,
      'america/honduras': Language.ES,
      'america/nicaragua': Language.ES,
      'america/costa_rica': Language.ES,
      
      // France and French-speaking regions (comprehensive)
      'europe/paris': Language.FR,
      'europe/monaco': Language.FR,
      'europe/brussels': Language.FR, // Belgium (French part)
      'europe/luxembourg': Language.FR, // Luxembourg (French)
      'europe/geneva': Language.FR, // Switzerland (French part)
      'europe/zurich': Language.FR, // Switzerland (can be French)
      
      // French overseas territories
      'indian/reunion': Language.FR,
      'indian/mayotte': Language.FR,
      'indian/kerguelen': Language.FR,
      'america/guadeloupe': Language.FR,
      'america/martinique': Language.FR,
      'america/french_guiana': Language.FR,
      'america/st_pierre': Language.FR,
      'pacific/tahiti': Language.FR,
      'pacific/marquesas': Language.FR,
      'pacific/gambier': Language.FR,
      'pacific/new_caledonia': Language.FR,
      'pacific/wallis': Language.FR,
      
      // French-speaking Africa
      'africa/abidjan': Language.FR, // Ivory Coast
      'africa/dakar': Language.FR, // Senegal
      'africa/bamako': Language.FR, // Mali
      'africa/ouagadougou': Language.FR, // Burkina Faso
      'africa/conakry': Language.FR, // Guinea
      'africa/bissau': Language.FR, // Guinea-Bissau
      'africa/niamey': Language.FR, // Niger
      'africa/ndjamena': Language.FR, // Chad
      'africa/bangui': Language.FR, // Central African Republic
      'africa/libreville': Language.FR, // Gabon
      'africa/malabo': Language.FR, // Equatorial Guinea
      'africa/brazzaville': Language.FR, // Republic of Congo
      'africa/kinshasa': Language.FR, // Democratic Republic of Congo
      'africa/bujumbura': Language.FR, // Burundi
      'africa/kigali': Language.FR, // Rwanda
      'africa/djibouti': Language.FR, // Djibouti
      'africa/comoro': Language.FR, // Comoros
      'indian/madagascar': Language.FR, // Madagascar
      'africa/algiers': Language.FR, // Algeria
      'africa/tunis': Language.FR, // Tunisia
      'africa/casablanca': Language.FR, // Morocco
      
      // French-speaking Canada
      'america/montreal': Language.FR,
      'america/quebec': Language.FR,
      
      // Additional Spanish timezones we might have missed
      'atlantic/azores': Language.ES, // Portugal but close to Spain
      'america/eirunepe': Language.ES, // Brazil border with Spanish countries
      'america/rio_branco': Language.ES, // Brazil border with Spanish countries
    };

    // PRIORITY 1: IP-based country detection (most accurate)
    if (ipLocation.country && countryToLanguage[ipLocation.country]) {
      const ipBasedLang = countryToLanguage[ipLocation.country];
      console.debug('Using IP-based country language detection:', ipLocation.country, '->', ipBasedLang);
      
      // Cross-check with browser language to ensure consistency
      for (const browserLang of browserLanguages) {
        if (typeof browserLang === 'string') {
          const langCode = browserLang.split('-')[0].toLowerCase();
          if (languageMap[langCode] === ipBasedLang) {
            console.debug('IP location matches browser language, perfect match!');
            return ipBasedLang;
          }
        }
      }
      
      // Even if browser language doesn't match, trust IP location for non-English countries
      if (ipBasedLang !== Language.EN) {
        console.debug('Trusting IP-based location over browser language for non-English country');
        return ipBasedLang;
      }
    }

    // PRIORITY 2: Browser language preferences (if IP detection failed or gave English)
    for (const browserLang of browserLanguages) {
      if (typeof browserLang === 'string') {
        // Extract primary language code
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        // Special handling for regional variants
        if (langCode === 'es') {
          // Verify with IP location if available
          if (ipLocation.country && !countryToLanguage[ipLocation.country]) {
            console.debug('Spanish browser language with unknown IP country:', ipLocation.country);
          }
          return Language.ES;
        } else if (langCode === 'fr') {
          // Verify with IP location if available
          if (ipLocation.country && !countryToLanguage[ipLocation.country]) {
            console.debug('French browser language with unknown IP country:', ipLocation.country);
          }
          return Language.FR;
        } else if (langCode === 'tr') {
          // Turkish
          return Language.TR;
        } else if (langCode === 'en') {
          // English - check if IP suggests another language
          if (ipLocation.country && countryToLanguage[ipLocation.country] && countryToLanguage[ipLocation.country] !== Language.EN) {
            console.debug('English browser but non-English IP country:', ipLocation.country, 'using IP country language');
            return countryToLanguage[ipLocation.country];
          }
          return Language.EN;
        }
        
        // Check if we support this language
        if (languageMap[langCode]) {
          return languageMap[langCode];
        }
      }
    }

    // If no browser language matched, use timezone as a hint
    if (timezone && locationLanguageHints[timezone]) {
      console.debug('Using exact timezone-based language detection:', timezone, '->', locationLanguageHints[timezone]);
      return locationLanguageHints[timezone];
    }
    
    // Try partial timezone matching for common patterns
    if (timezone) {
      // Check for Spanish-speaking regions
      if (timezone.includes('america/') && 
          (timezone.includes('mexico') || timezone.includes('bogota') || timezone.includes('lima') || 
           timezone.includes('santiago') || timezone.includes('buenos_aires') || timezone.includes('caracas') ||
           timezone.includes('guatemala') || timezone.includes('havana') || timezone.includes('panama') ||
           timezone.includes('costa_rica') || timezone.includes('el_salvador') || timezone.includes('honduras'))) {
        console.debug('Using partial timezone matching for Spanish:', timezone);
        return Language.ES;
      }
      
      // Check for French-speaking regions
      if (timezone.includes('europe/paris') || timezone.includes('africa/') && 
          (timezone.includes('dakar') || timezone.includes('abidjan') || timezone.includes('bamako') ||
           timezone.includes('libreville') || timezone.includes('kinshasa') || timezone.includes('algiers'))) {
        console.debug('Using partial timezone matching for French:', timezone);
        return Language.FR;
      }
      
      // Check for Turkish regions
      if (timezone.includes('istanbul') || timezone.includes('ankara')) {
        console.debug('Using partial timezone matching for Turkish:', timezone);
        return Language.TR;
      }
    }

    // Final fallback to English
    console.debug('No language match found, using English. Browser languages:', browserLanguages, 'Timezone:', timezone);
    return Language.EN;
    
  } catch (error) {
    console.warn('Language detection failed, falling back to English:', error);
    return Language.EN;
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Initial fallback while we detect
    const savedLanguage = localStorage.getItem('shukran-language');
    const hasManuallySet = localStorage.getItem('shukran-language-manually-set') === 'true';
    
    if (savedLanguage && hasManuallySet && Object.values(Language).includes(savedLanguage as Language)) {
      return savedLanguage as Language;
    }
    
    return savedLanguage as Language || Language.EN;
  });

  // Async language detection effect
  useEffect(() => {
    const performLanguageDetection = async () => {
      try {
        const savedLanguage = localStorage.getItem('shukran-language');
        const hasManuallySet = localStorage.getItem('shukran-language-manually-set') === 'true';
        const lastDetectedLang = localStorage.getItem('shukran-last-detected-language');
        
        // If user has manually set a language, respect that choice
        if (savedLanguage && hasManuallySet && Object.values(Language).includes(savedLanguage as Language)) {
          console.debug('Using manually set language:', savedLanguage);
          return;
        }
        
        // Detect current browser/location language (now async)
        const currentDetectedLang = await detectUserLanguage();
        
        // If we have a saved language and it matches current detection, use it
        if (savedLanguage && savedLanguage === currentDetectedLang && Object.values(Language).includes(savedLanguage as Language)) {
          console.debug('Using consistent auto-detected language:', savedLanguage);
          return;
        }
        
        // If detection has changed or no saved language, use current detection
        console.debug('Using new auto-detected language:', currentDetectedLang, 'Previous:', lastDetectedLang);
        
        // Update language state
        setLanguage(currentDetectedLang);
        
        // Save the auto-detected language and mark as automatic
        localStorage.setItem('shukran-language', currentDetectedLang);
        localStorage.setItem('shukran-last-detected-language', currentDetectedLang);
        localStorage.removeItem('shukran-language-manually-set');
        
      } catch (error) {
        console.warn('Language detection failed:', error);
      }
    };

    // Perform initial detection
    performLanguageDetection();
  }, []); // Run once on mount

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('shukran-language', language);
  }, [language]);

  // Periodically check if location/language has changed (for VPN users, travelers, etc.)
  useEffect(() => {
    const checkLanguageChanges = async () => {
      const hasManuallySet = localStorage.getItem('shukran-language-manually-set') === 'true';
      
      // Only auto-update if user hasn't manually set a language
      if (!hasManuallySet) {
        try {
          const currentDetectedLang = await detectUserLanguage();
          const savedLang = localStorage.getItem('shukran-language');
          
          // If detection has changed, update the language
          if (currentDetectedLang !== savedLang && currentDetectedLang !== language) {
            console.debug('Auto-updating language due to location change:', savedLang, '->', currentDetectedLang);
            setLanguage(currentDetectedLang);
            localStorage.setItem('shukran-last-detected-language', currentDetectedLang);
          }
        } catch (error) {
          console.debug('Language change detection failed:', error);
        }
      }
    };

    // Check on focus (when user returns to the app)
    const handleFocus = () => {
      setTimeout(() => checkLanguageChanges(), 2000); // Small delay to ensure IP services are ready
    };

    // Check every 5 minutes for location changes
    const interval = setInterval(() => checkLanguageChanges(), 5 * 60 * 1000);
    
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [language]);

  // Enhanced setLanguage function - marks as manually set when user changes language
  const handleSetLanguage = useCallback((lang: Language) => {
    console.debug('Manually setting language to:', lang);
    setLanguage(lang);
    
    // Save the manual selection
    localStorage.setItem('shukran-language', lang);
    localStorage.setItem('shukran-language-manually-set', 'true');
    localStorage.setItem('shukran-manual-selection-timestamp', Date.now().toString());
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
