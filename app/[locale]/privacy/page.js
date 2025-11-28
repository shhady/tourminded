import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Privacy Policy | Watermelon Tours',
  description: 'Privacy Policy for Watermelon Tours - Connect with expert local guides for personalized tours in the Holy Land.',
};

export default async function PrivacyPage({ params }) {
  const localeParams = await params;
  const locale = localeParams?.locale || 'en';

  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  return (
    <MainLayout locale={locale} user={user}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-secondary-900 mt-4">
            Privacy Policy — Watermelon Tours OÜ
          </h1>
          <p className="text-sm text-secondary-600 mb-8">
            Last updated: 1st of December 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <p>
              Watermelon Tours OÜ (“Watermelon Tours”, “we”, “our”, or “us”) is committed to protecting your personal data and
              respecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when
              you use our website or book tours with us.
            </p>
            <p>
              We operate in accordance with the General Data Protection Regulation (GDPR) and applicable Estonian and EU data
              protection laws.
            </p>
            <p>
              By using our website or submitting personal information, you agree to the practices described in this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">1. Who We Are</h2>
            <p>Watermelon Tours OÜ</p>
            <p>Registry code: 17371746</p>
            <p>Registered address: Harju maakond, Tallinn, Kesklinna linnaosa, Tartu mnt 67/1-13b, 10115</p>
            <p>Website: https://www.watermelontours.com</p>
            <p>Email: info@watermelontours.com</p>
            <p>
              We act as the data controller for the information you provide. When guides receive your contact information to operate
              the tour, they act as data processors.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">2. What Personal Data We Collect</h2>
            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">2.1 Information You Provide Directly</h3>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number (if provided)</li>
              <li>Country of residence</li>
              <li>Passport details (if required for certain tours)</li>
              <li>Billing address (for payment confirmation)</li>
              <li>Any information shared in messages, inquiries, or booking forms</li>
            </ul>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">2.2 Booking &amp; Payment Information</h3>
            <ul>
              <li>Tour details you select</li>
              <li>Price and payment confirmation</li>
              <li>Payment method (processed securely by Stripe; we do not store card details)</li>
            </ul>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">2.3 Automatically Collected Data</h3>
            <ul>
              <li>IP address</li>
              <li>Browser and device information</li>
              <li>Cookies and tracking data</li>
              <li>General usage statistics</li>
            </ul>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">2.4 Guide Information (if you register as a guide)</h3>
            <ul>
              <li>Profile details</li>
              <li>Tour descriptions</li>
              <li>Languages spoken</li>
              <li>Payment/payout information</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li>Process and manage tour bookings</li>
              <li>Connect you with the guide operating your tour</li>
              <li>Send confirmations, receipts, and important updates</li>
              <li>Communicate itinerary changes or operational notifications</li>
              <li>Improve website performance and user experience</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal and accounting requirements</li>
              <li>Send marketing emails if you explicitly subscribe in the future</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">4. Legal Basis for Processing</h2>
            <p>We process your data under these GDPR legal bases:</p>
            <ul>
              <li>Contractual necessity: to operate and manage your booking</li>
              <li>Legitimate interest: improving services, ensuring safety, preventing misuse</li>
              <li>Legal obligation: tax, accounting, and compliance requirements</li>
              <li>Consent: for newsletters, cookies, and optional data you choose to provide</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">5. How We Share Your Data</h2>
            <p>We do not sell your data.</p>
            <p>We share it only when necessary:</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">5.1 With Your Guide</h3>
            <p>Your name, contact information, and booking details are shared with the guide responsible for your tour.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">5.2 With Service Providers</h3>
            <p>Such as:</p>
            <ul>
              <li>Stripe (payment processing)</li>
              <li>Hosting and email services</li>
              <li>Analytics and website performance tools</li>
            </ul>
            <p>All providers follow GDPR-compliant data protection standards.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">5.3 With Authorities</h3>
            <p>Only if legally required.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">6. Data Retention</h2>
            <p>We keep your personal data only as long as necessary:</p>
            <ul>
              <li>Booking and payment records: up to 5 years</li>
              <li>Emails and customer support messages: up to 2 years</li>
              <li>Marketing data: until you unsubscribe</li>
              <li>Guide profiles: while active on the platform</li>
            </ul>
            <p>After these periods, data is anonymized or securely deleted.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">7. Data Security</h2>
            <p>We take appropriate technical and organizational steps to protect your data, including:</p>
            <ul>
              <li>Encrypted website connections (SSL)</li>
              <li>Secure servers and restricted access</li>
              <li>Regular monitoring and maintenance</li>
            </ul>
            <p>While we aim to protect your information, no transmission method is completely secure.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">8. International Data Transfers</h2>
            <p>Data is primarily stored in the EU.</p>
            <p>
              If certain service providers process data outside the EU, this occurs only with GDPR-approved safeguards such as:
            </p>
            <ul>
              <li>Standard Contractual Clauses</li>
              <li>Adequacy decisions</li>
              <li>Other legally accepted mechanisms</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">9. Your Rights</h2>
            <p>You have the following rights under GDPR:</p>
            <ul>
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion (“right to be forgotten”)</li>
              <li>Restrict processing</li>
              <li>Object to processing</li>
              <li>Withdraw consent</li>
              <li>Request a copy of your data (data portability)</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at:
              <br />
              info@watermelontours.com
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">10. Cookies</h2>
            <p>Our website uses cookies to:</p>
            <ul>
              <li>Enable core site functionality</li>
              <li>Maintain sessions</li>
              <li>Analyze general website usage</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>
            <p>A separate Cookie Policy may be provided.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">11. Third-Party Links</h2>
            <p>Our website may include links to external websites.</p>
            <p>We are not responsible for their content or privacy practices.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">12. Children’s Privacy</h2>
            <p>We do not knowingly collect data from minors without parental consent.</p>
            <p>
              Parents or guardians booking tours for minors accept full responsibility for the information provided.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">13. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically.</p>
            <p>Changes take effect immediately upon posting on our website.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">14. Contact Us</h2>
            <p>For any privacy-related questions or requests, contact:</p>
            <p>Watermelon Tours OÜ</p>
            <p>Registry code: 17371746</p>
            <p>Address: Harju maakond, Tallinn, Kesklinna linnaosa, Tartu mnt 67/1-13b, 10115</p>
            <p>Email: info@watermelontours.com</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
