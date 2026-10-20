import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { createClient } from "@supabase/supabase-js";
import { database, disconnect } from "../src/lib/db";
loadEnvConfig(process.cwd());
// Password is read from stdin, never shell arguments or a committed file.
try {
  const email = process.argv[2];
  if (
    !email ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.SUPABASE_URL
  )
    throw new Error("setup");
  const [existing] =
    await database()`select id from staff_members where role='owner' and active=true`;
  if (existing)
    throw new Error(
      "An owner exists. Use the owner dashboard for additional staff.",
    );
  console.log(
    "Enter a 12+ character owner password on stdin (input should be piped from a password manager).",
  );
  let password = "";
  for await (const chunk of process.stdin) password += chunk;
  password = password.trim();
  if (password.length < 12) throw new Error("password");
  const admin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error("auth");
  try {
    await database()`insert into staff_members(id,email,display_name,role) values(${data.user.id},${email},'Club owner','owner')`;
  } catch (e) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw e;
  }
  console.log("Owner created. Sign in at /staff/login.");
} catch {
  console.error(
    "Owner setup failed. Check configuration, password length, and whether an owner/email already exists.",
  );
  process.exitCode = 1;
} finally {
  await disconnect();
}
