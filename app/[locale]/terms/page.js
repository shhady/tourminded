import MainLayout from '@/components/layout/MainLayout';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Terms of Service | Watermelon Tours',
  description: 'Terms of Service for Watermelon Tours - Connect with expert local guides for personalized tours in the Holy Land.',
};

export default async function TermsPage({ params }) {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-secondary-900">
            Watermelon Tours OÜ — Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p>
              These terms apply to any tour, activity, or service booked through Watermelon Tours OÜ (“Watermelon Tours,” "we,"
              "our," or "us"), whether directly through our website, through a partner platform, or when Watermelon Tours acts as
              an agent for an independent guide or tour operator.
            </p>
            <p>
              By making a reservation, all persons or organizations agree to the following terms:
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">1. Definitions</h2>
            <p>The person(s) making a reservation are referred to as the “client(s).”</p>
            <p>These Terms &amp; Conditions are referred to as the “terms.”</p>
            <p>By submitting a booking request or payment, the client agrees to be bound by these terms.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">2. Registration &amp; Acceptance of Terms</h2>
            <p>All clients booking a tour must complete the online reservation form and check the box accepting these terms.</p>
            <p>For minors, a parent or legal guardian must complete the booking form on their behalf.</p>
            <p>No guide, representative, or third party has the authority to alter these terms.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">3. Governing Law</h2>
            <p>These terms are governed by the laws of Estonia, where Watermelon Tours OÜ is registered.</p>
            <p>All disputes shall be resolved exclusively in Estonian courts.</p>
            <p>
              If any part of these terms is found unenforceable, it will be replaced by a valid clause that best reflects the
              original intent.
            </p>
            <p>A printed or electronic version of this document is admissible in legal proceedings.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">Payment &amp; Reservations</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">4. Payments for Tours</h3>
            <p>All prices are displayed in US dollars (USD) unless stated otherwise.</p>
            <p>
              When a client submits a booking request, the guide must confirm availability and pricing before the booking is
              finalized.
            </p>
            <p>Payment is made securely through our website using Stripe (credit card, Apple Pay, Google Pay).</p>
            <p>Bookings are considered confirmed only after full payment is completed.</p>
            <p>
              If additional services (homestay, meals, transportation, etc.) are requested, the guide will provide a price quote
              which must be accepted before payment.
            </p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">5. Private Tours</h3>
            <p>All tours offered through Watermelon Tours are private unless stated otherwise.</p>
            <p>Customized itineraries or special additions may require updated pricing.</p>
            <p>Quotes for modified private tours are confirmed by email or through the platform.</p>
            <p>
              After accepting a quote, a deposit may be requested. Deposits must be paid before the reservation is confirmed unless
              otherwise agreed by Watermelon Tours.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">Cancellation &amp; Refund Policies</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">6. Cancellation by Client</h3>
            <p>
              All cancellations must be submitted in writing via email. The date on which Watermelon Tours receives the email
              determines the cancellation charges.
            </p>
            <p>Refunds may take up to 30 days from the date of written cancellation.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">6.1 Public / Standard Private Day Tours</h3>
            <p>A 50% refund is given if cancellation is made more than 14 days before the tour.</p>
            <p>No refund is given if cancellation is made less than 14 days before the tour.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">6.2 Customized Private Day Tours</h3>
            <p>A 50% refund is given if cancellation is made more than 30 days before the tour.</p>
            <p>No refund is given if cancellation is made less than 30 days before the tour.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">6.3 Private Multi-Day Tours</h3>
            <p>An 80% refund is given if cancellation is made more than 90 days before the tour.</p>
            <p>A 50% refund is given if cancellation is made 30–90 days before the tour.</p>
            <p>No refund is given if cancellation is made less than 30 days before the tour.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">6.4 Date Changes</h3>
            <p>Clients may change the date without additional fee if the change is made more than 14 days before the tour.</p>
            <p>
              Date changes made within 14 days may incur an additional fee at the discretion of Watermelon Tours.
            </p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">7. Cancellation by Watermelon Tours</h3>
            <p>Watermelon Tours reserves the right to cancel any tour at any time for any reason.</p>
            <p>
              If a tour is canceled in advance, the client may choose a full refund or transfer payment to another available tour.
            </p>
            <p>
              If a tour is canceled due to factors outside our control (such as weather, local closures, delays, flight issues, or
              political disruptions), Watermelon Tours will calculate expenses incurred up to that point and issue a pro-rated
              refund at our discretion.
            </p>
            <p>If a client is removed from a tour due to inappropriate behavior, no refund will be issued.</p>
            <p>No further liability beyond any applicable refund will arise.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">Travel Requirements</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">8. Travel Documents</h3>
            <p>Clients must have a valid passport, required visas, and necessary travel or health insurance.</p>
            <p>Watermelon Tours provides general information in good faith but is not responsible for outdated or incorrect visa advice.</p>
            <p>
              If a client is refused entry at any checkpoint or border due to documentation issues, Watermelon Tours is not liable
              for related costs.
            </p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">9. Visa &amp; Entry Assistance</h3>
            <p>Visa and entry rules depend on nationality and may change without notice.</p>
            <p>
              Our guides have years of experience assisting travelers with border questions, entry procedures, and checkpoint
              expectations.
            </p>
            <p>Clients may always message their guide or our team for help before arrival.</p>
            <p>Final entry decisions rest solely with border authorities.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">During the Tour</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">10. Authority on Tours</h3>
            <p>Clients agree to follow the instructions of the guide and relevant local authorities during the tour.</p>
            <p>Decisions regarding timing, safety, and itinerary changes are final and made for the well-being of the group.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">11. Suitability &amp; Conduct</h3>
            <p>Watermelon Tours may remove a client from a tour if they:</p>
            <ul>
              <li>– Violate local laws</li>
              <li>– Endanger themselves or others</li>
              <li>– Harass or disrupt the guide or other clients</li>
              <li>– Ignore safety instructions</li>
            </ul>
            <p>In such cases, no refund will be issued and the client bears all additional costs.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">12. Unused Services</h3>
            <p>If a client fails to join a tour, arrives late, or leaves early, no refunds will be provided.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">General Travel Disclaimer</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">13. General Travel Disclaimer</h3>
            <p>
              Watermelon Tours and its guides follow local regulations and make reasonable efforts to provide a safe and enjoyable
              experience.
            </p>
            <p>
              Conditions such as traffic, weather, or site closures may affect itineraries, and adjustments may be necessary.
            </p>
            <p>Clients are responsible for following guide instructions and preparing appropriately for the tour.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">Liability</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">14. Limitation of Liability</h3>
            <p>While Watermelon Tours takes reasonable precautions, we are not responsible for:</p>
            <ul>
              <li>– Injury or illness</li>
              <li>– Loss or damage to personal property</li>
              <li>– Delays or interruptions to transportation</li>
              <li>– Third-party service providers</li>
              <li>– Changes due to local conditions</li>
            </ul>
            <p>
              Clients agree to indemnify Watermelon Tours, its employees, guides, and partners from claims arising from
              participation in any tour.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">Price Changes</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">15. Price Adjustments</h3>
            <p>Watermelon Tours may adjust prices due to changes in fuel costs, supplier pricing, or exchange rate fluctuations.</p>
            <p>Quotes for private tours are guaranteed only for the specific tour and dates quoted.</p>

            <h2 className="text-2xl font-bold mb-4 text-secondary-900 mt-4">General</h2>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">16. Client Agreement</h3>
            <p>By booking a tour, the client confirms they have read, understood, and accepted these terms.</p>
            <p>Clients confirm they are of legal age or have guardian approval for minors.</p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">17. Entire Agreement</h3>
            <p>These terms constitute the entire agreement between the client and Watermelon Tours and supersede all prior communications.</p>
            <p>
              Personal information is shared only when necessary to operate the tour, such as providing your contact details to your
              guide.
            </p>

            <h3 className="text-xl font-bold mb-4 text-secondary-900 mt-4">18. Copyright</h3>
            <p>All content on the Watermelon Tours website is protected by copyright and may not be reproduced without permission.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
