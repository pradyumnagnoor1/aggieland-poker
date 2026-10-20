import postgres from "postgres";

let connection: ReturnType<typeof postgres> | undefined;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!connection)
    connection = postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 4,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.DATABASE_SSL === "false" ? false : "require",
      onnotice: () => {},
    });
  return connection;
}
export async function disconnect() {
  if (connection) {
    await connection.end({ timeout: 5 });
    connection = undefined;
  }
}
