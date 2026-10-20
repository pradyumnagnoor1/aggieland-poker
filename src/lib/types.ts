export type Role = "owner" | "manager" | "floor";
export type Staff = {
  id: string;
  email: string;
  display_name: string;
  role: Role;
};
export type EntryState =
  | "waiting"
  | "arrived"
  | "offered"
  | "acknowledged"
  | "seated"
  | "cancelled"
  | "expired"
  | "no_show";
export type Game = {
  id: string;
  name: string;
  variant: string;
  stakes: string;
  status: "forming" | "running" | "paused" | "finished";
  accepting: boolean;
  note: string;
  confirmed_at: string;
  version: number;
  waiting: number;
  stale: boolean;
};
export type Policy = {
  arrival_minutes: number;
  offer_minutes: number;
  stale_minutes: number;
  policy_confirmed: boolean;
};
export type Ticket = {
  id: string;
  reference: string;
  display_name: string;
  game_id: string;
  game_name: string;
  stakes: string;
  state: EntryState;
  position: number;
  joined_at: string;
  arrival_deadline: string | null;
  arrived_at: string | null;
  expires_at: string | null;
  seat_label: string | null;
  source: string;
  version: number;
};
export type Seat = {
  id: string;
  game_id: string;
  label: string;
  occupied: boolean;
  held: boolean;
  active: boolean;
};
export type PlayerData = {
  games: Game[];
  ticket: Ticket | null;
  policy: Policy;
  demo: boolean;
  setup?: boolean;
  server_time: string;
};
export type StaffData = PlayerData & {
  staff: Staff;
  entries: Ticket[];
  seats: Seat[];
  session: { id: string; opened_at: string } | null;
  team: Staff[];
  audit: {
    id: string;
    action: string;
    created_at: string;
    details: Record<string, unknown>;
  }[];
  scheduler: boolean;
};
