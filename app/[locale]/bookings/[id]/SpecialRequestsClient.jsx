'use client';
import { useMemo, useState } from 'react';

export default function SpecialRequestsClient({
  locale,
  bookingId,
  travelers,
  tourPrice,
  tourPricePer,
  items: initialItems = [],
  userAlreadyApproved = false,
  otherApproved = false,
}) {
  const [items, setItems] = useState(
    (initialItems || []).map((it) => ({
      specialRequest: it.specialRequest || '',
      specialRequestPrice: Number(it.specialRequestPrice) || 0,
      specialRequestPricePerGroupOrPerson: it.specialRequestPricePerGroupOrPerson === 'person' ? 'person' : 'group',
      checked: true,
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  const basePrice = useMemo(() => {
    const t = Number(tourPrice) || 0;
    const tr = Number(travelers) || 1;
    return tourPricePer === 'person' ? t * tr : t;
  }, [tourPrice, tourPricePer, travelers]);

  const extrasSum = useMemo(() => {
    const tr = Number(travelers) || 1;
    return items.reduce((sum, it) => {
      if (!it.checked) return sum;
      const price = Number(it.specialRequestPrice) || 0;
      const mult = it.specialRequestPricePerGroupOrPerson === 'person' ? tr : 1;
      return sum + price * mult;
    }, 0);
  }, [items, travelers]);

  const total = basePrice + extrasSum;
  const hasChanges = useMemo(() => items.some((it) => it.checked === false), [items]);

  const setChecked = (idx, checked) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, checked } : it)));
  };

  const approve = async () => {
    try {
      setSubmitting(true);
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedOfferUser: true }),
      });
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const update = async () => {
    try {
      setSubmitting(true);
      const filtered = items
        .filter((it) => it.checked)
        .map((it) => ({
          specialRequest: it.specialRequest,
          specialRequestPrice: Number(it.specialRequestPrice) || 0,
          specialRequestPricePerGroupOrPerson: it.specialRequestPricePerGroupOrPerson === 'person' ? 'person' : 'group',
        }));
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialRequestsCheckBoxes: filtered,
          approvedOfferUser: true,
          approvedOfferGuide: false,
        }),
      });
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 border-t border-secondary-200">
      <div className="text-sm text-secondary-600 mb-3">
        {locale === 'en' ? 'Special Requests' : 'الطلبات الخاصة'}
      </div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <label key={idx} className="flex items-center justify-between gap-3 p-2 rounded border border-secondary-200">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={it.checked} onChange={(e) => setChecked(idx, e.target.checked)} />
              <span className="text-sm text-secondary-900">{it.specialRequest}</span>
            </div>
            <div className="text-sm text-secondary-700">
              ${Number(it.specialRequestPrice) || 0}
              <span className="text-secondary-500"> {it.specialRequestPricePerGroupOrPerson === 'person' ? (locale === 'en' ? 'per person' : 'للشخص') : (locale === 'en' ? 'per group' : 'للمجموعة')}</span>
            </div>
          </label>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-secondary-700 text-sm">
          {locale === 'en' ? 'Total' : 'الإجمالي'}: <span className="font-semibold text-secondary-900">${total}</span>
        </div>
        <div className="flex gap-2">
          {!userAlreadyApproved && otherApproved && !hasChanges && (
            <button type="button" onClick={approve} disabled={submitting} className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-60">
              {locale === 'en' ? 'Approve' : 'موافقة'}
            </button>
          )}
          {!userAlreadyApproved && hasChanges && (
            <button type="button" onClick={update} disabled={submitting} className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-60">
              {locale === 'en' ? 'Update' : 'تحديث'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


