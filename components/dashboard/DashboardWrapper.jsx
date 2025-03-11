'use client';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardWrapper({ children, locale, userRole }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 container mx-auto px-4 py-8">
      <div className="md:w-64 flex-shrink-0">
        <DashboardSidebar locale={locale} userRole={userRole} />
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
} 