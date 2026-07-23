# Gokul Saradhi — Technology & Digital Solutions

A dependency-light, multi-page services website built for GitHub Pages.

## Pages

- `index.html` — commercial services homepage
- `learning-community.html` — beginner guidance, IT Exposure Radar and community
- `contact.html` — purpose-specific WhatsApp and email contact paths
- `privacy.html` — proportional privacy policy
- `terms.html` — working terms

## Preview

Run a static server in this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Maintaining the IT Exposure Radar

The Radar is a replaceable daily snapshot stored in `data/radar-events.json`. The user may provide a new complete Radar report each day; treat that report as the authoritative list for that update.

For every Radar update:

- Read the new report supplied by the user.
- Extract only genuine opportunities included in that report.
- Convert each opportunity into the existing structured JSON shape.
- Validate dates, times, timezones and official links.
- Include useful public details, but do not publish personal scheduling notes, private reminders or internal decision comments.
- Exclude cancelled items and anything that is not useful for the daily board.
- Replace the entire `events` array in `data/radar-events.json`; do not merge it with yesterday's events.
- Update `lastUpdatedAt` to the actual update time in Asia/Kolkata.
- Preserve the JSON schema and frontend behaviour.
- Do not change unrelated website content or design.
- Show the updated Radar locally for review before committing or deploying.

Each event should include `startsAt` and `endsAt` as timezone-aware ISO strings. Use `registrationDeadline` when registration can close before the event ends, and `isCancelled: true` only when a supplied item must be suppressed. Keep `expiresAt` as a compatibility alias for `endsAt` when updating older entries.

If an event has an ambiguous or missing date/time that prevents reliable state handling, verify it from the official source or leave it out and report why. The frontend sorts events by derived state, shows urgency labels, keeps completed cards visible until the next daily replacement, removes CTAs from completed or registration-closed cards, hides cancelled events, and shows the empty state when the snapshot has no displayable events.

## Design guardrail

Gradient, dimensional and glow effects are reserved for the hero, primary actions, service markers and closing CTA. Body sections remain restrained, spacious and readable.
