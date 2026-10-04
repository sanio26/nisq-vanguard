import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type AppRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CONSULTANT"
  | "ANALYST"
  | "SALES"
  | "INSTRUCTOR"
  | "CLIENT"
  | "STUDENT";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  designation: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  user: User;
  session: Session;
  profile: UserProfile | null;
  roles: AppRole[];
}

/* ============================================================
   AUTH REDIRECT URLS
   ============================================================ */

function getAppUrl(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path}`;
}

/* ============================================================
   AUTH ERROR HANDLING
   ============================================================ */

function getAuthErrorMessage(
  error: {
    message?: string;
    status?: number;
    code?: string;
  } | null,
  fallback: string
): string {
  const message = error?.message?.trim() ?? "";
  const normalizedMessage = message.toLowerCase();

  console.error("Supabase Auth error:", {
    message: error?.message,
    status: error?.status,
    code: error?.code,
  });

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("rate_limit") ||
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("email rate limit")
  ) {
    return "Supabase's email service is temporarily rate-limited. Please wait before trying again.";
  }

  if (
    normalizedMessage.includes("redirect") ||
    normalizedMessage.includes("redirect url") ||
    normalizedMessage.includes("not allowed")
  ) {
    return "The authentication redirect URL is not allowed by Supabase. Please check Authentication → URL Configuration.";
  }

  if (
    normalizedMessage.includes("invalid login") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "Unable to sign in. Please check your email and password.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Please confirm your email address before signing in.";
  }

  if (
    normalizedMessage.includes("user already registered") ||
    normalizedMessage.includes("already registered")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (
    normalizedMessage.includes("signup") &&
    normalizedMessage.includes("disabled")
  ) {
    return "New account registration is currently disabled in Supabase.";
  }

  if (
    normalizedMessage.includes("password") &&
    normalizedMessage.includes("weak")
  ) {
    return "Please choose a stronger password.";
  }

  if (message) {
    return message;
  }

  return fallback;
}

/* ============================================================
   SIGN UP
   ============================================================ */

export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = fullName.trim();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  if (!normalizedName) {
    throw new Error("Full name is required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const redirectTo = getAppUrl("/login?confirmed=1");

  console.info("Creating Supabase account:", {
    email: normalizedEmail,
    redirectTo,
  });

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: normalizedName,
      },
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw new Error(
      getAuthErrorMessage(
        error,
        "Unable to create your account. Please try again."
      )
    );
  }

  if (!data.user) {
    throw new Error(
      "Supabase did not return a user account. Please try again."
    );
  }

  console.info("Supabase signup result:", {
    userId: data.user.id,
    email: data.user.email,
    emailConfirmedAt: data.user.email_confirmed_at,
    hasSession: Boolean(data.session),
  });

  return data;
}

/* ============================================================
   SIGN IN
   ============================================================ */

export async function signIn(
  email: string,
  password: string
) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required.");
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (error) {
    throw new Error(
      getAuthErrorMessage(
        error,
        "Unable to sign in. Please check your email and password."
      )
    );
  }

  if (!data.session || !data.user) {
    throw new Error(
      "Supabase did not create an authenticated session."
    );
  }

  console.info("Supabase login successful:", {
    userId: data.user.id,
    email: data.user.email,
  });

  return data;
}

/* ============================================================
   SIGN OUT
   ============================================================ */

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase sign-out error:", error);

    throw new Error("Unable to sign out. Please try again.");
  }
}

/* ============================================================
   SESSION
   ============================================================ */

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase session error:", error);

    throw new Error("Unable to retrieve your session.");
  }

  return session;
}

/* ============================================================
   CURRENT USER
   ============================================================ */

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

/* ============================================================
   CURRENT PROFILE
   ============================================================ */

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, organization, designation, avatar_url, bio, is_active, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Supabase profile error:", error);

    throw new Error("Unable to load your profile.");
  }

  return data;
}

/* ============================================================
   CURRENT ROLES
   ============================================================ */

export async function getCurrentRoles(): Promise<AppRole[]> {
  const user = await getCurrentUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) {
    console.error("Supabase roles error:", error);

    throw new Error(
      "Unable to load your account permissions."
    );
  }

  return (data ?? []).map(
    (item) => item.role as AppRole
  );
}

/* ============================================================
   CURRENT AUTH USER
   ============================================================ */

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const [profile, roles] = await Promise.all([
    getCurrentProfile(),
    getCurrentRoles(),
  ]);

  return {
    user: session.user,
    session,
    profile,
    roles,
  };
}

/* ============================================================
   ROLE HELPERS
   ============================================================ */

export function hasRole(
  roles: AppRole[],
  role: AppRole
): boolean {
  return roles.includes(role);
}

export function hasAnyRole(
  roles: AppRole[],
  allowedRoles: AppRole[]
): boolean {
  return allowedRoles.some((role) =>
    roles.includes(role)
  );
}

export function isAdminRole(
  roles: AppRole[]
): boolean {
  return hasAnyRole(roles, [
    "ADMIN",
    "SUPER_ADMIN",
  ]);
}

/* ============================================================
   PASSWORD RESET
   ============================================================ */

export async function resetPassword(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  const redirectTo = getAppUrl("/reset-password");

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo,
      }
    );

  if (error) {
    console.error(
      "Supabase password reset error:",
      error
    );

    throw new Error(
      getAuthErrorMessage(
        error,
        "Unable to send password reset instructions."
      )
    );
  }
}

/* ============================================================
   PASSWORD RESET ALIAS
   ============================================================ */

export async function sendPasswordReset(
  email: string
) {
  return resetPassword(email);
}

/* ============================================================
   UPDATE PASSWORD
   ============================================================ */

export async function updatePassword(
  password: string
) {
  if (password.length < 8) {
    throw new Error(
      "Password must be at least 8 characters."
    );
  }

  const { error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    console.error(
      "Supabase password update error:",
      error
    );

    throw new Error(
      getAuthErrorMessage(
        error,
        "Unable to update your password."
      )
    );
  }
}