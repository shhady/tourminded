'use client';

import React, { useEffect, useState } from 'react';
import { Loader, Plus, X } from 'lucide-react';
import AvailabilityCalendar from '@/components/guides/AvailabilityCalendar';

export default function BookTourModal({ locale = 'en', tourId, maxGroupSize = 10, pricePer = 'group', guideNotAvailable = [] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [notes, setNotes] = useState('');
  const [requestItems, setRequestItems] = useState([{ specialRequest: '', specialRequestPrice: '' }]);
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const [conflictDates, setConflictDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const addItem = () => setRequestItems(prev => [...prev, { specialRequest: '', specialRequestPrice: '' }]);
  const removeItem = (idx) => setRequestItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    setRequestItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setTravelers(1);
    setNotes('');
    setRequestItems([{ specialRequest: '', specialRequestPrice: '' }]);
  };

  // Re-validate availability whenever dates change; clear conflict message when resolved
  useEffect(() => {
    const toUTC = (d) => { const x = new Date(d); return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate())); };
    if (!startDate) {
      setAvailabilityMsg('');
      setConflictDates([]);
      return;
    }
    try {
      const requestedStart = toUTC(startDate);
      const requestedEnd = endDate ? toUTC(endDate) : requestedStart;
      const conflicts = [];
      for (let d = new Date(requestedStart); d <= requestedEnd; d.setUTCDate(d.getUTCDate() + 1)) {
        const hit = guideNotAvailable.some(r => {
          const rs = toUTC(r.start);
          const re = toUTC(r.end || r.start);
          return d >= rs && d <= re;
        });
        if (hit) conflicts.push(new Date(d).toISOString());
      }
      if (conflicts.length > 0) {
        setConflictDates(conflicts);
        setAvailabilityMsg(locale === 'en' ? 'Selected dates include days when the guide is unavailable.' : 'التواريخ المختارة تحتوي أيامًا غير متاحة لدى المرشد.');
      } else {
        setConflictDates([]);
        setAvailabilityMsg('');
        setError('');
      }
    } catch {
      // ignore parse errors
    }
  }, [startDate, endDate, guideNotAvailable, locale]);

  const submit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    setAvailabilityMsg('');
    setConflictDates([]);
    try {
      if (!startDate) throw new Error(locale === 'en' ? 'Start date is required' : 'تاريخ البداية مطلوب');
      if (!travelers || travelers < 1) throw new Error(locale === 'en' ? 'Travelers must be at least 1' : 'عدد المسافرين يجب أن يكون 1 على الأقل');

      // Availability check against guideNotAvailable ranges
      const toUTC = (d) => { const x = new Date(d); return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate())); };
      const requestedStart = toUTC(startDate);
      const requestedEnd = endDate ? toUTC(endDate) : requestedStart;
      const overlaps = (s1, e1, s2, e2) => !(e1 < s2 || s1 > e2);
      const blocked = guideNotAvailable.some(r => {
        const rs = toUTC(r.start);
        const re = toUTC(r.end || r.start);
        return overlaps(requestedStart, requestedEnd, rs, re);
      });
      if (blocked) {
        // Build list of conflicting specific days
        const conflicts = [];
        for (let d = new Date(requestedStart); d <= requestedEnd; d.setUTCDate(d.getUTCDate() + 1)) {
          const hit = guideNotAvailable.some(r => {
            const rs = toUTC(r.start);
            const re = toUTC(r.end || r.start);
            return d >= rs && d <= re;
          });
          if (hit) conflicts.push(new Date(d));
        }
        setConflictDates(conflicts.map(cd => cd.toISOString()));
        setAvailabilityMsg(locale === 'en' ? 'Selected dates include days when the guide is unavailable.' : 'التواريخ المختارة تحتوي أيامًا غير متاحة لدى المرشد.');
        throw new Error(locale === 'en' ? 'Guide not available on selected dates' : 'المرشد غير متاح في التواريخ المختارة');
      }

      const payload = {
        tour: tourId,
        dates: {
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
        },
        travelers: parseInt(travelers, 10),
        specialRequests: notes || undefined,
        specialRequestsCheckBoxes: requestItems
          .filter(it => String(it.specialRequest).trim() !== '')
          .map(it => ({ specialRequest: it.specialRequest, specialRequestPrice: it.specialRequestPrice ? Number(it.specialRequestPrice) : 0 })),
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create booking');
      setSuccess(locale === 'en' ? 'Booking submitted. We will contact you shortly.' : 'تم إرسال الحجز. سنتواصل معك قريبًا.');
      resetForm();
      // Keep modal open to show success, or close after short delay
      setTimeout(() => setOpen(false), 1200);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="w-full bg-black hover:bg-black/90 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        onClick={() => setOpen(true)}
      >
        {locale === 'en' ? 'Book Tour' : 'احجز الجولة'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 p-6 z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{locale === 'en' ? 'Book this Tour' : 'احجز هذه الجولة'}</h3>
              <button onClick={() => setOpen(false)} className="text-secondary-600 hover:text-secondary-900" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="mb-3 p-2 rounded bg-red-100 text-red-700">{error}</div>}
            {success && <div className="mb-3 p-2 rounded bg-green-100 text-green-700">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
              <div>
                <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'Start Date' : 'تاريخ البداية'}*</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'End Date (optional)' : 'تاريخ النهاية (اختياري)'} </label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            {availabilityMsg && (
              <div className="mb-3 text-sm text-red-600">
                <div>{availabilityMsg}</div>
                {conflictDates.length > 0 && (
                  <div className="mt-1">
                    {locale === 'en' ? 'Unavailable on: ' : 'غير متاح في: '}
                    {conflictDates.map((iso, i) => {
                      const d = new Date(iso);
                      const label = new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
                      return <span key={iso}>{label}{i < conflictDates.length - 1 ? ', ' : ''}</span>;
                    })}
                  </div>
                )}
                <button type="button" onClick={() => setShowCalendar(s => !s)} className="mt-2 text-primary-600 hover:text-primary-700 underline">
                  {showCalendar ? (locale === 'en' ? 'Hide calendar' : 'إخفاء التقويم') : (locale === 'en' ? 'Show calendar' : 'عرض التقويم')}
                </button>
                {showCalendar && (
                  <div className="mt-2 border border-secondary-200 rounded-md">
                    <AvailabilityCalendar locale={locale} ranges={guideNotAvailable} />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'Travelers' : 'عدد المسافرين'}*</label>
                <input type="number" min={1} max={maxGroupSize} value={travelers} onChange={e => setTravelers(e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <p className="mt-1 text-xs text-secondary-500">{locale === 'en' ? `Max ${maxGroupSize}` : `الحد الأقصى ${maxGroupSize}`}</p>
              </div>
              <div>
                <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'Notes (optional)' : 'ملاحظات (اختياري)'}</label>
                <textarea type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder={locale === 'en' ? 'Any special requests...' : 'طلبات خاصة...'} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            {/* <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-secondary-700">{locale === 'en' ? 'Special Requests (optional)' : 'طلبات خاصة (اختياري)'}</label>
                <button type="button" onClick={addItem} className="text-primary-600 hover:text-primary-700 flex items-center gap-1"><Plus className="w-4 h-4" /> {locale === 'en' ? 'Add' : 'إضافة'}</button>
              </div>
              <div className="space-y-2">
                {requestItems.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                    <input
                      type="text"
                      placeholder={locale === 'en' ? 'Request' : 'طلب'}
                      value={it.specialRequest}
                      onChange={e => updateItem(idx, 'specialRequest', e.target.value)}
                      className="col-span-4 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={locale === 'en' ? 'Price' : 'السعر'}
                      value={it.specialRequestPrice}
                      onChange={e => updateItem(idx, 'specialRequestPrice', e.target.value)}
                      className="col-span-2 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {requestItems.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border border-secondary-300 text-secondary-700 hover:bg-secondary-50">
                {locale === 'en' ? 'Cancel' : 'إلغاء'}
              </button>
              <button onClick={submit} disabled={submitting} className="px-4 py-2 rounded-md bg-black text-white hover:bg-primary-700">
                {submitting ? <span className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" />{locale === 'en' ? 'Submitting...' : 'جاري الإرسال...'}</span> : (locale === 'en' ? 'Submit Booking' : 'إرسال الحجز')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


