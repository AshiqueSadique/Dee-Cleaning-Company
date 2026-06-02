import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const FROM = 'Dee Cleaning Co. <onboarding@resend.dev>';

export async function sendConfirmationEmails(booking: {
  name: string;
  email: string;
  service: string;
  size: string;
  area: string;
  date: string;
  slot: string;
  finalPrice: string;
  bookingRef: string;
  assignedCleaners: string[];
  staffEmails: string[];
}): Promise<void> {
  const slotTime =
    booking.slot === 'Morning' ? '9 AM – 12 PM' :
    booking.slot === 'Afternoon' ? '1 PM – 4 PM' :
    '5 PM – 8 PM';
  const cleanerNames = booking.assignedCleaners.join(', ');

  const clientHtml = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; background: #f6f1e7; padding: 40px;">
      <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #b85c3c; margin-bottom: 32px;">DEE CLEANING CO.</p>
      <h1 style="font-size: 28px; font-weight: normal; margin-bottom: 8px;">Your booking is confirmed ✓</h1>
      <p style="color: #6a5e52; margin-bottom: 32px;">Hi ${booking.name}, we're all set. Here are your details:</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
        ${[
          ['Service', booking.service],
          ['Size', booking.size],
          ['Area', booking.area],
          ['Date', booking.date],
          ['Time', `${booking.slot} (${slotTime})`],
          ['Cleaner', cleanerNames || 'To be assigned'],
          ['Price', booking.finalPrice ? `฿${booking.finalPrice}` : 'To be confirmed'],
          ['Booking Ref', booking.bookingRef],
        ].map(([label, value]) => `
          <tr style="border-top: 1px solid #c9bea6;">
            <td style="padding: 10px 0; font-family: Helvetica, sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #b85c3c; width: 40%;">${label}</td>
            <td style="padding: 10px 0; font-size: 15px;">${value}</td>
          </tr>
        `).join('')}
      </table>
      <p style="color: #6a5e52; font-size: 14px; line-height: 1.7;">Your cleaner will message you the morning of your appointment with their ETA.<br/>Payment by PromptPay after the clean.</p>
      <p style="color: #6a5e52; font-size: 14px; margin-top: 24px;">Questions? Reply to this email or message us on LINE.</p>
      <p style="font-style: italic; color: #b85c3c; margin-top: 40px;">Dee Cleaning Co. 🌸</p>
    </div>
  `;

  const staffHtml = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; background: #f6f1e7; padding: 40px;">
      <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #b85c3c; margin-bottom: 32px;">DEE CLEANING CO. · STAFF ASSIGNMENT</p>
      <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 8px;">New booking assigned to you</h1>
      <p style="color: #6a5e52; margin-bottom: 32px;">You have been assigned to the following booking:</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
        ${[
          ['Client', booking.name],
          ['Service', booking.service],
          ['Size', booking.size],
          ['Area', booking.area],
          ['Date', booking.date],
          ['Time', `${booking.slot} (${slotTime})`],
          ['Price', booking.finalPrice ? `฿${booking.finalPrice}` : 'TBC'],
          ['Booking Ref', booking.bookingRef],
        ].map(([label, value]) => `
          <tr style="border-top: 1px solid #c9bea6;">
            <td style="padding: 10px 0; font-family: Helvetica, sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #b85c3c; width: 40%;">${label}</td>
            <td style="padding: 10px 0; font-size: 15px;">${value}</td>
          </tr>
        `).join('')}
      </table>
      <p style="color: #6a5e52; font-size: 14px;">Please message the client on LINE the morning of the appointment with your ETA.</p>
    </div>
  `;

  const promises: Promise<any>[] = [];

  if (booking.email) {
    promises.push(resend.emails.send({
      from: FROM,
      to: booking.email,
      subject: `Booking confirmed ✓ — ${booking.date} · ${booking.slot} (Ref: ${booking.bookingRef})`,
      html: clientHtml,
    }));
  }

  for (const staffEmail of booking.staffEmails) {
    if (staffEmail) {
      promises.push(resend.emails.send({
        from: FROM,
        to: staffEmail,
        subject: `Assignment: ${booking.name} — ${booking.date} · ${booking.slot} (Ref: ${booking.bookingRef})`,
        html: staffHtml,
      }));
    }
  }

  await Promise.allSettled(promises);
}
