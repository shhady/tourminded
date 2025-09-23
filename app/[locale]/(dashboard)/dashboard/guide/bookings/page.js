'use client';

import React, { useEffect, useState } from 'react';
import { Loader, Plus, X, Save } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function GuideBookingsPage({ params }) {
  const localeParams = React.use(params);
  const locale = localeParams?.locale || 'en';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState({}); // id -> items
  const [savingId, setSavingId] = useState('');
  const [expandedId, setExpandedId] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bookings?limit=50', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load bookings');
      setBookings(data.data || []);
      // initialize editing map
      const map = {};
      (data.data || []).forEach(b => {
        map[b._id] = (b.specialRequestsCheckBoxes || []).map(it => ({ specialRequest: it.specialRequest || '', specialRequestPrice: it.specialRequestPrice || 0 }));
      });
      setEditing(map);
    } catch (e) {
      setError(e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const addItem = (id) => {
    setEditing(prev => ({ ...prev, [id]: [...(prev[id] || []), { specialRequest: '', specialRequestPrice: 0 }] }));
  };
  const removeItem = (id, idx) => {
    setEditing(prev => ({ ...prev, [id]: (prev[id] || []).filter((_, i) => i !== idx) }));
  };
  const updateItem = (id, idx, field, value) => {
    setEditing(prev => ({ ...prev, [id]: (prev[id] || []).map((it, i) => i === idx ? { ...it, [field]: field === 'specialRequestPrice' ? Number(value) : value } : it) }));
  };

  const saveBooking = async (id) => {
    setSavingId(id);
    setError('');
    try {
      const payload = { specialRequestsCheckBoxes: (editing[id] || []) };
      const res = await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking');
      await fetchBookings();
    } catch (e) {
      setError(e.message || 'Failed to update booking');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{locale === 'en' ? 'Bookings' : 'الحجوزات'}</h1>
        <Button variant="outline" onClick={fetchBookings}>
          {locale === 'en' ? 'Refresh' : 'تحديث'}
        </Button>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-secondary-600"><Loader className="w-4 h-4 animate-spin" />{locale === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-secondary-600">{locale === 'en' ? 'No bookings yet.' : 'لا توجد حجوزات بعد.'}</div>
      ) : (
        <>
        {/* Desktop/table view */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">{locale === 'en' ? 'Tour' : 'الجولة'}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">{locale === 'en' ? 'Dates' : 'التواريخ'}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">{locale === 'en' ? 'Travelers' : 'المسافرون'}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">{locale === 'en' ? 'Total' : 'الإجمالي'}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {bookings.map(b => (
                <React.Fragment key={b._id}>
                  <tr className="hover:bg-secondary-50">
                    <td className="px-4 py-3 text-sm text-secondary-900">{b.tour?.title?.en || b.tour?.title?.ar || 'Tour'}</td>
                    <td className="px-4 py-3 text-sm text-secondary-700">{new Date(b.dates?.startDate).toLocaleDateString()} {b.dates?.endDate ? `→ ${new Date(b.dates.endDate).toLocaleDateString()}` : ''}</td>
                    <td className="px-4 py-3 text-sm text-secondary-700">{b.travelers}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-600">${b.totalPrice}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-primary-600 hover:text-primary-800" onClick={() => setExpandedId(expandedId === b._id ? '' : b._id)}>
                        {expandedId === b._id ? (locale === 'en' ? 'Hide' : 'إخفاء') : (locale === 'en' ? 'View' : 'عرض')}
                      </button>
                    </td>
                  </tr>
                  {expandedId === b._id && (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 bg-secondary-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-secondary-700 mb-2">{locale === 'en' ? 'Customer' : 'العميل'}</div>
                            <div className="text-sm text-secondary-700">{b.user?.name || b.user?.email || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-secondary-700 mb-2">{locale === 'en' ? 'Notes' : 'ملاحظات'}</div>
                            <div className="text-sm text-secondary-700 whitespace-pre-line">{b.specialRequests || '-'}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="mb-2 text-sm font-medium text-secondary-700">{locale === 'en' ? 'Special Requests (editable)' : 'الطلبات الخاصة (قابلة للتعديل)'}</div>
                          <div className="space-y-2">
                            {(editing[b._id] || []).map((it, idx) => (
                              <div key={idx} className="grid grid-cols-6 gap-2 items-center">
                                <input type="text" value={it.specialRequest} onChange={e => updateItem(b._id, idx, 'specialRequest', e.target.value)} placeholder={locale === 'en' ? 'Request' : 'طلب'} className="col-span-4 px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <div className="col-span-2 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-500">$</span>
                      <input type="number" min="0" step="0.01" value={it.specialRequestPrice} onChange={e => updateItem(b._id, idx, 'specialRequestPrice', e.target.value)} placeholder={locale === 'en' ? 'Price' : 'السعر'} className="w-full pl-6 pr-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                                {(editing[b._id] || []).length > 0 && (
                                  <button type="button" onClick={() => removeItem(b._id, idx)} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-3">
                            <button type="button" onClick={() => addItem(b._id)} className="text-primary-600 hover:text-primary-700 flex items-center gap-1"><Plus className="w-4 h-4" />{locale === 'en' ? 'Add item' : 'إضافة عنصر'}</button>
                            <button type="button" onClick={() => saveBooking(b._id)} disabled={savingId === b._id} className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 flex items-center gap-2">
                              {savingId === b._id ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              {locale === 'en' ? 'Save' : 'حفظ'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Mobile/card view */}
        <div className="md:hidden space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-secondary-900 mb-1">{b.tour?.title?.en || b.tour?.title?.ar || 'Tour'}</div>
                  <div className="text-sm text-secondary-700">{new Date(b.dates?.startDate).toLocaleDateString()} {b.dates?.endDate ? `→ ${new Date(b.dates.endDate).toLocaleDateString()}` : ''}</div>
                  <div className="text-sm text-secondary-700">{locale === 'en' ? 'Traveler(s):' : 'المسافرون:'} {b.travelers}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-secondary-600">{locale === 'en' ? 'Total' : 'الإجمالي'}</div>
                  <div className="text-lg font-bold text-primary-600">${b.totalPrice}</div>
                </div>
              </div>
              <div className="mt-3">
                <button className="text-primary-600 hover:text-primary-800" onClick={() => setExpandedId(expandedId === b._id ? '' : b._id)}>
                  {expandedId === b._id ? (locale === 'en' ? 'Hide' : 'إخفاء') : (locale === 'en' ? 'View details' : 'عرض التفاصيل')}
                </button>
              </div>
              {expandedId === b._id && (
                <div className="mt-3 border-t border-secondary-200 pt-3">
                  <div className="mb-3">
                    <div className="text-sm font-medium text-secondary-700 mb-1">{locale === 'en' ? 'Customer' : 'العميل'}</div>
                    <div className="text-sm text-secondary-700">{b.user?.name || b.user?.email || '-'}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium text-secondary-700 mb-1">{locale === 'en' ? 'Notes' : 'ملاحظات'}</div>
                    <div className="text-sm text-secondary-700 whitespace-pre-line">{b.specialRequests || '-'}</div>
                  </div>
                  <div className="mb-2 text-sm font-medium text-secondary-700">{locale === 'en' ? 'Special Requests (editable)' : 'الطلبات الخاصة (قابلة للتعديل)'}</div>
                  <div className="space-y-2">
                    {(editing[b._id] || []).map((it, idx) => (
                      <div key={idx} className="space-y-2">
                        <input type="text" value={it.specialRequest} onChange={e => updateItem(b._id, idx, 'specialRequest', e.target.value)} placeholder={locale === 'en' ? 'Request' : 'طلب'} className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-500">$</span>
                          <input type="number" min="0" step="0.01" value={it.specialRequestPrice} onChange={e => updateItem(b._id, idx, 'specialRequestPrice', e.target.value)} placeholder={locale === 'en' ? 'Price' : 'السعر'} className="w-full pl-6 pr-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        {(editing[b._id] || []).length > 0 && (
                          <button type="button" onClick={() => removeItem(b._id, idx)} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2 mt-3">
                    <button type="button" onClick={() => addItem(b._id)} className="text-primary-600 hover:text-primary-700 flex items-center gap-1"><Plus className="w-4 h-4" />{locale === 'en' ? 'Add item' : 'إضافة عنصر'}</button>
                    <button type="button" onClick={() => saveBooking(b._id)} disabled={savingId === b._id} className="w-full sm:w-auto px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 flex items-center gap-2 justify-center">
                      {savingId === b._id ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {locale === 'en' ? 'Save' : 'حفظ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}


