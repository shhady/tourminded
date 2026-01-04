import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Cookie Policy | Watermelon Tours',
  description: 'Cookie Policy for Watermelon Tours - Information about how we use cookies and tracking technologies.',
};

export default async function CookiesPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  const content = {
    en: {
      title: "Cookie Policy",
      lastUpdated: "Last updated: January 2026",
      intro: "This Cookie Policy explains how Watermelon Tours (“we”, “us”, or “our”) uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.",
      whatAreCookies: {
        title: "What are cookies?",
        text: "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information."
      },
      types: {
        title: "Types of Cookies We Use",
        essential: {
          title: "Essential Cookies",
          text: "These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website to you, you cannot refuse them without impacting how our website functions.",
          examples: [
            "Session cookies (NextAuth.js) - To keep you logged in",
            "Security cookies (Stripe) - For secure payment processing",
            "CSRF Token - To prevent cross-site request forgery attacks"
          ]
        },
        analytics: {
          title: "Analytics and Customization Cookies",
          text: "These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.",
          examples: [
            "Google Analytics (_ga, _gid) - To track website traffic and user behavior",
            "Vercel Analytics - To monitor website performance"
          ]
        },
        marketing: {
          title: "Advertising Cookies",
          text: "These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests."
        }
      },
      control: {
        title: "How can you control cookies?",
        text: "You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. In addition, you can set or amend your web browser controls to accept or refuse cookies."
      }
    },
    ar: {
      title: "سياسة ملفات تعريف الارتباط",
      lastUpdated: "آخر تحديث: يناير 2026",
      intro: "توضح سياسة ملفات تعريف الارتباط هذه كيف تستخدم Watermelon Tours (\"نحن\" أو \"نا\") ملفات تعريف الارتباط والتقنيات المماثلة للتعرف عليك عند زيارة موقعنا الإلكتروني. وتشرح ماهية هذه التقنيات وسبب استخدامنا لها، بالإضافة إلى حقوقك في التحكم في استخدامنا لها.",
      whatAreCookies: {
        title: "ما هي ملفات تعريف الارتباط؟",
        text: "ملفات تعريف الارتباط هي ملفات بيانات صغيرة يتم وضعها على جهاز الكمبيوتر أو الجهاز المحمول الخاص بك عند زيارة موقع ويب. تُستخدم ملفات تعريف الارتباط على نطاق واسع من قبل أصحاب المواقع لكي تعمل مواقعهم، أو لتعمل بكفاءة أكبر، وكذلك لتوفير معلومات إعداد التقارير."
      },
      types: {
        title: "أنواع ملفات تعريف الارتباط التي نستخدمها",
        essential: {
          title: "ملفات تعريف الارتباط الأساسية",
          text: "تعد ملفات تعريف الارتباط هذه ضرورية للغاية لتزويدك بالخدمات المتاحة عبر موقعنا الإلكتروني واستخدام بعض ميزاته، مثل الوصول إلى المناطق الآمنة. نظرًا لأن ملفات تعريف الارتباط هذه ضرورية للغاية لتقديم الموقع إليك، فلا يمكنك رفضها دون التأثير على كيفية عمل موقعنا.",
          examples: [
            "ملفات تعريف ارتباط الجلسة (NextAuth.js) - لإبقائك مسجلاً للدخول",
            "ملفات تعريف ارتباط الأمان (Stripe) - لمعالجة الدفع الآمن",
            "رمز CSRF - لمنع هجمات تزوير الطلبات عبر المواقع"
          ]
        },
        analytics: {
          title: "ملفات تعريف الارتباط للتحليلات والتخصيص",
          text: "تقوم ملفات تعريف الارتباط هذه بجمع المعلومات التي يتم استخدامها إما في شكل مجمع لمساعدتنا في فهم كيفية استخدام موقعنا الإلكتروني أو مدى فعالية حملاتنا التسويقية، أو لمساعدتنا في تخصيص موقعنا الإلكتروني لك.",
          examples: [
            "Google Analytics (_ga, _gid) - لتتبع حركة المرور وسلوك المستخدم",
            "Vercel Analytics - لمراقبة أداء الموقع"
          ]
        },
        marketing: {
          title: "ملفات تعريف الارتباط الإعلانية",
          text: "تُستخدم ملفات تعريف الارتباط هذه لجعل الرسائل الإعلانية أكثر ملاءمة لك. وهي تؤدي وظائف مثل منع ظهور نفس الإعلان باستمرار، وضمان عرض الإعلانات بشكل صحيح للمعلنين، وفي بعض الحالات اختيار الإعلانات التي تستند إلى اهتماماتك."
        }
      },
      control: {
        title: "كيف يمكنك التحكم في ملفات تعريف الارتباط؟",
        text: "لديك الحق في تقرير ما إذا كنت ستقبل ملفات تعريف الارتباط أو ترفضها. يمكنك ممارسة حقوق ملفات تعريف الارتباط الخاصة بك عن طريق تعيين تفضيلاتك في مدير الموافقة على ملفات تعريف الارتباط. بالإضافة إلى ذلك، يمكنك تعيين أو تعديل عناصر تحكم متصفح الويب الخاص بك لقبول ملفات تعريف الارتباط أو رفضها."
      }
    }
  };

  // Fallback to English if locale not found
  const t = content[locale] || content.en;
  const isRtl = locale === 'he' || locale === 'ar';

  return (
    <MainLayout locale={locale} user={user}>
      <div className="container mx-auto px-4 py-16 text-black" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black mt-4">
            {t.title}
          </h1>
          <p className="text-sm text-black mb-8">
            {t.lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="mb-6">{t.intro}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.whatAreCookies.title}</h2>
            <p className="mb-6">{t.whatAreCookies.text}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.types.title}</h2>
            
            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.types.essential.title}</h3>
            <p className="mb-4">{t.types.essential.text}</p>
            <ul className="list-disc ps-5 mb-6">
              {t.types.essential.examples.map((item, index) => (
                <li key={index} className="mb-1">{item}</li>
              ))}
            </ul>

            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.types.analytics.title}</h3>
            <p className="mb-4">{t.types.analytics.text}</p>
            <ul className="list-disc ps-5 mb-6">
              {t.types.analytics.examples.map((item, index) => (
                <li key={index} className="mb-1">{item}</li>
              ))}
            </ul>

                        <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.types.marketing.title}</h3>
            <p className="mb-6">{t.types.marketing.text}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.control.title}</h2>
            <p className="mb-6">{t.control.text}</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

