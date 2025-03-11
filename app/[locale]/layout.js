import { getDirection } from "@/lib/i18n";

export default async function LocaleLayout({ children, params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';
  const dir = getDirection(locale);

  return (
    <div className={`locale-layout ${locale === "ar" ? "font-arabic" : ""}`} dir={dir} lang={locale}>
      {children}
    </div>
  );
} 