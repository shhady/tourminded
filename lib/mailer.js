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


