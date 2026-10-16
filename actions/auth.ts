"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "../lib/auth";
import { isValidPassword, PASSWORD_REQUIREMENTS } from "../lib/password-policy";

export type SignInState = {
  error: string | null;
};

export async function signUpAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (!isValidPassword(password)) {
    return { error: PASSWORD_REQUIREMENTS };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/signin?verified=1",
      },
    });
  } catch {
    return {
      error: "Unable to complete sign-up. Check your details and try again. If you already registered, use Verify email on the sign-in page to request a link.",
    };
  }

  redirect("/verify-email");
}

export async function signInAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
  } catch (error) {
    return {
      error: error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED"
        ? "Verify your email before signing in. Check your inbox or request another verification email."
        : "Unable to sign in. Check your email and password and try again.",
    };
  }

  redirect("/list");
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/list");
}
