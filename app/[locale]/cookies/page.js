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
      intro: "To make this website work properly, we sometimes place small data files called cookies on your device. This policy explains what cookies are, how we use them, and how you can manage them.",
      whatAreCookies: {
        title: "What are cookies?",
        text: "A cookie is a small text file that a website stores on your computer or mobile device when you visit the site.\n\nFirst-party cookies are cookies set by the website you are visiting. Only that website can read them. In addition, a website might potentially use external services, which also set their own cookies, known as third-party cookies.\n\nPersistent cookies are cookies saved on your computer and that are not deleted automatically when you quit your browser, unlike a session cookie, which is deleted when you quit your browser.\n\nEvery time you visit our website, you will be prompted to accept or refuse cookies.\n\nThe purpose is to enable the site to remember your preferences (such as user name, language, etc.) for a certain period of time.\n\nThat way, you do not have to re-enter them when browsing around the site during the same visit.\n\nCookies can also be used to establish anonymised statistics about the browsing experience on our sites."
      },
      howWeUse: {
        title: "How do we use cookies?",
        text: "We use first-party cookies (set and controlled by us) and third-party cookies (set by external organizations). The types of cookies we use are for:\n\n1. Storing visitor preferences\n2. Making our websites operational\n3. Gathering analytics data (about user behaviour)."
      },
      types: {
        title: "Types of cookies we use",
        preferences: {
          title: "1. Visitor preferences",
          text: "These are set by us and only we can read them. They remember if you have agreed to (or refused) this site’s cookie policy.",
          items: [
            { name: "cookie_consent", service: "Cookie Consent Kit", purpose: "Stores your cookie preferences (so you won't be asked again)", type: "First-party persistent cookie", duration: "Persistent" }
          ]
        },
        operational: {
          title: "2. Operational cookies",
          text: "There are some cookies that we have to include in order for certain web pages to function. For this reason, they do not require your consent. In particular, authentication cookies and technical cookies.",
          items: [
            { name: "next-auth.session-token", service: "Authentication (NextAuth.js)", purpose: "Maintains your logged-in session", type: "First-party session/persistent cookie", duration: "Session / 30 days" },
            { name: "next-auth.csrf-token", service: "Security", purpose: "Prevents Cross-Site Request Forgery (CSRF) attacks", type: "First-party session cookie", duration: "Session" },
            { name: "__stripe_mid", service: "Stripe (Payment)", purpose: "Fraud prevention and payment security", type: "Third-party persistent cookie", duration: "1 year" },
            { name: "__stripe_sid", service: "Stripe (Payment)", purpose: "Fraud prevention and payment security", type: "Third-party session cookie", duration: "30 minutes" }
          ]
        },
        analytics: {
          title: "3. Analytics cookies",
          text: "We use these purely for internal research on how we can improve the service we provide for all our users. The cookies simply assess how you interact with our website – as an anonymous user (the data gathered does not identify you personally).",
          items: [
            { name: "_ga", service: "Google Analytics", purpose: "Distinguishes users to analyze traffic", type: "First-party persistent cookie", duration: "2 years" },
            { name: "_gid", service: "Google Analytics", purpose: "Distinguishes users to analyze traffic", type: "First-party persistent cookie", duration: "24 hours" }
          ]
        }
      },
      thirdParty: {
        title: "Third-party cookies",
        text: "Some of our pages display content from external providers, e.g. Google Maps, Stripe, or Vercel. To view this third-party content, you first have to accept their specific terms and conditions. This includes their cookie policies, which we have no control over.\n\nProviders may, at any time, change their terms of service, purpose and use of cookies, etc."
      },
      manage: {
        title: "How can you manage cookies?",
        removing: {
          title: "Removing cookies from your device",
          text: "You can delete all cookies that are already on your device by clearing the browsing history of your browser. This will remove all cookies from all websites you have visited. Be aware though that you may also lose some saved information (e.g. saved login details, site preferences)."
        },
        siteSpecific: {
          title: "Managing site-specific cookies",
          text: "For more detailed control over site-specific cookies, check the privacy and cookie settings in your preferred browser."
        },
        blocking: {
          title: "Blocking cookies",
          text: "You can set most modern browsers to prevent any cookies being placed on your device, but you may then have to manually adjust some preferences every time you visit a site/page. And some services and functionalities may not work properly at all (e.g. logging in)."
        }
      }
    },
    ar: {
      title: "سياسة ملفات تعريف الارتباط",
      lastUpdated: "آخر تحديث: يناير 2026",
      intro: "لجعل هذا الموقع يعمل بشكل صحيح، نقوم أحيانًا بوضع ملفات بيانات صغيرة تسمى ملفات تعريف الارتباط على جهازك. تشرح هذه السياسة ما هي ملفات تعريف الارتباط، وكيف نستخدمها، وكيف يمكنك إدارتها.",
      whatAreCookies: {
        title: "ما هي ملفات تعريف الارتباط؟",
        text: "ملفات تعريف الارتباط هي ملفات نصية صغيرة يخزنها موقع الويب على جهاز الكمبيوتر أو الجهاز المحمول الخاص بك عند زيارة الموقع.\n\nملفات تعريف الارتباط الخاصة بالطرف الأول هي ملفات تعريف الارتباط التي يحددها موقع الويب الذي تزوره. يمكن لهذا الموقع فقط قراءتها. بالإضافة إلى ذلك، قد يستخدم موقع الويب خدمات خارجية، والتي تحدد أيضًا ملفات تعريف الارتباط الخاصة بها، والمعروفة باسم ملفات تعريف الارتباط الخاصة بأطراف ثالثة.\n\nملفات تعريف الارتباط الدائمة هي ملفات تعريف الارتباط المحفوظة على جهاز الكمبيوتر الخاص بك والتي لا يتم حذفها تلقائيًا عند الخروج من المتصفح، على عكس ملفات تعريف ارتباط الجلسة، التي يتم حذفها عند الخروج من المتصفح.\n\nفي كل مرة تزور فيها موقعنا، سيُطلب منك قبول أو رفض ملفات تعريف الارتباط.\n\nالغرض هو تمكين الموقع من تذكر تفضيلاتك (مثل اسم المستخدم واللغة وما إلى ذلك) لفترة معينة من الوقت.\n\nوبهذه الطريقة، لن تضطر إلى إعادة إدخالها عند تصفح الموقع خلال نفس الزيارة.\n\nيمكن أيضًا استخدام ملفات تعريف الارتباط لإنشاء إحصائيات مجهولة المصدر حول تجربة التصفح على مواقعنا."
      },
      howWeUse: {
        title: "كيف نستخدم ملفات تعريف الارتباط؟",
        text: "نحن نستخدم ملفات تعريف الارتباط الخاصة بالطرف الأول (التي نحددها ونتحكم فيها نحن) وملفات تعريف الارتباط الخاصة بالطرف الثالث (التي تحددها منظمات خارجية). أنواع ملفات تعريف الارتباط التي نستخدمها هي لـ:\n\n1. تخزين تفضيلات الزائر\n2. جعل مواقعنا الإلكترونية تعمل\n3. جمع بيانات التحليلات (حول سلوك المستخدم)."
      },
      types: {
        title: "أنواع ملفات تعريف الارتباط التي نستخدمها",
        preferences: {
          title: "1. تفضيلات الزائر",
          text: "يتم تعيين هذه من قبلنا ولا يمكن قراءتها إلا من قبلنا. وهي تتذكر ما إذا كنت قد وافقت على (أو رفضت) سياسة ملفات تعريف الارتباط الخاصة بهذا الموقع.",
          items: [
            { name: "cookie_consent", service: "أداة الموافقة على ملفات تعريف الارتباط", purpose: "تخزن تفضيلات ملفات تعريف الارتباط الخاصة بك (لذا لن يتم سؤالك مرة أخرى)", type: "ملف تعريف ارتباط دائم للطرف الأول", duration: "دائم" }
          ]
        },
        operational: {
          title: "2. ملفات تعريف الارتباط التشغيلية",
          text: "هناك بعض ملفات تعريف الارتباط التي يتعين علينا تضمينها لكي تعمل صفحات ويب معينة. ولهذا السبب، فهي لا تتطلب موافقتك. على وجه الخصوص، ملفات تعريف الارتباط الخاصة بالمصادقة والملفات التقنية.",
          items: [
            { name: "next-auth.session-token", service: "المصادقة (NextAuth.js)", purpose: "تحافظ على جلسة تسجيل الدخول الخاصة بك", type: "ملف تعريف ارتباط الجلسة/دائم للطرف الأول", duration: "جلسة / 30 يومًا" },
            { name: "next-auth.csrf-token", service: "الأمان", purpose: "تمنع هجمات تزوير الطلبات عبر المواقع (CSRF)", type: "ملف تعريف ارتباط الجلسة للطرف الأول", duration: "جلسة" },
            { name: "__stripe_mid", service: "Stripe (الدفع)", purpose: "منع الاحتيال وأمن الدفع", type: "ملف تعريف ارتباط دائم للطرف الثالث", duration: "سنة واحدة" },
            { name: "__stripe_sid", service: "Stripe (الدفع)", purpose: "منع الاحتيال وأمن الدفع", type: "ملف تعريف ارتباط الجلسة للطرف الثالث", duration: "30 دقيقة" }
          ]
        },
        analytics: {
          title: "3. ملفات تعريف الارتباط للتحليلات",
          text: "نحن نستخدم هذه فقط للبحث الداخلي حول كيفية تحسين الخدمة التي نقدمها لجميع مستخدمينا. تقوم ملفات تعريف الارتباط ببساطة بتقييم كيفية تفاعلك مع موقعنا الإلكتروني - كمستخدم مجهول (البيانات التي تم جمعها لا تحدد هويتك شخصيًا).",
          items: [
            { name: "_ga", service: "Google Analytics", purpose: "تميز المستخدمين لتحليل حركة المرور", type: "ملف تعريف ارتباط دائم للطرف الأول", duration: "سنتان" },
            { name: "_gid", service: "Google Analytics", purpose: "تميز المستخدمين لتحليل حركة المرور", type: "ملف تعريف ارتباط دائم للطرف الأول", duration: "24 ساعة" }
          ]
        }
      },
      thirdParty: {
        title: "ملفات تعريف الارتباط للطرف الثالث",
        text: "تعرض بعض صفحاتنا محتوى من مزودين خارجيين، مثل Google Maps أو Stripe أو Vercel. لعرض محتوى الطرف الثالث هذا، عليك أولاً قبول الشروط والأحكام الخاصة بهم. ويشمل ذلك سياسات ملفات تعريف الارتباط الخاصة بهم، والتي لا نتحكم فيها.\n\nقد يقوم مقدمو الخدمات، في أي وقت، بتغيير شروط الخدمة والغرض من استخدام ملفات تعريف الارتباط وما إلى ذلك."
      },
      manage: {
        title: "كيف يمكنك إدارة ملفات تعريف الارتباط؟",
        removing: {
          title: "إزالة ملفات تعريف الارتباط من جهازك",
          text: "يمكنك حذف جميع ملفات تعريف الارتباط الموجودة بالفعل على جهازك عن طريق مسح سجل التصفح في متصفحك. سيؤدي هذا إلى إزالة جميع ملفات تعريف الارتباط من جميع مواقع الويب التي قمت بزيارتها. كن على علم بأنه قد تفقد أيضًا بعض المعلومات المحفوظة (مثل تفاصيل تسجيل الدخول المحفوظة وتفضيلات الموقع)."
        },
        siteSpecific: {
          title: "إدارة ملفات تعريف الارتباط الخاصة بموقع معين",
          text: "لمزيد من التحكم التفصيلي في ملفات تعريف الارتباط الخاصة بموقع معين، تحقق من إعدادات الخصوصية وملفات تعريف الارتباط في متصفحك المفضل."
        },
        blocking: {
          title: "حظر ملفات تعريف الارتباط",
          text: "يمكنك ضبط معظم المتصفحات الحديثة لمنع وضع أي ملفات تعريف ارتباط على جهازك، ولكن قد تضطر بعد ذلك إلى ضبط بعض التفضيلات يدويًا في كل مرة تزور فيها موقعًا/صفحة. وقد لا تعمل بعض الخدمات والوظائف بشكل صحيح على الإطلاق (مثل تسجيل الدخول)."
        }
      }
    }
  };

  const t = content[locale] || content.en;
  const isRtl = locale === 'he' || locale === 'ar';

  return (
    <MainLayout locale={locale} user={user}>
      <div className="container mx-auto px-4 py-16 text-black" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-black mt-4">
            {t.title}
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            {t.lastUpdated}
          </p>

          <div className="prose prose-lg max-w-none text-black">
            <p className="mb-6 whitespace-pre-line">{t.intro}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.whatAreCookies.title}</h2>
            <p className="mb-6 whitespace-pre-line">{t.whatAreCookies.text}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.howWeUse.title}</h2>
            <p className="mb-6 whitespace-pre-line">{t.howWeUse.text}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.types.title}</h2>
            
            {/* Preferences */}
            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.types.preferences.title}</h3>
            <p className="mb-4">{t.types.preferences.text}</p>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الاسم' : 'Name'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الخدمة' : 'Service'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الغرض' : 'Purpose'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'النوع والمدة' : 'Type & Duration'}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.types.preferences.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-mono text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm">{item.service}</td>
                      <td className="px-4 py-2 text-sm">{item.purpose}</td>
                      <td className="px-4 py-2 text-sm">{item.type}<br/><span className="text-xs text-gray-500">{item.duration}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Operational */}
            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.types.operational.title}</h3>
            <p className="mb-4">{t.types.operational.text}</p>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الاسم' : 'Name'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الخدمة' : 'Service'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الغرض' : 'Purpose'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'النوع والمدة' : 'Type & Duration'}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.types.operational.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-mono text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm">{item.service}</td>
                      <td className="px-4 py-2 text-sm">{item.purpose}</td>
                      <td className="px-4 py-2 text-sm">{item.type}<br/><span className="text-xs text-gray-500">{item.duration}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Analytics */}
            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.types.analytics.title}</h3>
            <p className="mb-4">{t.types.analytics.text}</p>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الاسم' : 'Name'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الخدمة' : 'Service'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'الغرض' : 'Purpose'}</th>
                    <th className="px-4 py-2 text-start border-b">{isRtl ? 'النوع والمدة' : 'Type & Duration'}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.types.analytics.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-mono text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm">{item.service}</td>
                      <td className="px-4 py-2 text-sm">{item.purpose}</td>
                      <td className="px-4 py-2 text-sm">{item.type}<br/><span className="text-xs text-gray-500">{item.duration}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.thirdParty.title}</h2>
            <p className="mb-6 whitespace-pre-line">{t.thirdParty.text}</p>

            <h2 className="text-2xl font-bold mb-4 text-black mt-8">{t.manage.title}</h2>
            
            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.manage.removing.title}</h3>
            <p className="mb-4">{t.manage.removing.text}</p>

            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.manage.siteSpecific.title}</h3>
            <p className="mb-4">{t.manage.siteSpecific.text}</p>

            <h3 className="text-xl font-bold mb-2 text-black mt-6">{t.manage.blocking.title}</h3>
            <p className="mb-4">{t.manage.blocking.text}</p>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
