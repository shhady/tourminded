"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Edit2, X, Loader } from "lucide-react";

export default function AdminFaqManager({ initialFaqs }) {
  const params = useParams();
  const locale = params?.locale || "en";

  const [faqs, setFaqs] = useState(initialFaqs || []);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({ question: "", answer: "", order: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const label = (en, ar) => (locale === "en" ? en : ar);

  const sortedFaqs = [...faqs].sort((a, b) => {
    const ao = typeof a.order === "number" ? a.order : 0;
    const bo = typeof b.order === "number" ? b.order : 0;
    if (ao !== bo) return ao - bo;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const resetCreateForm = () => {
    setQuestion("");
    setAnswer("");
    setOrder("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setError(label("Question and answer are required.", "السؤال والإجابة مطلوبان."));
      return;
    }
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          order: order === "" ? 0 : Number(order) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.data) {
        throw new Error(data?.message || label("Failed to create FAQ.", "فشل إنشاء السؤال."));
      }
      setFaqs((prev) => [...prev, data.data]);
      resetCreateForm();
    } catch (err) {
      setError(err.message || label("Failed to create FAQ.", "فشل إنشاء السؤال."));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setEditingValues({
      question: faq.question || "",
      answer: faq.answer || "",
      order: typeof faq.order === "number" ? String(faq.order) : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues({ question: "", answer: "", order: "" });
  };

  const handleEditChange = (field, value) => {
    setEditingValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (faqId) => {
    if (!editingValues.question.trim() || !editingValues.answer.trim()) {
      setError(label("Question and answer are required.", "السؤال والإجابة مطلوبان."));
      return;
    }
    setError("");
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/faq/${faqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editingValues.question.trim(),
          answer: editingValues.answer.trim(),
          order:
            editingValues.order === "" ? 0 : Number(editingValues.order) || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.data) {
        throw new Error(data?.message || label("Failed to update FAQ.", "فشل تحديث السؤال."));
      }
      setFaqs((prev) =>
        prev.map((f) => (f._id === faqId ? data.data : f))
      );
      cancelEdit();
    } catch (err) {
      setError(err.message || label("Failed to update FAQ.", "فشل تحديث السؤال."));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (faqId) => {
    if (
      !window.confirm(
        label(
          "Are you sure you want to delete this FAQ?",
          "هل أنت متأكد أنك تريد حذف هذا السؤال؟"
        )
      )
    ) {
      return;
    }
    setDeletingId(faqId);
    setError("");
    try {
      const res = await fetch(`/api/admin/faq/${faqId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || label("Failed to delete FAQ.", "فشل حذف السؤال."));
      }
      setFaqs((prev) => prev.filter((f) => f._id !== faqId));
      if (editingId === faqId) cancelEdit();
    } catch (err) {
      setError(err.message || label("Failed to delete FAQ.", "فشل حذف السؤال."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">
        {label("FAQ Management", "إدارة الأسئلة الشائعة")}
      </h1>
      <p className="mb-6 text-secondary-700">
        {label(
          "Add, edit, and delete frequently asked questions shown on your site.",
          "أضف وحرّر واحذف الأسئلة الشائعة التي تظهر في موقعك."
        )}
      </p>

      {/* Create form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-600" />
          {label("Add New Question", "إضافة سؤال جديد")}
        </h2>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-800 mb-1">
              {label("Question", "السؤال")}
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={label(
                "e.g. How do I book a tour?",
                "مثال: كيف أحجز جولة؟"
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-800 mb-1">
              {label("Answer", "الإجابة")}
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={label(
                "Write a clear answer for travelers.",
                "اكتب إجابة واضحة للمسافرين."
              )}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="sm:w-40">
              <label className="block text-sm font-medium text-secondary-800 mb-1">
                {label("Order (optional)", "الترتيب (اختياري)")}
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-600 text-black hover:bg-primary-700 disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin " />
                  <span className="text-black">{label("Saving…", "جارٍ الحفظ...")}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-black" />
                  {label("Add Question", "إضافة سؤال")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow overflow-hidden text-black">
        <div className="px-6 py-4 border-b border-secondary-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">
            {label("Existing Questions", "الأسئلة الحالية")}
          </h2>
          <span className="text-xs text-secondary-500 text-black">
            {label(`${faqs.length} items`, `${faqs.length} سؤال`)}
          </span>
        </div>
        {sortedFaqs.length === 0 ? (
          <div className="px-6 py-8 text-center text-secondary-500 text-black">
            {label("No FAQ entries yet.", "لا توجد أسئلة حتى الآن.")}
          </div>
        ) : (
          <div className="divide-y divide-secondary-200 text-black">
            {sortedFaqs.map((faq) => {
              const isEditing = editingId === faq._id;
              return (
                <div key={faq._id} className="px-6 py-4 text-black">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editingValues.question}
                            onChange={(e) =>
                              handleEditChange("question", e.target.value)
                            }
                            className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm mb-2"
                          />
                          <textarea
                            value={editingValues.answer}
                            onChange={(e) =>
                              handleEditChange("answer", e.target.value)
                            }
                            rows={3}
                            className="w-full rounded-md border border-secondary-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-secondary-700 mb-1">
                            {label("Order", "الترتيب")}
                          </label>
                          <input
                            type="number"
                            value={editingValues.order}
                            onChange={(e) =>
                              handleEditChange("order", e.target.value)
                            }
                            className="w-full rounded-md border border-secondary-300 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-secondary-300 text-secondary-700 text-sm"
                        >
                          <X className="w-4 h-4" />
                          {label("Cancel", "إلغاء")}
                        </button>
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() => handleSaveEdit(faq._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary-600 text-black text-sm hover:bg-primary-700 disabled:opacity-60"
                        >
                          {savingEdit ? (
                            <Loader className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            <Edit2 className="w-4 h-4 text-black" />
                          )}
                          {label("Save", "حفظ")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-secondary-500">
                            #{typeof faq.order === "number" ? faq.order : 0}
                          </span>
                          <h3 className="font-semibold text-secondary-900">
                            {faq.question}
                          </h3>
                        </div>
                        <p className="text-sm text-secondary-700 whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(faq)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-secondary-100 text-secondary-800 text-sm hover:bg-secondary-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          {label("Edit", "تعديل")}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === faq._id}
                          onClick={() => handleDelete(faq._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60"
                        >
                          {deletingId === faq._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {label("Delete", "حذف")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


