import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { database, disconnect } from "../src/lib/db";
loadEnvConfig(process.cwd());
try {
  const [r] = await database()`select public.expire_waitlist() as expired`;
  console.log(r);
} finally {
  await disconnect();
}
