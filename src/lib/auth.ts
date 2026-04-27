"use client";

/**
 * src/lib/auth.ts
 *
 * Auth helper functions. All Supabase Auth calls go through here.
 * Pages import from this file — never call supabase.auth directly in pages.
 */

import { createClient } from "@/lib/supabase/client";
import { apiClient } from "@/lib/api/client";

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Registers a new brand account.
 *
 * Flow (per domain_06):
 * 1. supabase.auth.signUp() — creates auth.users row
 * 2. POST /auth/register — creates tenants + users rows
 * 3. Returns tenant context on success
 *
 * WHY TWO STEPS: Supabase Auth handles credentials.
 * Our backend handles the business record (tenant, role).
 * Neither knows about the other's internal structure.
 */
export async function registerBrand(
  email: string,
  password: string,
  companyName: string
): Promise<{ tenantId: string; role: string } | AuthError> {
  const supabase = createClient();

  // Step 1: Create Supabase Auth user
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    // "User already registered" — guide them to login instead
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already been registered") ||
      error.message.toLowerCase().includes("user already exists")
    ) {
      return { message: "An account with this email already exists. Please sign in instead." };
    }
    return { message: error.message, code: (error as { code?: string }).code };
  }

  if (!data.session) {
    // This happens when Supabase email confirmation is ENABLED.
    // The user was created but needs to verify their email first.
    return {
      message:
        "Check your inbox — a verification email has been sent. " +
        "Confirm your email then sign in.",
    };
  }

  // Step 2: Create tenant + user records in our DB via POST /auth/complete-registration
  try {
    const envelope = await apiClient<{
      tenant_id: string;
      company_name: string;
      role: string;
    }>("/api/v1/auth/complete-registration", {
      method: "POST",
      body: JSON.stringify({ company_name: companyName }),
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });

    // envelope is ResponseEnvelope<{tenant_id, company_name, role}>
    if (envelope.status === "success" && envelope.data) {
      return { tenantId: envelope.data.tenant_id, role: envelope.data.role };
    }

    // Backend returned status: "error"
    const backendMsg = envelope.error?.message ?? "Tenant setup failed — please contact support";
    console.error("[registerBrand] backend error:", envelope.error);
    return { message: backendMsg };
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Registration failed — please try again";
    console.error("[registerBrand] network/timeout error:", err);
    return { message: msg };
  }
}


/**
 * Logs in an existing brand account.
 *
 * Flow (per domain_06):
 * 1. supabase.auth.signInWithPassword()
 * 2. Session stored in httpOnly cookie by Supabase SSR automatically
 * 3. Returns success on success
 */
export async function loginBrand(
  email: string,
  password: string
): Promise<{ success: boolean } | AuthError> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase error messages to user-friendly ones
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return { message: "Incorrect email or password" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { message: "Please verify your email before logging in" };
    }
    return { message: error.message };
  }

  return { success: true };
}

/**
 * Logs out the current user.
 * Clears Supabase session cookie.
 */
export async function logoutBrand(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Type guard — checks if result is an auth error
 */
export function isAuthError(result: unknown): result is AuthError {
  return typeof result === "object" && result !== null && "message" in result;
}
