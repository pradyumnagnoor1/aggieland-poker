import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { readFile, readdir } from "node:fs/promises";
import { database, disconnect } from "../src/lib/db";
loadEnvConfig(process.cwd());
try {
  const sql = database();
  await sql`create table if not exists app_migrations(name text primary key,applied_at timestamptz not null default now())`;
  for (const name of (await readdir("supabase/migrations"))
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    const [done] =
      await sql`select name from app_migrations where name=${name}`;
    if (done) continue;
    const source = await readFile(`supabase/migrations/${name}`, "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(source);
      await tx`insert into app_migrations(name) values(${name})`;
    });
    console.log(`Applied ${name}`);
  }
} catch {
  console.error(
    "Migration failed. Check database access and migration SQL; no credentials were logged.",
  );
  process.exitCode = 1;
} finally {
  await disconnect();
}
