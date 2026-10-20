import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { AppError } from "./errors";

export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export function sameSecret(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function requireOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.APP_ORIGIN;
  const allowed = configured
    ? new URL(configured).origin
    : new URL(request.url).origin;
  if (!origin || origin !== allowed)
    throw new AppError(
      "ORIGIN",
      "Please reload this page before trying again.",
      403,
    );
}
export function clientKey(request: Request) {
  const ip = process.env.VERCEL
    ? (request.headers.get("x-vercel-forwarded-for") ??
      request.headers.get("x-forwarded-for") ??
      "unknown")
    : "local";
  return createHmac(
    "sha256",
    process.env.RATE_LIMIT_SECRET ||
      process.env.CRON_SECRET ||
      "development-only",
  )
    .update(ip.split(",")[0].trim())
    .digest("hex");
}
export const localDemo = () =>
  process.env.DEMO_MODE === "true" &&
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL &&
  !!process.env.LOCAL_DEMO_PASSWORD;
