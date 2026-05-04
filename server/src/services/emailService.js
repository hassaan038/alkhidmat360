import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass },
  });

  return transporter;
}

const RECORD_LABELS = {
  qurbaniDonation: 'Qurbani Donation',
  rationDonation: 'Ration Donation',
  skinCollection: 'Skin Collection',
  orphanSponsorship: 'Orphan Sponsorship',
  loanApplication: 'Loan Application',
  ramadanRationApplication: 'Ramadan Ration Application',
  orphanRegistration: 'Orphan Registration',
  volunteerTask: 'Volunteer Task',
  fitrana: 'Fitrana Payment',
  zakatPayment: 'Zakat Payment',
  zakatApplication: 'Zakat Application',
  sadqa: 'Sadqa Donation',
  disasterDonation: 'Disaster Relief Donation',
  qurbaniBooking: 'Qurbani Hissa Booking',
  qurbaniSkinPickup: 'Qurbani Skin Pickup',
};

const POSITIVE_STATUSES = new Set([
  'confirmed',
  'approved',
  'completed',
  'scheduled',
  'collected',
]);
const NEGATIVE_STATUSES = new Set(['rejected']);

function buildEmail({ fullName, recordLabel, status }) {
  const isPositive = POSITIVE_STATUSES.has(status);
  const isNegative = NEGATIVE_STATUSES.has(status);
  const accent = isPositive ? '#16a34a' : isNegative ? '#dc2626' : '#2563eb';
  const headline = isPositive
    ? `Your ${recordLabel} has been ${status}`
    : isNegative
      ? `Your ${recordLabel} was rejected`
      : `Update on your ${recordLabel}`;

  const body = isPositive
    ? `Good news! Your ${recordLabel.toLowerCase()} has been <strong>${status}</strong> by our team. Thank you for supporting Alkhidmat 360.`
    : isNegative
      ? `Unfortunately, your ${recordLabel.toLowerCase()} could not be approved at this time. If you believe this is a mistake or need clarification, please reply to this email or contact our support team.`
      : `The status of your ${recordLabel.toLowerCase()} has been updated to <strong>${status}</strong>.`;

  const subject = `Alkhidmat 360 — ${headline}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <div style="border-top: 4px solid ${accent}; padding-top: 16px;">
        <h2 style="margin: 0 0 8px 0; color: ${accent};">${headline}</h2>
        <p style="margin: 0 0 16px 0;">Dear ${fullName || 'Donor'},</p>
        <p style="margin: 0 0 16px 0; line-height: 1.6;">${body}</p>
        <p style="margin: 24px 0 4px 0;">Regards,</p>
        <p style="margin: 0; font-weight: bold;">Alkhidmat 360 Team</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="font-size: 12px; color: #6b7280; margin: 0;">
        This is an automated notification. Please do not reply to this email if no action is needed.
      </p>
    </div>
  `;

  const text = `${headline}\n\nDear ${fullName || 'Donor'},\n\n${body.replace(/<[^>]+>/g, '')}\n\nRegards,\nAlkhidmat 360 Team`;

  return { subject, html, text };
}

/**
 * Send a status-update email. Never throws — failures are logged.
 *
 * @param {Object} input
 * @param {string} input.to          - recipient email
 * @param {string} input.fullName    - recipient name (for greeting)
 * @param {string} input.recordType  - key from RECORD_LABELS
 * @param {string} input.status      - new status string
 */
export async function sendStatusEmail({ to, fullName, recordType, status }) {
  try {
    if (!to) return;

    const tx = getTransporter();
    if (!tx) {
      console.warn('[email] SMTP not configured — skipping email to', to);
      return;
    }

    const recordLabel = RECORD_LABELS[recordType] || 'Request';
    const { subject, html, text } = buildEmail({ fullName, recordLabel, status });
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const info = await tx.sendMail({ from, to, subject, html, text });
    console.log('[email] sent to', to, '— messageId:', info.messageId);
  } catch (err) {
    console.error('[email] send failed:', err.message);
  }
}

export default { sendStatusEmail };
