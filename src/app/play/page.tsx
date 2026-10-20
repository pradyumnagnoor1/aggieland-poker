import { AppShell } from "@/components/app-shell";
import Player from "@/components/player";
export const metadata = { title: "Tonight’s lineup" };
export default function Play() {
  return (
    <AppShell>
      <Player />
    </AppShell>
  );
}
