import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { defaultLocale } from '../../../lib/i18n';

export default function GuideDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push(`/${defaultLocale}/dashboard/guide`);
  }, [router]);
  
  return null;
} 