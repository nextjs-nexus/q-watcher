import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { isValidPassword, PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS } from "./password-policy";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";
import { MysqlDialect } from "kysely";
import { sendAuthEmail } from "./email";

export const auth = betterAuth({
  database: {
    dialect: new MysqlDialect({ pool }),
    type: "mysql",
    transaction: true,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail(user.email, url, "reset");
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail(user.email, url, "verify");
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const passwordField = ctx.path === "/sign-up/email"
        ? "password"
        : ["/reset-password", "/change-password", "/set-password"].includes(ctx.path)
          ? "newPassword"
          : null;

      if (passwordField && !isValidPassword(ctx.body?.[passwordField])) {
        throw new APIError("BAD_REQUEST", {
          code: "INVALID_PASSWORD",
          message: PASSWORD_REQUIREMENTS,
        });
      }
    }),
  },
  plugins: [nextCookies()],
});
