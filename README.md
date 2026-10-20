# Jokers of Aggieland

A responsive poker-club website using the supplied Hideaway reference design and verified Jokers of Aggieland content.

## Local preview

Run `npm run dev` and open http://localhost:4173. No package installation or build step is needed. The production site is the `dist/` directory.

Run `npm run check` to check JavaScript syntax.

## Editing

- `dist/index.html`: all club content, schedules, pricing, contact information, and metadata.
- `dist/assets/styles.css`: design tokens, responsive layouts, and interactions.
- `dist/assets/app.js`: table animation, local-time day labels, membership comparison, navigation, filters, and photo viewer.
- `docs/implementation.md`: source notes, content ambiguities, and verification.

Contact buttons use the club's published phone, SMS, email, GroupMe, Facebook, and Maps destinations. There is no simulated booking, payment, or messaging backend. Photos and the logo come from the supplied Jokers site; photos are resized for web delivery. Google Fonts is the only remote page asset.

The June/July 2026 WSOP promotion is marked completed. Seat-rental and daily-membership prices are omitted because the source does not publish them. Confirm future schedule changes with the club before updating the site.
