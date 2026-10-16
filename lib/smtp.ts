import nodemailer from "nodemailer";

export function createSmtpTransport() {
  if (typeof window !== "undefined") {
    throw new Error("SMTP is only available on the server.");
  }
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT);
  const secureSetting = process.env.SMTP_SECURE;

  if (!host || !user || !pass) {
    throw new Error("Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD to enable auth emails.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }
  if (secureSetting !== "true" && secureSetting !== "false") {
    throw new Error("SMTP_SECURE must be true for SSL/TLS or false for STARTTLS.");
  }
  const secure = secureSetting === "true";
  if (port === 465 && !secure) {
    throw new Error("Port 465 requires SMTP_SECURE=true.");
  }
  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    dnsTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}
