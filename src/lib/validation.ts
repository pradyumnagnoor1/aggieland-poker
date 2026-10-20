import { z } from "zod";
const uuid = z.uuid();
const name = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .refine((v) => !/[\x00-\x1F\x7F]/.test(v), "Use plain text.");
const reason = z.string().trim().max(300).optional();
const entry = { entryId: uuid, version: z.number().int().positive() };
export const joinSchema = z.object({
  requestId: uuid,
  gameId: uuid,
  name,
  accepted: z.literal(true),
});
export const playerSchema = z.object({
  requestId: uuid,
  entryId: uuid,
  action: z.enum(["cancel", "acknowledge"]),
});
export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});
export const staffSchema = z.intersection(
  z.object({ requestId: uuid }),
  z.discriminatedUnion("action", [
    z.object({ action: z.literal("session_open") }),
    z.object({ action: z.literal("session_close") }),
    z.object({
      action: z.literal("game_create"),
      name,
      variant: z.string().trim().min(2).max(50),
      stakes: z.string().trim().min(1).max(30),
    }),
    z.object({
      action: z.literal("game_update"),
      gameId: uuid,
      version: z.number().int().positive(),
      status: z.enum(["forming", "running", "paused", "finished"]),
      accepting: z.boolean(),
      note: z.string().trim().max(200),
    }),
    z.object({
      action: z.literal("seat_create"),
      gameId: uuid,
      label: z.string().trim().min(2).max(40),
    }),
    z.object({ action: z.literal("seat_release"), seatId: uuid }),
    z.object({
      action: z.literal("entry_add"),
      gameId: uuid,
      name,
      source: z.enum(["walk_in", "phone"]),
    }),
    z.object({ action: z.literal("entry_arrive"), ...entry }),
    z.object({
      action: z.literal("entry_offer"),
      ...entry,
      seatId: uuid,
      reason,
    }),
    z.object({ action: z.literal("entry_seat"), ...entry }),
    z.object({
      action: z.literal("entry_cancel"),
      ...entry,
      reason: z.string().trim().min(3).max(300),
    }),
    z.object({
      action: z.literal("entry_no_show"),
      ...entry,
      reason: z.string().trim().min(3).max(300),
    }),
    z.object({
      action: z.literal("entry_move"),
      ...entry,
      reason: z.string().trim().min(5).max(300),
    }),
    z.object({
      action: z.literal("policy_update"),
      arrivalMinutes: z.number().int().min(5).max(240),
      offerMinutes: z.number().int().min(1).max(30),
      staleMinutes: z.number().int().min(5).max(120),
    }),
    z.object({
      action: z.literal("team_update"),
      staffId: uuid,
      role: z.enum(["owner", "manager", "floor"]),
      active: z.boolean(),
    }),
  ]),
);
export const teamSchema = z.object({
  email: z.email().max(254),
  name,
  password: z.string().min(12).max(128),
  role: z.enum(["owner", "manager", "floor"]),
});
