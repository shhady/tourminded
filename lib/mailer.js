import nodemailer from 'nodemailer';

let cachedTransporter = null;

function createTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('Email configuration is missing');
  }

  // Prefer Zoho when using a Zoho mailbox or our domain mailbox
  if (user.includes('@zoho.') || user.includes('watermelontours.com')) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zoho.eu',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // Zoho 587 with STARTTLS
      auth: { user, pass },
    });
    return cachedTransporter;
  }

  // Default to Gmail service (for non-Zoho mailboxes)
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  return cachedTransporter;
}

export async function sendAdminGuideRegistrationEmail({ guide, user, data }) {
  try {
    const transporter = createTransporter();

    const adminEmail = process.env.MY_EMAIL || process.env.EMAIL_USER;

    const englishName = Array.isArray(data?.names)
      ? (data.names.find((n) => n.language === 'English')?.value || data.nickname || user?.name || 'New Guide')
      : data?.nickname || user?.name || 'New Guide';

    const userEmail = user?.email || '';

    const languages = Array.isArray(data?.languages)
      ? data.languages
          .map((l) => (typeof l === 'string' ? l : l?.language))
          .filter(Boolean)
          .join(', ')
      : '';

    const expertiseAreas = Array.isArray(data?.expertise)
      ? data.expertise.map((e) => e?.area).filter(Boolean).join(', ')
      : '';

    const subject = `New guide registration: ${englishName}`;
    const text = `A new guide has registered.\n\nName: ${englishName}\nEmail: ${userEmail}\nPhone: ${data?.phone || ''}\n\nLicense issue date: ${data?.licenseIssueDate || ''}\nLanguages: ${languages}\nExpertise: ${expertiseAreas}\n\nGuide ID: ${guide?._id || ''}\nUser ID: ${user?._id || ''}`;

    const html = `
      <h2>New guide registration</h2>
      <p><strong>Name:</strong> ${englishName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Address:</strong> ${data?.address || ''}</p>
      <p><strong>Nickname:</strong> ${data?.nickname || ''}</p>
      <p><strong>Phone:</strong> ${data?.phone || ''}</p>
      <p><strong>License issue date:</strong> ${data?.licenseIssueDate || ''}</p>
      <p><strong>Languages:</strong> ${languages}</p>
      <p><strong>Expertise:</strong> ${expertiseAreas}</p>
      <p><strong>Guide ID:</strong> ${guide?._id || ''}</p>
      <p><strong>User ID:</strong> ${user?._id || ''}</p>
    `;

    await transporter.sendMail({
      from: { name: 'Watermelon Tours', address: process.env.EMAIL_USER },
      to: adminEmail,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error('Failed to send admin guide registration email:', err);
  }
}

export async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: { name: 'Watermelon Tours', address: process.env.EMAIL_USER },
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

export async function sendBookingNotifications({ baseUrl, booking, user, guideUser, tour }) {
  const guideDashboardUrl = `${baseUrl}/en/(dashboard)/dashboard/guide/bookings`.replace('/(dashboard)', '');
  const start = booking?.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '';
  const end = booking?.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '';
  const dateRange = end ? `${start} → ${end}` : start;

  // Email to guide
  if (guideUser?.email) {
    await sendEmail({
      to: guideUser.email,
      subject: `New booking request: ${tour?.title?.en || tour?.title?.ar || 'Tour'}`,
      text: `A new booking was created.\nTour: ${tour?.title?.en || tour?.title?.ar}\nDates: ${dateRange}\nTravelers: ${booking.travelers}\nNotes: ${booking.specialRequests || '-'}\nOpen dashboard: ${guideDashboardUrl}`,
      html: `
        <h3>New booking request</h3>
        <p><strong>Tour:</strong> ${tour?.title?.en || tour?.title?.ar || 'Tour'}</p>
        <p><strong>Dates:</strong> ${dateRange}</p>
        <p><strong>Travelers:</strong> ${booking.travelers}</p>
        <p><strong>Notes:</strong><br/>${(booking.specialRequests || '-').replace(/\n/g, '<br/>')}</p>
        <p><a href="${guideDashboardUrl}">Open guide dashboard</a></p>
      `,
    });
  }

  // Email to user
  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: 'We received your booking request',
      text: `Thank you for your booking.\nTour: ${tour?.title?.en || tour?.title?.ar}\nDates: ${dateRange}\nTravelers: ${booking.travelers}\nNotes: ${booking.specialRequests || '-'}\nWe will email you a revised price to approve.`,
      html: `
        <h3>We received your booking request</h3>
        <p>Thank you for booking with Watermelon Tours.</p>
        <p><strong>Tour:</strong> ${tour?.title?.en || tour?.title?.ar || 'Tour'}</p>
        <p><strong>Dates:</strong> ${dateRange}</p>
        <p><strong>Travelers:</strong> ${booking.travelers}</p>
        <p><strong>Notes:</strong><br/>${(booking.specialRequests || '-').replace(/\n/g, '<br/>')}</p>
        <p>You will receive another email with an updated price to approve.</p>
      `,
    });
  }
}

export async function sendPaymentEmails({ baseUrl, booking, user, guideUser, tour }) {
  const guideDashboardUrl = `${baseUrl}/en/(dashboard)/dashboard/guide/bookings`.replace('/(dashboard)', '');
  const start = booking?.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '';
  const end = booking?.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '';
  const dateRange = end ? `${start} → ${end}` : start;
  const total = Number(booking.totalPrice || 0).toFixed(2);

  if (guideUser?.email) {
    await sendEmail({
      to: guideUser.email,
      subject: `New paid booking: ${tour?.title?.en || tour?.title?.ar || 'Tour'}`,
      text: `A booking was paid.\nTour: ${tour?.title?.en || tour?.title?.ar}\nDates: ${dateRange}\nTravelers: ${booking.travelers}\nTotal: $${total}\nOpen dashboard: ${guideDashboardUrl}`,
      html: `
        <h3>New paid booking</h3>
        <p><strong>Tour:</strong> ${tour?.title?.en || tour?.title?.ar || 'Tour'}</p>
        <p><strong>Dates:</strong> ${dateRange}</p>
        <p><strong>Travelers:</strong> ${booking.travelers}</p>
        <p><strong>Total:</strong> $${total}</p>
        <p><a href="${guideDashboardUrl}">Open guide dashboard</a></p>
      `,
    });
  }

  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: 'Booking confirmed and payment received',
      text: `Thanks for your payment.\nTour: ${tour?.title?.en || tour?.title?.ar}\nDates: ${dateRange}\nTravelers: ${booking.travelers}\nTotal: $${total}`,
      html: `
        <h3>Booking confirmed</h3>
        <p>We received your payment. Here are your booking details:</p>
        <p><strong>Tour:</strong> ${tour?.title?.en || tour?.title?.ar || 'Tour'}</p>
        <p><strong>Dates:</strong> ${dateRange}</p>
        <p><strong>Travelers:</strong> ${booking.travelers}</p>
        <p><strong>Total:</strong> $${total}</p>
      `,
    });
  }
}

export async function sendGuideUpdatedBookingEmail({ baseUrl, booking, user, tour }) {
  if (!user?.email) return;
  const bookingUrl = `${baseUrl}/en/bookings/${booking?._id}`;
  const start = booking?.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '';
  const end = booking?.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '';
  const dateRange = end ? `${start} → ${end}` : start;

  const extras = Array.isArray(booking?.specialRequestsCheckBoxes) ? booking.specialRequestsCheckBoxes : [];
  const extrasHtml = extras.length
    ? `<ul>${extras.map(it => `<li>${(it.specialRequest || '').toString()} — $${Number(it.specialRequestPrice || 0).toFixed(2)} (${it.specialRequestPricePerGroupOrPerson || 'group'})</li>`).join('')}</ul>`
    : '<p>-</p>';

  await sendEmail({
    to: user.email,
    subject: 'Your booking was updated — please review and approve',
    text: `Your booking was updated by the guide.\nTour: ${tour?.title?.en || tour?.title?.ar}\nDates: ${dateRange}\nPlease review and approve here: ${bookingUrl}`,
    html: `
      <h3>Your booking was updated</h3>
      <p><strong>Tour:</strong> ${tour?.title?.en || tour?.title?.ar || 'Tour'}</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Updated items:</strong></p>
      ${extrasHtml}
      <p><a href="${bookingUrl}">Open your booking</a> to approve or request changes.</p>
    `,
  });
}

export async function sendGuideApprovedEmail({ baseUrl, booking }) {
  // Inform user to proceed to checkout
  const checkoutUrl = `${baseUrl}/en/checkout?bookingId=${booking?._id}`;
  const user = booking?.user;
  if (!user?.email) return;
  await sendEmail({
    to: user.email,
    subject: 'Your booking is approved — proceed to checkout',
    text: `Your booking has been approved by the guide. Please proceed to payment: ${checkoutUrl}`,
    html: `
      <h3>Your booking is approved</h3>
      <p>Please proceed to payment to confirm your booking.</p>
      <p><a href="${checkoutUrl}">Go to checkout</a></p>
    `,
  });
}

export async function sendUserUpdatedBookingEmail({ baseUrl, booking, guideUser, tour }) {
  if (!guideUser?.email) return;
  const guideDashboardUrl = `${baseUrl}/en/(dashboard)/dashboard/guide/bookings`.replace('/(dashboard)', '');
  const start = booking?.dates?.startDate ? new Date(booking.dates.startDate).toLocaleDateString() : '';
  const end = booking?.dates?.endDate ? new Date(booking.dates.endDate).toLocaleDateString() : '';
  const dateRange = end ? `${start} → ${end}` : start;

  const extras = Array.isArray(booking?.specialRequestsCheckBoxes) ? booking.specialRequestsCheckBoxes : [];
  const extrasHtml = extras.length
    ? `<ul>${extras.map(it => `<li>${(it.specialRequest || '').toString()} — $${Number(it.specialRequestPrice || 0).toFixed(2)} (${it.specialRequestPricePerGroupOrPerson || 'group'})</li>`).join('')}</ul>`
    : '<p>-</p>';

  await sendEmail({
    to: guideUser.email,
    subject: 'User updated booking — review and approve',
    text: `The user updated their booking.\nTour: ${tour?.title?.en || tour?.title?.ar}\nDates: ${dateRange}\nOpen your dashboard: ${guideDashboardUrl}`,
    html: `
      <h3>User updated booking</h3>
      <p><strong>Tour:</strong> ${tour?.title?.en || tour?.title?.ar || 'Tour'}</p>
      <p><strong>Dates:</strong> ${dateRange}</p>
      <p><strong>Selected items:</strong></p>
      ${extrasHtml}
      <p><a href="${guideDashboardUrl}">Open guide dashboard</a> to review and approve.</p>
    `,
  });
}

export async function sendChatMessageNotificationEmail({
  fromUser,
  toUser,
  chatId,
  message,
  baseUrl,
}) {
  if (!toUser?.email) return;

  const senderName =
    (fromUser?.firstName && fromUser?.lastName
      ? `${fromUser.firstName} ${fromUser.lastName}`
      : fromUser?.name) || 'Someone';

  const recipientName = toUser?.name || 'there';
  const chatUrlBase = baseUrl?.replace(/\/$/, '') || '';
  const chatUrl = `${chatUrlBase}/en/chat/${encodeURIComponent(String(chatId))}`;

  const subject = `New message from ${senderName} on Watermelon Tours`;
  const text = `Hi ${recipientName},

${senderName} sent you a new message on Watermelon Tours:

"${message}"

Open the conversation to reply:
${chatUrl}
`;
  const html = `<p>Hi ${recipientName},</p><p><strong>${senderName}</strong> sent you a new message on <strong>Watermelon Tours</strong>:</p><blockquote>${message}</blockquote><p><a href="${chatUrl}">Click here to view and reply in your chat</a>.</p>`;
  await sendEmail({ to: toUser.email, subject, text, html });
}


