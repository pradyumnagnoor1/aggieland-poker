import { AppShell } from "@/components/app-shell";
export default function NotFound() {
  return (
    <AppShell>
      <div className="empty-state">
        <span className="empty-suit">♠</span>
        <h1>This hand went elsewhere.</h1>
        <p>We couldn’t find that page.</p>
        <a className="wl-button" href="/play">
          Back to tonight’s games ↗
        </a>
      </div>
    </AppShell>
  );
}
