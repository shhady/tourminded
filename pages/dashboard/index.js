import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { defaultLocale } from '../../lib/i18n';

export default function DashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push(`/${defaultLocale}/dashboard`);
  }, [router]);
  
  return null;
} 