# Jokers of Aggieland: owner platform and reporting plan

Status: proposed implementation plan; no feature implementation or production configuration changes authorized by this document. Prepared October 20, 2026.

## 1. Outcome and current baseline

Deliver an owner-operated website that staff can update from a phone, publish current games, maintain tournaments, and run a fair online wait-list. Retain the existing Aggieland maroon/white design. Exclude marketing SMS, email campaigns, online gambling, payment processing, and financial player tracking.

Current source is buildless HTML/CSS/JavaScript in dist/. Schedules, prices, and copy are embedded in index.html. There is no database, staff login, shared live board, persistent wait-list, or analytics collection. Existing verification covers responsive rendering, links/assets, JavaScript syntax, membership calculator, filters, navigation, and photo viewer. It does not establish real-user performance scores or business results. The current Sites deployment is owner-private; handing over the source and operating a public club website are separate deployment/access decisions.

## 2. How owners make changes after the sale

Provide an authenticated /admin area on the club's eventual domain. Owners use individual accounts, with account recovery and MFA support. A dashboard has Today, Website Content, Tournaments, Wait-list, Reports, and Team tabs.

Content workflow: open a section → edit labeled fields → save draft → preview desktop/phone layout → publish. Show a successful publication timestamp only after the server commits the change. Invalidate the relevant public cache after publishing. Keep prior versions and allow restoration. Warn about conflicting edits instead of silently overwriting another staff member's changes.

Operational workflow: a floor manager updates a game or queue directly, without a draft/publish stage. These actions need immediate feedback, a durable event record, and a clear failure/retry state. Content publishing and operational updates use the same login but different permissions.

Examples:
- Change monthly membership price: Website Content → Membership → price field → preview → publish. The displayed price and membership calculator both read the same pricing record.
- Cancel a single tournament: Tournaments → date → cancel occurrence → enter public note → publish. The weekly series remains scheduled.
- Change holiday hours: Website Content → Hours → dated exception → publish. Normal weekly hours return automatically.
- Update a game: Today → $1/$2 NLH → running → occupied seats 7 of 9 → save. The public board shows two available seats and the server's update time.

Structured fields preserve the approved design. Owners can change text, images, schedules, prices, announcements, and contact links. New layouts or new software behavior remain development work. Provide image upload, crop/preview, file limits, and alt text rather than asking staff to paste image URLs.

### Roles

| Role | Capabilities |
|---|---|
| Owner | All content, prices, reports, team access, configuration, exports |
| Manager | Content publishing, tournaments, live games, queues, operational reports |
| Floor staff | Live game updates, arrivals, seat offers, seating, cancellation/no-show actions |
| Developer support | Explicitly granted, revocable technical access; no permanent shared owner password |

Enforce permissions on every server operation. Hiding a dashboard button is insufficient authorization. Record actor, timestamp, record, and before/after values for sensitive changes; never log credentials or session tokens.

## 3. Staff editing dashboard

Editable areas: membership plans and inclusions, cash-game definitions and buy-in ranges, weekly schedule, regular/exception hours, contact details, GroupMe/social links, FAQs, gallery, homepage announcements, promotion archives, and tournament content.

Announcements have title, body, destination link, start/end time, and optional priority. Expired announcements disappear automatically. Price fields use numeric validation; no fee is invented when the source is unknown. Archived promotions are explicitly distinguished from upcoming events.

Acceptance:
- Owner changes one price once and both public pricing and calculator agree.
- A scheduled announcement starts/expires on the chosen Central Time dates.
- An owner restores a prior content version.
- A floor-staff account cannot change pricing or invite staff, including by calling the API directly.
- Conflicting staff edits produce a reload/review prompt.
- A failed save retains the user's entered values and never claims publication succeeded.

## 4. What's running tonight

Public cards show game, stakes, status, table count, available seats, queue size, and last confirmed update. Distinguish a recurring scheduled game from a staff-confirmed running game. Statuses: scheduled, forming, running, paused, and finished. Do not infer a running game from the weekly calendar.

Staff controls: start/finish game, open/close table, set capacity/occupied seats, pause remote joins, and confirm current status. Availability is calculated from active tables and reservations, not separately typed in multiple places. A seat offered to a wait-listed player is held until accepted, expired, or released.

Freshness policy: proposed default after 30 minutes without confirmation is 'Update needed—call the club to confirm'; the owner can adjust this. Automatic refresh must not falsely advance the staff confirmation timestamp. If disconnected, show the last retrieved timestamp and reconnect state. Outside an active operating session, clear the live status. Sessions can span midnight until the following 4 AM; do not reset them at calendar midnight.

Use server-sent updates or short polling with reconnection and a fallback refresh. Initial target: successful staff changes visible to an online public client within 10 seconds. Show forming/running boards only when staff has provided the underlying data.

Acceptance: two phones see consistent updates; stale and disconnected states are visible; occupied seats cannot exceed capacity; finishing a game prevents new joins and handles outstanding entries explicitly.

## 5. Tournament calendar

Public views: upcoming list on phones, optional month grid on larger screens, individual event pages, filters by day/format, event status, and Google Calendar/.ics add actions.

Event fields: title, variant, start time, doors/registration time when confirmed, entry amount, fee breakdown if known, starting chips, blind structure, level duration, add-ons, rebuys, late registration cutoff, organizer notes, location, and cancellation status. Display only confirmed fields. Published content currently has a Monday/Tuesday ambiguity; owner confirmation is needed before assigning Monday a specific format/time.

Staff creates recurring series, then modifies 'this occurrence' or 'this and future occurrences'. Persist concrete occurrences so exceptions and historic records are stable. Use America/Chicago for recurrence rules and display; store individual event timestamps in UTC with the originating time zone. Check daylight-saving transitions and late-night dates.

Calendar files include stable event IDs, location, event URL, start/end where known, and revision/cancellation metadata. A downloaded .ics is a snapshot; do not promise it automatically reflects future edits. A subscription feed can be a later addition. End times must be omitted or clearly estimated if the club cannot provide them.

Acceptance: one cancellation does not cancel the series; daylight-saving dates retain the intended local start time; Google Calendar and .ics contain correct times and addresses; past events leave the upcoming list; add-to-calendar clicks are recorded only as intent, not proof that an event was saved.

## 6. Online wait-list

Player flow: choose a running/forming game → read queue rules → enter minimal identifying information → join → receive a private status link/session → view position → check in with staff → receive an on-page seat offer → accept or leave. A full player account is optional for the first release. The private status token must be unguessable and limited to that player's entry; public views show queue counts, not names or contact information.

No marketing subscriptions, SMS, or email delivery. The first release provides on-page seat-ready status and an optional sound after the player enables it. A closed browser, background suspension, or offline device can miss an alert. State this clearly in the join/status flow. If dependable background delivery becomes a requirement, revisit a separately approved notification channel before selling that promise.

Entry states: waiting → arrived → offered → seated, with cancelled, expired, and no-show terminal outcomes. Staff checks in players and controls seating. Owners approve rules for remote-arrival deadlines, late arrivals, priority, and offer expiration. Proposed initial rule: one active entry per player per game; no automatic advancement based on an unverified self-check-in. Position is a queue rank, not a guaranteed wait time or seat reservation.

Staff board: entries by game, join time, arrival state, position, offer expiry, and actions to check in, offer seat, seat player, cancel, or mark no-show. Priority overrides require a reason and audit entry. Staff can pause joins during a busy shift and add walk-ins/call-ins using the same queue with source labels.

Correctness: queue and seat changes commit in a database transaction; duplicate join submissions are idempotent; simultaneous staff actions cannot allocate one seat twice. Authoritative timestamps and rank calculations live on the server. Offer expiration and stale-entry cleanup require scheduled server jobs, not an open staff browser. Deduplicate within the limits of the chosen identity model; anonymous sessions cannot prove real-world identity, so rate limits and staff controls are also necessary.

Acceptance: simultaneous joins receive stable ordering; double taps do not duplicate entries; two staff devices cannot award the same seat; private status links cannot expose other players; refresh preserves queue position; cancellation removes an entry; offer expiry releases its held seat; expired sessions cannot make staff changes; outages provide an explicit call-the-club fallback.

## 7. Performance report

Owner reporting lives at /admin/reports with 7-day, 30-day, and custom ranges, prior-period comparison, mobile-friendly charts, definitions, and CSV/PDF export. Show 'No data yet' or 'Insufficient sample' rather than fabricated numbers. No automated report email in this scope.

### Business and operational measures

| Measure | Definition / limitation |
|---|---|
| Visits and visitors | Analytics sessions and estimated visitors; affected by consent, blocking, and device changes |
| Traffic sources | Referrer/campaign category when available; unknown is retained as unknown |
| Call, directions, GroupMe clicks | Link activations; not completed calls, arrivals, or group memberships |
| Tournament interest | Event views and calendar-link activations; not registrations |
| Join conversion | Sessions with a successful web join / eligible sessions viewing the wait-list, within the report window |
| Wait-list demand | Server-confirmed joins by game, day, and source; report web and staff-entered entries separately |
| Seated conversion | Entries from a join-date cohort that reached seated / all eligible entries in that cohort; show active entries as pending |
| Waiting time | Join-to-offer and arrival-to-seat separately; median and 90th percentile with sample sizes, plus current active-wait ages |
| No-shows and cancellations | Separate terminal outcomes, with declared denominator and reasons where captured |
| Board freshness | Share of active operating time where staff confirmation is within the freshness threshold |
| Staff use | Operational update activity for diagnosing adoption, access limited to owner |

Persist operational events server-side after successful transactions. Do not count a clicked join button as a successful join. Deduplicate client retries. Exclude staff/test traffic from marketing reports. Avoid names, phone numbers, private queue tokens, and email addresses in analytics payloads or URLs. Restrict row-level queue data and exports by role; agree retention and deletion rules with the owner.

Avoid revenue claims unless real attendance/payment data is deliberately added later. Report observed actions and comparisons; the website cannot prove incremental revenue from clicks alone.

### Technical performance

Track uptime, error rates, public page loading, interaction responsiveness, layout shifts, API response time, and live-update delay. Proposed targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile, segmented mobile/desktop; live updates ≤10s for connected clients. Distinguish lab tests from actual-user samples. These are targets, not achieved measurements or contractual service guarantees.

Monthly report layout: date range/sample quality → audience and interest → joins and seating → busiest games/hours → stale-board/no-show observations → technical health → three concrete recommendations. Compare like-for-like periods and identify incomplete cohorts.

## 8. Architecture and data

Keep the present public design. Move editable content into a database served by an authenticated backend and a protected admin application. Public content can remain cached/static; queue state and staff updates are dynamic. React can help organize the dashboard, but a framework migration is not required simply to make content editable.

Select the hosting/runtime and authentication provider during foundation work after confirming account ownership and operational needs. The present deployment is static-only; production operations require persistent database/storage, server endpoints, secrets, scheduled work, and monitoring. Do not store operational state only in browser storage or expose privileged database credentials to the frontend. If retaining Sites, use its supported server/runtime path; do not assume a native Next.js server can be dropped into static hosting.

Logical records: staff users and roles; content revisions; membership plans; normal hours and dated exceptions; announcements; gallery assets; game definitions; operating sessions; tables and occupancy; tournament series and occurrences; wait-list entries; seat offers; operational events; audit events; aggregate analytics.

Public responses expose only necessary published fields. Staff API operations enforce permissions and input validation, with rate limits for public joins. Store private queue tokens securely and expire them. Use transactional queue updates and unique constraints for active entry/seat invariants. Include backup scheduling, restore testing, error monitoring, and documented recovery procedures.

## 9. Build sequence and release gates

1. Foundation and owner editing: agree owner/staff roles, account ownership, queue rules, data retention, and architecture; implement auth, schema, migrations, content forms, preview/publish/version restore; connect public content. Gate: owner can update a price, hours, and announcement without developer help.
2. Calendar and live board: implement event recurrence/exceptions/calendar export, operating sessions, tables, staff controls, freshness and public refresh. Gate: staff runs a simulated shift with two devices and correct midnight/DST behavior.
3. Wait-list pilot: implement join/status, staff check-in, offers, seat holds, expiration, queue audit, retries, and abuse controls. Gate: concurrent-action and permission tests pass; staff rehearses manual fallback. Pilot one game before expanding.
4. Reporting and handover: implement event collection and aggregates from the first phases, then finish report screens/exports, performance checks, restore drill, training, and final production setup. Gate: report reconciles to known test entries; owner performs everyday tasks independently; live deployment is on approved accounts/domain/audience.

Instrumentation should begin when each feature is built, not after launch. Each phase needs review with a club representative before finalizing their business rules. No feature is considered production-ready solely because a mock dashboard looks complete.

## 10. Sale, ownership, and ongoing maintenance

Recommended arrangement: the club owns its domain, production hosting, database, analytics account, and content. Give them the source repository/export, setup guide, billing inventory, and recovery details. Grant the developer revocable collaborator access for a separately agreed maintenance service. Confirm actual provider transfer capabilities; the present private preview link is not a completed ownership transfer.

Provide individual staff invitations, a primary and backup owner, a short training session, recorded walkthrough, plain-language editing guide, and an emergency contact process. Demonstrate editing, tournament cancellation, table status, queue seating, reporting, staff removal, and restoring a prior version.

Define in the agreement what setup includes and which ongoing costs belong to the club. Routine content changes are self-service. Software fixes, provider upgrades, backup oversight, security maintenance, and new features require an ongoing responsible maintainer. Agree support availability, incident response, export/exit process, and access removal before delivery. Do not promise unlimited support or guaranteed revenue.

## References

- Next.js authorization principles for server mutations (relevant if that stack is selected): https://nextjs.org/docs/app/getting-started/mutating-data
- PostgreSQL locking and concurrent updates: https://www.postgresql.org/docs/17/explicit-locking.html
- Google Web Vitals definitions and measurement: https://web.dev/articles/vitals

These references support engineering practices. Product defaults and release gates above are proposed design choices, subject to the club's actual operating workflow.
