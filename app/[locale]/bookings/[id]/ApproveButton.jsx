'use client';
import { useState } from 'react';

export default function ApproveButton({ locale, bookingId, label }) {
  const [loading, setLoading] = useState(false);
  const onApprove = async () => {
    try {
      setLoading(true);
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedOfferUser: true })
      });
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" onClick={onApprove} disabled={loading} className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-60">
      {loading ? (locale === 'en' ? 'Approving...' : 'جاري الموافقة...') : (label || (locale === 'en' ? 'Approve' : 'موافقة'))}
    </button>
  );
}


