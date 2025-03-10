import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined, use the default locale
  const currentLocale = locale || defaultLocale;
  
  // Load messages for the requested locale
  let messages;
  try {
    messages = (await import(`./messages/${currentLocale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale: ${currentLocale}`, error);
    // Fallback to empty messages
    messages = {};
  }

  return {
    messages,
    defaultLocale,
    locales,
    timeZone: 'UTC'
  };
}); 