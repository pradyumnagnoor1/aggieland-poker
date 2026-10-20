import { AppShell } from "@/components/app-shell";
import StaffDesk from "@/components/staff";
export const metadata = {
  title: "The floor desk",
  robots: { index: false, follow: false },
};
export default function StaffPage() {
  return (
    <AppShell staff>
      <StaffDesk />
    </AppShell>
  );
}
