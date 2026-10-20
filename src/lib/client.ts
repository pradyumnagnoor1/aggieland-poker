"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export class RequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}
export async function request<T>(url: string, payload?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new RequestError(
      data.error || "Please try again.",
      response.status,
      data.code,
    );
  return data;
}
export function usePoll<T>(url: string, enabled = true) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [updated, setUpdated] = useState<Date | null>(null);
  const inFlight = useRef(false),
    alive = useRef(true);
  const reload = useCallback(async () => {
    if (inFlight.current || !enabled) return;
    inFlight.current = true;
    try {
      const value = await request<T>(url);
      if (alive.current) {
        setData(value);
        setError("");
        setUpdated(new Date());
      }
    } catch (e) {
      if (alive.current) {
        if (
          e instanceof RequestError &&
          e.status === 401 &&
          url.startsWith("/api/staff")
        ) {
          window.location.assign("/staff/login");
          return;
        }
        setError(e instanceof Error ? e.message : "Connection interrupted.");
      }
    } finally {
      inFlight.current = false;
      if (alive.current) setLoading(false);
    }
  }, [url, enabled]);
  useEffect(() => {
    alive.current = true;
    if (!enabled) {
      setLoading(false);
      return;
    }
    void reload();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void reload();
    }, 10000);
    const wake = () => {
      if (document.visibilityState === "visible") void reload();
    };
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    return () => {
      alive.current = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
    };
  }, [reload, enabled]);
  return { data, error, loading, updated, reload };
}
export function time(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}
export function ago(value: string) {
  const mins = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  return mins < 1 ? "Just confirmed" : `${mins}m ago`;
}
