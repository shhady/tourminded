"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trash2, Edit, Compass, DollarSign, User, Loader } from "lucide-react";

export default function AdminToursTable({ tours: initialTours }) {
  const [tours, setTours] = useState(initialTours || []);
  const [deletingId, setDeletingId] = useState("");
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";

  const formatPrice = (price) => {
    if (typeof price !== "number") return "$0";
    return `$${price}`;
  };

  const handleEdit = (tourId) => {
    router.push(`/${locale}/dashboard/admin/tours/edit/${tourId}`);
  };

  const handleDelete = async (tourId) => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to delete this tour?' : 'هل أنت متأكد أنك تريد حذف هذه الجولة؟')) return;
    try {
      setDeletingId(tourId);
      const res = await fetch(`/api/tours/${tourId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || (locale === 'en' ? 'Failed to delete tour' : 'فشل حذف الجولة'));
        return;
      }
      setTours((prev) => prev.filter((t) => t._id !== tourId));
    } catch (e) {
      alert(locale === 'en' ? 'Unexpected error while deleting' : 'حدث خطأ غير متوقع أثناء الحذف');
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">{locale === 'en' ? 'Manage Tours' : 'إدارة الجولات'}</h1>
      <p className="mb-8 text-secondary-700">{locale === 'en' ? 'View, edit, and delete tours.' : 'عرض وتعديل وحذف الجولات.'}</p>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Title' : 'العنوان'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Guide' : 'المرشد'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Price' : 'السعر'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Active' : 'نشط'}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">{locale === 'en' ? 'Actions' : 'الإجراءات'}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {tours.map((t) => (
              <tr key={t._id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-secondary-900">{t.title?.en || t.title?.ar || '-'}</div>
                  <div className="text-xs text-secondary-600 truncate max-w-xs">{t.description?.en || t.description?.ar || ''}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-secondary-800">
                    <User className="w-4 h-4" />
                    <span>{t.guide?.nickname || t.guide?.names?.[0]?.value || '—'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-secondary-900">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{formatPrice(t.price)}</span>
                    <span className="text-secondary-600 text-sm">{t.pricePer === 'person' ? (locale === 'en' ? '/ person' : '/ للشخص') : (locale === 'en' ? '/ group' : '/ للمجموعة')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {t.isActive ? (locale === 'en' ? 'Active' : 'نشط') : (locale === 'en' ? 'Inactive' : 'غير نشط')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(t._id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200">
                      <Edit className="w-4 h-4" /> {locale === 'en' ? 'Edit' : 'تعديل'}
                    </button>
                    <button onClick={() => handleDelete(t._id)} disabled={deletingId === t._id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                      {deletingId === t._id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {locale === 'en' ? 'Delete' : 'حذف'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {tours.map((t) => (
          <div key={t._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-secondary-900 mb-1">{t.title?.en || t.title?.ar || '-'}</div>
                <div className="text-sm text-secondary-700 flex items-center gap-1"><User className="w-4 h-4" />{t.guide?.nickname || t.guide?.names?.[0]?.value || '—'}</div>
                <div className="text-sm text-secondary-700 flex items-center gap-1 mt-1"><DollarSign className="w-4 h-4" />{formatPrice(t.price)} <span className="text-secondary-600">{t.pricePer === 'person' ? (locale === 'en' ? '/ person' : '/ للشخص') : (locale === 'en' ? '/ group' : '/ للمجموعة')}</span></div>
                <div className="mt-1"><span className={`px-2 py-1 rounded text-xs font-semibold ${t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.isActive ? (locale === 'en' ? 'Active' : 'نشط') : (locale === 'en' ? 'Inactive' : 'غير نشط')}</span></div>
              </div>
              <Compass className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(t._id)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-secondary-100 text-secondary-800 hover:bg-secondary-200">
                <Edit className="w-4 h-4" /> {locale === 'en' ? 'Edit' : 'تعديل'}
              </button>
              <button onClick={() => handleDelete(t._id)} disabled={deletingId === t._id} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                {deletingId === t._id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {locale === 'en' ? 'Delete' : 'حذف'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


