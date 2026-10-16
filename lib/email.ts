import { createSmtpTransport } from "./smtp";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export async function sendAuthEmail(to: string, url: string, kind: "verify" | "reset") {
  if (typeof window !== "undefined") {
    throw new Error("Email sending is only available on the server.");
  }

  const from = process.env.SMTP_FROM_EMAIL;
  if (!from) {
    throw new Error("Set SMTP_FROM_EMAIL to enable auth emails.");
  }
  const transporter = createSmtpTransport();

  const title = kind === "verify" ? "Verify your email" : "Reset your password";
  const description = kind === "verify"
    ? "Confirm your email address to sign in to Q-Watcher."
    : "Use this link to choose a new Q-Watcher password.";
  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject: `${title} — Q-Watcher`,
      text: `${description}\n\n${url}\n\nThis link expires in one hour. If you did not request this email, you can ignore it.`,
      html: `<h1>${title}</h1><p>${description}</p><p><a href="${escapeHtml(url)}">${title}</a></p><p>This link expires in one hour. If you did not request this email, you can ignore it.</p>`,
    });
    if (!result.accepted?.length || result.rejected?.length) {
      throw new Error("Recipient rejected");
    }
  } catch (error: unknown) {
    const failure = error && typeof error === "object"
      ? error as { code?: unknown; command?: unknown; responseCode?: unknown }
      : {};
    const codes = [
      "EAUTH", "ECONNECTION", "ETIMEDOUT", "ESOCKET", "EDNS", "EENVELOPE",
      "EMESSAGE", "ESTREAM", "EPROTOCOL", "ETLS", "ECONNREFUSED", "ENOTFOUND",
      "ECONNRESET",
    ];
    const commands = [
      "CONN", "EHLO", "HELO", "STARTTLS", "AUTH PLAIN", "AUTH LOGIN",
      "AUTH XOAUTH2", "MAIL FROM", "RCPT TO", "DATA",
    ];
    // Allow only diagnostic categories; never log the error object or raw response.
    console.error("Authentication email SMTP failure", {
      code: typeof failure.code === "string" && codes.includes(failure.code)
        ? failure.code
        : "UNKNOWN",
      command: typeof failure.command === "string" && commands.includes(failure.command)
        ? failure.command
        : "UNKNOWN",
      responseCode: typeof failure.responseCode === "number"
        && Number.isInteger(failure.responseCode)
        && failure.responseCode >= 400 && failure.responseCode <= 599
        ? failure.responseCode
        : null,
    });
    throw new Error("Unable to send the authentication email through SMTP.");
  } finally {
    transporter.close();
  }
}
