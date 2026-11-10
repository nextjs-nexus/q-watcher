import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import {
  DEMO_EMAIL_RESTRICTED_PATHS,
  DEMO_SESSION_RESTRICTED_PATHS,
  isDemoEmail,
} from "./demo";
import { isValidPassword, PASSWORD_MIN_LENGTH, PASSWORD_REQUIREMENTS } from "./password-policy";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";
import { MysqlDialect } from "kysely";
import { sendAuthEmail } from "./email";

const DEMO_ACCOUNT_RESTRICTED_MESSAGE = "The shared demo account cannot be changed.";

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
      // The demo account is shared, so visitors may use it but not change or take it over.
      if (DEMO_EMAIL_RESTRICTED_PATHS.includes(ctx.path) && isDemoEmail(ctx.body?.email)) {
        throw new APIError("FORBIDDEN", {
          code: "DEMO_ACCOUNT_RESTRICTED",
          message: DEMO_ACCOUNT_RESTRICTED_MESSAGE,
        });
      }

      if (DEMO_SESSION_RESTRICTED_PATHS.includes(ctx.path)) {
        const session = await getSessionFromCtx(ctx);
        if (session && isDemoEmail(session.user.email)) {
          throw new APIError("FORBIDDEN", {
            code: "DEMO_ACCOUNT_RESTRICTED",
            message: DEMO_ACCOUNT_RESTRICTED_MESSAGE,
          });
        }
      }

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
