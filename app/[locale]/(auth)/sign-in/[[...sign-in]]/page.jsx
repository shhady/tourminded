'use client';

import { SignIn } from "@clerk/nextjs";
import { usePathname } from 'next/navigation';

export default function Page() {
  // Get the locale from the pathname
  const pathname = usePathname();
  const localeMatch = pathname.match(/\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'en';

  const appearance = {
    elements: {
      rootBox: "mx-auto w-full max-w-md",
      card: "bg-white p-6 rounded-lg shadow-md",
      headerTitle: "text-2xl font-bold mb-6 text-center",
      headerSubtitle: "text-secondary-600 text-center mb-4",
      formButtonPrimary: "w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
      formFieldLabel: "block text-sm font-medium text-secondary-700 mb-1",
      formFieldInput: "w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500",
      footerAction: "text-sm text-secondary-600 mt-6 text-center",
      footerActionLink: "text-primary-600 hover:text-primary-500 font-medium",
      identityPreview: "bg-secondary-50 p-4 rounded-md",
      formFieldWarning: "mt-1 text-sm text-red-600",
      formFieldError: "mt-1 text-sm text-red-600",
      alert: "mb-4 p-3 bg-red-100 text-red-700 rounded-md",
    },
    layout: {
      socialButtonsPlacement: "bottom",
      socialButtonsVariant: "iconButton",
    },
    variables: {
      colorPrimary: "#0d47a1",
      colorText: "#1f2937",
      colorTextSecondary: "#4b5563",
      colorBackground: "#f9fafb",
      colorDanger: "#ef4444",
      borderRadius: "0.375rem",
    },
  };

  return (
    <div className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <SignIn 
            appearance={appearance} 
            redirectUrl={`/${locale}`}
            signUpUrl={`/sign-up`}
          />
        </div>
      </div>
    </div>
  );
}
