export function Brand() {
  return (
    <a className="wl-brand" href="/play" aria-label="Jokers wait-list home">
      <span className="brand-emblem" aria-hidden="true">
        ♠
      </span>
      <span>
        JOKERS<small>OF AGGIELAND</small>
      </span>
    </a>
  );
}
export function AppShell({
  children,
  staff = false,
  status = false,
}: {
  children: React.ReactNode;
  staff?: boolean;
  status?: boolean;
}) {
  return (
    <div className="waitlist-app">
      <a className="wl-skip" href="#app-main">
        Skip to content
      </a>
      <header className="wl-header">
        <div className="wl-header-inner">
          <Brand />
          <span className="header-divider" />
          <span className="header-label">
            {staff ? "THE FLOOR DESK" : "YOUR SPOT STARTS HERE"}
          </span>
          <a className="back-site" href="/">
            Back to website <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      {!staff && (
        <nav className="player-tabs" aria-label="Player navigation">
          <div>
            <a href="/play" aria-current={!status ? "page" : undefined}>
              <span aria-hidden="true">♣</span> Tonight
            </a>
            <a href="/play/status" aria-current={status ? "page" : undefined}>
              <span aria-hidden="true">▤</span> My spot
            </a>
            <span className="tabs-location">COLLEGE STATION, TX</span>
          </div>
        </nav>
      )}
      <main id="app-main" className={`wl-main ${staff ? "wl-main-staff" : ""}`}>
        {children}
      </main>
      <footer className="wl-footer">
        <span>Jokers of Aggieland · 2553 Texas Avenue South, Suite D</span>
        <a href="tel:+19794462077">Need a hand? (979) 446-2077 ↗</a>
        {!staff && <a href="/staff/login">Staff sign-in</a>}
      </footer>
    </div>
  );
}
