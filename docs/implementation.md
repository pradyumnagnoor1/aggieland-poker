# Jokers of Aggieland redesign

## Current implementation: wait-list platform

The application is now Next.js 16 / React 19 / TypeScript with server-backed PostgreSQL queue operations. Active code is src/ and public/. Independent hosting is https://aggieland-poker.vercel.app, linked to https://github.com/pradyumnagnoor1/aggieland-poker. The old Sites configuration is archived, and the runtime does not depend on Sites.

Implemented: original Tonight/My spot player design, private guest tickets, persistent joins/cancellation, staff arrivals, walk-ins/call-ins, atomic seat offers/holds, acknowledgments, seating, expiration, game/shift/seat management, owner-managed roles, queue policies, audit, rate limiting, origin checks, retention, SQL migrations and Cron scheduling, and operational handover guides.

Verification: TypeScript and production build passed. All 20 PostgreSQL integration tests passed locally and GitHub Actions workflow 39477064452 completed successfully. Browser rehearsal verified join → staff check-in → offer → player acknowledgment → staff seated. Desktop and 390px player/staff layouts were reviewed. Vercel deployed successfully; its player API explicitly returns setup=true with no games while its database is unconfigured.

Remaining live setup: git-ignored .env.supabase.local needs DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Hosted migrations, real Supabase staff login, first-owner provisioning, named Cron execution, owner policy approval, actual club pilot, and any custom-domain/account handover remain unverified/pending. No synthetic data or local-only login is deployed to production.

The sections below preserve the original marketing-site research and first-version baseline.

Scope: recreate the Hideaway marketing site's visual language with verified Jokers content. Buildless HTML, CSS, and JavaScript. No authentication, payment, or invented wait-list backend.

Skills considered: coding-orchestrator, design-system, Sites. Chosen: those three for implementation routing, responsive design, and preview/publication. The existing repository was empty. No AI product components. Network boundaries: static local assets, Google Fonts, and explicit outbound contact/community links.

Sources inspected October 20, 2026: jokersofaggieland.com homepage, /copy-of-cash-games, /services, /wsop, /gallery, /contact, /event-list. Visual reference: thehideawaypoker.com and its public styles.css/app.js.

Verified facts: $5 monthly / $50 annual membership; drinks, food, snacks included; seat rental excluded. No published seat rental rate or priced daily membership. Weekdays 7 PM–4 AM; weekends 2 PM–4 AM. Address 2553 Texas Avenue South, Suite D, College Station TX 77840. Call/text 979-446-2077. Email jokers@jokersofaggieland.com.

Content caveats: tournament page title says Turbo Mondays and Tuesdays, but detailed schedule only specifies Tuesday 7 PM. Present Tuesday's verified details and mention Monday requires confirmation. WSOP 2026 dates are in the past; present as archive. No current events listed. Cash schedules depend on player interest. Do not copy Hideaway prices, no-rake claim, opening time, player app, analytics IDs, or branding.

Design tokens follow Hideaway: #0b0a12 background, #13111d/#1b1828 surfaces, #f2f1f6 text, #a7a3bd muted, #4d55f0 blue accent, #5b3489 purple table rail; Bebas Neue and Manrope. Shared buttons, cards, weekly playing cards, header, phone dock, membership dial, and native details disclosures. Use real Jokers photography and logos.

Acceptance: complete source content, functional membership comparison, keyboard-accessible dial and menus, working contact/directions/community links, responsive desktop/390px layouts with no overflow, no missing local assets, valid JavaScript. Verify with npm run check and browser inspection.

Verification: npm run check passed; local server returned HTTP 200; HTML local assets and anchor targets all resolve. Browser inspected at desktop and 390px; no horizontal overflow or broken loaded images. Verified membership dial Home/End/arrows (1 month $5, 2 months $10, 12 months $50 with $10 savings), mixed-game filtering, gallery modal open/Escape close, phone menu opening and anchor close, and FAQ expansion. External contact actions were inspected as links without sending messages or placing calls.

User requested Aggieland colors: final palette uses #500000 Aggieland maroon actions, #100d0e warm charcoal, #faf7f2 white, #d67b84 readable maroon-tinted accents, maroon table rails, and a white highlighted seat. Hideaway layout retained.
