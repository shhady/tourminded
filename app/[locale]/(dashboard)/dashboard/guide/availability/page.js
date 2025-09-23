'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Loader, Calendar as CalendarIcon, X, Save, RefreshCw } from 'lucide-react';

// Helper to format date to YYYY-MM-DD (local for input display)
function toInputDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

// Helper to format date to readable short
function toShort(date) {
  try {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
  } catch {
    return '';
  }
}

export default function AvailabilityPage({ params }) {
  const localeParams = React.use(params);
  const locale = localeParams?.locale || 'en';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ranges, setRanges] = useState([]); // { start: ISO, end: ISO, note? }

  // UI state for adding a range
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [newNote, setNewNote] = useState('');

  // Fetch availability
  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guides/availability', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load availability');
      const data = await res.json();
      setRanges((data.data || []).map(r => ({ start: r.start, end: r.end, note: r.note })));
    } catch (e) {
      setError(e.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAvailability(); }, []);

  const addRange = async () => {
    if (!newStart) return;
    setSaving(true);
    setError('');
    try {
      const payload = { mode: 'add', ranges: [{ start: newStart, end: newEnd || newStart, note: newNote || undefined }] };
      const res = await fetch('/api/guides/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add range');
      setRanges((data.data || []).map(r => ({ start: r.start, end: r.end, note: r.note })));
      setNewStart('');
      setNewEnd('');
      setNewNote('');
    } catch (e) {
      setError(e.message || 'Failed to add range');
    } finally {
      setSaving(false);
    }
  };

  const removeRange = async (idx) => {
    const next = ranges.filter((_, i) => i !== idx);
    setSaving(true);
    setError('');
    try {
      const payload = { mode: 'replace', ranges: next };
      const res = await fetch('/api/guides/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove range');
      setRanges((data.data || []).map(r => ({ start: r.start, end: r.end, note: r.note })));
    } catch (e) {
      setError(e.message || 'Failed to remove range');
    } finally {
      setSaving(false);
    }
  };

  // No explicit save function; each add/remove persists immediately

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          {locale === 'en' ? 'Availability' : 'التوفر'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAvailability} disabled={loading}>
            <div className="flex items-center gap-1">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{locale === 'en' ? 'Refresh' : 'تحديث'}</span>
            </div>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>
      )}

      {/* Add range */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">{locale === 'en' ? 'Mark Unavailable Dates' : 'وضع تواريخ غير متاح'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'Start' : 'البداية'}</label>
            <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'End (optional)' : 'النهاية (اختياري)'}</label>
            <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm text-secondary-700 mb-1">{locale === 'en' ? 'Note (optional)' : 'ملاحظة (اختياري)'}</label>
            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={locale === 'en' ? 'e.g., Personal leave' : 'مثلاً: إجازة شخصية'} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="mt-3">
          <Button type="button" onClick={addRange} disabled={!newStart || saving}>
            {saving ? (
              <span className="flex items-center gap-2"><Loader className="w-4 h-4 animate-spin" />{locale === 'en' ? 'Adding...' : 'جاري الإضافة...'}</span>
            ) : (
              locale === 'en' ? 'Add Unavailable Range' : 'إضافة فترة غير متاح'
            )}
          </Button>
        </div>
      </div>

      {/* Ranges List */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-3">{locale === 'en' ? 'Unavailable Dates' : 'تواريخ غير متاح'}</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-secondary-600"><Loader className="w-4 h-4 animate-spin" /> {locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
        ) : ranges.length === 0 ? (
          <p className="text-secondary-600">{locale === 'en' ? 'No unavailable dates yet. You are bookable every day.' : 'لا توجد تواريخ غير متاحة بعد. أنت متاح للحجز يومياً.'}</p>
        ) : (
          <ul className="divide-y divide-secondary-200">
            {ranges.map((r, idx) => (
              <li key={`${r.start}-${r.end}-${idx}`} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{toShort(r.start)}{r.end && r.end !== r.start ? ` → ${toShort(r.end)}` : ''}</div>
                  {r.note && <div className="text-sm text-secondary-600">{r.note}</div>}
                </div>
                <button onClick={() => removeRange(idx)} className="text-red-600 hover:text-red-800" aria-label="Remove"><X className="w-5 h-5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


