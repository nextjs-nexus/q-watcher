import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import nodemailer, { type SendMailOptions } from 'nodemailer';
import { sendAuthEmail } from '../lib/email';
import { createSmtpTransport } from '../lib/smtp';

test('SMTP auth emails enforce TLS, escape links, and report delivery failures safely', async () => {
  const keys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM_EMAIL'];
  const original = keys.map(key => process.env[key]);
  try {
    Object.assign(process.env, {
      SMTP_HOST: 'smtp.example.com', SMTP_PORT: '465', SMTP_SECURE: 'true',
      SMTP_USER: 'test@example.com', SMTP_PASSWORD: 'test-password',
      SMTP_FROM_EMAIL: 'Q-Watcher <test@example.com>',
    });
    delete process.env.SMTP_PASSWORD;
    assert.throws(createSmtpTransport, /SMTP_PASSWORD/);
    process.env.SMTP_PASSWORD = 'test-password';
    process.env.SMTP_PORT = 'invalid';
    assert.throws(createSmtpTransport, /SMTP_PORT/);
    process.env.SMTP_PORT = '465';
    process.env.SMTP_SECURE = 'false';
    assert.throws(createSmtpTransport, /requires SMTP_SECURE=true/);
    process.env.SMTP_SECURE = 'true';

    const transport = nodemailer.createTransport({ streamTransport: true, buffer: true });
    const create = mock.method(nodemailer, 'createTransport', () => transport);
    const send = mock.method(transport, 'sendMail', async (): Promise<{ accepted: string[]; rejected: string[] }> => ({ accepted: ['test@example.com'], rejected: [] }));
    const close = mock.method(transport, 'close', () => {});
    const log = mock.method(console, 'error', () => {});
    const url = 'https://example.com/verify?token=test&callbackURL="example"';
    await sendAuthEmail('test@example.com', url, 'verify');
    const options = create.mock.calls[0].arguments[0] as { secure: boolean; tls: { rejectUnauthorized: boolean } };
    assert.equal(options.secure, true);
    assert.equal(options.tls.rejectUnauthorized, true);
    const mail = send.mock.calls[0].arguments[0] as SendMailOptions;
    assert.match(String(mail.html), /&amp;callbackURL=&quot;example&quot;/);
    assert.ok(String(mail.text).includes(url));
    assert.equal(close.mock.callCount(), 1);
    await sendAuthEmail('test@example.com', url, 'reset');
    assert.match(String((send.mock.calls[1].arguments[0] as SendMailOptions).subject), /Reset your password/);
    send.mock.mockImplementation(async () => {
      throw Object.assign(new Error('private credentials and server response'), {
        code: 'EAUTH', command: 'AUTH PLAIN', responseCode: 535,
        response: 'private SMTP response with credentials',
      });
    });
    await assert.rejects(sendAuthEmail('test@example.com', url, 'reset'), { message: 'Unable to send the authentication email through SMTP.' });
    assert.deepEqual(log.mock.calls.at(-1)?.arguments, [
      'Authentication email SMTP failure',
      { code: 'EAUTH', command: 'AUTH PLAIN', responseCode: 535 },
    ]);
    send.mock.mockImplementation(async () => {
      throw { code: 'private-password', command: 'AUTH private-password', responseCode: 'private-password' };
    });
    await assert.rejects(sendAuthEmail('test@example.com', url, 'reset'), /Unable to send/);
    assert.deepEqual(log.mock.calls.at(-1)?.arguments, [
      'Authentication email SMTP failure',
      { code: 'UNKNOWN', command: 'UNKNOWN', responseCode: null },
    ]);
    send.mock.mockImplementation(async () => ({ accepted: [], rejected: ['test@example.com'] }));
    await assert.rejects(sendAuthEmail('test@example.com', url, 'verify'), /Unable to send/);
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    createSmtpTransport();
    const starttls = create.mock.calls.at(-1)!.arguments[0] as { requireTLS: boolean };
    assert.equal(starttls.requireTLS, true);
  } finally {
    mock.restoreAll();
    keys.forEach((key, index) => {
      if (original[index] === undefined) delete process.env[key];
      else process.env[key] = original[index];
    });
  }
});
