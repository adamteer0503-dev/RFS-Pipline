# RFS LinkedIn Fast-Scout & Runner Invite

A Chrome extension (Manifest V3) for the founder of **Run For Startups (RFS)**
to quickly scout founders/investors on LinkedIn and generate personalized
invitations to morning running sessions.

## Files

- `manifest.json` — Manifest V3 config, permissions, and popup registration.
- `popup.html` — Popup UI markup.
- `popup.css` — Dark athletic-tech styling with neon orange/cyan accents.
- `popup.js` — Template engine, clipboard logic, and draft persistence via `chrome.storage.local`.
- `icons/` — Generated extension icons (16/32/48/128px).

## Features

- **Candidate inputs**: name & role, startup stage (Ideation / MVP / Seed /
  Round A / VC Investor), estimated running pace.
- **Generate RFS Invite**: produces a personalized, low-ego LinkedIn message
  inviting the candidate to the next 10km morning run + fireside chat.
- **Generate Running Icebreaker**: produces 2 conversation starters tailored
  to the candidate's stage (founder vs. investor angle).
- **Copy to Clipboard**: one click, with instant visual "Copied ✓" feedback.
- **Draft autosave**: all fields and the generated message are saved to
  `chrome.storage.local` and restored next time you open the popup. Use
  "Clear draft" to reset.

## Load unpacked into Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select this folder: `chrome-extension/rfs-linkedin-fast-scout`.
5. The "RFS LinkedIn Fast-Scout" icon will appear in your toolbar. Pin it for
   quick access while browsing LinkedIn.
6. Click the icon, fill in the candidate's details, and generate your invite
   or icebreaker.

## Notes

- Permissions requested: `activeTab`, `storage`, `clipboardWrite` — the
  extension does not read page content; all generation happens locally from
  the fields you fill in.
- Icons were generated locally with a small Python/Pillow script
  (`gen_icons.py`, not required at runtime).
