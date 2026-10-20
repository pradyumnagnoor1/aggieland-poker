import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { database } from "./db";
import { AppError, assert } from "./errors";
import { hash, localDemo, newToken, sameSecret } from "./security";
import type { Staff } from "./types";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
export function authClient() {
  assert(
    process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY,
    "SETUP",
    "Staff sign-in is not configured yet.",
    503,
  );
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function authAdmin() {
  assert(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SETUP",
    "Staff account management needs the Supabase service key.",
    503,
  );
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function setSession(
  response: NextResponse,
  session: { access_token: string; refresh_token: string; expires_in: number },
) {
  response.cookies.set("joa_staff_access", session.access_token, {
    ...cookieOptions,
    maxAge: session.expires_in,
  });
  response.cookies.set("joa_staff_refresh", session.refresh_token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}
export async function requireStaff(
  request: NextRequest,
  responseCookies?: NextResponse,
): Promise<Staff> {
  let id: string | undefined;
  const local = request.cookies.get("joa_local_staff")?.value;
  if (localDemo() && local) {
    const [s] =
      await database()`select staff_id from local_staff_sessions where token_hash=${hash(local)} and expires_at>now()`;
    id = s?.staff_id;
  } else {
    const access = request.cookies.get("joa_staff_access")?.value;
    const refresh = request.cookies.get("joa_staff_refresh")?.value;
    assert(access || refresh, "AUTH", "Please sign in to the staff desk.", 401);
    const client = authClient();
    if (access) {
      const { data } = await client.auth.getUser(access);
      id = data.user?.id;
    }
    if (!id && refresh) {
      const { data, error } = await client.auth.refreshSession({
        refresh_token: refresh,
      });
      if (!error && data.session) {
        id = data.user?.id;
        if (responseCookies) setSession(responseCookies, data.session);
      }
    }
  }
  assert(id, "AUTH", "Your session expired. Please sign in again.", 401);
  const [staff] =
    await database()`select id,email,display_name,role from staff_members where id=${id} and active=true`;
  assert(
    staff,
    "AUTH",
    "Your account does not have active club staff access.",
    403,
  );
  return staff as Staff;
}
export async function signIn(
  email: string,
  password: string,
  response: NextResponse,
) {
  assert(
    process.env.DATABASE_URL,
    "SETUP",
    "The club’s wait-list is not connected yet. Please contact the owner.",
    503,
  );
  if (localDemo() && email === "owner@jokers.local") {
    assert(
      sameSecret(password, process.env.LOCAL_DEMO_PASSWORD!),
      "LOGIN",
      "Email or password is incorrect.",
      401,
    );
    const [staff] =
      await database()`select id from staff_members where email=${email} and active=true`;
    assert(
      staff,
      "SETUP",
      "Run npm run db:demo to create the local demonstration.",
      503,
    );
    const token = newToken();
    await database()`insert into local_staff_sessions(token_hash,staff_id,expires_at) values(${hash(token)},${staff.id},now()+interval '8 hours')`;
    response.cookies.set("joa_local_staff", token, {
      ...cookieOptions,
      maxAge: 8 * 3600,
    });
    return;
  }
  const client = authClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session)
    throw new AppError("LOGIN", "Email or password is incorrect.", 401);
  const [staff] =
    await database()`select id from staff_members where id=${data.user.id} and active=true`;
  assert(staff, "AUTH", "This account does not have club staff access.", 403);
  setSession(response, data.session);
}
export async function signOut(request: NextRequest, response: NextResponse) {
  const local = request.cookies.get("joa_local_staff")?.value;
  if (local && localDemo())
    await database()`delete from local_staff_sessions where token_hash=${hash(local)}`;
  const access = request.cookies.get("joa_staff_access")?.value;
  if (access && process.env.SUPABASE_SERVICE_ROLE_KEY)
    await authAdmin().auth.admin.signOut(access, "local");
  for (const name of [
    "joa_staff_access",
    "joa_staff_refresh",
    "joa_local_staff",
  ])
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
}
