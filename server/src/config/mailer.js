import nodemailer from 'nodemailer';

export const isSmtpConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

export const createTransporter = () => {
  if (isSmtpConfigured()) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

export const sendInvitationEmail = async ({ to, tripTitle, inviterName, role, inviteUrl }) => {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #F8F7F2; border-radius: 12px; color: #252525;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #234638; margin: 0; font-size: 28px;">TripMate</h1>
        <p style="color: #69947f; font-size: 14px; margin-top: 4px;">Collaborative Travel Itinerary Planner</p>
      </div>
      <div style="background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #E7D8C5; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <h2 style="color: #234638; font-size: 20px; margin-top: 0;">You're invited to collaborate!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          <strong>${inviterName || 'A fellow traveler'}</strong> has invited you to join their trip <strong>"${tripTitle}"</strong> as an <strong>${role}</strong>.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${inviteUrl}" style="background-color: #234638; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 13px; color: #666666; line-height: 1.5;">
          This invitation link will expire in 7 days. If you do not have a TripMate account yet, you will be prompted to register using this email (${to}).
        </p>
        <p style="font-size: 12px; color: #888888; word-break: break-all; margin-top: 20px;">
          Direct link: <a href="${inviteUrl}" style="color: #234638;">${inviteUrl}</a>
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888888;">
        &copy; ${new Date().getFullYear()} TripMate. Plan trips together effortlessly.
      </div>
    </div>
  `;

  if (transporter) {
    return await transporter.sendMail({
      from: `"TripMate" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `Trip Invitation: ${tripTitle}`,
      html,
    });
  } else {
    // Development fallback
    console.log(`\n========================================`);
    console.log(`[SMTP Not Configured - Development Mode]`);
    console.log(`To: ${to}`);
    console.log(`Subject: Trip Invitation: ${tripTitle}`);
    console.log(`Role: ${role}`);
    console.log(`Invite URL: ${inviteUrl}`);
    console.log(`========================================\n`);
    return {
      messageId: `dev-mock-${Date.now()}`,
      mock: true,
      inviteUrl,
    };
  }
};
