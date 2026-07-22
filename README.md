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

Replace the `.radar-empty` block in `learning-community.html` with checked entries. Each item should include the event name, type, online/offline status, location, date, deadline when available, why it is useful, direct registration link and last-checked date. Remove expired entries.
