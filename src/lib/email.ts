import nodemailer from "nodemailer";

// Build a transport from SMTP_* env vars. Returns null when not configured,
// so callers can degrade gracefully instead of crashing.
function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  // Gmail shows app passwords in spaced groups of 4 — strip whitespace.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // implicit TLS on 465; STARTTLS otherwise
    auth: { user, pass },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ sent: boolean }> {
  const transport = getTransport();
  const from =
    process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? "no-reply@store.com";

  if (!transport) {
    console.warn(
      `[email] SMTP not configured — skipped "${opts.subject}" to ${opts.to}`
    );
    return { sent: false };
  }

  await transport.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { sent: true };
}

// Welcome email for a customer who signed up themselves (no password).
export async function sendSignupWelcomeEmail(
  to: string,
  name: string
): Promise<{ sent: boolean }> {
  const subject = "Welcome to the Store";
  const text =
    `Hi ${name},\n\n` +
    `Thanks for creating an account at the Store. You can now sign in and start shopping.\n`;
  const html =
    `<p>Hi ${name},</p>` +
    `<p>Thanks for creating an account at <strong>the Store</strong>. ` +
    `You can now sign in and start shopping.</p>`;
  return sendMail({ to, subject, html, text });
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  password: string
): Promise<{ sent: boolean }> {
  const subject = "Welcome to the Store";
  const text =
    `Hi ${name},\n\n` +
    `An account has been created for you.\n\n` +
    `Login email: ${to}\n` +
    `Temporary password: ${password}\n\n` +
    `Please sign in and change your password and email from your account settings.\n`;
  const html =
    `<p>Hi ${name},</p>` +
    `<p>An account has been created for you at <strong>the Store</strong>.</p>` +
    `<p><strong>Login email:</strong> ${to}<br/>` +
    `<strong>Temporary password:</strong> <code>${password}</code></p>` +
    `<p>Please sign in and change your password and email from your account settings.</p>`;

  return sendMail({ to, subject, html, text });
}
