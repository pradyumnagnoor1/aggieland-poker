# Jokers: wait-list-first implementation plan

Status: planning only. This supersedes the broader feature build order in owner-platform-plan.md. Retain Aggieland branding and verified club content, create a distinct Jokers player experience, and move future hosting/deployment away from ChatGPT Sites. Prioritize a separate player wait-list page and the minimum staff tools required to operate it. No marketing messaging, calendar expansion, full content CMS, or broad reporting dashboard in this release. This revision does not migrate or delete the existing deployment.

## Experience and routes

- Main site: add Join the wait-list to the header, hero, and mobile action bar. Route it to /play in the same tab. Include a clear Back to website link on the player page. A future player subdomain is optional and not required for the initial release.
- /play: available games, stakes, running/forming status, waiting count, latest staff confirmation, and Join buttons. Show an honest empty state when no games are accepting joins.
- /play/status: private status for the current player's entry, including game, position, arrival instructions, queue state, and cancel action. Access comes from the player's private session, not a publicly guessable entry ID.
- /staff/waitlist: authenticated staff queue and game controls, optimized for phone/tablet.

The player page should feel like a Jokers check-in desk: compact maroon header, warm white game list, and a prominent personal queue ticket after joining. Use Tonight and My spot navigation, large touch targets, and little marketing copy. No P&L, balances, payments, or membership dashboard.

## Distinct Jokers design direction

Working concept: Your spot at Jokers. The player app is a purpose-built check-in experience with its own composition and vocabulary, rather than a reproduction of Hideaway's Tables / Waitlist / P&L / Profile navigation.

- Palette: deep Aggieland maroon #500000, warm white #faf7f2, charcoal text, and restrained silver borders. Use warm white as the main player-app canvas so it feels different from the dark promotional homepage.
- Typography: strong editorial section titles with readable, conventional body text; reserve condensed display type for small brand accents rather than every screen heading.
- Game selection: a compact list of game rows with stakes, game type, forming/running label, waiting count, freshness, and a clear Join action. Group by game, not an illustrated overview of every physical table.
- Personal queue ticket: once joined, prioritize a large numbered ticket: Your spot #3, two ahead, selected game, joined time, and next action. The ticket number is a display reference, not an authorization credential.
- Progress: a text-labeled sequence of On the list → Checked in → Seat offered → Seated. Do not mark check-in complete until staff confirms arrival. Seat-offer acknowledgment can appear inside the offer step.
- Navigation: Tonight and My spot; on mobile, keep the next useful action near the bottom without replicating Hideaway's four-tab bar.
- Identity: use the actual Jokers logo, local club photography sparingly, and plain welcoming language such as Find your game, You're on the list, and Check in with the floor.
- Interaction: concise state changes, visible freshness, clear expired/paused states, accessible focus and contrast, and reduced-motion support. Avoid decorative animated tables in the player workflow.
- Staff view: a practical queue workspace with game selectors and a prioritized action list; optimize it independently from the player ticket design.

Keep the existing marketing site's maroon identity and verified information during migration. Update the entry points and companion-page wording to match the new experience. A broader homepage redesign is deferred unless separately requested.

Design acceptance: assess the player home, joining flow, personal ticket, and staff workspace side by side with the inspected reference. Require a distinct layout, navigation, hierarchy, and copy—not only a palette change. Use original components and owned/source-provided assets.

## Player flow

1. Open Join the wait-list from the website.
2. Choose a game accepting joins, such as $1/$2 NLH. Staff-confirmed game data determines availability; the weekly schedule does not automatically create a running game.
3. Enter a name or nickname plus a distinguishing detail only if the club needs it. Default to minimal data; do not collect phone/email solely because it might be useful later.
4. Read and acknowledge the remote-arrival rule and notification limitation. Show the rule before submitting.
5. Join once. The server returns confirmed queue placement and establishes a secure private session. Disable repeat submission while pending; retry safely after errors.
6. View position, how many entries are ahead, arrival deadline if applicable, staff contact link, and status. Do not fabricate estimated wait times.
7. Arrive at the club and check in with staff. Only staff confirms physical arrival in the first release.
8. Staff offers a seat. The open status page displays Seat ready, table identifier if assigned, and the server-controlled response deadline. Player can acknowledge the offer; staff confirms seating in person.
9. Leave the queue at any time. Staff or server transitions the entry to the appropriate final state.

First version: guest session rather than mandatory full account. Persist status across refreshes on the same device using an HttpOnly secure session cookie. If the device/session is lost, instruct the player to contact staff. No cross-device recovery promise until an identity/recovery feature is designed. Give staff a matching entry reference; never treat a nickname alone as secure identity.

## Notifications and scope boundary

No SMS, email campaign, or automated outbound message integration. Seat-ready updates are on-page, with optional sound after an explicit user action. Background or closed browsers may not receive/display timely updates. Present 'Keep this page open and check in with the floor' prominently. Staff can call out the player's name inside the club.

Do not market this version as reliable background phone notifications. Browser push can be separately evaluated later if requested; it is not part of this plan.

## Staff workflow

Staff signs into /staff/waitlist using individual accounts. Owners/managers manage staff access and queue rules. Floor staff manages games and entries but cannot grant permissions.

At opening: create/select the operating session, enable the actual games accepting players, mark forming/running, and set remote-join status. During the shift: add walk-ins/call-ins, confirm arrivals, offer seats, acknowledge declined/expired offers, seat players, remove duplicates, and mark cancellations/no-shows. At closing: pause joins, resolve outstanding entries, and end the session. Operating sessions span midnight as needed.

Staff view columns: queue position, player display name, entry reference, source, joined time, arrival state, offer status/deadline, and available actions. Show last sync time and connection state. Require a reason for queue-order overrides. Keep an audit trail for staff changes.

Minimum game controls: game label, variant, stakes, forming/running/paused/finished state, accepting joins on/off, public note, and last confirmation time. Do not add a public seat count until reliable table capacity/occupancy data is maintained. For the first version, staff explicitly selects/identifies an available seat when making an offer; reserve it atomically so two staff members cannot offer it simultaneously.

## Rules to settle with the club before the pilot

Proposed defaults are product suggestions, not established Jokers policies:
- One active game queue per guest session in the initial release to simplify seating and duplication.
- Queue priority by server join time; any arrival-based priority must be explicitly agreed and published.
- Remote joins have a configurable arrival deadline chosen by the owner; do not invent a published deadline now.
- Offer response/arrival window is configurable and chosen by the owner.
- Staff confirms arrival and final seating.
- Staff can pause remote joins independently of the game continuing.
- Game closure stops new joins and explicitly resolves waiting/offered entries; no silent transfer to another game.
- If already seated, joining again creates a new entry at the back after the prior entry is finalized.

## State and reliability

States: waiting, arrived, offered, offer acknowledged, seated; terminal alternatives: cancelled, expired, no-show. The precise allowed transitions are enforced on the server. Acknowledging an offer is not equivalent to being physically seated.

Persistent records: staff users/roles, queue policy settings, operating sessions, games, active table/seat references sufficient for offers, guest sessions, wait-list entries, seat offers, and audit events.

Backend requirements: authenticated staff API; minimal public game API; private player status API; transactional joins/offers/seating; server timestamps; unique active-entry and active-seat constraints; idempotent retries; automatic expiration jobs; rate limits; and monitoring. Anonymous sessions do not prove unique real-world players, so staff duplicate handling and abuse controls remain necessary.

Start with short polling through authorized server endpoints, pausing unnecessary requests when appropriate and resynchronizing when the tab becomes active. Proposed target is status propagation within 10 seconds for connected active clients. Show update timestamps and offline/stale states. Do not claim a successful action until the server commits it. If a response is lost, retry with the same request identifier or query the existing state. Realtime channels can be added later with explicit per-player authorization; never broadcast private queue rows publicly.

Do not use localStorage as the shared queue, hardcoded fake players, or privileged database keys in frontend JavaScript. Public responses show aggregate counts, never the full named queue. Player status must not expose other players' names, contact details, or private tokens.

## Architecture and deployment

Proposed stack: Next.js with React and TypeScript for the marketing routes, player app, staff dashboard, and server endpoints; Supabase Postgres for persistent queue data and Supabase Auth for staff; a conventional GitHub repository; Vercel for application hosting and preview deployments. This is a planned architecture, not installed infrastructure. Confirm applicable service terms, production plan requirements, costs, and ownership before provisioning.

Port the present marketing HTML/CSS into components while preserving approved content and maroon styling. Build the player workflow as original React components. Keep marketing pages mostly static and use dynamic server routes for private queue operations. One domain with /play and /staff/waitlist avoids unnecessary cross-origin session complexity.

All queue writes go through server authorization and transactional database operations. Staff uses managed authentication and application role checks. Guests retain the secure server session specified above; a guest cookie is not automatically a Supabase Auth identity. Initially, private guest queue reads also go through the server, where the session is checked. Keep privileged secrets server-only, restrict exposed database access, and explicitly enforce row-level policies for any client-facing authenticated data. Schedule expiration jobs using a supported scheduler after validating cadence and plan limits; also check expiration transactionally whenever acting on an offer.

GitHub becomes the source of truth. Pull requests create staging previews; reviewed production-branch changes deploy to Vercel. Separate staging and production database/secrets. Use synthetic data only in staging and initialize production empty. Keep schema migrations and deployment/recovery instructions in the repository.

### Migration away from ChatGPT Sites

1. Preserve a copy of the working source and the current Git history. Create/select the ordinary GitHub repository and document its ownership; stop using Sites as the future source/deployment workflow.
2. Prepare the Next.js application locally. Port public pages/assets, implement the new routes, and retain redirects for any changed existing URLs.
3. Set up the chosen Vercel project and Supabase environments in owner-controlled accounts where available, or document a verified handover path. Record billing owners and give the developer scoped collaborator access.
4. Deploy to the new provider's staging/preview URL. Verify pages, queue concurrency, authentication, expiration, storage, backups/restoration, and mobile behavior against the release checks.
5. Connect a custom domain only after the domain owner authorizes the specific domain change. Preserve unrelated DNS records, especially existing email records. Plan the final domain cutover and rollback with the owner; do not overwrite the club's existing Wix site during a sales demo.
6. Verify the approved new production domain, TLS, redirects, auth callback URLs, and actual database environment. Update all shared demonstration links to the new hosting URL.
7. After cutover is verified, archive the obsolete local Sites configuration outside the active deployment path. Retire the old hosted preview when requested; avoid deleting the only working deployment before replacement is verified. The final application must not depend on ChatGPT Sites or require a ChatGPT account for staff/player access.

Planning does not create provider accounts, transfer assets, incur charges, alter DNS, or shut down the existing preview. Those operations belong to the implementation/cutover phase.

## Build phases

1. Independent foundation and distinct design: prepare the Next.js/GitHub/Vercel/Supabase setup; design Tonight, joining, My spot ticket, and staff workspace; port the marketing site. Demonstrate with clearly labeled synthetic data on the new staging host. Confirm wording and owner queue policies.
2. Functional core: database, staff authentication, role checks, game controls, guest sessions, join/cancel, staff arrivals, and persistent status. Connect website Join the wait-list buttons.
3. Seating and reliability: transactional offers/seat holds, acknowledgments, seating, server-side expiration, refresh/reconnection, duplicate protection, audit logs, and closing workflow.
4. Club pilot and migration: rehearse one game with real staff, test player/staff devices, confirm instructions, document manual fallback, complete the authorized domain/account handover on independent hosting, then enable public joins for that game. Expand only after staff confirms the workflow fits.

A polished mockup is not a working queue. Do not publish synthetic availability as live operational data.

## Acceptance checks

- Header, hero, and phone dock open the companion page; back link returns to main site.
- Guests can join, refresh, see their entry, and cancel without an account.
- Duplicate taps/retries do not add duplicate entries.
- Two guests joining together receive stable ordering.
- Two staff members cannot offer or seat the same seat simultaneously.
- Arrival and seating require authorized staff actions.
- A player cannot read or mutate another player's entry.
- Offer expiration happens even if all browsers close.
- Cancelling, expiring, or finishing an entry releases relevant holds.
- Empty games, paused joins, network failures, and stale data have clear UI states.
- Midnight, operating-session close, and daylight-saving changes preserve correct deadlines.
- Mobile navigation, keyboard access, focus, and screen-reader status announcements work.
- Staff can run the queue and pause it without developer assistance.
- Player screens have an original Jokers game-list/ticket design and do not reproduce Hideaway's app navigation or screen composition.
- Website, player routes, staff authentication, expiration jobs, and database function on the new hosting without a ChatGPT account or Sites dependency.
- GitHub source, environment configuration, migrations, billing ownership, backups, and domain cutover/rollback are documented and verified before handover.

## Owner handover and success criteria

Deliver owner/admin access, individual staff invitations, a short opening-to-closing guide, documented queue rules, recovery procedures, backup/restore verification, monitoring ownership, and source/configuration handover. Agree ongoing support responsibility for a live operational system.

For the pilot, capture only the operational events needed to reconcile the queue: join, arrived, offered, acknowledged, seated, cancelled, expired, no-show, override. A full performance dashboard is deferred. Basic acceptance is correct operations and staff adoption; do not promise increased revenue or guaranteed wait times.

## Provider references reviewed for this revision

- Vercel Git deployments: https://vercel.com/docs/git
- Vercel project transfer: https://vercel.com/docs/projects/transferring-projects
- Supabase database access controls: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Realtime authorization, if adopted later: https://supabase.com/docs/guides/realtime/authorization
