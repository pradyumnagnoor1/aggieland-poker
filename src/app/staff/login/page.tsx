import { AppShell } from "@/components/app-shell";
import Login from "@/components/login";
export const metadata = {
  title: "Staff sign-in",
  robots: { index: false, follow: false },
};
export default function LoginPage() {
  return (
    <AppShell staff>
      <Login />
    </AppShell>
  );
}
