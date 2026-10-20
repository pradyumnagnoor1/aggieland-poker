# Jokers of Aggieland redesign

Scope: recreate the Hideaway marketing site's visual language with verified Jokers content. Buildless HTML, CSS, and JavaScript. No authentication, payment, or invented wait-list backend.

Skills considered: coding-orchestrator, design-system, Sites. Chosen: those three for implementation routing, responsive design, and preview/publication. The existing repository was empty. No AI product components. Network boundaries: static local assets, Google Fonts, and explicit outbound contact/community links.

Sources inspected October 20, 2026: jokersofaggieland.com homepage, /copy-of-cash-games, /services, /wsop, /gallery, /contact, /event-list. Visual reference: thehideawaypoker.com and its public styles.css/app.js.

Verified facts: $5 monthly / $50 annual membership; drinks, food, snacks included; seat rental excluded. No published seat rental rate or priced daily membership. Weekdays 7 PM–4 AM; weekends 2 PM–4 AM. Address 2553 Texas Avenue South, Suite D, College Station TX 77840. Call/text 979-446-2077. Email jokers@jokersofaggieland.com.

Content caveats: tournament page title says Turbo Mondays and Tuesdays, but detailed schedule only specifies Tuesday 7 PM. Present Tuesday's verified details and mention Monday requires confirmation. WSOP 2026 dates are in the past; present as archive. No current events listed. Cash schedules depend on player interest. Do not copy Hideaway prices, no-rake claim, opening time, player app, analytics IDs, or branding.

Design tokens follow Hideaway: #0b0a12 background, #13111d/#1b1828 surfaces, #f2f1f6 text, #a7a3bd muted, #4d55f0 blue accent, #5b3489 purple table rail; Bebas Neue and Manrope. Shared buttons, cards, weekly playing cards, header, phone dock, membership dial, and native details disclosures. Use real Jokers photography and logos.

Acceptance: complete source content, functional membership comparison, keyboard-accessible dial and menus, working contact/directions/community links, responsive desktop/390px layouts with no overflow, no missing local assets, valid JavaScript. Verify with npm run check and browser inspection.

Verification: npm run check passed; local server returned HTTP 200; HTML local assets and anchor targets all resolve. Browser inspected at desktop and 390px; no horizontal overflow or broken loaded images. Verified membership dial Home/End/arrows (1 month $5, 2 months $10, 12 months $50 with $10 savings), mixed-game filtering, gallery modal open/Escape close, phone menu opening and anchor close, and FAQ expansion. External contact actions were inspected as links without sending messages or placing calls.

User requested Aggieland colors: final palette uses #500000 Aggieland maroon actions, #100d0e warm charcoal, #faf7f2 white, #d67b84 readable maroon-tinted accents, maroon table rails, and a white highlighted seat. Hideaway layout retained.
