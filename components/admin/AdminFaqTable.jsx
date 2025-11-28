'use client';

import React, { useState } from 'react';
import { Loader, Trash2, Edit3, Save, X } from 'lucide-react';

export default function AdminFaqTable({ initialFaqs = [], locale = 'en' }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingAnswer, setEditingAnswer] = useState('');

  const t = (en, ar) => (locale === 'en' ? en : ar);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create FAQ');
      }
      setFaqs((prev) => [data.data, ...prev]);
      setQuestion('');
      setAnswer('');
    } catch (err) {
      setError(err.message || 'Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setEditingQuestion(faq.question);
    setEditingAnswer(faq.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingQuestion('');
    setEditingAnswer('');
  };

  const saveEdit = async (faqId) => {
    if (!editingQuestion.trim() || !editingAnswer.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/faq/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editingQuestion.trim(),
          answer: editingAnswer.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update FAQ');
      }
      setFaqs((prev) => prev.map((f) => (f._id === faqId ? data.data : f)));
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  const deleteFaq = async (faqId) => {
    if (!window.confirm(t('Delete this FAQ?', 'حذف هذا السؤال؟'))) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/faq/${faqId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete FAQ');
      }
      setFaqs((prev) => prev.filter((f) => f._id !== faqId));
      if (editingId === faqId) {
        cancelEdit();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4">
        {t('FAQ', 'الأسئلة الشائعة')}
      </h1>
      <p className="text-sm text-secondary-600 mb-6">
        {t(
          'Manage frequently asked questions shown on the site. Only admins can edit these.',
          'إدارة الأسئلة الشائعة المعروضة في الموقع. فقط المشرفون يمكنهم تعديلها.'
        )}
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-secondary-800 mb-1">
            {t('Question', 'السؤال')}
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t('Enter a question...', 'أدخل سؤالاً...')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-800 mb-1">
            {t('Answer', 'الإجابة')}
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder={t('Enter an answer...', 'أدخل الإجابة...')}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !question.trim() || !answer.trim()}
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              {t('Saving...', 'جاري الحفظ...')}
            </>
          ) : (
            t('Add FAQ', 'إضافة سؤال')
          )}
        </button>
      </form>

      {/* FAQ list */}
      {faqs.length === 0 ? (
        <p className="text-sm text-secondary-500">
          {t('No FAQ items yet.', 'لا توجد أسئلة حتى الآن.')}
        </p>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className="rounded-lg border border-secondary-200 bg-secondary-50/40 p-4"
            >
              {editingId === faq._id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-secondary-700 mb-1">
                      {t('Question', 'السؤال')}
                    </label>
                    <input
                      type="text"
                      value={editingQuestion}
                      onChange={(e) => setEditingQuestion(e.target.value)}
                      className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary-700 mb-1">
                      {t('Answer', 'الإجابة')}
                    </label>
                    <textarea
                      rows={3}
                      value={editingAnswer}
                      onChange={(e) => setEditingAnswer(e.target.value)}
                      className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => saveEdit(faq._id)}
                      disabled={loading || !editingQuestion.trim() || !editingAnswer.trim()}
                      className="inline-flex items-center rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-black/90 disabled:opacity-60"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {t('Save', 'حفظ')}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center rounded-md border border-secondary-300 px-3 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t('Cancel', 'إلغاء')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-1">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-secondary-700 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => startEdit(faq)}
                      className="inline-flex items-center rounded-md border border-secondary-300 px-3 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      {t('Edit', 'تعديل')}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteFaq(faq._id)}
                      className="inline-flex items-center rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t('Delete', 'حذف')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


