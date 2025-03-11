export const locales = ['en', 'ar'];
export const defaultLocale = 'en';

// Get multilingual content based on locale
export const getLocalizedContent = (content, locale = defaultLocale) => {
  if (!content) return '';
  
  // If content is a string, return it
  if (typeof content === 'string') return content;
  
  // If content has locale property, return it
  if (content[locale]) return content[locale];
  
  // If locale is not available, return default locale
  if (content[defaultLocale]) return content[defaultLocale];
  
  // If no content is available, return empty string
  return '';
};

// Get direction based on locale
export const getDirection = (locale) => {
  return locale === 'ar' ? 'rtl' : 'ltr';
};

// Get font family based on locale
export const getFontFamily = (locale) => {
  return locale === 'ar' ? 'font-arabic' : 'font-sans';
};

// Check if a locale is valid
export function isValidLocale(locale) {
  return locales.includes(locale);
} 