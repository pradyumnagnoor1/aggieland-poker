import { AppShell } from "@/components/app-shell";
import Player from "@/components/player";
export const metadata = {
  title: "My spot",
  robots: { index: false, follow: false },
};
export default function Status() {
  return (
    <AppShell status>
      <Player status />
    </AppShell>
  );
}
