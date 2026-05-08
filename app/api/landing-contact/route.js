import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

const TO = "Info@watermelontours.com";

const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const phone = (body.phone || "").toString().trim();
    const message = (body.message || "").toString().trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (name.length > 200 || email.length > 200 || phone.length > 50 || message.length > 5000) {
      return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
    }

    const subject = `New trip inquiry from ${name}`;
    const text = `New trip inquiry from the landing page.

Name: ${name}
Email: ${email}
Phone: ${phone || "-"}

Message:
${message}`;

    const html = `
      <h2 style="margin:0 0 12px 0;font-family:system-ui,sans-serif">New trip inquiry</h2>
      <p style="margin:0 0 8px 0;font-family:system-ui,sans-serif"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 8px 0;font-family:system-ui,sans-serif"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p style="margin:0 0 8px 0;font-family:system-ui,sans-serif"><strong>Phone:</strong> ${escapeHtml(phone || "-")}</p>
      <p style="margin:16px 0 8px 0;font-family:system-ui,sans-serif"><strong>Message:</strong></p>
      <p style="margin:0;font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(message)}</p>
    `;

    await sendEmail({ to: TO, subject, text, html });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("landing-contact error:", err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
