import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { database, disconnect } from "../src/lib/db";
loadEnvConfig(process.cwd());
try {
  if (
    process.env.DEMO_MODE !== "true" ||
    process.env.VERCEL ||
    process.env.NODE_ENV === "production"
  )
    throw new Error("Demo seed is local-only.");
  const sql = database();
  const owner = "11111111-1111-4111-8111-111111111111";
  await sql`insert into staff_members(id,email,display_name,role) values(${owner},'owner@jokers.local','Demo owner','owner') on conflict(id) do nothing`;
  await sql`update club_settings set policy_confirmed=true,arrival_minutes=30,offer_minutes=5`;
  let [shift] =
    await sql`select id from operating_sessions where closed_at is null`;
  if (!shift)
    [shift] =
      await sql`insert into operating_sessions(opened_by) values(${owner}) returning id`;
  const [existing] = await sql`select id from games limit 1`;
  if (!existing)
    for (const g of [
      {
        name: "No Limit Hold’em",
        variant: "Hold’em",
        stakes: "$1 / $2",
        status: "running",
      },
      {
        name: "Small-stakes Hold’em",
        variant: "Hold’em",
        stakes: "$0.25 / $0.50",
        status: "running",
      },
      {
        name: "Round of Each",
        variant: "Mixed games",
        stakes: "$5 / $5",
        status: "forming",
      },
    ]) {
      const [game] =
        await sql`insert into games(name,variant,stakes,status,accepting,session_id,note) values(${g.name},${g.variant},${g.stakes},${g.status},true,${shift.id},'Synthetic demonstration game') returning id`;
      for (let i = 1; i <= 3; i++)
        await sql`insert into seats(game_id,label) values(${game.id},${`Table ${g.stakes === "$1 / $2" ? "1" : g.stakes === "$5 / $5" ? "3" : "2"} · Seat ${i}`})`;
    }
  await sql`update games set confirmed_at=now()`;
  console.log("Local synthetic games ready. No real players were added.");
} catch (e) {
  console.error(e instanceof Error ? e.message : "Demo seed failed");
  process.exitCode = 1;
} finally {
  await disconnect();
}
