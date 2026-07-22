# Salon Booking Manager — PWA Build Spec & Agent Prompt

> Hand this entire document to a coding agent (Claude Code, Cursor, Devin, Replit Agent, etc.) as the build brief. It supersedes any earlier version of this app — this is v2, incorporating direct client feedback on the v1 build.

---

## 0. Project Framing (read this first, agent)

Build a **mobile-first Progressive Web App (PWA)** — not a native app — for a small salon/clinic owner in India to manage daily bookings, customers, and stylists. The client cannot afford Play Store / App Store distribution right now, so **PWA is the final delivery target**, not a placeholder: it must be installable (Add to Home Screen), work offline for at least the current day's data, and feel like a native app on a phone.

This is an MVP. Do not add scope beyond what's listed. Do not scaffold admin panels, multi-tenant marketplaces, payment gateways, or anything not explicitly requested — the owner wants something they can actually use next week, not a platform.

The client had a first version built by a single-prompt tool (Emergent/Replit-style) and came back with a specific list of corrections. Those corrections are **not optional polish** — they are the spec now. They're folded into the requirements below and flagged inline as `[CLIENT FIX]` so you understand why they exist and don't silently drop them in a future refactor.

---

## 1. Tech Stack (recommended, opinionated)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** or Vite + React + TypeScript | Either works; Next.js gives easier PWA + SSR-lite setup and easier deploy on Vercel |
| Styling | **Tailwind CSS** | Fast to keep "clean, minimal" consistent |
| Backend/DB | **Supabase** (Postgres + Auth + Row Level Security + Realtime) | One service for DB, auth (incl. Google OAuth), and hosting-friendly free tier |
| Auth | **Supabase Auth — Google OAuth only** | Matches onboarding requirement (Google sign-in compulsory) |
| PWA layer | `next-pwa` (or `vite-plugin-pwa` if using Vite) + Workbox | Service worker, offline caching, installability, manifest.json |
| Forms/validation | React Hook Form + Zod | Clean forms for booking/service/customer entry |
| State | React Query (TanStack Query) for server state, lightweight Context/Zustand for UI state | Keeps things simple, avoids over-engineering |
| Dates | `date-fns` | Week view, custom date ranges, follow-up dates |
| Charts (stats) | Simple bar/number cards — **no charting library needed for MVP**, plain Tailwind cards | Keep it minimal per design requirement |
| Deployment | Vercel (frontend) + Supabase (backend), or a single VPS if client prefers | Cheap/free tier friendly |

Do not introduce native shells (Capacitor, React Native, Tauri) — this is web-only, installable via browser "Add to Home Screen."

---

## 2. Onboarding & Auth `[CLIENT FIX]`

This entire flow is new — it did not exist in v1 and was explicitly requested.

1. **Landing/login screen**: single "Continue with Google" button. Google sign-in is **compulsory** — no email/password option, no skip.
2. **First-time-user flow** (runs once, right after first successful Google sign-in):
   - Step A — **Business type selection**: two large tappable cards/options: **"Clinic"** and **"Salon"**. Store this as `organizations.business_type`.
   - Step B — **Organisation name**: simple text input, "What's your business called?" → saved as `organizations.name`.
   - On submit, create the `organizations` row, link the authenticated user as `owner`, and route to the Home/Today screen.
3. **Returning users**: Google sign-in → skip straight to Home screen (org already exists for their user id).
4. **Top app bar** (persistent across all screens): app name (e.g. "Salonly" — placeholder, client can rename) top-left/right per their mockup, and directly below/beside it, the **organisation name** the owner entered. This is literally: `[App Name]` above/beside `[Organisation Name]`, always visible so a multi-org future doesn't get confusing.

Data model addition:
```
organizations
  id, owner_user_id, name, business_type ('clinic' | 'salon'), created_at

users (managed by Supabase Auth) — link via owner_user_id
```

---

## 3. Navigation Structure `[CLIENT FIX]`

Bottom tab bar, 4 tabs (mobile-first, thumb-reachable):

1. **Today** (home) — today's schedule + quick stats
2. **Appointments** — was labeled "Calendar" in v1; renamed and reworked (see §5) — this is the icon the client circled and asked to "replace it with appointment options"
3. **Customers** — customer list/search
4. **More** — settings: manage services & prices, manage stylists, business profile, sign out

---

## 4. Screen 1: Today / Home

Purpose: what the owner opens first thing every day.

**Top stat cards** (compact, 2x2 grid or horizontal scroll):
- Today's appointment count
- This week's appointment count
- Unique clients this month
- (See §7 for why "No-shows" is **removed** from this screen)

**Appointment list** (today, sorted by time):
Each row shows:
- Time slot
- Customer name + phone number
- Service (now a **custom** service name + price, see §6 — not a fixed dropdown)
- Stylist assigned
- Status badge: Confirmed / Completed / No-show (color-coded)
- **Single quick action**: "Mark Completed" button. (No inline "No-show" button here — see §7 for why, and where no-show gets set instead.)

**Floating "+ New Booking" button** — opens Add Booking form (§5).

---

## 5. Screen 2: Appointments (was "Calendar") `[CLIENT FIX]`

Client feedback: *"Replace it with appointment options"* + *"Daily appointments will show here."* — v1's bottom-nav calendar icon opened a month-grid calendar. The client wants this tab to behave as an **appointments-first view**, not a bare calendar grid.

Rework as:
- **Default view on tab open**: a **day view** — a date strip (horizontal scroll of the current week's dates, today highlighted) at the top, and below it, the **full list of that day's appointments** (same card format as Today screen). Tapping any date in the strip loads that day's appointments below.
- **Toggle at top-right**: switch to **Week view** — the original requirement's week grid, color-coded by status (upcoming = neutral/blue, completed = green, no-show = red/muted), tapping any day jumps back into day view for that date.
- This satisfies both the original spec (§4 "Calendar view — week, color-coded") and the client's correction (this tab should primarily surface a day's appointment list, not force the owner into a calendar grid first).

---

## 6. Screen 3: Add / Edit Booking — Custom Services & Stylists `[CLIENT FIX]`

This is the biggest structural change from v1. Indian salons need **fully custom, owner-defined services and prices** — a fixed dropdown of "Haircut / Hair Color / Facial / Manicure / Pedicure / Other" does not reflect how pricing actually works (prices vary customer to customer, service names vary salon to salon).

**Form fields:**
1. Customer name (text)
2. Phone number (text, numeric validation)
3. **Service** — selectable chips/dropdown populated from the org's **Services list** (managed in Settings, §8), where each service has a name and a *default* price. Selecting a service pre-fills the price field, which the owner **can always override per booking**.
   - `[CLIENT FIX]` Replace the old hardcoded "Other" option at the end of the list with an **"+ Add manually"** action — tapping it lets the owner type a brand-new service name and price on the spot, which also gets saved to their Services list for next time (so the dropdown grows organically instead of dead-ending at "Other" every time).
4. **Price** — numeric field, always editable regardless of whether a preset or custom service was chosen. This is the "fully custom pricing" requirement — no service is ever locked to a fixed price.
5. **Stylist** — same pattern as service: chips/dropdown of the org's saved Stylists (§8), plus `[CLIENT FIX]` an **"+ Add manually"** option at the end (replacing a dead-end "Other") to add a new stylist name on the fly, saved for future reuse.
6. **Date** — `[CLIENT FIX]` support **both automatic and manual date capture**: default the date field to "today," but allow the owner to tap and pick any date manually (for advance bookings). This applies to the booking date itself.
7. **Time slot** — simple time picker.
8. `[CLIENT FIX]` **Follow-up field** (last field on the form, optional): a toggle "Needs follow-up?" — if enabled, show a date picker for the follow-up date and an optional short note (e.g. "check if hair color faded, offer touch-up"). Store as `bookings.follow_up_date` / `bookings.follow_up_note`. Surface a simple "Follow-ups due today" indicator on the Home screen if any exist (small addition, not a full separate screen — keep MVP scope).
9. **Save Booking** button.

Data model:
```
services
  id, org_id, name, default_price, created_by ('preset' | 'manual'), created_at

stylists
  id, org_id, name, created_by ('preset' | 'manual'), created_at

bookings
  id, org_id, customer_id, service_id (nullable if fully custom one-off), 
  service_name_snapshot, price, stylist_id, stylist_name_snapshot,
  date, time_slot, status ('confirmed' | 'completed' | 'no_show'),
  follow_up_date (nullable), follow_up_note (nullable),
  created_at, updated_at
```
(Snapshot fields protect historical bookings from changing if a service/stylist is later renamed or its default price edited.)

---

## 7. No-show Handling — Removed From Quick Actions `[CLIENT FIX]`

Client feedback: *"Remove no-show option"* — annotated on both (a) the "No-shows" stat card on the Today screen, and (b) the inline "No-show" quick-action button next to "Completed" on each appointment row.

Implementation:
- **Remove** the standalone "No-shows" stat card from the Today screen's top stats (it stays available only inside the aggregate dashboard, §9 — no need to surface it twice, and the owner didn't want it front-and-center daily).
- **Remove** the one-tap "No-show" button from the appointment row. Keep only "Mark Completed" as the quick action, since that's the common happy path.
- No-show status is instead set via the **Edit Booking** screen: a status dropdown (Confirmed / Completed / No-show) accessible by tapping into a booking's details. This keeps the daily list clean while still letting the owner correct a status after the fact.
- (Optional, cheap to add: auto-flag a booking as "no_show" if its time slot has passed by a few hours and it was never marked Completed — a background check, not a button. Include this only if trivial; skip if it adds real complexity for MVP.)

---

## 8. Screen 4: Customers

- Table/list: name, phone, last visit date, last service taken, total visit count.
- Search bar (name or phone, client-side filter is fine for MVP scale).
- Tap a customer → their full booking history (reuse the appointment card component).

---

## 9. Screen 5: Dashboard / Stats — Expanded `[CLIENT FIX]`

Client feedback: *"Dashboard options: total sale, total clients day/week/month wise. Custom date option also."*

Build this as either the top section of Home (if kept light) or its own "Stats" area reachable from More — agent's call on placement, but **all of the following must exist**:

- **Total sales** (sum of `price` across completed bookings) — filterable by **Day / Week / Month** (segmented control).
- **Total clients** (unique customers with a booking) — same Day/Week/Month filter.
- **Total bookings** — same filter.
- **No-show count** — same filter (this is where the no-show number now lives, per §7).
- **Custom date range picker** `[CLIENT FIX]` — lets the owner pick an arbitrary start/end date and see the same metrics (sales, clients, bookings, no-shows) for that exact range, independent of the Day/Week/Month presets.

Keep the UI as plain stat cards/numbers — no charting library needed for MVP, per the original "no unnecessary features" instruction.

---

## 10. Screen 6: Settings ("More" tab)

- **Manage Services**: list of the org's services (name + default price), add/edit/delete. This is the same list that feeds the Add Booking dropdown in §6.
- **Manage Stylists**: same pattern — list, add/edit/delete.
- **Business profile**: org name, business type (editable post-onboarding).
- **Sign out**.

---

## 11. Design Requirements

- Clean, minimal UI, generous whitespace, no clutter.
- Mobile-first responsive (owner primarily uses this on phone; desktop should still be usable but isn't the priority).
- Color palette: soft neutral base (off-white/warm gray backgrounds, dark slate text) + **one accent color** for primary actions and status highlights (e.g. a muted teal or terracotta — agent's creative call, but must stay to one accent, not a rainbow of status colors beyond what's functionally needed: confirmed/upcoming, completed, no-show).
- Large tap targets throughout — this is used one-handed, often mid-service.

---

## 12. PWA Requirements (non-negotiable — this is the delivery target, not native)

- `manifest.json` with app name, short name, icons (192/512px, maskable), theme color, `display: standalone`.
- Service worker (via `next-pwa` or `vite-plugin-pwa`) caching the app shell so it opens instantly and works offline for **already-loaded data** (today's bookings, customer list last fetched).
- Installable: must pass the "Add to Home Screen" prompt criteria on both Android Chrome and iOS Safari (iOS needs manual "Add to Home Screen" via share sheet — no auto-prompt exists there, but it must work when the owner does it manually).
- Google OAuth must work inside the installed PWA context (test the redirect flow specifically in standalone/installed mode, not just in-browser — this is a common PWA + OAuth gotcha).
- Reasonably graceful offline state: if the owner opens the app with no signal, show cached today's data rather than a blank error screen; queue any offline "Mark Completed" taps to sync once back online (nice-to-have, not blocking for MVP if time-constrained — flag as a stretch item rather than dropping silently).

---

## 13. Explicit Out-of-Scope for This MVP

Do not build, even if it seems easy to bolt on:
- SMS/WhatsApp reminders or notifications
- Online payments / invoicing
- Multi-branch / multi-location support
- Staff login roles beyond a single owner account
- Public-facing booking widget for customers to self-book
- Analytics/charts beyond the plain stat cards in §9

These may become v3 asks later — leave the data model reasonably extensible (e.g., `org_id` on everything) but do not pre-build UI for any of them.

---

## 14. Summary of Client-Fix Checklist (for the building agent's own verification pass)

Before calling this done, confirm each of these against the running app:

- [ ] Google sign-in only, compulsory, no bypass
- [ ] Onboarding asks Clinic/Salon, then organisation name, before first Home screen
- [ ] Top bar shows app name + organisation name
- [ ] Bottom nav's second tab defaults to a **daily appointment list** (with week-view toggle), not a bare month calendar
- [ ] Service selector ends in **"+ Add manually"**, not "Other" — and manually added services persist for reuse
- [ ] Stylist selector ends in **"+ Add manually"**, not "Other" — same persistence behavior
- [ ] Price field is always editable regardless of preset vs. custom service
- [ ] Date field supports both auto (defaults to today) and manual date picking
- [ ] Follow-up toggle + date + note exists as the last field on the booking form
- [ ] "No-shows" stat card is **gone** from the Today screen
- [ ] Inline "No-show" quick-action button is **gone** from appointment rows — no-show is only set via Edit Booking's status dropdown
- [ ] Dashboard shows total sale + total clients, filterable Day/Week/Month, plus a working custom date range picker
- [ ] App is installable as a PWA on both Android and iOS, and Google OAuth works in installed/standalone mode

---

*End of build spec. Build the data model and auth/onboarding flow first, then Add/Edit Booking (since Services/Stylists feed everything else), then Today/Appointments screens, then Customers, then Dashboard, then PWA polish last.*
