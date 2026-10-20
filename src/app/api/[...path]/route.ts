import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { database } from "@/lib/db";
import {
  authAdmin,
  authClient,
  requireStaff,
  signIn,
  signOut,
} from "@/lib/auth";
import { AppError, assert } from "@/lib/errors";
import {
  guestSession,
  validGuestSession,
  joinQueue,
  playerCommand,
  playerSnapshot,
  rateLimit,
  registerStaff,
  staffCommand,
  staffSnapshot,
} from "@/lib/queue";
import { clientKey, newToken, requireOrigin, sameSecret } from "@/lib/security";
import {
  joinSchema,
  loginSchema,
  playerSchema,
  staffSchema,
  teamSchema,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store", Vary: "Cookie" },
  });
}
async function body(request: NextRequest) {
  const text = await request.text();
  assert(text.length < 8192, "SIZE", "Request too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("BODY", "Invalid request.");
  }
}
function errorResponse(error: unknown) {
  if (error instanceof ZodError)
    return json(
      {
        error: "Please check the form fields.",
        code: "VALIDATION",
        fields: error.flatten().fieldErrors,
      },
      400,
    );
  if (error instanceof AppError)
    return json({ error: error.message, code: error.code }, error.status);
  // Never log database URLs, query parameters, passwords, or auth tokens.
  console.error(
    "waitlist_request_failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return json(
    {
      error:
        "The club connection is unavailable. Please try again or call (979) 446-2077.",
      code: "UNAVAILABLE",
    },
    503,
  );
}
async function handle(request: NextRequest) {
  const path = new URL(request.url).pathname;
  if (request.method === "POST") requireOrigin(request);
  const response = json({ ok: true });
  if (path === "/api/health") {
    await database()`select 1`;
    return json({ ok: true });
  }
  if (path === "/api/jobs/expire") {
    const secret = process.env.CRON_SECRET;
    assert(
      secret &&
        sameSecret(
          request.headers.get("authorization") || "",
          `Bearer ${secret}`,
        ),
      "AUTH",
      "Unauthorized.",
      401,
    );
    const [r] = await database()`select public.expire_waitlist() as expired`;
    return json(r);
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    await rateLimit(`login:${clientKey(request)}`, 10, 900);
    const input = loginSchema.parse(await body(request));
    await signIn(input.email.toLowerCase(), input.password, response);
    return response;
  }
  if (path === "/api/auth/logout" && request.method === "POST") {
    await signOut(request, response);
    return response;
  }
  if (path === "/api/player" && request.method === "GET") {
    if (!process.env.DATABASE_URL)
      return json({
        games: [],
        ticket: null,
        policy: {
          arrival_minutes: 30,
          offer_minutes: 5,
          stale_minutes: 30,
          policy_confirmed: false,
        },
        demo: false,
        setup: true,
        server_time: new Date().toISOString(),
      });
    let token = request.cookies.get("joa_guest")?.value;
    if (
      !token ||
      !/^[A-Za-z0-9_-]{43}$/.test(token) ||
      !(await validGuestSession(token))
    ) {
      await rateLimit(`sessions:${clientKey(request)}`, 120, 3600);
      token = newToken();
    }
    await guestSession(token);
    const data = await playerSnapshot(token);
    const result = json(data);
    result.cookies.set("joa_guest", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 3600,
    });
    return result;
  }
  if (path === "/api/player" && request.method === "POST") {
    const token = request.cookies.get("joa_guest")?.value;
    assert(token, "SESSION", "Reload this page before joining.", 401);
    await rateLimit(`join:${clientKey(request)}`, 90, 3600);
    const input = joinSchema.parse(await body(request));
    return json(await joinQueue(token, input.requestId, input));
  }
  if (path === "/api/player/action" && request.method === "POST") {
    const token = request.cookies.get("joa_guest")?.value;
    assert(token, "SESSION", "Reload your spot before trying again.", 401);
    const input = playerSchema.parse(await body(request));
    return json(
      await playerCommand(token, input.requestId, input.action, input.entryId),
    );
  }
  if (path.startsWith("/api/staff")) {
    const staff = await requireStaff(request, response);
    let result: NextResponse;
    if (path === "/api/staff" && request.method === "GET")
      result = json(await staffSnapshot(staff));
    else if (path === "/api/staff/action" && request.method === "POST") {
      const input = staffSchema.parse(await body(request));
      const { requestId, ...command } = input;
      result = json(await staffCommand(staff, requestId, command));
    } else if (path === "/api/staff/team" && request.method === "POST") {
      assert(
        staff.role === "owner",
        "ROLE",
        "Only an owner can create staff accounts.",
        403,
      );
      await rateLimit(`team:${staff.id}`, 10, 3600);
      const input = teamSchema.parse(await body(request));
      const admin = authAdmin();
      const { data, error } = await admin.auth.admin.createUser({
        email: input.email.toLowerCase(),
        password: input.password,
        email_confirm: true,
      });
      assert(
        !error && data.user,
        "ACCOUNT",
        "Could not create account. Check whether this email is already registered.",
        409,
      );
      try {
        await registerStaff(staff, {
          id: data.user.id,
          email: input.email.toLowerCase(),
          name: input.name,
          role: input.role,
        });
      } catch (e) {
        await admin.auth.admin.deleteUser(data.user.id);
        throw e;
      }
      result = json({ ok: true });
    } else if (path === "/api/staff/password" && request.method === "POST") {
      const input = teamSchema
        .pick({ password: true })
        .extend({ currentPassword: loginSchema.shape.password })
        .parse(await body(request));
      const client = authClient();
      const { data, error } = await client.auth.signInWithPassword({
        email: staff.email,
        password: input.currentPassword,
      });
      assert(
        !error && data.session,
        "PASSWORD",
        "Current password is incorrect.",
        401,
      );
      const { error: updateError } = await client.auth.updateUser({
        password: input.password,
      });
      assert(!updateError, "PASSWORD", "Could not change password.");
      result = json({ ok: true });
    } else throw new AppError("NOT_FOUND", "Not found.", 404);
    for (const cookie of response.cookies.getAll()) result.cookies.set(cookie);
    return result;
  }
  throw new AppError("NOT_FOUND", "Not found.", 404);
}
export async function GET(request: NextRequest) {
  try {
    return await handle(request);
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(request: NextRequest) {
  try {
    return await handle(request);
  } catch (e) {
    return errorResponse(e);
  }
}
