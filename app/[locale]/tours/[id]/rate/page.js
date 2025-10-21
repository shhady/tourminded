'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Star, Loader } from 'lucide-react';

export default function RateTourPage({ params }) {
  const paramsData = React.use(params);
  const { id, locale } = paramsData || {};

  const router = useRouter();
  // start with 0 so stars are empty until user selects
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tourTitle, setTourTitle] = useState('');
  const [loadingTitle, setLoadingTitle] = useState(true);
  const [guideId, setGuideId] = useState('');
  const [guideName, setGuideName] = useState('');
  const [languages, setLanguages] = useState([]);
  const [langRatings, setLangRatings] = useState({});
  const [langHover, setLangHover] = useState({});
  const [guideRating, setGuideRating] = useState(0);
  const [guideHoverRating, setGuideHoverRating] = useState(0);
  const [guideComment, setGuideComment] = useState('');
  const [step, setStep] = useState(0); // 0: tour, 1: guide, 2: languages
  const [tourTriedNext, setTourTriedNext] = useState(false);
  const [guideTriedNext, setGuideTriedNext] = useState(false);
  const [langTriedSubmit, setLangTriedSubmit] = useState(false);

  const stars = [1, 2, 3, 4, 5];

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required parts
      if (rating < 1) {
        throw new Error(locale === 'en' ? 'Please rate the tour' : 'يرجى تقييم الجولة');
      }
      if (guideId && guideRating < 1) {
        throw new Error(locale === 'en' ? 'Please rate the guide' : 'يرجى تقييم المرشد');
      }
      if (guideId && languages.length > 0 && Object.keys(langRatings).length === 0) {
        throw new Error(locale === 'en' ? 'Please rate at least one language' : 'يرجى تقييم لغة واحدة على الأقل');
      }

      // 1) Submit tour review
      const tourRes = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tour: id, rating, comment }),
      });
      if (tourRes.status === 401) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/tours/${id}/rate`)}`);
        return;
      }
      if (!tourRes.ok) {
        const j = await tourRes.json().catch(() => ({}));
        throw new Error(j.message || (locale === 'en' ? 'Failed to submit tour review' : 'فشل إرسال تقييم الجولة'));
      }

      // 2) Submit guide review (optional but validated above if guideId exists)
      if (guideId && guideRating >= 1) {
        const guideRes = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ guide: guideId, rating: guideRating, comment: guideComment }),
        });
        if (guideRes.status === 401) {
          router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/tours/${id}/rate`)}`);
          return;
        }
        if (!guideRes.ok) {
          const j = await guideRes.json().catch(() => ({}));
          throw new Error(j.message || (locale === 'en' ? 'Failed to submit guide review' : 'فشل إرسال تقييم المرشد'));
        }

        // Also update the guide's embedded reviews array to keep legacy data in sync
        const legacyGuideReviewRes = await fetch(`/api/guides/${guideId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ review: guideComment || '', rating: guideRating }),
        });
        if (!legacyGuideReviewRes.ok) {
          const j = await legacyGuideReviewRes.json().catch(() => ({}));
          throw new Error(j.message || (locale === 'en' ? 'Failed to update guide reviews' : 'فشل تحديث تقييمات المرشد'));
        }
      }

      // 3) Submit language ratings (optional)
      if (guideId && Object.keys(langRatings).length > 0) {
        for (const [languageIndex, proficiency] of Object.entries(langRatings)) {
          const langRes = await fetch('/api/guides/update-proficiency', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guideId, languageIndex: parseInt(languageIndex), proficiency }),
          });
          if (!langRes.ok) {
            const j = await langRes.json().catch(() => ({}));
            throw new Error(j.message || (locale === 'en' ? 'Failed to submit language ratings' : 'فشل إرسال تقييمات اللغات'));
          }
        }
      }

      // All done
      router.push(`/${locale}/tours/${id}`);
    } catch (err) {
      setError(err.message || 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch tour title and guide data
  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const res = await fetch(`/api/tours/${id}`);
        if (res.ok) {
          const json = await res.json();
          const t = json?.data?.title;
          if (t && typeof t === 'object') {
            setTourTitle(t[locale] || t.en || '');
          } else if (typeof t === 'string') {
            setTourTitle(t);
          }
          const gId = json?.data?.guide;
          if (gId) {
            setGuideId(gId);
            try {
              const gRes = await fetch(`/api/guides/${gId}`);
              if (gRes.ok) {
                const gJson = await gRes.json();
                const guide = gJson?.guide || gJson;
                if (guide) {
                  setGuideName(guide?.user?.name || '');
                  setLanguages(Array.isArray(guide.languages) ? guide.languages : []);
                }
              }
            } catch {}
          }
        }
      } catch {}
      setLoadingTitle(false);
    };
    if (id) fetchTitle();
  }, [id, locale]);

  return (
    <MainLayout locale={locale}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-secondary-900">
          {locale === 'en' ? 'Rate This Tour' : 'قيّم هذه الجولة'}
        </h1>
        <p className="text-secondary-700 mb-6">
          {loadingTitle ? (locale === 'en' ? 'Loading tour...' : 'جاري تحميل الجولة...') : tourTitle}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Step 0: Rate Tour */}
        {step === 0 && (
          <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Your Rating' : 'تقييمك'}
            </label>
            <p className={`${tourTriedNext && rating < 1 ? 'text-red-600' : 'text-secondary-600'} text-xs mb-2`}>
              {locale === 'en'
                ? `Required: select 1–5 stars.`
                : `إلزامي: اختر من 1 إلى 5 نجوم.`
                }
            </p>
            <div className="flex items-center gap-2">
              {stars.map((s) => (
                <button
                  type="button"
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${ (hoverRating || rating) >= s ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300' }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-secondary-700 mb-1">
              {locale === 'en' ? 'Your Review' : 'مراجعتك'}
            </label>
              <p className="text-xs text-secondary-600 mb-2">
                {locale === 'en' ? 'Optional: share any details about this tour.' : 'اختياري: شارك أي تفاصيل عن هذه الجولة.'}
              </p>
            <textarea
              id="comment"
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={locale === 'en' ? 'Share your experience...' : 'شارك تجربتك...'}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              
            />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { if (rating < 1) { setTourTriedNext(true); } else { setStep(1); } }}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-black hover:bg-primary-700 transition-colors border border-primary-600"
              >
                {locale === 'en' ? 'Next' : 'التالي'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Rate Languages (optional) */}
        {step === 2 && guideId && languages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold mb-2 text-secondary-900">
              {locale === 'en' ? `Rate ${guideName || 'the guide'}'s languages` : `قيّم لغات ${guideName || 'المرشد'}`}
            </h2>
            <p className={`text-sm mb-4 ${langTriedSubmit && Object.keys(langRatings).length === 0 ? 'text-red-600' : 'text-secondary-600'}`}>
              {locale === 'en' ? 'Required: rate at least one language you experienced.' : 'إلزامي: قيّم لغة واحدة على الأقل.'}
            </p>
            <div className="space-y-4">
              {languages.map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between border border-secondary-200 rounded-md px-3 py-2">
                  <span className="text-secondary-800">{lang.language}</span>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onMouseEnter={() => setLangHover(prev => ({ ...prev, [idx]: s }))}
                        onMouseLeave={() => setLangHover(prev => ({ ...prev, [idx]: 0 }))}
                        onClick={() => setLangRatings(prev => ({ ...prev, [idx]: s }))}
                        className="cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${ ((langHover[idx] || langRatings[idx] || 0) >= s) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300' }`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center rounded-lg border px-4 py-2 text-secondary-800 hover:bg-secondary-50 transition-colors">
                {locale === 'en' ? 'Back' : 'رجوع'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => { setLangTriedSubmit(true); handleSubmitAll(); }}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-black hover:bg-primary-700 transition-colors border border-primary-600"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    {locale === 'en' ? 'Submitting...' : 'يتم الإرسال...'}
                  </span>
                ) : (
                  locale === 'en' ? 'Submit All' : 'إرسال الكل'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Rate Guide */}
        {step === 1 && guideId && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
            <h2 className="text-xl font-semibold mb-2 text-secondary-900">
              {locale === 'en' ? `Rate ${guideName || 'the guide'}` : `قيّم ${guideName || 'المرشد'}`}
            </h2>
            <p className={`${guideTriedNext && guideRating < 1 ? 'text-red-600' : 'text-secondary-600'} text-xs mb-2`}>
              {locale === 'en' ? 'Required: 1–5 stars' : 'إلزامي: من 1 إلى 5 نجوم'}
            </p>
            <div className="flex items-center gap-2 mb-4">
              {[1,2,3,4,5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onMouseEnter={() => setGuideHoverRating(s)}
                  onMouseLeave={() => setGuideHoverRating(0)}
                  onClick={() => setGuideRating(s)}
                  className="cursor-pointer"
                >
                  <Star className={`w-7 h-7 ${ ((guideHoverRating || guideRating) >= s) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300' }`} />
                </button>
              ))}
            </div>
            <textarea
              rows={5}
              value={guideComment}
              onChange={(e) => setGuideComment(e.target.value)}
              placeholder={locale === 'en' ? 'Comment about the guide (optional)' : 'تعليق عن المرشد (اختياري)'}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-secondary-600 mt-2">{locale === 'en' ? 'Optional comment.' : 'تعليق اختياري.'}</p>
            <div className="flex justify-between mt-4">
              <button type="button" onClick={() => setStep(0)} className="inline-flex items-center rounded-lg border px-4 py-2 text-secondary-800 hover:bg-secondary-50 transition-colors">
                {locale === 'en' ? 'Back' : 'رجوع'}
              </button>
              <button
                type="button"
                onClick={() => { if (guideRating < 1) { setGuideTriedNext(true); } else { setStep(2); } }}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-black hover:bg-primary-700 transition-colors border border-primary-600"
              >
                {locale === 'en' ? 'Next' : 'التالي'}
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}


